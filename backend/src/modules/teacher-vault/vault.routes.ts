import { NextFunction, Request, Response, Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import mammoth from 'mammoth';
import { authMiddleware, AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { tenantMiddleware } from '../../common/middleware/tenant.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { TokenUtil } from '../../common/utils/token.util';
import { ENV } from '../../config/env';
import { Section } from '../../models';
import { TeacherVaultItem, VaultKind } from '../../models/TeacherVaultItem';
import { TextbookAccessService } from '../curriculum/textbook-access.service';

const router = Router();

const ROOT = path.resolve(process.cwd(), 'uploads/vault');
fs.mkdirSync(ROOT, { recursive: true });

/** What a teacher may upload, and how the Smart Board treats it. */
const KINDS: Record<string, VaultKind> = {
  pdf: 'PDF',
  ppt: 'PRESENTATION', pptx: 'PRESENTATION', pps: 'PRESENTATION', ppsx: 'PRESENTATION', odp: 'PRESENTATION',
  doc: 'DOCUMENT', docx: 'DOCUMENT', odt: 'DOCUMENT', rtf: 'DOCUMENT',
  txt: 'TEXT', md: 'TEXT',
  xls: 'SPREADSHEET', xlsx: 'SPREADSHEET', csv: 'SPREADSHEET',
  mp4: 'VIDEO', webm: 'VIDEO', mov: 'VIDEO', m4v: 'VIDEO',
  mp3: 'AUDIO', wav: 'AUDIO', m4a: 'AUDIO', ogg: 'AUDIO',
  jpg: 'IMAGE', jpeg: 'IMAGE', png: 'IMAGE', gif: 'IMAGE', webp: 'IMAGE', svg: 'IMAGE',
};
const MIME: Record<string, string> = {
  pdf: 'application/pdf', mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', m4v: 'video/mp4',
  mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4', ogg: 'audio/ogg',
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
  txt: 'text/plain; charset=utf-8', md: 'text/plain; charset=utf-8', csv: 'text/csv; charset=utf-8',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};
const extOf = (name: string) => path.extname(name || '').replace('.', '').toLowerCase();

const upload = multer({
  storage: multer.diskStorage({
    destination: (req: any, _file, cb) => {
      const dir = path.join(ROOT, String(req.institutionId || req.user?.institutionId || 'misc'));
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extOf(file.originalname) || 'bin'}`),
  }),
  limits: { fileSize: 250 * 1024 * 1024, files: 20 },
});

const ok = (res: Response, data: any, message = 'OK', status = 200) => res.status(status).json({ success: true, message, data, error: null });
const fail = (res: Response, status: number, message: string, code = 'ERROR') => res.status(status).json({ success: false, message, data: null, error: { code, message } });
const idOf = (v: any) => String(v?._id || v?.id || v || '');

const accessToken = (itemId: string, userId: string) => jwt.sign({ purpose: 'vault', itemId, uid: userId }, ENV.JWT_SECRET, { expiresIn: '12h' });

/** File and viewer URLs are opened by the board inside frames, so they accept a short-lived link token as well as a normal sign-in. */
const fileAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const link = String(req.query.access || '');
    let item: any = null;
    if (link) {
      const p: any = jwt.verify(link, ENV.JWT_SECRET);
      if (p.purpose !== 'vault' || String(p.itemId) !== String(req.params.id)) return fail(res, 403, 'This link is not valid for this file.', 'BAD_LINK');
      item = await TeacherVaultItem.findById(req.params.id);
    } else {
      const header = String(req.headers.authorization || '');
      const user = TokenUtil.verify(header.replace(/^Bearer\s+/i, ''));
      item = await TeacherVaultItem.findOne({ _id: req.params.id, teacherId: user.userId });
    }
    if (!item) return fail(res, 404, 'File not found.', 'NOT_FOUND');
    (req as any).vaultItem = item;
    next();
  } catch {
    fail(res, 401, 'Please sign in again.', 'UNAUTHORIZED');
  }
};

const pathOf = (item: any) => path.join(ROOT, String(item.institutionId), item.storedName);

const escapeHtml = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const page = (title: string, body: string, dark = false) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title>
<style>*{box-sizing:border-box}html,body{margin:0;height:100%}body{font-family:Segoe UI,Arial,sans-serif;background:${dark ? '#05070b' : '#ffffff'};color:${dark ? '#f4f4f4' : '#1d2b27'}}
.doc{max-width:980px;margin:0 auto;padding:28px 34px 60px;font-size:20px;line-height:1.65}.doc h1,.doc h2,.doc h3{color:#0f4c4a;line-height:1.25}.doc table{border-collapse:collapse;width:100%;margin:14px 0}.doc td,.doc th{border:1px solid #c9d6d2;padding:8px 10px}.doc img{max-width:100%;height:auto}
.stage{height:100%;display:flex;align-items:center;justify-content:center}.stage video,.stage img{max-width:100%;max-height:100%}.stage audio{width:80%}
.note{padding:40px;max-width:720px;margin:0 auto;font-size:18px;line-height:1.6}.note a{color:#0f5f55;font-weight:700}</style></head><body>${body}</body></html>`;

// ── Upload (one or many files, with the unit and topic they belong to) ──────────────────────
router.post(
  '/',
  authMiddleware,
  authorize('TEACHER', 'SUPER_ADMIN'),
  tenantMiddleware,
  (req: Request, res: Response, next: NextFunction) => upload.array('files', 20)(req, res, (err: any) => (err ? fail(res, 400, err.message, 'UPLOAD_REJECTED') : next())),
  async (req: AuthenticatedRequest, res: Response) => {
    const files = ((req as any).files || []) as Express.Multer.File[];
    const cleanup = () => files.forEach((f) => fs.unlink(f.path, () => undefined));
    try {
      const { sectionId, centralSubjectId, unitTitle, unitNumber, topic, description, title } = req.body || {};
      if (!files.length) return fail(res, 400, 'Choose at least one file to upload.', 'NO_FILE');
      const unsupported = files.filter((f) => !KINDS[extOf(f.originalname)]);
      if (unsupported.length) {
        cleanup();
        return fail(res, 400, 'This file type is not supported: ' + unsupported.map((f) => f.originalname).join(', ') + '. Upload PDF, PowerPoint, Word, video, audio, image, spreadsheet or text files.', 'UNSUPPORTED_TYPE');
      }
      if (!sectionId || !centralSubjectId) { cleanup(); return fail(res, 400, 'Choose the class and subject first.', 'SCOPE_REQUIRED'); }
      if (!String(unitTitle || '').trim()) { cleanup(); return fail(res, 400, 'Enter the unit these materials belong to.', 'UNIT_REQUIRED'); }
      const teacherId = req.user!.userId;
      const institutionId = req.institutionId!;
      if (!(await TextbookAccessService.teacherIsAllocated(teacherId, sectionId, centralSubjectId))) {
        cleanup();
        return fail(res, 403, 'You are not assigned to teach this subject in this class.', 'UNAUTHORIZED_ALLOCATION');
      }
      const section: any = await Section.findById(sectionId).lean();
      if (!section) { cleanup(); return fail(res, 404, 'Class section not found.', 'NOT_FOUND'); }

      const created: any[] = [];
      for (const f of files) {
        const ext = extOf(f.originalname);
        const base = path.basename(f.originalname, path.extname(f.originalname));
        created.push(
          await TeacherVaultItem.create({
            institutionId, teacherId, classId: section.classId, sectionId, centralSubjectId,
            unitNumber: unitNumber !== undefined && unitNumber !== '' && !Number.isNaN(Number(unitNumber)) ? Number(unitNumber) : undefined,
            unitTitle: String(unitTitle).trim(), topic: String(topic || '').trim(), description: String(description || '').trim(),
            title: files.length === 1 && String(title || '').trim() ? String(title).trim() : base,
            kind: KINDS[ext] || 'OTHER', storedName: f.filename, originalFilename: f.originalname,
            mimeType: MIME[ext] || f.mimetype || 'application/octet-stream', extension: ext, fileSizeBytes: f.size,
          })
        );
      }
      return ok(res, created.map((c) => c.toJSON()), `${created.length} file${created.length === 1 ? '' : 's'} saved to the vault`, 201);
    } catch (e: any) {
      cleanup();
      return fail(res, 500, e?.message || 'Upload failed.', 'UPLOAD_FAILED');
    }
  }
);

// ── List this teacher's materials for a subject (all sections of the class) ─────────────────
router.get('/', authMiddleware, authorize('TEACHER', 'SUPER_ADMIN'), tenantMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sectionId, centralSubjectId } = req.query as any;
    if (!sectionId || !centralSubjectId) return fail(res, 400, 'Class and subject are required.', 'SCOPE_REQUIRED');
    const section: any = await Section.findById(sectionId).lean();
    if (!section) return ok(res, []);
    const items = await TeacherVaultItem.find({ teacherId: req.user!.userId, centralSubjectId, classId: section.classId })
      .sort({ unitNumber: 1, unitTitle: 1, topic: 1, createdAt: 1 })
      .lean();
    return ok(res, items.map((i: any) => ({ ...i, id: String(i._id), _id: undefined, storedName: undefined })), 'Vault loaded');
  } catch (e: any) {
    return fail(res, 500, e?.message || 'Could not load the vault.');
  }
});

// ── Edit the title, unit or topic ───────────────────────────────────────────────────────────
router.patch('/:id', authMiddleware, authorize('TEACHER', 'SUPER_ADMIN'), tenantMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const patch: any = {};
    for (const k of ['title', 'unitTitle', 'topic', 'description']) if (typeof req.body?.[k] === 'string') patch[k] = req.body[k].trim();
    if (req.body?.unitNumber !== undefined) patch.unitNumber = req.body.unitNumber === '' || req.body.unitNumber === null ? undefined : Number(req.body.unitNumber);
    if (patch.title === '' || patch.unitTitle === '') return fail(res, 400, 'Title and unit cannot be empty.', 'VALIDATION_ERROR');
    const item = await TeacherVaultItem.findOneAndUpdate({ _id: req.params.id, teacherId: req.user!.userId }, patch, { new: true });
    if (!item) return fail(res, 404, 'File not found.', 'NOT_FOUND');
    return ok(res, item.toJSON(), 'Saved');
  } catch (e: any) {
    return fail(res, 500, e?.message || 'Could not save.');
  }
});

router.delete('/:id', authMiddleware, authorize('TEACHER', 'SUPER_ADMIN'), tenantMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item: any = await TeacherVaultItem.findOneAndDelete({ _id: req.params.id, teacherId: req.user!.userId });
    if (!item) return fail(res, 404, 'File not found.', 'NOT_FOUND');
    fs.unlink(pathOf(item), () => undefined);
    return ok(res, { id: req.params.id }, 'Deleted');
  } catch (e: any) {
    return fail(res, 500, e?.message || 'Could not delete.');
  }
});

// ── What the Smart Board needs to present one item ──────────────────────────────────────────
router.get('/:id/present', authMiddleware, authorize('TEACHER', 'SUPER_ADMIN'), tenantMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item: any = await TeacherVaultItem.findOne({ _id: req.params.id, teacherId: req.user!.userId });
    if (!item) return fail(res, 404, 'File not found.', 'NOT_FOUND');
    await TeacherVaultItem.updateOne({ _id: item._id }, { $inc: { launchCount: 1 }, $set: { lastLaunchedAt: new Date() } });
    const access = accessToken(String(item._id), req.user!.userId);
    // PDF, PowerPoint (.pptx) and pictures open in the board's slide presenter, where the teacher can draw over each slide.
    const slideDeck = item.kind === 'PDF' || item.kind === 'IMAGE' || (item.kind === 'PRESENTATION' && ['pptx', 'ppsx'].includes(item.extension));
    return ok(res, {
      id: String(item._id), title: item.title, kind: item.kind, extension: item.extension, originalFilename: item.originalFilename,
      mode: slideDeck ? 'DECK' : 'EMBED',
      fileUrl: `/api/v1/teacher-vault/${item._id}/file?access=${encodeURIComponent(access)}`,
      embedUrl: `/api/v1/teacher-vault/${item._id}/view?access=${encodeURIComponent(access)}`,
    });
  } catch (e: any) {
    return fail(res, 500, e?.message || 'Could not open the file.');
  }
});

// ── Raw file (download, preview, board) ─────────────────────────────────────────────────────
router.get('/:id/file', fileAuth, (req: Request, res: Response) => {
  const item: any = (req as any).vaultItem;
  const full = pathOf(item);
  if (!fs.existsSync(full)) return fail(res, 404, 'The stored file is missing.', 'FILE_MISSING');
  res.setHeader('Content-Type', MIME[item.extension] || item.mimeType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `${req.query.download ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(item.originalFilename)}`);
  res.setHeader('Cache-Control', 'private, max-age=0');
  res.sendFile(full);
});

// ── A ready-to-show page for Word, video, audio, images, text and spreadsheets ───────────────
router.get('/:id/view', fileAuth, async (req: Request, res: Response) => {
  const item: any = (req as any).vaultItem;
  const full = pathOf(item);
  if (!fs.existsSync(full)) return res.status(404).send(page('Missing', '<div class="note">The stored file is missing.</div>'));
  const file = `/api/v1/teacher-vault/${item._id}/file?access=${encodeURIComponent(String(req.query.access || ''))}`;
  const dl = file + '&download=1';
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'private, max-age=0');
  try {
    if (item.kind === 'VIDEO') return res.send(page(item.title, `<div class="stage"><video src="${file}" controls autoplay playsinline></video></div>`, true));
    if (item.kind === 'AUDIO') return res.send(page(item.title, `<div class="stage"><audio src="${file}" controls autoplay></audio></div>`, true));
    if (item.kind === 'IMAGE') return res.send(page(item.title, `<div class="stage"><img src="${file}" alt="${escapeHtml(item.title)}"></div>`, true));
    if (item.kind === 'PDF') return res.redirect(file);
    if (item.kind === 'TEXT') {
      const text = fs.readFileSync(full, 'utf8');
      return res.send(page(item.title, `<div class="doc"><pre style="white-space:pre-wrap;font:inherit">${escapeHtml(text)}</pre></div>`));
    }
    if (item.kind === 'DOCUMENT' && item.extension === 'docx') {
      const out = await mammoth.convertToHtml({ path: full });
      return res.send(page(item.title, `<div class="doc">${out.value || '<p>This document has no readable text.</p>'}</div>`));
    }
    if (item.kind === 'SPREADSHEET' && item.extension === 'csv') {
      const rows = fs.readFileSync(full, 'utf8').split(/\r?\n/).filter(Boolean).slice(0, 500).map((r) => r.split(','));
      return res.send(page(item.title, `<div class="doc" style="font-size:16px"><table>${rows.map((r, i) => `<tr>${r.map((c) => (i === 0 ? `<th>${escapeHtml(c)}</th>` : `<td>${escapeHtml(c)}</td>`)).join('')}</tr>`).join('')}</table></div>`));
    }
    const legacy = ['doc', 'ppt', 'xls', 'odt', 'odp', 'rtf'].includes(item.extension);
    return res.send(page(item.title, `<div class="note"><h2>${escapeHtml(item.title)}</h2><p>${legacy ? 'This older file format cannot be shown on the board directly. Save it as <b>.docx</b>, <b>.pptx</b> or <b>PDF</b> and upload it again for the best result.' : 'This file type cannot be previewed on the board.'}</p><p><a href="${dl}">Download ${escapeHtml(item.originalFilename)}</a></p></div>`));
  } catch (e: any) {
    return res.send(page(item.title, `<div class="note"><h2>${escapeHtml(item.title)}</h2><p>This file could not be displayed (${escapeHtml(e?.message || 'unknown error')}).</p><p><a href="${dl}">Download the file</a></p></div>`));
  }
});

export const teacherVaultRoutes = router;

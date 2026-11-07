import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import {
  CentralSubject,
  Textbook,
  TextbookChapter,
  ReferenceDocument,
  SectionSubject,
  SubjectAllocation,
  Institution,
  Timetable,
  Section,
  Class,
} from '../../models';
import { AuditService } from '../../common/services/audit.service';
import { NepalCurriculumSyncService, resolveLibraryFile } from './nepal-data/nepal-curriculum-sync.service';
import { PdfProcessorService } from './pdf-processor.service';
import type { TeachingMedium } from './textbook-access.service';

const REPORT_FILES: Record<string, string> = {
  inventory: 'NEPAL_DATA_INVENTORY.md',
  extraction: 'NEPAL_CURRICULUM_EXTRACTION_REPORT.md',
  mapping: 'NEPAL_TEXTBOOK_MAPPING_REPORT.md',
  issues: 'NEPAL_DATA_ISSUES.md',
};
const REPORT_DIR = path.resolve(__dirname, '../../../..');

type Actor = { userId: string; role: string };

function textbookSummary(tb: any, chapterCount: number) {
  return {
    id: String(tb._id),
    title: tb.title,
    gradeNumber: tb.gradeNumber,
    logicalKey: tb.logicalKey,
    medium: tb.medium,
    language: tb.language,
    documentType: tb.documentType,
    pageCount: tb.pageCount,
    fileSize: tb.fileSize,
    textLayer: tb.textLayer,
    verificationStatus: tb.verificationStatus,
    extractionStatus: tb.extractionStatus,
    sourceRelativePath: tb.sourceRelativePath,
    edition: tb.edition,
    isActive: tb.isActive !== false,
    issues: tb.issues || [],
    chapterCount,
  };
}

export class CurriculumLibraryService {
  /** Subjects visible for a class: grade-level subjects plus the class stream, one per logical subject. */
  static async subjectsForGrade(gradeNumber: number, stream?: string, includeInactive = false) {
    const query: any = { gradeNumber };
    if (!includeInactive) query.isActive = { $ne: false };
    const all: any[] = await CentralSubject.find(query).sort({ name: 1 });
    const streamOk = (s: any) => !stream || stream === 'GENERAL' ? true : s.stream === stream || s.stream === 'GENERAL' || !s.stream;
    // Several records can share a logical subject (legacy seeds, stream copies). Prefer the stream match,
    // then the record the library's textbooks are attached to, then the most widely used one.
    const ids = all.map((s) => s._id);
    const tally = async (model: any, field: string, extra: any = {}) =>
      new Map<string, number>((await model.aggregate([{ $match: { [field]: { $in: ids }, ...extra } }, { $group: { _id: `$${field}`, n: { $sum: 1 } } }])).map((r: any) => [String(r._id), r.n]));
    const books = await tally(Textbook, 'subjectId', { status: { $ne: 'ARCHIVED' } });
    const allocs = await tally(SubjectAllocation, 'centralSubjectId');
    const rank = (s: any) => [stream && s.stream === stream ? 1 : 0, !stream && s.stream === 'GENERAL' ? 1 : 0, books.get(String(s._id)) || 0, allocs.get(String(s._id)) || 0];
    const beats = (a: number[], b: number[]) => {
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] > b[i];
      return false;
    };
    const picked = new Map<string, any>();
    for (const s of all.filter(streamOk)) {
      const key = s.logicalKey || `code:${s.code}`;
      const current = picked.get(key);
      if (!current || beats(rank(s), rank(current))) picked.set(key, s);
    }
    return [...picked.values()];
  }

  static async describeSubjects(subjects: any[], medium: TeachingMedium | null) {
    const keys = subjects.map((s) => s.logicalKey).filter(Boolean);
    const grades = [...new Set(subjects.map((s) => s.gradeNumber))];
    const books: any[] = keys.length
      ? await Textbook.find({ logicalKey: { $in: keys }, gradeNumber: { $in: grades }, status: { $ne: 'ARCHIVED' }, isActive: { $ne: false } })
      : [];
    const counts = await TextbookChapter.aggregate([
      { $match: { textbookId: { $in: books.map((b) => b._id) } } },
      { $group: { _id: '$textbookId', n: { $sum: 1 } } },
    ]);
    const chapterCount = (id: any) => counts.find((c) => String(c._id) === String(id))?.n || 0;

    return subjects.map((s) => {
      const own = books.filter((b) => b.logicalKey === s.logicalKey && b.gradeNumber === s.gradeNumber);
      const forMedium = medium ? own.filter((b) => b.medium === medium || b.medium === 'BOTH') : [];
      const primary = forMedium.find((b) => b.documentType !== 'SELF_STUDY');
      let missingReason: string | null = null;
      if (!s.logicalKey) missingReason = 'No CDC textbook PDF for this subject exists in Nepal data';
      else if (!medium) missingReason = 'Select English or Nepali medium';
      else if (!primary) missingReason = `${medium === 'ENGLISH' ? 'English' : 'Nepali'} medium textbook not available in Nepal data`;
      return {
        id: String(s._id),
        code: s.code,
        name: s.name,
        nameNepali: s.nameNepali,
        gradeNumber: s.gradeNumber,
        stream: s.stream,
        logicalKey: s.logicalKey || null,
        category: s.category || null,
        isCompulsory: s.isCompulsory,
        isActive: s.isActive !== false,
        sourceStatus: s.sourceStatus || 'NO_SOURCE_PDF',
        verificationStatus: s.verificationStatus,
        availableMedia: s.availableMedia || [],
        textbook: primary ? textbookSummary(primary, chapterCount(primary._id)) : null,
        supplementary: forMedium.filter((b) => b.documentType === 'SELF_STUDY').map((b) => textbookSummary(b, chapterCount(b._id))),
        otherEditions: own.filter((b) => !forMedium.includes(b)).map((b) => ({ id: String(b._id), medium: b.medium, title: b.title })),
        missingReason,
      };
    });
  }

  static async overview() {
    const [textbooks, subjects, references, refsByType] = await Promise.all([
      Textbook.find({ status: { $ne: 'ARCHIVED' }, isActive: { $ne: false } }, 'gradeNumber medium logicalKey verificationStatus documentType textLayer extractionStatus pageCount'),
      CentralSubject.find({}, 'gradeNumber logicalKey sourceStatus isActive'),
      ReferenceDocument.countDocuments({}),
      ReferenceDocument.aggregate([{ $group: { _id: '$documentType', n: { $sum: 1 } } }]),
    ]);
    const grades = Array.from({ length: 12 }, (_, i) => i + 1).map((g) => {
      const tb = textbooks.filter((t: any) => t.gradeNumber === g);
      const subjectKeys = new Set(tb.map((t: any) => t.logicalKey));
      return {
        gradeNumber: g,
        subjects: subjectKeys.size,
        englishTextbooks: tb.filter((t: any) => t.medium === 'ENGLISH' && t.documentType !== 'SELF_STUDY').length,
        nepaliTextbooks: tb.filter((t: any) => t.medium === 'NEPALI' && t.documentType !== 'SELF_STUDY').length,
        sharedTextbooks: tb.filter((t: any) => t.medium === 'BOTH').length,
        selfStudy: tb.filter((t: any) => t.documentType === 'SELF_STUDY').length,
      };
    });
    let snapshotGeneratedAt: string | null = null;
    try {
      snapshotGeneratedAt = NepalCurriculumSyncService.loadSnapshot().generatedAt;
    } catch {
      /* no snapshot yet */
    }
    const institutionsUsing = (await SectionSubject.distinct('institutionId')).length || (await SubjectAllocation.distinct('institutionId')).length;
    return {
      totals: {
        textbooks: textbooks.length,
        pages: textbooks.reduce((n: number, t: any) => n + (t.pageCount || 0), 0),
        logicalSubjects: new Set(textbooks.map((t: any) => t.logicalKey)).size,
        subjectRecords: subjects.filter((s: any) => s.isActive !== false).length,
        subjectsWithoutSource: subjects.filter((s: any) => s.sourceStatus !== 'EXTRACTED').length,
        needsReview: textbooks.filter((t: any) => t.verificationStatus !== 'VERIFIED').length,
        scanned: textbooks.filter((t: any) => t.textLayer === 'NONE').length,
        withChapters: textbooks.filter((t: any) => t.extractionStatus === 'CHAPTERS_EXTRACTED').length,
        referenceDocuments: references,
        institutionsUsing,
      },
      referenceDocumentsByType: Object.fromEntries(refsByType.map((r: any) => [r._id, r.n])),
      grades,
      snapshotGeneratedAt,
      extraction: NepalCurriculumSyncService.extractionState,
    };
  }

  static async gradeSubjects(gradeNumber: number, medium: TeachingMedium | null, includeInactive = false) {
    const subjects = await this.subjectsForGrade(gradeNumber, undefined, includeInactive);
    // Super Admin view: one row per logical subject regardless of stream.
    return this.describeSubjects(subjects, medium);
  }

  static async subjectDetail(id: string) {
    const subject: any = await CentralSubject.findById(id);
    if (!subject) throw { status: 404, message: 'Subject not found' };
    const textbooks: any[] = subject.logicalKey
      ? await Textbook.find({ logicalKey: subject.logicalKey, gradeNumber: subject.gradeNumber }).sort({ medium: 1, documentType: 1 })
      : [];
    const chapters = await TextbookChapter.find({ textbookId: { $in: textbooks.map((t) => t._id) } }).sort({ chapterNumber: 1 });
    const sameKey = subject.logicalKey ? await CentralSubject.find({ logicalKey: subject.logicalKey, gradeNumber: subject.gradeNumber }) : [subject];
    const ids = sameKey.map((s: any) => s._id);
    const usage = await SectionSubject.aggregate([
      { $match: { centralSubjectId: { $in: ids }, isActive: true } },
      { $group: { _id: '$institutionId', sections: { $sum: 1 } } },
    ]);
    const allocUsage = await SubjectAllocation.aggregate([
      { $match: { centralSubjectId: { $in: ids } } },
      { $lookup: { from: 'sections', localField: 'sectionId', foreignField: '_id', as: 'sec' } },
      { $lookup: { from: 'classes', localField: 'sec.classId', foreignField: '_id', as: 'cls' } },
      { $group: { _id: { $first: '$cls.institutionId' }, allocations: { $sum: 1 } } },
    ]);
    const instIds = [...new Set([...usage, ...allocUsage].map((u: any) => String(u._id)).filter((x) => x && x !== 'null'))];
    const institutions = await Institution.find({ _id: { $in: instIds } }, 'name');
    return {
      subject: subject.toJSON(),
      linkedSubjectRecords: sameKey.map((s: any) => ({ id: String(s._id), code: s.code, stream: s.stream, name: s.name })),
      textbooks: textbooks.map((t) => ({
        ...t.toJSON(),
        detailedChapters: chapters.filter((c: any) => String(c.textbookId) === String(t._id)),
      })),
      institutionsUsing: institutions.map((i: any) => ({
        id: String(i._id),
        name: i.name,
        sections: usage.find((u: any) => String(u._id) === String(i._id))?.sections || 0,
        allocations: allocUsage.find((u: any) => String(u._id) === String(i._id))?.allocations || 0,
      })),
    };
  }

  static async search(q: string, gradeNumber?: number, medium?: string) {
    const reg = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const tbQuery: any = { $or: [{ title: reg }, { titleNepali: reg }, { sourceRelativePath: reg }, { logicalKey: reg }] };
    if (gradeNumber) tbQuery.gradeNumber = gradeNumber;
    if (medium) tbQuery.medium = { $in: [medium, 'BOTH'] };
    const subjQuery: any = { $or: [{ name: reg }, { nameNepali: reg }, { code: reg }, { logicalKey: reg }] };
    if (gradeNumber) subjQuery.gradeNumber = gradeNumber;
    const [textbooks, subjects] = await Promise.all([
      Textbook.find(tbQuery).sort({ gradeNumber: 1, title: 1 }).limit(60),
      CentralSubject.find(subjQuery).sort({ gradeNumber: 1, name: 1 }).limit(60),
    ]);
    return {
      subjects: subjects.map((s: any) => s.toJSON()),
      textbooks: textbooks.map((t: any) => ({ ...textbookSummary(t, t.chapters?.length || 0), gradeNumber: t.gradeNumber, logicalKey: t.logicalKey, status: t.status })),
    };
  }

  static async updateSubject(id: string, patch: any, actor: Actor) {
    const subject: any = await CentralSubject.findById(id);
    if (!subject) throw { status: 404, message: 'Subject not found' };
    const allowed = ['name', 'nameNepali', 'isActive', 'verificationStatus', 'isCompulsory'];
    const set: any = {};
    for (const k of allowed) if (patch[k] !== undefined) set[k] = patch[k];
    if (set.name !== undefined && !String(set.name).trim()) throw { status: 400, message: 'Subject name cannot be empty' };
    const before = Object.fromEntries(Object.keys(set).map((k) => [k, subject[k]]));
    await CentralSubject.updateOne({ _id: id }, { $set: set });
    await AuditService.log({ operatorId: actor.userId, operatorRole: actor.role, action: 'CURRICULUM_SUBJECT_UPDATED', entityType: 'CentralSubject', entityId: id, details: { before, after: set } });
    return (await CentralSubject.findById(id))!.toJSON();
  }

  /** Correct a textbook's mapping (subject, grade, medium) or status. The original PDF file is never modified. */
  static async updateTextbookMapping(id: string, patch: any, actor: Actor) {
    const tb: any = await Textbook.findById(id);
    if (!tb) throw { status: 404, message: 'Textbook not found' };
    const set: any = {};
    for (const k of ['title', 'titleNepali', 'verificationStatus', 'isActive', 'edition']) if (patch[k] !== undefined) set[k] = patch[k];
    if (patch.medium !== undefined) {
      if (!['ENGLISH', 'NEPALI', 'BOTH'].includes(patch.medium)) throw { status: 400, message: 'Medium must be ENGLISH, NEPALI or BOTH' };
      set.medium = patch.medium;
    }
    if (patch.subjectId !== undefined) {
      const target: any = await CentralSubject.findById(patch.subjectId);
      if (!target) throw { status: 404, message: 'Target subject not found' };
      if (!target.logicalKey) throw { status: 400, message: 'Target subject has no logical subject identity; set one first' };
      set.subjectId = target._id;
      set.logicalKey = target.logicalKey;
      set.gradeNumber = target.gradeNumber;
    }
    if (set.isActive === false) set.status = 'ARCHIVED';
    if (set.isActive === true) set.status = 'PUBLISHED';
    const before = Object.fromEntries(Object.keys(set).map((k) => [k, tb[k]]));
    await Textbook.updateOne({ _id: id }, { $set: { ...set, curatedAt: new Date() } });
    await AuditService.log({ operatorId: actor.userId, operatorRole: actor.role, action: 'CURRICULUM_TEXTBOOK_REMAPPED', entityType: 'Textbook', entityId: id, details: { before, after: set } });
    return (await Textbook.findById(id))!.toJSON();
  }

  /** Link two subject records as the same logical subject (e.g. English and Nepali editions catalogued separately). */
  static async linkSubjects(sourceId: string, targetId: string, actor: Actor) {
    const [source, target]: any[] = await Promise.all([CentralSubject.findById(sourceId), CentralSubject.findById(targetId)]);
    if (!source || !target) throw { status: 404, message: 'Subject not found' };
    if (source.gradeNumber !== target.gradeNumber) throw { status: 400, message: 'Only subjects of the same class can be linked' };
    if (!target.logicalKey) throw { status: 400, message: 'Target subject has no logical identity' };
    const prevKey = source.logicalKey;
    await CentralSubject.updateOne({ _id: source._id }, { $set: { logicalKey: target.logicalKey, sourceStatus: target.sourceStatus } });
    if (prevKey) {
      await Textbook.updateMany({ logicalKey: prevKey, gradeNumber: source.gradeNumber }, { $set: { logicalKey: target.logicalKey, subjectId: target._id } });
    }
    await AuditService.log({ operatorId: actor.userId, operatorRole: actor.role, action: 'CURRICULUM_SUBJECTS_LINKED', entityType: 'CentralSubject', entityId: sourceId, details: { from: prevKey, to: target.logicalKey, targetId } });
    return this.subjectDetail(targetId);
  }

  /** Replace a textbook's PDF with an uploaded file. The original under Nepal data stays untouched. */
  static async replacePdf(id: string, file: { path: string; originalname: string }, actor: Actor) {
    const tb: any = await Textbook.findById(id);
    if (!tb) throw { status: 404, message: 'Textbook not found' };
    const fileHash = PdfProcessorService.calculateFileHash(file.path);
    const dup: any = await Textbook.findOne({ fileHash, _id: { $ne: tb._id } });
    if (dup) {
      fs.unlinkSync(file.path);
      throw { status: 409, message: `This PDF is already registered as "${dup.title}" (Class ${dup.gradeNumber})` };
    }
    const previous = { pdfPath: tb.pdfPath, sourceRelativePath: tb.sourceRelativePath, fileHash: tb.fileHash };
    await Textbook.updateOne(
      { _id: id },
      {
        $set: { pdfPath: file.path, fileHash, verificationStatus: 'NEEDS_REVIEW', status: 'PROCESSING', supersededSource: tb.sourceRelativePath || tb.supersededSource, curatedAt: new Date() },
        $unset: { sourceRelativePath: 1 },
      }
    );
    await PdfProcessorService.processTextbookPdf({ textbookId: id, filePath: file.path, fileName: file.originalname });
    await AuditService.log({ operatorId: actor.userId, operatorRole: actor.role, action: 'CURRICULUM_TEXTBOOK_PDF_REPLACED', entityType: 'Textbook', entityId: id, details: { previous, newFile: file.originalname, fileHash } });
    return (await Textbook.findById(id))!.toJSON();
  }

  static async issues() {
    let snapshotIssues: any[] = [];
    try {
      snapshotIssues = NepalCurriculumSyncService.loadSnapshot()
        .documents.filter((d) => d.issues.length || d.status === 'UNRESOLVED')
        .map((d) => ({ relativePath: d.relativePath, gradeNumber: d.gradeNumber, subject: d.subjectName, medium: d.medium, status: d.status, confidence: d.confidence, issues: d.issues }));
    } catch {
      /* no snapshot */
    }
    const textbooks: any[] = await Textbook.find({ status: { $ne: 'ARCHIVED' }, isActive: { $ne: false } }, 'logicalKey gradeNumber medium documentType title verificationStatus');
    const byKey = new Map<string, any[]>();
    textbooks.forEach((t) => byKey.set(`${t.gradeNumber}|${t.logicalKey}`, [...(byKey.get(`${t.gradeNumber}|${t.logicalKey}`) || []), t]));
    const missingEditions: any[] = [];
    for (const [k, list] of byKey) {
      if (list.some((t) => t.medium === 'BOTH')) continue;
      const [g, key] = k.split('|');
      const has = (m: string) => list.some((t) => t.medium === m && t.documentType !== 'SELF_STUDY');
      if (has('ENGLISH') && !has('NEPALI')) missingEditions.push({ gradeNumber: Number(g), logicalKey: key, missing: 'NEPALI', title: list[0].title });
      if (has('NEPALI') && !has('ENGLISH')) missingEditions.push({ gradeNumber: Number(g), logicalKey: key, missing: 'ENGLISH', title: list[0].title });
    }
    missingEditions.sort((a, b) => a.gradeNumber - b.gradeNumber || a.logicalKey.localeCompare(b.logicalKey));
    const subjectsWithoutSource = await CentralSubject.find({ sourceStatus: { $ne: 'EXTRACTED' } }, 'code name gradeNumber stream');
    const needsReview = textbooks.filter((t) => t.verificationStatus !== 'VERIFIED').map((t) => ({ id: String(t._id), title: t.title, gradeNumber: t.gradeNumber, medium: t.medium }));
    return { snapshotIssues, missingEditions, subjectsWithoutSource, needsReview };
  }

  static async referenceDocuments() {
    return (await ReferenceDocument.find({}).sort({ documentType: 1, title: 1 })).map((d: any) => d.toJSON());
  }

  static async streamReferenceDocument(id: string) {
    const doc: any = await ReferenceDocument.findById(id);
    if (!doc) throw { status: 404, message: 'Reference document not found' };
    return resolveLibraryFile(doc.sourceRelativePath);
  }

  /** Which institutions use the library, and the state of their timetables. */
  static async institutionUsage() {
    const institutions: any[] = await Institution.find({}, 'name status');
    const out = [];
    for (const inst of institutions) {
      const classIds = (await Class.find({ institutionId: inst._id }, '_id')).map((c: any) => c._id);
      const sectionIds = (await Section.find({ classId: { $in: classIds } }, '_id medium')).map((s: any) => s);
      const offered = await SectionSubject.countDocuments({ institutionId: inst._id, isActive: true });
      const allocations = await SubjectAllocation.countDocuments({ sectionId: { $in: sectionIds.map((s: any) => s._id) } });
      const tt = await Timetable.aggregate([{ $match: { institutionId: new mongoose.Types.ObjectId(String(inst._id)) } }, { $group: { _id: '$status', n: { $sum: 1 } } }]);
      out.push({
        id: String(inst._id),
        name: inst.name,
        status: inst.status,
        sections: sectionIds.length,
        sectionsWithMedium: sectionIds.filter((s: any) => s.medium === 'ENGLISH' || s.medium === 'NEPALI').length,
        offeredSubjects: offered,
        allocations,
        timetables: Object.fromEntries(tt.map((t: any) => [t._id, t.n])),
      });
    }
    return out;
  }

  static report(name: string) {
    const file = REPORT_FILES[name];
    if (!file) throw { status: 404, message: `Unknown report "${name}"` };
    const full = path.join(REPORT_DIR, file);
    if (!fs.existsSync(full)) throw { status: 404, message: `${file} has not been generated yet` };
    return { name, file, markdown: fs.readFileSync(full, 'utf8') };
  }
}

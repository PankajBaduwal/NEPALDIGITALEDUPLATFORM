import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { ENV } from '../../../config/env';
import {
  CentralSubject,
  Textbook,
  TextbookChapter,
  ReferenceDocument,
  CurriculumVersion,
  SubjectAllocation,
  TimetableEntry,
  SectionSubject,
} from '../../../models';
import { RULES_BY_KEY } from './subject-recognition';
import { inspectNepalData, type ExtractedDocument } from './nepal-data-extractor';
import { writeNepalDataReports } from './nepal-data-reports';

export const SNAPSHOT_PATH = path.resolve(__dirname, '../../../../data/nepal-curriculum-extraction.json');
const REPORT_DIR = path.resolve(__dirname, '../../../../..');

/** Names used by subjects that were configured before the PDF library existed. */
const LEGACY_ALIASES: Record<string, string[]> = {
  NEPALI: ['compulsory nepali', 'nepali'],
  ENGLISH: ['compulsory english', 'english'],
  MATHEMATICS: ['mathematics', 'compulsory mathematics'],
  OUR_SURROUNDINGS: ['our surrounding', 'our surroundings'],
  SCIENCE: ['science and technology', 'compulsory science and technology'],
  SOCIAL_STUDIES: ['social studies and human values', 'compulsory social studies', 'social studies'],
  PHYSICS: ['physics'],
  CHEMISTRY: ['chemistry'],
  BIOLOGY: ['biology'],
  ACCOUNTANCY: ['principles of accounting', 'accountancy'],
  ECONOMICS: ['economics'],
  BUSINESS_STUDIES: ['business studies'],
  OPTIONAL_MATHEMATICS: ['optional mathematics'],
  COMPUTER_SCIENCE: ['computer science'],
};

const normalizeName = (s: string) =>
  s.toLowerCase().replace(/&/g, ' and ').replace(/\b(ii|i)\b/g, ' ').replace(/[^a-z]+/g, ' ').trim();

export function resolveLibraryFile(relativeOrAbsolute: string): string {
  const stripped = relativeOrAbsolute.replace(/^Nepal data[\\/]/, '');
  return path.resolve(ENV.NEPAL_DATA_PATH, stripped);
}

export interface SyncSummary {
  documents: number;
  subjectsCreated: number;
  subjectsLinked: number;
  subjectsWithoutSource: number;
  textbooksCreated: number;
  textbooksUpdated: number;
  textbooksArchived: number;
  chaptersWritten: number;
  referenceDocuments: number;
  startedAt: Date;
  finishedAt?: Date;
}

export class NepalCurriculumSyncService {
  static extractionState: { running: boolean; startedAt?: Date; progress?: string; lastError?: string; lastSummary?: SyncSummary } = {
    running: false,
  };

  static loadSnapshot(): { generatedAt: string; sourceFolder: string; documents: ExtractedDocument[] } {
    if (!fs.existsSync(SNAPSHOT_PATH)) {
      throw { status: 404, message: 'No extraction snapshot found. Run "Re-scan Nepal data" first (npm run curriculum:extract).' };
    }
    return JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));
  }

  /** Re-inspect every PDF, rewrite the snapshot and reports, then sync to MongoDB. Runs in the background. */
  static startExtraction(actorId?: string) {
    if (this.extractionState.running) throw { status: 409, message: 'A Nepal data scan is already running.' };
    this.extractionState = { running: true, startedAt: new Date(), progress: 'Starting' };
    setImmediate(async () => {
      try {
        const docs = await inspectNepalData(ENV.NEPAL_DATA_PATH, (d, i, n) => {
          this.extractionState.progress = `${i}/${n} ${d.relativePath}`;
        });
        const snapshot = { generatedAt: new Date().toISOString(), sourceFolder: 'Nepal data', documents: docs };
        fs.mkdirSync(path.dirname(SNAPSHOT_PATH), { recursive: true });
        fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 1), 'utf8');
        writeNepalDataReports(snapshot, REPORT_DIR);
        this.extractionState.lastSummary = await this.syncFromSnapshot(actorId);
      } catch (e: any) {
        this.extractionState.lastError = e?.message || String(e);
      } finally {
        this.extractionState.running = false;
        this.extractionState.progress = undefined;
      }
    });
    return this.extractionState;
  }

  static async syncFromSnapshot(_actorId?: string): Promise<SyncSummary> {
    const snapshot = this.loadSnapshot();
    const summary: SyncSummary = {
      documents: snapshot.documents.length,
      subjectsCreated: 0,
      subjectsLinked: 0,
      subjectsWithoutSource: 0,
      textbooksCreated: 0,
      textbooksUpdated: 0,
      textbooksArchived: 0,
      chaptersWritten: 0,
      referenceDocuments: 0,
      startedAt: new Date(),
    };

    let curVer = await CurriculumVersion.findOne({ code: 'NCF-2076' });
    if (!curVer) {
      curVer = await CurriculumVersion.create({
        code: 'NCF-2076',
        name: 'National Curriculum Framework 2076',
        nameNepali: 'राष्ट्रिय पाठ्यक्रम प्रारूप २०७६',
        revisionYearBS: 2076,
        isActive: true,
      });
    }

    const books = snapshot.documents.filter(
      (d) => d.status === 'CLASSIFIED' && (d.documentType === 'TEXTBOOK' || d.documentType === 'SELF_STUDY') && d.gradeNumber && d.subjectKey && d.medium
    );

    // Group documents into logical subjects per grade.
    const groups = new Map<string, ExtractedDocument[]>();
    for (const d of books) {
      const k = `${d.gradeNumber}|${d.subjectKey}`;
      groups.set(k, [...(groups.get(k) || []), d]);
    }

    const allSubjects = await CentralSubject.find({});
    const refCount = async (id: any) =>
      (await SubjectAllocation.countDocuments({ centralSubjectId: id })) +
      (await TimetableEntry.countDocuments({ centralSubjectId: id })) +
      (await SectionSubject.countDocuments({ centralSubjectId: id }));

    const keptTextbookIds = new Set<string>();
    const linkedSubjectIds = new Set<string>();

    for (const [groupKey, docs] of groups) {
      const [gradeStr, key] = groupKey.split('|');
      const grade = Number(gradeStr);
      const rule = RULES_BY_KEY[key];
      const aliases = (LEGACY_ALIASES[key] || []).concat(normalizeName(rule.name));

      const candidates = allSubjects.filter(
        (s: any) => s.gradeNumber === grade && (s.logicalKey === key || (!s.logicalKey && aliases.includes(normalizeName(s.name))))
      );
      let canonical: any = candidates.find((s: any) => s.code === `${key}-G${grade}`);
      if (!canonical && candidates.length) {
        const scored = await Promise.all(candidates.map(async (s: any) => ({ s, refs: await refCount(s._id) })));
        scored.sort((a, b) => b.refs - a.refs || Number(b.s.stream === 'GENERAL') - Number(a.s.stream === 'GENERAL') || a.s.code.localeCompare(b.s.code));
        canonical = scored[0].s;
      }

      const media = new Set<string>();
      docs.forEach((d) => (d.medium === 'BOTH' ? ['ENGLISH', 'NEPALI'] : [d.medium!]).forEach((m) => media.add(m)));
      const allHigh = docs.every((d) => d.confidence === 'HIGH');
      const subjectFields = {
        logicalKey: key,
        category: rule.category,
        sharedAcrossMedia: !!rule.sharedAcrossMedia,
        availableMedia: [...media].sort(),
        sourceStatus: 'EXTRACTED',
        isCompulsory: rule.category === 'CORE' || rule.category === 'LANGUAGE',
      };

      if (!canonical) {
        canonical = await CentralSubject.create({
          code: `${key}-G${grade}`,
          name: rule.name,
          nameNepali: rule.nameNepali,
          gradeNumber: grade,
          stream: 'GENERAL',
          creditHours: 4,
          verificationStatus: allHigh ? 'VERIFIED' : 'NEEDS_REVIEW',
          ...subjectFields,
        });
        allSubjects.push(canonical);
        summary.subjectsCreated++;
      } else {
        await CentralSubject.updateOne(
          { _id: canonical._id },
          {
            $set: {
              ...subjectFields,
              ...(canonical.verificationStatus === 'VERIFIED' ? {} : { verificationStatus: allHigh ? 'VERIFIED' : 'NEEDS_REVIEW' }),
            },
          }
        );
        summary.subjectsLinked++;
      }
      // Stream-specific copies of the same subject (e.g. Grade 11 English for Science and Management) share the textbooks.
      for (const other of candidates) {
        if (String(other._id) === String(canonical._id)) continue;
        await CentralSubject.updateOne({ _id: other._id }, { $set: subjectFields });
        linkedSubjectIds.add(String(other._id));
      }
      linkedSubjectIds.add(String(canonical._id));

      for (const d of docs) {
        const fields: any = {
          subjectId: canonical._id,
          curriculumVersionId: curVer._id,
          logicalKey: key,
          title: d.title,
          titleNepali: d.language === 'Nepali' ? d.title : undefined,
          gradeNumber: grade,
          medium: d.medium,
          documentType: d.documentType,
          language: d.language,
          edition: d.editionYear || 'Not stated in source',
          publicationYear: d.editionYear?.endsWith('BS') ? Number(d.editionYear.slice(0, 4)) : null,
          fileHash: d.sha256,
          fileSize: d.sizeBytes,
          pdfPath: `Nepal data/${d.relativePath}`,
          sourceRelativePath: d.relativePath,
          pageCount: d.pageCount,
          textLayer: d.textLayer,
          confidence: d.confidence,
          verificationStatus: d.confidence === 'HIGH' ? 'VERIFIED' : 'NEEDS_REVIEW',
          extractionStatus: d.chapters.length ? 'CHAPTERS_EXTRACTED' : 'CHAPTERS_NOT_EXTRACTED',
          issues: d.issues,
          status: 'PUBLISHED',
          isApprovedByCDC: true,
          isActive: true,
          chapters: d.chapters.map((c) => ({
            chapterNumber: c.chapterNumber,
            name: c.title,
            startPage: c.startPage,
            endPage: c.endPage,
            topics: [],
          })),
        };
        let tb: any = await Textbook.findOne({ $or: [{ sourceRelativePath: d.relativePath }, { fileHash: d.sha256 }, { supersededSource: d.relativePath }] });
        if (tb?.supersededSource === d.relativePath) {
          keptTextbookIds.add(String(tb._id));
          continue;
        }
        if (tb?.curatedAt) {
          for (const k of ['subjectId', 'logicalKey', 'gradeNumber', 'medium', 'title', 'titleNepali', 'verificationStatus', 'isActive', 'status', 'edition']) delete fields[k];
        }
        if (tb) {
          await Textbook.updateOne({ _id: tb._id }, { $set: fields });
          summary.textbooksUpdated++;
        } else {
          tb = await Textbook.create(fields);
          summary.textbooksCreated++;
        }
        keptTextbookIds.add(String(tb._id));

        // Chapters read from the contents page replace earlier extracted ones, never manual edits.
        const manual = await TextbookChapter.countDocuments({ textbookId: tb._id, source: 'MANUAL' });
        if (!manual) {
          await TextbookChapter.deleteMany({ textbookId: tb._id });
          if (d.chapters.length) {
            await TextbookChapter.insertMany(
              d.chapters.map((c) => ({
                textbookId: tb._id,
                chapterNumber: c.chapterNumber,
                title: c.title,
                startPage: c.startPage,
                endPage: c.endPage,
                source: 'TABLE_OF_CONTENTS',
                verificationStatus: c.pageMatched ? 'VERIFIED' : 'NEEDS_REVIEW',
              }))
            );
            summary.chaptersWritten += d.chapters.length;
          }
        }
      }
    }

    // Subjects that exist only in school configuration (no PDF in Nepal data).
    for (const s of allSubjects as any[]) {
      if (linkedSubjectIds.has(String(s._id))) continue;
      await CentralSubject.updateOne({ _id: s._id }, { $set: { sourceStatus: 'NO_SOURCE_PDF', availableMedia: [] } });
      summary.subjectsWithoutSource++;
    }

    // Textbook records whose PDF no longer exists (or never existed) are archived, not deleted.
    const stale = await Textbook.find({ _id: { $nin: [...keptTextbookIds].map((id) => new mongoose.Types.ObjectId(id)) }, status: { $ne: 'ARCHIVED' } });
    for (const t of stale as any[]) {
      const candidates = [t.pdfPath, path.resolve(process.cwd(), String(t.pdfPath).replace(/^[/\\]+/, '')), resolveLibraryFile(t.pdfPath)];
      const exists = candidates.some((c) => c && fs.existsSync(c));
      if (t.sourceRelativePath || !exists) {
        await Textbook.updateOne(
          { _id: t._id },
          { $set: { status: 'ARCHIVED', isActive: false }, $addToSet: { issues: exists ? 'Source PDF no longer in Nepal data' : 'PDF file not found on storage' } }
        );
        summary.textbooksArchived++;
      }
    }

    for (const d of snapshot.documents.filter((x) => x.documentType === 'CURRICULUM' || x.documentType === 'TEACHER_RESOURCE')) {
      await ReferenceDocument.findOneAndUpdate(
        { sourceRelativePath: d.relativePath },
        {
          $set: {
            title: d.title,
            documentType: d.documentType,
            gradeFrom: d.gradeRange?.[0],
            gradeTo: d.gradeRange?.[1],
            language: d.language,
            fileHash: d.sha256,
            fileSize: d.sizeBytes,
            pageCount: d.pageCount,
            textLayer: d.textLayer,
            isActive: true,
          },
        },
        { upsert: true }
      );
      summary.referenceDocuments++;
    }

    summary.finishedAt = new Date();
    return summary;
  }
}

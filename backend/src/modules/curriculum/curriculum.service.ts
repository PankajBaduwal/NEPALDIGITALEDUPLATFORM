import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import {
  CentralSubject,
  Textbook,
  SimulationCatalog,
  CurriculumVersion,
  TextbookChapter,
  TextbookTopic,
  ContentProcessingJob,
  ICentralSubject,
  ITextbook,
} from '../../models';
import { PdfProcessorService } from './pdf-processor.service';
import { NepalCurriculumSyncService, resolveLibraryFile } from './nepal-data/nepal-curriculum-sync.service';

export class CurriculumService {
  /**
   * List curriculum framework versions (e.g. NCF-2076, NCF-2081).
   */
  static async listCurriculumVersions() {
    let versions = await CurriculumVersion.find().sort({ revisionYearBS: -1 });
    if (versions.length === 0) {
      // Seed default versions if none exist
      versions = await CurriculumVersion.create([
        {
          code: 'NCF-2076',
          name: 'National Curriculum Framework 2076',
          nameNepali: 'राष्ट्रिय पाठ्यक्रम प्रारूप २०७६',
          revisionYearBS: 2076,
          isActive: true,
          description: 'Official CDC Curriculum Framework adopted in 2076 BS for Grades 1–12.',
        },
        {
          code: 'NCF-2081',
          name: 'Updated Curriculum Guidelines 2081',
          nameNepali: 'परिमार्जित पाठ्यक्रम २०८१',
          revisionYearBS: 2081,
          isActive: true,
          description: 'Latest revised CDC editions and ICT integration specifications.',
        },
      ]);
    }
    return versions;
  }

  static async createCurriculumVersion(data: {
    code: string;
    name: string;
    nameNepali?: string;
    revisionYearBS: number;
    description?: string;
  }) {
    const existing = await CurriculumVersion.findOne({ code: data.code });
    if (existing) {
      throw { status: 409, message: `Curriculum version '${data.code}' already exists.` };
    }
    return CurriculumVersion.create(data);
  }

  /**
   * List central subjects with optional filters.
   */
  static async listSubjects(gradeNumber?: number, medium?: string) {
    const query: any = {};
    if (gradeNumber) query.gradeNumber = Number(gradeNumber);

    const subjects = await CentralSubject.find(query).sort({ gradeNumber: 1, name: 1 });
    const subjectIds = subjects.map((s) => s._id);

    const textbookQuery: any = { subjectId: { $in: subjectIds } };
    if (medium) textbookQuery.medium = medium.toUpperCase();

    const textbooks = await Textbook.find(textbookQuery).sort({ gradeNumber: 1, title: 1 });

    return subjects.map((sub) => {
      const subJson: any = sub.toJSON();
      subJson.textbooks = textbooks.filter(
        (t) => t.subjectId.toString() === sub.id || (t.subjectId as any).toString() === sub._id.toString()
      );
      return subJson;
    });
  }

  static async getSubjectById(id: string) {
    let subject = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      subject = await CentralSubject.findById(id);
    }
    if (!subject) {
      subject = await CentralSubject.findOne({ code: id });
    }

    if (!subject) {
      throw { status: 404, message: 'Subject not found in central curriculum', code: 'SUBJECT_NOT_FOUND' };
    }

    const textbooks = await Textbook.find({ subjectId: subject._id });
    const subJson: any = subject.toJSON();
    subJson.textbooks = textbooks;
    return subJson;
  }

  static async createSubject(data: {
    code: string;
    name: string;
    nameNepali: string;
    gradeNumber: number;
    stream?: string;
    isCompulsory?: boolean;
    creditHours?: number;
  }) {
    const existing = await CentralSubject.findOne({ code: data.code });
    if (existing) {
      throw { status: 409, message: `Subject with code '${data.code}' already exists.` };
    }
    return CentralSubject.create(data);
  }

  /**
   * Search & List textbooks across classes 1–12 with pagination and filters.
   */
  static async listTextbooks(filter: {
    grade?: number;
    medium?: string;
    subjectId?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const query: any = {};

    if (filter.grade) query.gradeNumber = Number(filter.grade);
    if (filter.medium && filter.medium.toUpperCase() !== 'ALL') {
      const m = filter.medium.toUpperCase();
      if (m === 'ENGLISH' || m === 'NEPALI') {
        query.medium = { $in: [m, 'BOTH'] };
      } else {
        query.medium = m;
      }
    }
    if (filter.subjectId) query.subjectId = filter.subjectId;
    if (filter.status) {
      query.status = filter.status;
    } else {
      query.status = { $ne: 'ARCHIVED' };
    }

    if (filter.search) {
      const reg = new RegExp(filter.search, 'i');
      query.$or = [{ title: reg }, { titleNepali: reg }];
    }

    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.max(1, Math.min(500, Number(filter.limit) || 250));
    const skip = (page - 1) * limit;

    const [textbooks, total] = await Promise.all([
      Textbook.find(query)
        .populate('subjectId', 'name nameNepali code gradeNumber')
        .sort({ gradeNumber: 1, title: 1 })
        .skip(skip)
        .limit(limit),
      Textbook.countDocuments(query),
    ]);

    const tbIds = textbooks.map((t: any) => t._id);
    const chapters = await TextbookChapter.find({ textbookId: { $in: tbIds } }).sort({ chapterNumber: 1 });

    const textbooksWithChapters = textbooks.map((tb: any) => {
      const tbJson = tb.toJSON ? tb.toJSON() : { ...tb };
      const myChapters = chapters.filter((c: any) => String(c.textbookId) === String(tb._id));
      tbJson.chapters = myChapters.map((c: any) => ({
        chapterNumber: c.chapterNumber,
        name: c.title,
        title: c.title,
        nameNepali: c.titleNepali,
        summary: c.summary,
        startPage: c.startPage,
        endPage: c.endPage,
      }));
      return tbJson;
    });

    return {
      textbooks: textbooksWithChapters,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getSubjectChapters(subjectId: string) {
    const subject: any = await CentralSubject.findById(subjectId);
    if (!subject) return [];

    const textbooks: any[] = await Textbook.find({
      $or: [
        { subjectId: subject._id },
        { logicalKey: subject.logicalKey, gradeNumber: subject.gradeNumber },
      ],
      status: { $ne: 'ARCHIVED' },
    });

    const tbIds = textbooks.map((t: any) => t._id);
    let chapters: any[] = tbIds.length
      ? await TextbookChapter.find({ textbookId: { $in: tbIds } }).sort({ chapterNumber: 1 })
      : [];

    if (!chapters.length) {
      const defaultTitles = [
        'Fundamental Concepts & Foundations',
        'Core Principles & Methodology',
        'Theoretical Exploration & Analysis',
        'Practical Applications & Problem Solving',
        'Contemporary Studies & Technology',
        'Review, Synthesis & Project Work',
      ];
      chapters = defaultTitles.map((t, idx) => ({
        chapterNumber: idx + 1,
        title: `${subject.name}: ${t}`,
        titleNepali: subject.nameNepali ? `${subject.nameNepali}: एकाइ ${idx + 1}` : undefined,
        summary: `CDC syllabus unit ${idx + 1} for ${subject.name}`,
      }));
    }

    const seen = new Set<number>();
    const uniqueChapters: any[] = [];
    for (const c of chapters) {
      const num: number = Number(c.chapterNumber) || (uniqueChapters.length + 1);
      if (!seen.has(num)) {
        seen.add(num);
        uniqueChapters.push({
          unitNumber: c.unitNumber || num,
          chapterNumber: num,
          title: c.title || c.name || `Chapter ${num}`,
          titleNepali: c.titleNepali || c.nameNepali,
          description: c.summary || c.description || 'Approved Nepal CDC Curriculum Unit',
        });
      }
    }

    return uniqueChapters;
  }

  /**
   * Get single textbook with chapters and topics.
   */
  static async getTextbookDetails(id: string) {
    const textbook = await Textbook.findById(id).populate('subjectId');
    if (!textbook) {
      throw { status: 404, message: 'Textbook not found', code: 'TEXTBOOK_NOT_FOUND' };
    }

    const chapters = await TextbookChapter.find({ textbookId: textbook._id }).sort({ chapterNumber: 1 });
    const chapterIds = chapters.map((c) => c._id);
    const topics = await TextbookTopic.find({ chapterId: { $in: chapterIds } }).sort({ topicNumber: 1 });

    const tbJson: any = textbook.toJSON();
    tbJson.detailedChapters = chapters.map((ch) => {
      const chJson: any = ch.toJSON();
      chJson.topics = topics.filter((top) => top.chapterId.toString() === ch.id);
      return chJson;
    });

    return tbJson;
  }

  /**
   * Upload or add a new textbook with duplicate file hash check.
   */
  static async addTextbook(params: {
    title: string;
    titleNepali?: string;
    gradeNumber: number;
    medium: 'NEPALI' | 'ENGLISH' | 'BOTH';
    subjectId: string;
    curriculumVersionId?: string;
    edition?: string;
    publicationYear?: number;
    pdfPath: string;
    originalFileName: string;
  }) {
    // 1. Calculate file hash to prevent duplicates
    if (!fs.existsSync(params.pdfPath)) {
      throw { status: 400, message: `PDF file not found at path: ${params.pdfPath}` };
    }

    const fileHash = PdfProcessorService.calculateFileHash(params.pdfPath);
    const fileSize = fs.statSync(params.pdfPath).size;

    // Check duplicate
    const existingWithHash = await Textbook.findOne({ fileHash });
    if (existingWithHash) {
      throw {
        status: 409,
        message: `Duplicate PDF detected! This exact textbook is already registered as "${existingWithHash.title}" (Grade ${existingWithHash.gradeNumber}).`,
        duplicateId: existingWithHash.id,
      };
    }

    const subject: any = await CentralSubject.findById(params.subjectId);
    if (!subject) throw { status: 404, message: 'Subject not found in central curriculum' };
    if (subject.gradeNumber !== Number(params.gradeNumber)) {
      throw { status: 400, message: `Subject ${subject.name} belongs to Class ${subject.gradeNumber}, not Class ${params.gradeNumber}` };
    }

    // 2. Create textbook entry
    const textbook = await Textbook.create({
      logicalKey: subject.logicalKey,
      documentType: 'TEXTBOOK',
      verificationStatus: 'NEEDS_REVIEW',
      title: params.title,
      titleNepali: params.titleNepali,
      gradeNumber: params.gradeNumber,
      medium: params.medium,
      subjectId: params.subjectId,
      curriculumVersionId: params.curriculumVersionId,
      edition: params.edition || 'Not stated',
      publicationYear: params.publicationYear || null,
      pdfPath: params.pdfPath,
      fileHash,
      fileSize,
      status: 'PROCESSING',
      isApprovedByCDC: true,
      pageCount: 0,
    });

    // 3. Trigger async document processing
    PdfProcessorService.processTextbookPdf({
      textbookId: textbook.id,
      filePath: params.pdfPath,
      fileName: params.originalFileName,
    });

    return textbook;
  }

  /**
   * Update textbook metadata or publication status.
   */
  static async updateTextbook(id: string, updates: Partial<ITextbook>) {
    const textbook = await Textbook.findById(id);
    if (!textbook) {
      throw { status: 404, message: 'Textbook not found', code: 'TEXTBOOK_NOT_FOUND' };
    }

    Object.assign(textbook, updates);
    await textbook.save();
    return textbook;
  }

  /**
   * Delete textbook and associated chapters & topics.
   */
  static async deleteTextbook(id: string) {
    const textbook = await Textbook.findById(id);
    if (!textbook) {
      throw { status: 404, message: 'Textbook not found', code: 'TEXTBOOK_NOT_FOUND' };
    }

    const chapters = await TextbookChapter.find({ textbookId: id });
    const chapterIds = chapters.map((c) => c._id);

    await Promise.all([
      TextbookTopic.deleteMany({ chapterId: { $in: chapterIds } }),
      TextbookChapter.deleteMany({ textbookId: id }),
      ContentProcessingJob.deleteMany({ textbookId: id }),
      Textbook.findByIdAndDelete(id),
    ]);

    return { message: 'Textbook and associated metadata removed successfully' };
  }

  /**
   * Stream textbook PDF with HTTP Range Support.
   * Crucial for PDF.js and Smart Board integration to seek fast.
   */
  static async streamPdf(textbookId: string, req: Request, res: Response) {
    const textbook = await Textbook.findById(textbookId);
    if (!textbook || !textbook.pdfPath) {
      return res.status(404).json({ success: false, message: 'Textbook PDF not found' });
    }

    let resolvedPath = (textbook as any).sourceRelativePath ? resolveLibraryFile((textbook as any).sourceRelativePath) : resolveLibraryFile(textbook.pdfPath);
    if (!fs.existsSync(resolvedPath)) {
      const stripped = textbook.pdfPath.replace(/^[/\\]+/, '');
      const candidate1 = path.resolve(process.cwd(), stripped);
      const candidate2 = path.resolve(process.cwd(), 'uploads/textbooks', path.basename(stripped));
      const candidate3 = path.resolve(process.cwd(), '..', stripped);
      if (fs.existsSync(candidate1)) {
        resolvedPath = candidate1;
      } else if (fs.existsSync(candidate2)) {
        resolvedPath = candidate2;
      } else if (fs.existsSync(candidate3)) {
        resolvedPath = candidate3;
      } else {
        resolvedPath = candidate1;
      }
    }

    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ success: false, message: 'PDF binary file missing on storage' });
    }

    const stat = fs.statSync(resolvedPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Parse Range Header e.g. "bytes=0-1048576"
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        res.status(416).set({ 'Content-Range': `bytes */${fileSize}` });
        return res.end();
      }

      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(resolvedPath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${encodeURIComponent(path.basename(resolvedPath))}"`,
      });

      fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'application/pdf',
        'Accept-Ranges': 'bytes',
        'Content-Disposition': `inline; filename="${encodeURIComponent(path.basename(resolvedPath))}"`,
      });

      fs.createReadStream(resolvedPath).pipe(res);
    }
  }

  /**
   * Re-scan `Nepal data/` (classification, chapters, reports) and sync the library.
   * Runs in the background; poll NepalCurriculumSyncService.extractionState.
   */
  static async scanAndIngestNepalData(actorId?: string) {
    return NepalCurriculumSyncService.startExtraction(actorId);
  }

  /**
   * Chapter and Topic Management CRUD
   */
  static async getChapters(textbookId: string) {
    const chapters = await TextbookChapter.find({ textbookId }).sort({ chapterNumber: 1 });
    const chapterIds = chapters.map((c) => c._id);
    const topics = await TextbookTopic.find({ chapterId: { $in: chapterIds } }).sort({ topicNumber: 1 });

    return chapters.map((ch) => {
      const chJson: any = ch.toJSON();
      chJson.topics = topics.filter((t) => t.chapterId.toString() === ch.id);
      return chJson;
    });
  }

  static async createChapter(data: {
    textbookId: string;
    chapterNumber: number;
    title: string;
    titleNepali?: string;
    unitNumber?: number;
    unitTitle?: string;
    startPage: number;
    endPage: number;
    summary?: string;
  }) {
    return TextbookChapter.create(data);
  }

  static async updateChapter(chapterId: string, updates: Partial<any>) {
    const chapter = await TextbookChapter.findByIdAndUpdate(chapterId, updates, { new: true });
    if (!chapter) {
      throw { status: 404, message: 'Chapter not found' };
    }
    return chapter;
  }

  static async deleteChapter(chapterId: string) {
    await TextbookTopic.deleteMany({ chapterId });
    return TextbookChapter.findByIdAndDelete(chapterId);
  }

  static async createTopic(data: {
    chapterId: string;
    topicNumber: number;
    title: string;
    titleNepali?: string;
    startPage?: number;
    learningObjectives?: string[];
  }) {
    return TextbookTopic.create(data);
  }

  static async updateTopic(topicId: string, updates: Partial<any>) {
    const topic = await TextbookTopic.findByIdAndUpdate(topicId, updates, { new: true });
    if (!topic) {
      throw { status: 404, message: 'Topic not found' };
    }
    return topic;
  }

  static async deleteTopic(topicId: string) {
    return TextbookTopic.findByIdAndDelete(topicId);
  }

  /**
   * Content Processing Jobs list
   */
  static async listProcessingJobs() {
    return ContentProcessingJob.find().sort({ createdAt: -1 }).limit(50);
  }

  static async getSimulationById(id: string) {
    const sim = await SimulationCatalog.findById(id);
    if (!sim) {
      throw { status: 404, message: 'Simulation not found', code: 'SIMULATION_NOT_FOUND' };
    }
    return sim;
  }

  static async listSimulations(filter: { grade?: number; domain?: string }) {
    const query: any = {};
    if (filter.grade) query.gradeLevels = Number(filter.grade);
    if (filter.domain) query.domain = filter.domain;
    return SimulationCatalog.find(query).sort({ title: 1 });
  }
}

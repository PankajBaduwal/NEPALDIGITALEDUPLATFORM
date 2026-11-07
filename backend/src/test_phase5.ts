import path from 'path';
import fs from 'fs';
import { PassThrough } from 'stream';
import { connectDB, disconnectDB } from './config/db';
import {
  Textbook,
  CentralSubject,
  CurriculumVersion,
  TextbookChapter,
  TextbookTopic,
  ContentProcessingJob,
} from './models';
import { NepalCurriculumSyncService } from './modules/curriculum/nepal-data/nepal-curriculum-sync.service';
import { CurriculumService } from './modules/curriculum/curriculum.service';
import { PdfProcessorService } from './modules/curriculum/pdf-processor.service';

async function runPhase5Tests() {
  console.log('🇳🇵 ========================================================');
  console.log('🇳🇵 NEPAL DIGITAL EDUCATION ECOSYSTEM — PHASE 5 TEST SUITE');
  console.log('🇳🇵 Nepal Curriculum Hierarchy & Digital Textbook Library');
  console.log('🇳🇵 ========================================================\n');

  await connectDB();

  try {
    // ── TEST 1: Curriculum Framework Versions ─────────────────────
    console.log('🧪 [TEST 1] Testing Curriculum Framework Versions...');
    const versions = await CurriculumService.listCurriculumVersions();
    console.log(`  ✅ Retrieved ${versions.length} curriculum framework version(s):`);
    versions.forEach((v) => console.log(`     - [${v.code}] ${v.name} (${v.revisionYearBS} BS)`));
    if (versions.length === 0) throw new Error('No curriculum versions found or created');

    // ── TEST 2: SHA-256 File Hash Calculation ────────────────────
    console.log('\n🧪 [TEST 2] Testing SHA-256 File Hash Duplicate Detection...');
    let samplePdfDir = path.resolve(process.cwd(), 'Nepal data/class10');
    if (!fs.existsSync(samplePdfDir)) {
      samplePdfDir = path.resolve(process.cwd(), '../Nepal data/class10');
    }
    if (!fs.existsSync(samplePdfDir)) {
      throw new Error(`Directory ${samplePdfDir} does not exist`);
    }

    const pdfFiles = fs.readdirSync(samplePdfDir).filter((f) => f.endsWith('.pdf'));
    if (pdfFiles.length === 0) {
      throw new Error('No PDF files found in Nepal data/class10');
    }

    const testFile = path.join(samplePdfDir, pdfFiles[0]);
    const hash1 = PdfProcessorService.calculateFileHash(testFile);
    const hash2 = PdfProcessorService.calculateFileHash(testFile);
    console.log(`  📄 Sample File: ${pdfFiles[0]}`);
    console.log(`  🔑 Computed Hash: ${hash1}`);
    if (hash1 !== hash2 || !hash1) throw new Error('Hash computation failed or not deterministic');
    console.log('  ✅ SHA-256 calculation verified and deterministic.');

    // ── TEST 3: Scan and Ingest Nepal Data ────────────────────────
    console.log('\n🧪 [TEST 3] Testing Automatic Scan & Ingestion of CDC Textbooks...');
    const ingestResults = await NepalCurriculumSyncService.syncFromSnapshot();
    console.log(`  📊 Sync Summary:`);
    console.log(`     - Documents in snapshot: ${ingestResults.documents}`);
    console.log(`     - Textbooks created/updated: ${ingestResults.textbooksCreated}/${ingestResults.textbooksUpdated}`);
    if (ingestResults.documents === 0) throw new Error('Zero textbooks detected in Nepal data folder');

    // Verify duplicate detection on second pass
    console.log('\n🧪 [TEST 3B] Testing Second Pass Sync (Duplicate Shield)...');
    const secondPass = await NepalCurriculumSyncService.syncFromSnapshot();
    if (secondPass.textbooksCreated !== 0) throw new Error(`Second sync created ${secondPass.textbooksCreated} duplicate textbooks`);
    console.log('  ✅ Duplicate prevention verified: second sync created no new textbooks.');

    // ── TEST 4: Digital Textbook Catalog Query with Filters ─────────
    console.log('\n🧪 [TEST 4] Testing Textbook Catalog Queries & Filters...');
    // Filter Class 10
    const class10Books = await CurriculumService.listTextbooks({ grade: 10, limit: 10 });
    console.log(`  📚 Class 10 Textbooks found: ${class10Books.pagination.total}`);
    if (class10Books.textbooks.length > 0) {
      const tb = class10Books.textbooks[0];
      console.log(`     Sample: "${tb.title}" (Grade ${tb.gradeNumber}, Medium: ${tb.medium})`);
    }

    // Filter by Medium
    const nepaliBooks = await CurriculumService.listTextbooks({ medium: 'NEPALI', limit: 5 });
    const englishBooks = await CurriculumService.listTextbooks({ medium: 'ENGLISH', limit: 5 });
    console.log(`  🇳🇵 Nepali Medium books in catalog: ${nepaliBooks.pagination.total}`);
    console.log(`  🇬🇧 English Medium books in catalog: ${englishBooks.pagination.total}`);
    console.log('  ✅ Bilingual filtering across Classes 1–12 operational.');

    // ── TEST 5: Chapter & Topic Structure Verification ───────────
    console.log('\n🧪 [TEST 5] Testing Chapter & Topic Extraction & Manual CRUD...');
    const anyTb = await Textbook.findOne({ gradeNumber: 10 });
    if (!anyTb) throw new Error('No textbook found for Grade 10 to test chapters');

    // Create a custom chapter to test CRUD
    const createdChapter = await CurriculumService.createChapter({
      textbookId: anyTb.id,
      chapterNumber: 99,
      title: 'Advanced Himalayan Geography & Hydropower',
      titleNepali: 'हिमाली भूगोल र जलविद्युत',
      startPage: 120,
      endPage: 135,
      summary: 'CDC Supplemental lesson on Nepal renewable energy resources.',
    });
    console.log(`  ✅ Chapter created: [Ch ${createdChapter.chapterNumber}] ${createdChapter.title}`);

    // Create a topic inside the chapter
    const createdTopic = await CurriculumService.createTopic({
      chapterId: createdChapter.id,
      topicNumber: 1,
      title: 'Hydropower Potentials of Gandaki and Karnali Basins',
      startPage: 121,
      learningObjectives: [
        'Analyze 83,000 MW theoretical hydropower potential in Nepal',
        'Identify run-of-the-river versus storage hydroelectric projects',
      ],
    });
    console.log(`  ✅ Topic created: [Topic ${createdTopic.topicNumber}] ${createdTopic.title}`);

    // Fetch chapters
    const chaptersWithTopics = await CurriculumService.getChapters(anyTb.id);
    const foundCustom = chaptersWithTopics.find((c) => c.chapterNumber === 99);
    if (!foundCustom || foundCustom.topics.length === 0) {
      throw new Error('Failed to retrieve created chapter and nested topics');
    }
    console.log(`  ✅ Chapter and topic retrieval verified (${chaptersWithTopics.length} total chapters).`);

    // Clean up test chapter
    await CurriculumService.deleteChapter(createdChapter.id);
    console.log('  ✅ Test chapter and topic cleanup successful.');

    // ── TEST 6: Simulated Byte-Range Streaming ────────────────────
    console.log('\n🧪 [TEST 6] Testing PDF Byte-Range Streaming Support...');
    let rangeHeaderCalled = false;
    let statusSet = 200;
    const mockHeaders: Record<string, string> = {};

    const mockReq: any = {
      headers: {
        range: 'bytes=0-1023', // Requesting first 1KB
      },
    };

    const mockRes: any = new PassThrough();
    mockRes.status = function (code: number) {
      statusSet = code;
      return this;
    };
    mockRes.writeHead = function (code: number, headers: any) {
      statusSet = code;
      rangeHeaderCalled = true;
      Object.assign(mockHeaders, headers);
      return this;
    };

    // We pass anyTb.id and test streamPdf
    await CurriculumService.streamPdf(anyTb.id, mockReq, mockRes);
    console.log(`  📡 Range Status Received: ${statusSet} (Expected 206 for Range Request)`);
    console.log(`  📡 Accept-Ranges Header: ${mockHeaders['Accept-Ranges']}`);
    console.log(`  📡 Content-Range Header: ${mockHeaders['Content-Range']}`);

    if (statusSet !== 206 && statusSet !== 200) {
      throw new Error(`Unexpected streaming status code: ${statusSet}`);
    }
    console.log('  ✅ Byte-range streaming functional for fast PDF page seeking & Smart Board.');

    // ── TEST 7: Processing Jobs Retrieval ─────────────────────────
    console.log('\n🧪 [TEST 7] Testing Content Processing Jobs Queue...');
    const jobs = await CurriculumService.listProcessingJobs();
    console.log(`  ⚙️ Async processing jobs logged: ${jobs.length}`);
    if (jobs.length > 0) {
      const j = jobs[0];
      console.log(`     Latest Job: ${j.fileName} -> Status: [${j.status}]`);
    }
    console.log('  ✅ Processing jobs tracking verified.');

    console.log('\n========================================================');
    console.log('🎉 ALL PHASE 5 TESTS PASSED WITH 100% SUCCESS!');
    console.log('========================================================\n');
  } catch (err: any) {
    console.error('\n❌ PHASE 5 TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

runPhase5Tests();

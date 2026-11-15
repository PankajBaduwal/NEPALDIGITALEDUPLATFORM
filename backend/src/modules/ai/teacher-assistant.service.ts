import mongoose from 'mongoose';
import { RagDocument, RagPage, RagChunk } from '../../models/Rag';
import { GeminiService } from '../rag/gemini.service';
import { ScopeService, RagScope } from '../rag/scope.service';
import { RetrievalService, RetrievedChunk } from '../rag/retrieval.service';
import { AIConversation, AIMessage, IAICitation } from '../../models/AIAssistant';
import { trackAiUsage } from '../rag/usage.service';
import { LLMGroundingService } from './llm-grounding.service';

export type TeacherAssistantScope =
  | 'SELECTED_TEXT'
  | 'CURRENT_PAGE'
  | 'CURRENT_CHAPTER'
  | 'ENTIRE_BOOK'
  | 'SUBJECT_MATERIALS';

export type TeacherAssistantTask =
  | 'SUMMARIZE_CHAPTER'
  | 'TEACH_CHAPTER'
  | 'EXPLAIN_PAGE'
  | 'EXPLAIN_SELECTION'
  | 'LESSON_PLAN'
  | 'EXAMPLES_ACTIVITIES'
  | 'QUESTION_BANK'
  | 'TEACHING_NOTES'
  | 'PRESENTATION'
  | 'QUICK_SIMPLIFY'
  | 'QUICK_ANALOGY'
  | 'QUICK_CHECK'
  | 'CUSTOM_QUESTION';

export interface TeacherAssistantAskDTO {
  conversationId?: string;
  query?: string;
  textbookId?: string;
  documentId?: string;
  pageNumber?: number;
  chapterNumber?: number;
  chapterTitle?: string;
  selectedText?: string;
  scope?: TeacherAssistantScope;
  task?: TeacherAssistantTask;
  language?: 'auto' | 'ne' | 'en';
  grade?: number;
  subjectKey?: string;
}

const TEACHER_ROLES = ['TEACHER', 'PRINCIPAL', 'SCHOOL_ADMIN', 'COLLEGE_ADMIN', 'HOD', 'SUPER_ADMIN'];

const CLIP = (s: string, n: number) => (s && s.length > n ? s.slice(0, n) + '…' : s || '');
const LOOKS_NEPALI = (s: string) => /[ऀ-ॿ]/.test(s || '');

const TASK_PROMPTS: Record<TeacherAssistantTask, string> = {
  SUMMARIZE_CHAPTER: `Produce a high-yield, comprehensive chapter summary for teaching and revision:
1. Chapter Overview & Core Themes (पाठको मुख्य सारांश र अवधारणा).
2. Key Definitions, Terms & Rules (प्रमुख परिभाषाहरू, शब्दावली र नियमहरू).
3. Major Concepts & Step-by-Step Flow (मुख्य सिद्धान्तहरू र विषयवस्तुको विकासक्रम).
4. Formulas, Equations & Core Rules (महत्वपूर्ण सूत्रहरू र नियमहरू, if applicable).
5. Quick Revision Summary Checklist (विद्यार्थीहरूले जान्नै पर्ने ५ मुख्य बुँदाहरू).`,

  TEACH_CHAPTER: `Produce a comprehensive curriculum teaching roadmap for this chapter:
1. Learning Objectives (सिकाई उपलब्धि) categorized into Knowledge, Skills, and Attitudes.
2. Concept Progression & Prerequisites (what students must know before this chapter).
3. Recommended Teaching Steps & Sequence.
4. Common Student Misconceptions & how the teacher should address them.
5. Key Formative Assessment checkpoints.`,

  EXPLAIN_PAGE: `Produce a pedagogical teacher breakdown of this textbook page:
1. Core Concepts & Definitions on this page.
2. Recommended Chalkboard / Smart Board Layout (what to write on the board).
3. Classroom Discussion Questions to ask students to trigger active participation.
4. Real-world context or local Nepalese application.
5. Common points of student confusion on this page.`,

  EXPLAIN_SELECTION: `Explain and unpack the selected passage specifically for teaching:
1. Teacher's Concept Clarification (deep clear explanation).
2. Simplified Student-Friendly Phrasing (how to say it to the class in simple words).
3. Worked Chalkboard Example or Diagram breakdown.
4. Bilingual Terminology (key Nepali and English terms side-by-side).`,

  LESSON_PLAN: `Generate a structured, practical 40–45 minute classroom lesson plan:
- Grade & Subject & Chapter/Topic.
- Learning Objectives (२–३ मुख्य सिकाई उपलब्धिहरू).
- Materials Needed (कक्षाकोठामा प्रयोग हुने शैक्षिक सामग्रीहरू, low-cost local materials).
- Lesson Execution Timing:
  * Hook / Introduction (५ मिनेट): Engaging opening question or story.
  * Direct Instruction / Teaching (१५ मिनेट): Step-by-step teacher demonstration.
  * Guided Practice / Board Work (१० मिनेट): Teacher and students solving together.
  * Student Activity / Peer Collaboration (१० मिनेट): Group or pair task.
  * Assessment / Exit Ticket (५ मिनेट): Quick check to measure understanding.
- Homework & Extension (गृहकार्य).`,

  EXAMPLES_ACTIVITIES: `Provide graded worked examples and hands-on classroom activities:
1. Graded Worked Examples with full step-by-step solutions:
   - Example 1: Foundational / Easy
   - Example 2: Standard Textbook Level
   - Example 3: Challenging / Real-World Application
2. Classroom Activities:
   - Activity 1: Low-cost hands-on activity using easily available materials in Nepal (e.g., sticks, paper, stones, seeds, bottle caps).
   - Activity 2: Interactive pair/group activity with clear student roles.`,

  QUESTION_BANK: `Generate a Bloom's Taxonomy aligned classroom question bank with answers:
1. Recall & Knowledge (स्मरण - २ प्रश्न): Direct factual or definition questions.
2. Understanding & Comprehension (बोध - २ प्रश्न): Explain concepts in own words.
3. Application & Numerical/Practical (प्रयोग - २ प्रश्न): Problem solving or situational questions.
4. Higher Ability / Critical Thinking (उच्च दक्षता - १ प्रश्न): Analytical or evaluative question.
* Include Multiple Choice Questions (with correct key and brief reason).
* Include Model Answers and Marking Scheme / Rubric for short and long questions.`,

  TEACHING_NOTES: `Generate concise, high-impact teaching notes ready for classroom delivery:
1. Chalkboard Summary: Clean bullet points and key formulas/theorems.
2. Vital Definitions & Terminology (Bilingual: Nepali Devanagari & English).
3. Memory Hooks or Mnemonics to help students retain the concept.
4. Quick revision pointers.`,

  PRESENTATION: `Generate a 5-6 slide presentation outline suitable for teaching on a Smart Board or chalkboard:
For each Slide:
- Slide Title & Topic
- Chalkboard / Visual Diagram to draw
- Key Bullet Points for students to write down
- Teacher's Talking Points & Engaging Prompts`,

  QUICK_SIMPLIFY: `Explain this concept in very simple, easy-to-understand language for a student who is struggling to grasp it. Use clear analogies and avoid heavy jargon.`,

  QUICK_ANALOGY: `Provide 2 relatable, culturally authentic real-world analogies from everyday life, natural environment, festivals, agriculture, or geography in Nepal to make this concept click instantly.`,

  QUICK_CHECK: `Provide 3 quick, punchy formative questions a teacher can ask verbally right now to quickly check whether the class has understood the concept. Include what to listen for in the students' answers.`,

  CUSTOM_QUESTION: `Answer the teacher's question with pedagogical rigor, curriculum fidelity, and classroom-ready actionable guidance.`,
};

function safeParseAiJson(raw: string): any {
  if (!raw || !raw.trim()) return null;
  const cleaned = raw.trim().replace(/^```(?:json)?\s*|```\s*$/gi, '').trim();

  // 1. Direct standard parse
  try {
    const res = JSON.parse(cleaned);
    if (res && (res.answer || res.content)) {
      return {
        answer: res.answer || res.content || '',
        groundedness: res.groundedness || 'TEXTBOOK',
        sources: Array.isArray(res.sources) ? res.sources : [],
        followUps: Array.isArray(res.followUps) ? res.followUps : [],
        smartboardSummary: res.smartboardSummary || '',
      };
    }
  } catch {}

  // 2. Repair unescaped newlines/tabs inside string literals
  try {
    const repaired = cleaned.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/gs, (strMatch) => {
      return strMatch
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
    });
    const res = JSON.parse(repaired);
    if (res && (res.answer || res.content)) {
      return {
        answer: res.answer || res.content || '',
        groundedness: res.groundedness || 'TEXTBOOK',
        sources: Array.isArray(res.sources) ? res.sources : [],
        followUps: Array.isArray(res.followUps) ? res.followUps : [],
        smartboardSummary: res.smartboardSummary || '',
      };
    }
  } catch {}

  // 3. Regex extraction of "answer" field
  let extractedAnswer = '';
  const answerRegex = /"answer"\s*:\s*"([\s\S]*?)(?="\s*,\s*"(?:groundedness|sources|followUps|smartboardSummary)"|\s*"\s*\}|\s*\}$)/i;
  const m = cleaned.match(answerRegex);
  if (m && m[1]) {
    extractedAnswer = m[1]
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  } else {
    // 4. Strip { "answer": " at the beginning and "} at the end
    extractedAnswer = cleaned
      .replace(/^\s*\{\s*"answer"\s*:\s*"?/i, '')
      .replace(/"?\s*,\s*"(?:groundedness|sources|followUps|smartboardSummary)"[\s\S]*$/i, '')
      .replace(/"?\s*\}\s*$/i, '')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"');
  }

  let smartboardSummary = '';
  const sbMatch = cleaned.match(/"smartboardSummary"\s*:\s*"([\s\S]*?)"/i);
  if (sbMatch && sbMatch[1]) {
    smartboardSummary = sbMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
  }

  let followUps: string[] = [];
  const fuMatch = cleaned.match(/"followUps"\s*:\s*\[([\s\S]*?)\]/i);
  if (fuMatch && fuMatch[1]) {
    followUps = fuMatch[1]
      .split(',')
      .map((s) => s.trim().replace(/^"|"$/g, '').replace(/\\"/g, '"'))
      .filter((s) => s.length > 0);
  }

  return {
    answer: extractedAnswer.trim() || cleaned,
    groundedness: 'TEXTBOOK',
    sources: [],
    followUps,
    smartboardSummary,
  };
}

export class TeacherAssistantService {
  /**
   * Main entry point for Teacher-Only AI Assistant queries
   */
  static async ask(
    user: { userId: string; role: string; institutionId?: string },
    dto: TeacherAssistantAskDTO
  ) {
    // 1. Role-based Security Enforcement: Teachers & Admins Only
    if (!TEACHER_ROLES.includes(user.role)) {
      const err: any = new Error('The AI Teaching Assistant is a professional tool restricted to teachers and school administrators.');
      err.status = 403;
      err.code = 'TEACHER_ONLY_FEATURE';
      throw err;
    }

    const task: TeacherAssistantTask = dto.task || (dto.selectedText ? 'EXPLAIN_SELECTION' : dto.pageNumber ? 'EXPLAIN_PAGE' : 'CUSTOM_QUESTION');
    const scopeMode: TeacherAssistantScope = dto.scope || (dto.selectedText ? 'SELECTED_TEXT' : (task === 'SUMMARIZE_CHAPTER' || task === 'TEACH_CHAPTER') && dto.chapterNumber ? 'CURRENT_CHAPTER' : dto.pageNumber ? 'CURRENT_PAGE' : dto.chapterNumber ? 'CURRENT_CHAPTER' : 'ENTIRE_BOOK');

    // 2. Resolve RagDocument
    let ragDoc: any = null;
    const docQueryOrId = dto.documentId || dto.textbookId;
    if (docQueryOrId) {
      if (mongoose.Types.ObjectId.isValid(docQueryOrId)) {
        ragDoc = await RagDocument.findOne({
          $or: [{ _id: docQueryOrId }, { textbookId: docQueryOrId }],
        }).lean();
      }
      if (!ragDoc) {
        ragDoc = await RagDocument.findOne({ relativePath: docQueryOrId }).lean();
      }
    }

    const gradeNumber = dto.grade || ragDoc?.gradeNumber;
    const subjectKey = dto.subjectKey || ragDoc?.subjectKey;
    const chapterNumber = dto.chapterNumber;
    const pageNumber = dto.pageNumber;

    // 3. Resolve Scope via ScopeService
    const scope: RagScope = await ScopeService.resolve(
      { userId: user.userId, role: user.role, institutionId: user.institutionId },
      { grade: gradeNumber, subjectKey, allClasses: scopeMode === 'SUBJECT_MATERIALS' }
    );

    // 4. Resolve Page-Level cached text if CURRENT_PAGE or pageNumber requested
    let pageText = '';
    if (ragDoc && pageNumber) {
      const pageDoc: any = await RagPage.findOne({ documentId: ragDoc._id, page: pageNumber }).lean();
      if (pageDoc?.text) {
        pageText = pageDoc.text;
      }
    }

    // 5. Build Retrieval Query
    let queryText = dto.query?.trim() || '';
    if (!queryText) {
      if (task === 'SUMMARIZE_CHAPTER') queryText = `Summarize Chapter ${chapterNumber || ''} ${dto.chapterTitle || ''}: core concepts, definitions, and key takeaways`;
      else if (task === 'TEACH_CHAPTER') queryText = `Teach Chapter ${chapterNumber || ''} ${dto.chapterTitle || ''}`;
      else if (task === 'EXPLAIN_PAGE') queryText = `Explain Page ${pageNumber || ''} concepts`;
      else if (task === 'EXPLAIN_SELECTION' && dto.selectedText) queryText = dto.selectedText;
      else if (task === 'LESSON_PLAN') queryText = `Lesson plan for Chapter ${chapterNumber || ''} ${dto.chapterTitle || ''} page ${pageNumber || ''}`;
      else if (task === 'EXAMPLES_ACTIVITIES') queryText = `Worked examples and classroom activities for Chapter ${chapterNumber || ''} page ${pageNumber || ''}`;
      else if (task === 'QUESTION_BANK') queryText = `Question bank for Chapter ${chapterNumber || ''} page ${pageNumber || ''}`;
      else if (task === 'TEACHING_NOTES') queryText = `Teaching notes for Chapter ${chapterNumber || ''} page ${pageNumber || ''}`;
      else if (task === 'PRESENTATION') queryText = `Presentation slides for Chapter ${chapterNumber || ''} page ${pageNumber || ''}`;
      else if (task === 'QUICK_SIMPLIFY') queryText = `Simplify concept on page ${pageNumber || ''}: ${dto.selectedText || ''}`;
      else if (task === 'QUICK_ANALOGY') queryText = `Real-world Nepal analogy for page ${pageNumber || ''}: ${dto.selectedText || ''}`;
      else if (task === 'QUICK_CHECK') queryText = `3 check understanding questions for page ${pageNumber || ''}`;
      else queryText = `Pedagogical explanation for ${ragDoc?.title || 'this textbook'}`;
    }

    // 6. Retrieve RAG chunks
    const documentIds = ragDoc && scopeMode !== 'SUBJECT_MATERIALS' ? [String(ragDoc._id)] : undefined;
    const retrievedChunks = await RetrievalService.retrieve(
      dto.selectedText ? `${dto.selectedText}\n${queryText}` : queryText,
      scope,
      {
        topK: 6,
        chapterNumber: scopeMode === 'CURRENT_CHAPTER' ? chapterNumber : undefined,
        documentIds,
        pageNumber: scopeMode === 'CURRENT_PAGE' ? pageNumber : undefined,
      }
    );

    // 7. Language determination
    const lang =
      dto.language && dto.language !== 'auto'
        ? dto.language === 'ne'
          ? 'Nepali'
          : 'English'
        : LOOKS_NEPALI(queryText) || LOOKS_NEPALI(dto.selectedText || '')
        ? 'Nepali'
        : 'English';

    // 8. Construct Instructional Prompt
    const taskInstruction = TASK_PROMPTS[task] || TASK_PROMPTS.CUSTOM_QUESTION;
    const documentMeta = ragDoc
      ? `Textbook: ${ragDoc.title || 'CDC Textbook'} | Grade: Class ${ragDoc.gradeNumber || gradeNumber || ''} | Subject: ${ragDoc.subjectName || subjectKey || ''}`
      : `Class ${gradeNumber || 'Primary/Secondary'} | Subject: ${subjectKey || 'Curriculum'}`;

    const contextParts: string[] = [];
    if (dto.selectedText) {
      contextParts.push(`SELECTED TEXT HIGHLIGHTED BY TEACHER (Page ${pageNumber || 'current'}):\n"""${CLIP(dto.selectedText, 2500)}"""`);
    }
    if (pageText) {
      contextParts.push(`EXACT OCR/TEXT CONTENT OF CURRENT PAGE (Page ${pageNumber}):\n"""${CLIP(pageText, 3000)}"""`);
    }
    if (retrievedChunks.length > 0) {
      const chunkExtracts = retrievedChunks
        .map(
          (c, i) =>
            `[S${i + 1}] ${c.textbookTitle} · p.${c.pageStart}${c.pageEnd !== c.pageStart ? `–${c.pageEnd}` : ''}${c.chapter ? ` · ${c.chapter}` : ''}\n${CLIP(c.text, 1600)}`
        )
        .join('\n\n');
      contextParts.push(`RELEVANT TEXTBOOK EXTRACTS:\n<extracts>\n${chunkExtracts}\n</extracts>`);
    }

    const systemPrompt = `You are the Expert AI Teaching Assistant of the Nepal Digital Education Platform (नेपाल डिजिटल शिक्षा मञ्च).
You assist professional school teachers, head teachers, and educators teaching the Nepal CDC (पाठ्यक्रम विकास केन्द्र) curriculum.

ROLE & RESPONSIBILITY:
- Your target audience is a classroom teacher preparing or actively teaching a lesson.
- Provide actionable, pedagogical, high-quality guidance aligned strictly with the official Nepalese textbook content provided.
- Emphasize clear concept explanations, lesson timing, hands-on student engagement, formative questioning, and blackboard-ready notes.
- Use proper Unicode Devanagari when writing in Nepali. Keep scientific/technical terms understandable (you may include the English term in brackets, e.g., 'प्रकाश संश्लेषण (Photosynthesis)').
- Format formulas and mathematical equations using KaTeX LaTeX ($...$ inline, $$...$$ display). Never use LaTeX for ordinary words.
- Base your answers firmly on the textbook extracts. Cite specific page numbers [p. X] whenever referencing textbook ideas so teachers can point students to their books.
- Maintain a respectful, supportive, highly competent teacher-to-teacher tone.

Return ONLY a JSON response in the following schema:
{
  "answer": "<Comprehensive markdown response with structured headers, bullet points, and lesson guidance>",
  "groundedness": "TEXTBOOK|PARTIAL|GENERAL",
  "sources": [<numbers of extracts used: 1, 2, ...>],
  "followUps": ["<3 practical follow-up pedagogical prompts or next steps for the teacher>"],
  "smartboardSummary": "<2-3 sentence high-impact summary suitable for displaying on a Smart Board to students>"
}`;

    const userPrompt = `TEACHING CONTEXT:
${documentMeta}
SCOPE: ${scopeMode} (Active Page: ${pageNumber || 'N/A'}, Chapter: ${chapterNumber || 'N/A'})
RESPONSE LANGUAGE: ${lang}

TEACHING TASK INSTRUCTION:
${taskInstruction}

${contextParts.join('\n\n')}

TEACHER'S PROMPT / QUESTION:
${queryText}

Please provide an outstanding, classroom-tested response for the teacher.`;

    // 9. Execute Gemini AI Call
    let rawResult: string;
    let fallbackDegraded = false;
    try {
      rawResult = await GeminiService.generate({
        system: systemPrompt,
        prompt: userPrompt,
        json: true,
        temperature: 0.3,
        maxOutputTokens: 4096,
      });
    } catch {
      fallbackDegraded = true;
      rawResult = '';
    }

    // 10. Robust Parse of AI Response
    let parsed = safeParseAiJson(rawResult);
    if (!parsed) {
      // Degraded fallback
      const topExtracts = retrievedChunks.slice(0, 3);
      parsed = {
        answer:
          lang === 'Nepali'
            ? `### पाठ्यपुस्तक अध्ययन सामग्री (पेज ${pageNumber || 'हालको'})\n\nएआई सेवा केही बेरको लागि व्यस्त छ। तल पाठ्यपुस्तकको सम्बन्धित अंश दिइएको छ:\n\n${topExtracts.map((c) => `**${c.textbookTitle} (पेज ${c.pageStart}):**\n${c.text}`).join('\n\n')}`
            : `### Textbook Study Reference (Page ${pageNumber || 'current'})\n\nThe AI assistant is temporarily operating in reference mode. Relevant textbook extracts for your lesson:\n\n${topExtracts.map((c) => `**${c.textbookTitle} (p. ${c.pageStart}):**\n${c.text}`).join('\n\n')}`,
        groundedness: 'PARTIAL',
        sources: topExtracts.map((_, i) => i + 1),
        followUps: [
          'Generate practice questions on this topic',
          'Create a 40-minute lesson outline',
          'Suggest low-cost classroom activity',
        ],
        smartboardSummary: 'Lesson reference content from official CDC textbook.',
      };
    }

    // 11. Format Citations
    const usedIndices: number[] = Array.isArray(parsed.sources)
      ? parsed.sources.map((n: any) => parseInt(n, 10)).filter((n: number) => n >= 1 && n <= retrievedChunks.length)
      : [];

    const citations: IAICitation[] = [];
    const seenCitations = new Set<string>();

    // If current page is known and we have pageText or a chunk on this page, include it as primary citation
    if (pageNumber && ragDoc) {
      citations.push({
        textbookTitle: ragDoc.title || 'CDC Textbook',
        grade: ragDoc.gradeNumber || gradeNumber || 0,
        chapterNumber: chapterNumber || 0,
        chapterTitle: dto.chapterTitle || '',
        pageNumber,
        pageEnd: pageNumber,
        excerpt: CLIP(pageText.replace(/\s+/g, ' ') || (retrievedChunks[0]?.text || ''), 240),
        relevanceScore: 1.0,
        textbookId: ragDoc.textbookId ? String(ragDoc.textbookId) : String(ragDoc._id),
        relativePath: ragDoc.relativePath,
        subjectName: ragDoc.subjectName || subjectKey,
      });
      seenCitations.add(`${ragDoc.title}:${pageNumber}`);
    }

    for (const idx of usedIndices) {
      const c = retrievedChunks[idx - 1];
      if (!c) continue;
      const key = `${c.textbookTitle}:${c.pageStart}`;
      if (seenCitations.has(key)) continue;
      seenCitations.add(key);
      citations.push({
        textbookTitle: c.textbookTitle,
        grade: c.gradeNumber ?? 0,
        chapterNumber: c.chapterNumber ?? 0,
        chapterTitle: c.chapter || '',
        pageNumber: c.pageStart,
        pageEnd: c.pageEnd,
        excerpt: CLIP(c.text.replace(/\s+/g, ' '), 240),
        relevanceScore: Math.round(((c.vectorScore ?? 0.8) + Number.EPSILON) * 100) / 100,
        textbookId: c.textbookId,
        relativePath: c.relativePath,
        subjectName: c.subjectName,
      });
    }

    // 12. Save to Private Teacher Conversation Thread
    let conversation: any = null;
    if (dto.conversationId && mongoose.Types.ObjectId.isValid(dto.conversationId)) {
      conversation = await AIConversation.findOne({ _id: dto.conversationId, userId: user.userId });
    }
    if (!conversation) {
      const convTitle = CLIP(dto.query || `${task.replace('_', ' ')} - p.${pageNumber || '1'}`, 45);
      conversation = new AIConversation({
        userId: user.userId,
        institutionId: user.institutionId,
        userRole: 'TEACHER',
        title: convTitle,
        mode: 'TEACHER_LESSON_PLAN',
        grade: gradeNumber,
        subjectCode: subjectKey,
        textbookId: ragDoc?.textbookId || (ragDoc?._id ? ragDoc._id : undefined),
        chapterNumber,
        chapterTitle: dto.chapterTitle,
        language: dto.language || 'auto',
      });
      await conversation.save();
    }

    const assistantMsg = new AIMessage({
      conversationId: conversation._id,
      sender: 'ASSISTANT',
      content: parsed.answer,
      citations,
      suggestedQuestions: parsed.followUps || [],
      tokenUsage: {
        promptTokens: Math.ceil(userPrompt.length / 3.5),
        completionTokens: Math.ceil((parsed.answer?.length || 0) / 3.5),
        totalTokens: Math.ceil((userPrompt.length + (parsed.answer?.length || 0)) / 3.5),
      },
    });
    await assistantMsg.save();

    conversation.updatedAt = new Date();
    await conversation.save();

    return {
      conversationId: String(conversation._id),
      messageId: String(assistantMsg._id),
      answer: parsed.answer,
      groundedness: parsed.groundedness || 'TEXTBOOK',
      citations,
      followUps: parsed.followUps || [],
      smartboardSummary: parsed.smartboardSummary || '',
      task,
      scope: scopeMode,
      activePage: pageNumber,
      degraded: fallbackDegraded,
      textbookTitle: ragDoc?.title || 'CDC Textbook',
    };
  }

  /**
   * List conversations for the teacher, optionally filtered by textbook
   */
  static async listConversations(userId: string, textbookId?: string) {
    const filter: any = { userId, mode: 'TEACHER_LESSON_PLAN', isArchived: { $ne: true } };
    if (textbookId && mongoose.Types.ObjectId.isValid(textbookId)) {
      filter.textbookId = textbookId;
    }
    const convs = await AIConversation.find(filter).sort({ updatedAt: -1 }).limit(30).lean();
    return convs.map((c: any) => ({
      id: String(c._id),
      title: c.title,
      grade: c.grade,
      subjectCode: c.subjectCode,
      chapterNumber: c.chapterNumber,
      chapterTitle: c.chapterTitle,
      updatedAt: c.updatedAt,
      createdAt: c.createdAt,
    }));
  }

  /**
   * Get single conversation messages
   */
  static async getConversation(conversationId: string, userId: string) {
    const conv: any = await AIConversation.findOne({ _id: conversationId, userId }).lean();
    if (!conv) {
      const err: any = new Error('Conversation not found');
      err.status = 404;
      throw err;
    }
    const messages = await AIMessage.find({ conversationId: conv._id }).sort({ createdAt: 1 }).lean();
    return {
      conversation: {
        id: String(conv._id),
        title: conv.title,
        grade: conv.grade,
        chapterNumber: conv.chapterNumber,
        chapterTitle: conv.chapterTitle,
      },
      messages: messages.map((m: any) => ({
        id: String(m._id),
        sender: m.sender,
        content: m.content,
        citations: m.citations || [],
        suggestedQuestions: m.suggestedQuestions || [],
        createdAt: m.createdAt,
      })),
    };
  }

  /**
   * Delete / Archive a teacher conversation
   */
  static async archiveConversation(conversationId: string, userId: string) {
    await AIConversation.updateOne({ _id: conversationId, userId }, { isArchived: true });
    return { success: true };
  }
}

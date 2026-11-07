import {
  AIConversation,
  AIMessage,
  AIFeedback,
  AIUsage,
  AIMode,
  IAICitation,
} from '../../models/AIAssistant';
import { RAGEngineService } from './rag-engine.service';
import { LLMGroundingService } from './llm-grounding.service';
import { User, Institution, CentralSubject } from '../../models';
import { GeminiService } from '../rag/gemini.service';
import { ScopeService } from '../rag/scope.service';
import { RagAnswerService, RagTask } from '../rag/answer.service';
import { RagChunk } from '../../models/Rag';
import { trackAiUsage } from '../rag/usage.service';

export interface ChatQueryDTO {
  conversationId?: string;
  query: string;
  mode?: AIMode;
  grade?: number;
  subjectCode?: string;
  textbookId?: string;
  chapterNumber?: number;
  chapterTitle?: string;
  language?: 'ne' | 'en' | 'auto';
  subjectKey?: string;
  task?: RagTask;
  allClasses?: boolean;
  extraContext?: string;
}

export class AIService {
  /**
   * Main RAG Chat query endpoint supporting Students, Teachers, and Smart Board
   */
  static async chat(userId: string, institutionId: string | undefined, userRole: string, dto: ChatQueryDTO) {
    const {
      conversationId,
      query,
      mode = userRole === 'TEACHER' ? 'TEACHER_LESSON_PLAN' : 'STUDENT_TUTOR',
      grade,
      subjectCode,
      textbookId,
      chapterNumber,
      chapterTitle,
      language = 'auto',
    } = dto;

    if (!query || !query.trim()) {
      throw new Error('Query text is required.');
    }

    // 1. Safety Guardrails Validation
    const safety = LLMGroundingService.validateSafety(query);
    if (!safety.isSafe) {
      throw new Error(safety.reason);
    }

    // 2. Resolve or Create Conversation
    let conversation = null;
    if (conversationId) {
      conversation = await AIConversation.findOne({ _id: conversationId, userId });
    }

    if (!conversation) {
      const title = query.length > 40 ? query.substring(0, 40) + '...' : query;
      conversation = new AIConversation({
        userId,
        institutionId,
        userRole: userRole as any,
        title,
        mode,
        grade,
        subjectCode,
        textbookId,
        chapterNumber,
        chapterTitle,
        language,
      });
      await conversation.save();
    }

    // 3. Save User Message
    const userMsg = new AIMessage({
      conversationId: conversation._id,
      sender: 'USER',
      content: query,
      citations: [],
    });
    await userMsg.save();

    // 4a. Central Gemini RAG (class/subject scope comes from the database, never from the client)
    const useCentralRag = GeminiService.isConfigured() && ['STUDENT', 'TEACHER', 'SUPER_ADMIN'].includes(userRole) && (await RagChunk.estimatedDocumentCount()) > 0;
    if (useCentralRag) {
      let subjectKey: string | undefined = dto.subjectKey;
      const code = subjectCode || conversation.subjectCode;
      if (!subjectKey && code) {
        const cs: any = await CentralSubject.findOne({ code }).select('logicalKey').lean();
        subjectKey = cs?.logicalKey;
      }
      const scope = await ScopeService.resolve({ userId, role: userRole, institutionId }, { grade: userRole === 'STUDENT' ? undefined : grade || conversation.grade, subjectKey, allClasses: dto.allClasses });
      const prior = await AIMessage.find({ conversationId: conversation._id, _id: { $ne: userMsg._id } }).sort({ createdAt: -1 }).limit(6).lean();
      const rag = await trackAiUsage(
        { userId, institutionId, role: userRole, feature: dto.task ? `CHAT_${dto.task}` : 'CHAT' },
        () =>
          RagAnswerService.answer({
            question: query,
            scope,
            role: userRole as any,
            language,
            task: dto.task,
            chapterNumber: chapterNumber || conversation.chapterNumber,
            history: prior.reverse().map((m: any) => ({ sender: m.sender, content: m.content })),
            extraContext: dto.extraContext,
          }),
        (r: any) => ({ inputTokens: r.tokenUsage?.promptTokens, outputTokens: r.tokenUsage?.completionTokens, grounded: r.groundedness === 'TEXTBOOK' || r.groundedness === 'PARTIAL', degraded: !!r.degraded })
      );
      const quotaRag = await LLMGroundingService.checkAndUpdateUsage(userId, institutionId, userRole, rag.tokenUsage.promptTokens, rag.tokenUsage.completionTokens);
      if (!quotaRag.allowed) throw new Error('Daily AI educational query limit reached. Please try again tomorrow.');
      const assistantRag = new AIMessage({
        conversationId: conversation._id,
        sender: 'ASSISTANT',
        content: rag.answer,
        citations: rag.citations,
        suggestedQuestions: rag.followUps,
        tokenUsage: rag.tokenUsage,
      });
      await assistantRag.save();
      conversation.updatedAt = new Date();
      await conversation.save();
      return {
        conversationId: conversation.id,
        userMessageId: userMsg.id,
        assistantMessageId: assistantRag.id,
        content: rag.answer,
        citations: rag.citations,
        suggestedQuestions: rag.followUps,
        groundedness: rag.groundedness,
        scope: scope.label,
        quotaRemaining: quotaRag.remaining,
        tokenUsage: rag.tokenUsage,
      };
    }

    // 4. Retrieve Grounded Textbook Chunks via RAG Engine (legacy fallback when Gemini/index unavailable)
    const citations: IAICitation[] = await RAGEngineService.retrieveRelevantChunks({
      query,
      grade: grade || conversation.grade,
      subjectCode: subjectCode || conversation.subjectCode,
      textbookId: textbookId || (conversation.textbookId ? conversation.textbookId.toString() : undefined),
      topK: 3,
    });

    // 5. Generate Curriculum-Grounded Response
    const response = await LLMGroundingService.generateAnswer({
      userRole: userRole as any,
      grade: grade || conversation.grade || 10,
      subjectCode: subjectCode || conversation.subjectCode,
      mode: conversation.mode || mode,
      language,
      query,
      citations,
    });

    // 6. Check & Record Quota / Token Usage
    const quota = await LLMGroundingService.checkAndUpdateUsage(
      userId,
      institutionId,
      userRole,
      response.tokenUsage.promptTokens,
      response.tokenUsage.completionTokens
    );

    if (!quota.allowed) {
      throw new Error('Daily AI educational query limit reached. Please try again tomorrow.');
    }

    // 7. Save Assistant Message with Citations
    const assistantMsg = new AIMessage({
      conversationId: conversation._id,
      sender: 'ASSISTANT',
      content: response.answer,
      citations: response.citations,
      suggestedQuestions: response.suggestedQuestions,
      tokenUsage: response.tokenUsage,
    });
    await assistantMsg.save();

    // Touch conversation timestamp
    conversation.updatedAt = new Date();
    await conversation.save();

    return {
      conversationId: conversation.id,
      userMessageId: userMsg.id,
      assistantMessageId: assistantMsg.id,
      content: response.answer,
      citations: response.citations,
      suggestedQuestions: response.suggestedQuestions,
      quotaRemaining: quota.remaining,
      tokenUsage: response.tokenUsage,
    };
  }

  /** What the signed-in user may ask about (drives the class/subject pickers in the UI). */
  static async getScope(user: { userId: string; role: string; institutionId?: string | null }) {
    const scope = await ScopeService.resolve(user);
    const subjects = new Map<string, { key: string; name: string; grades: number[] }>();
    scope.allowedSubjects.forEach((a) => {
      const cur = subjects.get(a.key) || { key: a.key, name: a.name.replace(/^Compulsory\s+/i, ''), grades: [] };
      if (!cur.grades.includes(a.grade)) cur.grades.push(a.grade);
      subjects.set(a.key, cur);
    });
    const indexed = await RagChunk.countDocuments({ audience: { $ne: 'STAFF' }, gradeNumber: { $in: scope.grades }, ...(scope.subjectKeys.length ? { subjectKey: { $in: scope.subjectKeys } } : {}), embedding: { $exists: true } });
    return { label: scope.label, role: scope.role, grades: scope.grades, mediums: scope.mediums, subjects: [...subjects.values()], indexedChunks: indexed, aiConfigured: GeminiService.isConfigured() };
  }

  static async archiveConversation(userId: string, conversationId: string) {
    const r = await AIConversation.updateOne({ _id: conversationId, userId }, { $set: { isArchived: true } });
    if (!r.matchedCount) throw new Error('Conversation not found or unauthorized');
  }

  /**
   * List conversations for the authenticated user
   */
  static async listConversations(userId: string) {
    return await AIConversation.find({ userId, isArchived: false }).sort({ updatedAt: -1 }).limit(30);
  }

  /**
   * Get all messages for a specific conversation
   */
  static async getConversationMessages(userId: string, conversationId: string) {
    const conv = await AIConversation.findOne({ _id: conversationId, userId });
    if (!conv) {
      throw new Error('Conversation not found or unauthorized');
    }
    const messages = await AIMessage.find({ conversationId }).sort({ createdAt: 1 });
    return {
      conversation: conv,
      messages,
    };
  }

  /**
   * Submit feedback (thumbs up/down) for an AI answer
   */
  static async submitFeedback(params: {
    messageId: string;
    userId: string;
    institutionId?: string;
    rating: 'POSITIVE' | 'NEGATIVE';
    comment?: string;
  }) {
    const feedback = new AIFeedback(params);
    await feedback.save();

    await AIMessage.findByIdAndUpdate(params.messageId, {
      $set: {
        feedback: {
          rating: params.rating,
          comment: params.comment,
        },
      },
    });

    return feedback;
  }

  /**
   * Institutional Usage Statistics (for School Admin / Super Admin)
   */
  static async getUsageStats(institutionId?: string) {
    const filter = institutionId ? { institutionId } : {};
    const records = await AIUsage.find(filter).sort({ dateKey: -1 }).limit(30);

    const totalQueries = records.reduce((sum, r) => sum + r.queryCount, 0);
    const totalTokens = records.reduce((sum, r) => sum + r.totalTokens, 0);

    return {
      totalQueries,
      totalTokens,
      history: records,
    };
  }
}

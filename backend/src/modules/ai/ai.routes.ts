import { Router } from 'express';
import { AIController } from './ai.controller';
import { indexStatus } from './ai.indexStatus';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { rateLimit } from '../../common/middleware/rate-limit.middleware';

const router = Router();

// RAG Conversational AI
router.get('/scope', authMiddleware, AIController.scope);
router.post('/chat', authMiddleware, rateLimit('ai-chat', 20, 60_000), AIController.chat);
router.delete('/conversations/:id', authMiddleware, AIController.archive);
router.get('/conversations', authMiddleware, AIController.listConversations);
router.get('/conversations/:id', authMiddleware, AIController.getConversation);
router.post('/feedback', authMiddleware, AIController.submitFeedback);
router.get('/usage', authMiddleware, AIController.getUsage);
router.get('/index-status', authMiddleware, indexStatus);

// Legacy backward-compatible endpoint
router.post('/query', authMiddleware, rateLimit('ai-query', 20, 60_000), AIController.query);

export const aiRoutes = router;

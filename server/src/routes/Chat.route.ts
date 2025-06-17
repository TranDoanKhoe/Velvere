import { Router } from 'express';
import {
    createChatSession,
    sendMessage,
    getMessagesBySessionId,
    markMessagesAsRead,
    closeChatSession,
    getAllChatSessions,
    getUserChatSessions,
    assignAdminToSession
} from '../controllers/Chat.controller';

const router = Router();

// Routes quản lý chat
router.post('/sessions', createChatSession);                              // POST    /api/chat/sessions
router.post('/messages', sendMessage);                                    // POST    /api/chat/messages
router.get('/sessions/:sessionId/messages', getMessagesBySessionId);      // GET     /api/chat/sessions/:sessionId/messages
router.patch('/sessions/:sessionId/read', markMessagesAsRead);            // PATCH   /api/chat/sessions/:sessionId/read
router.patch('/sessions/:sessionId/close', closeChatSession);             // PATCH   /api/chat/sessions/:sessionId/close
router.get('/sessions', getAllChatSessions);                              // GET     /api/chat/sessions
router.get('/users/:userId/sessions', getUserChatSessions);               // GET     /api/chat/users/:userId/sessions
router.patch('/sessions/:sessionId/assign', assignAdminToSession);        // PATCH   /api/chat/sessions/:sessionId/assign

export default router;
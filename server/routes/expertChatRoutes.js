import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { 
    getExperts,
    getChats,
    getChatMessages,
    startChat,
    sendMessage
} from '../controllers/expertChatController.js';

const expertChatRouter = express.Router();

// Get list of experts (for regular users)
expertChatRouter.get('/experts', userAuth, getExperts);

// Get user's chats
expertChatRouter.get('/chats', userAuth, getChats);

// Get messages for a specific chat
expertChatRouter.get('/chats/:chatId/messages', userAuth, getChatMessages);

// Start or get existing chat with an expert
expertChatRouter.post('/chats', userAuth, startChat);

// Send message in a chat
expertChatRouter.post('/chats/:chatId/messages', userAuth, sendMessage);

export default expertChatRouter; 
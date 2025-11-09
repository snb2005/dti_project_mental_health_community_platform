import express from 'express';
import { getChatHistory, saveMessage } from '../controllers/chatController.js';
import userAuth from '../middleware/userAuth.js';

const chatRouter = express.Router();

chatRouter.get('/history', userAuth, getChatHistory);
chatRouter.post('/message', userAuth, saveMessage);

export default chatRouter; 
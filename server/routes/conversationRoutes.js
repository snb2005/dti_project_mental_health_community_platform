import express from 'express';
import { 
  getConversations, 
  createConversation, 
  deleteConversation,
  getConversationMessages,
  addMessage,
  updateConversationTitle
} from '../controllers/conversationController.js';
import userAuth from '../middleware/userAuth.js';

const conversationRouter = express.Router();

conversationRouter.get('/', userAuth, getConversations);
conversationRouter.post('/', userAuth, createConversation);
conversationRouter.delete('/:conversationId', userAuth, deleteConversation);
conversationRouter.get('/:conversationId/messages', userAuth, getConversationMessages);
conversationRouter.post('/:conversationId/messages', userAuth, addMessage);
conversationRouter.put('/:conversationId/title', userAuth, updateConversationTitle);

export default conversationRouter; 
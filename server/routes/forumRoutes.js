import express from 'express';
import { getRooms, getRoomMessages, postMessage, addReaction, addReply, joinRoom } from '../controllers/forumController.js';
import userAuth from '../middleware/userAuth.js';

const forumRouter = express.Router();

forumRouter.get('/rooms', userAuth, getRooms);
forumRouter.get('/rooms/:roomId/messages', userAuth, getRoomMessages);
forumRouter.post('/rooms/:roomId/messages', userAuth, postMessage);
forumRouter.post('/messages/:messageId/reactions', userAuth, addReaction);
forumRouter.post('/messages/:messageId/replies', userAuth, addReply);
forumRouter.post('/rooms/:roomId/join', userAuth, joinRoom);

export default forumRouter; 
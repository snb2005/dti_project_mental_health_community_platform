import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User' 
  },
  title: { 
    type: String, 
    required: true 
  },
  messages: [{
    sender: { type: String, required: true }, // 'user' or 'bot'
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model('Conversation', conversationSchema); 
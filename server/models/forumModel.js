import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['heart', 'support', 'thanks', 'strength']
    }
  }],
  replies: [{
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isAnonymous: {
      type: Boolean,
      default: false
    }
  }],
  isModerated: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'ANXIETY_SUPPORT',
      'DEPRESSION_HELP', 
      'WELLNESS_LIFESTYLE',
      'CHILD_ABUSE', 
      'DOMESTIC_ABUSE', 
      'WORKPLACE_ABUSE'
    ],
    required: true
  },
  category: {
    type: String,
    enum: [
      'Mental Wellness',
      'Support Groups', 
      'Crisis Support'
    ],
    required: true
  },
  icon: {
    type: String,
    default: '💬'
  },
  color: {
    type: String,
    default: '#6366F1'
  },
  memberCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }]
});

export const Room = mongoose.model('Room', roomSchema);
export const Message = mongoose.model('Message', messageSchema); 
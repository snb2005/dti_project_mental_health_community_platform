import { Room, Message } from '../models/forumModel.js';

export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({})
      .select('name description type category icon color memberCount createdAt')
      .sort({ category: 1, createdAt: 1 });
    
    res.json({
      success: true,
      rooms: rooms,
      totalRooms: rooms.length
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching rooms"
    });
  }
};

export const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    // Get messages with pagination
    const messages = await Message.find({ roomId })
      .populate('author', 'name email')
      .populate('replies.author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalMessages = await Message.countDocuments({ roomId });

    res.json({
      success: true,
      room: {
        name: room.name,
        description: room.description,
        category: room.category,
        icon: room.icon,
        color: room.color,
        memberCount: room.memberCount
      },
      messages: messages.reverse(), // Show oldest first
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasMore: skip + messages.length < totalMessages
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching messages"
    });
  }
};

export const postMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content, isAnonymous = false } = req.body;
    const userId = req.userId || req.body.userId; // From userAuth middleware

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message content is required"
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    // Create and save the message
    const message = new Message({
      content: content.trim(),
      roomId,
      author: userId,
      isAnonymous,
      createdAt: new Date()
    });

    await message.save();

    // Update room's message count and member count
    if (!room.messages.includes(message._id)) {
      room.messages.push(message._id);
      await room.save();
    }

    // Populate the message with user details before emitting
    const populatedMessage = await Message.findById(message._id)
      .populate('author', 'name email');

    // Emit the new message through Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(roomId).emit('newMessage', populatedMessage);
    }

    res.json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error('Error posting message:', error);
    res.status(500).json({
      success: false,
      message: "Error posting message"
    });
  }
};

export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { type } = req.body; // heart, support, thanks, strength
    const userId = req.userId || req.body.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    // Check if user already reacted
    const existingReaction = message.reactions.find(
      reaction => reaction.user.toString() === userId
    );

    if (existingReaction) {
      // Update reaction type
      existingReaction.type = type;
    } else {
      // Add new reaction
      message.reactions.push({ user: userId, type });
    }

    await message.save();

    res.json({
      success: true,
      reactions: message.reactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding reaction"
    });
  }
};

export const addReply = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content, isAnonymous = false } = req.body;
    const userId = req.userId || req.body.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    message.replies.push({
      content,
      author: userId,
      isAnonymous,
      timestamp: new Date()
    });

    await message.save();

    // Populate the updated message
    const populatedMessage = await Message.findById(messageId)
      .populate('author', 'name email')
      .populate('replies.author', 'name email');

    res.json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding reply"
    });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId || req.body.userId;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    // Increment member count (simplified - in production you'd track actual members)
    room.memberCount += 1;
    await room.save();

    res.json({
      success: true,
      message: "Joined room successfully",
      memberCount: room.memberCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error joining room"
    });
  }
}; 
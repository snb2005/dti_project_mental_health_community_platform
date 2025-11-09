import Conversation from '../models/conversationModel.js';

export const getConversations = async (req, res) => {
  try {
    const userId = req.body.userId;
    const conversations = await Conversation.find({ userId })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 });
    
    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching conversations"
    });
  }
};

export const createConversation = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { title } = req.body;

    const conversation = new Conversation({
      userId,
      title: title || 'New Conversation',
    });

    await conversation.save();

    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating conversation"
    });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.body.userId;

    const conversation = await Conversation.findOneAndDelete({
      _id: conversationId,
      userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      });
    }

    res.json({
      success: true,
      message: "Conversation deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting conversation"
    });
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.body.userId;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      });
    }

    res.json({
      success: true,
      messages: conversation.messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching conversation messages"
    });
  }
};

export const addMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, sender } = req.body;
    const userId = req.body.userId;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      });
    }

    conversation.messages.push({
      sender,
      text,
      timestamp: new Date()
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    res.json({
      success: true,
      message: "Message added successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding message"
    });
  }
};

export const updateConversationTitle = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { title } = req.body;
    const userId = req.body.userId;

    const conversation = await Conversation.findOneAndUpdate(
      { _id: conversationId, userId },
      { title },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      });
    }

    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating conversation title"
    });
  }
}; 
import Chat from '../models/chatmodel.js';

export const getChatHistory = async (req, res) => {
  try {
    const userId = req.body.userId; // This comes from userAuth middleware
    let chat = await Chat.findOne({ userId });
    
    if (!chat) {
      chat = { messages: [] };
    }
    
    res.json({
      success: true,
      messages: chat.messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching chat history"
    });
  }
};

export const saveMessage = async (req, res) => {
  try {
    const userId = req.body.userId; // From userAuth middleware
    const { text, sender } = req.body;

    let chat = await Chat.findOne({ userId });

    if (!chat) {
      chat = new Chat({
        userId,
        messages: []
      });
    }

    chat.messages.push({
      sender,
      text,
      timestamp: new Date()
    });

    await chat.save();

    res.json({
      success: true,
      message: "Message saved successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error saving message"
    });
  }
}; 
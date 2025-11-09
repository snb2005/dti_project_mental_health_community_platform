import ExpertChat from '../models/expertChatModel.js';
import User from '../models/usermodel.js';

// Get all experts
export const getExperts = async (req, res) => {
    try {
        const experts = await User.find({ isExpert: true })
            .select('name email');
        res.json({ success: true, experts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get user's chats
export const getChats = async (req, res) => {
    try {
        const userId = req.body.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        let chats;
        if (user.isExpert) {
            // If expert, get all chats where they are the expert
            chats = await ExpertChat.find({ expert: userId })
                .populate('user', 'name email')
                .sort('-lastMessage');
        } else {
            // If regular user, get all their chats with experts
            chats = await ExpertChat.find({ user: userId })
                .populate('expert', 'name email')
                .sort('-lastMessage');
        }

        res.json({ success: true, chats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get messages for a specific chat
export const getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.body.userId;

        const chat = await ExpertChat.findById(chatId)
            .populate({
                path: 'messages.sender',
                select: 'name email'
            });

        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }

        // Verify user has access to this chat
        if (chat.user.toString() !== userId.toString() && 
            chat.expert.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        res.json({ success: true, messages: chat.messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Start a new chat with an expert
export const startChat = async (req, res) => {
    try {
        const userId = req.body.userId;
        const { expertId } = req.body;

        // Get user details for populating the message
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify expert exists and is actually an expert
        const expert = await User.findOne({ _id: expertId, isExpert: true });
        if (!expert) {
            return res.status(404).json({ success: false, message: 'Expert not found' });
        }

        // Check if chat already exists
        let chat = await ExpertChat.findOne({
            user: userId,
            expert: expertId
        });

        if (!chat) {
            // Create new chat if it doesn't exist
            chat = await ExpertChat.create({
                user: userId,
                expert: expertId,
                messages: []
            });
        }

        // Populate the chat with user/expert details
        chat = await chat.populate('user expert', 'name email');

        res.json({ success: true, chat });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Send a message in a chat
export const sendMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content } = req.body;
        const userId = req.body.userId;

        // Get user details for populating the message
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const chat = await ExpertChat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }

        // Verify user has access to this chat
        if (chat.user.toString() !== userId.toString() && 
            chat.expert.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Add message
        const newMessage = {
            sender: userId,
            content: content.trim(),
            timestamp: new Date()
        };

        chat.messages.push(newMessage);
        chat.lastMessage = new Date();
        await chat.save();

        // Get the populated sender details
        const populatedMessage = {
            ...newMessage,
            sender: {
                _id: userId,
                name: user.name,
                email: user.email
            }
        };

        // Emit socket event to both user and expert rooms
        const io = req.app.get('io');
        const roomId = `expert-chat-${chatId}`;
        io.to(roomId).emit('expertChatMessage', {
            chatId,
            message: populatedMessage
        });

        res.json({ success: true, message: populatedMessage });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}; 
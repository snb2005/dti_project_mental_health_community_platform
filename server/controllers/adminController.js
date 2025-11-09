import User from '../models/usermodel.js';
import Blog from '../models/blogModel.js';

export const getAllUsers = async (req, res) => {
    try {
        // Get all users except the admin email
        const users = await User.find({
            email: { $ne: 'gscteam12345@gmail.com' }
        }).select('-password');
        
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, email, role, isAccountVerified, isExpert } = req.body;
        
        const user = await User.findByIdAndUpdate(
            userId,
            { name, email, role, isAccountVerified, isExpert },
            { new: true }
        ).select('-password');
        
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.userId);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const [userCount, blogCount] = await Promise.all([
            User.countDocuments(),
            Blog.countDocuments()
        ]);
        
        res.json({
            success: true,
            stats: {
                userCount,
                blogCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find()
            .populate('author', 'name email')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            blogs
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteBlog = async (req, res) => {
    try {
        const { blogId } = req.params;
        await Blog.findByIdAndDelete(blogId);
        
        res.json({
            success: true,
            message: 'Blog deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}; 
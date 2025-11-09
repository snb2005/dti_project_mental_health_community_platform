import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import { 
    getAllUsers, 
    updateUser, 
    deleteUser,
    getDashboardStats,
    getAllBlogs,
    deleteBlog 
} from '../controllers/adminController.js';

const adminRouter = express.Router();

// Remove duplicate routes and keep only these clean routes
adminRouter.get('/users', adminAuth, getAllUsers);
adminRouter.put('/users/:userId', adminAuth, updateUser);
adminRouter.patch('/users/:userId', adminAuth, updateUser);
adminRouter.delete('/users/:userId', adminAuth, deleteUser);
adminRouter.get('/dashboard-stats', adminAuth, getDashboardStats);
adminRouter.get('/blogs', adminAuth, getAllBlogs);
adminRouter.delete('/blogs/:blogId', adminAuth, deleteBlog);

export default adminRouter; 
import express from 'express';
import { 
  getAllBlogs,
  getMyBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  searchBlogs,
  likeBlog,
  getComments,
  addComment,
  deleteComment,
  getSingleBlog
} from '../controllers/blogController.js';
import userAuth from '../middleware/userAuth.js';
import Blog from '../models/blogModel.js';
import mongoose from 'mongoose';

const blogRouter = express.Router();

// Add this route for debugging - MOVE IT TO THE TOP
blogRouter.get('/debug/:blogId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.blogId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID format'
      });
    }
    
    const blog = await Blog.findById(req.params.blogId)
      .populate('author', 'name')
      .populate('likes', 'name');
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      blog: {
        _id: blog._id,
        title: blog.title,
        likes: blog.likes,
        likeCount: blog.likes.length,
        author: blog.author
      }
    });
  } catch (error) {
    console.error('Debug route error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

// Search route should be before dynamic routes
blogRouter.get('/search', searchBlogs);

// Protected routes with specific paths
blogRouter.get('/my-blogs', userAuth, getMyBlogs);

// CRUD operations
blogRouter.get('/', userAuth, getAllBlogs);
blogRouter.post('/', userAuth, createBlog);
blogRouter.put('/:blogId', userAuth, updateBlog);
blogRouter.delete('/:blogId', userAuth, deleteBlog);

// Like/unlike a blog
blogRouter.post('/:blogId/like', userAuth, likeBlog);

// Comment routes
blogRouter.get('/:blogId/comments', userAuth, getComments);
blogRouter.post('/:blogId/comments', userAuth, addComment);
blogRouter.delete('/:blogId/comments/:commentId', userAuth, deleteComment);

// Single blog route should be last as it's a catch-all
blogRouter.get('/:blogId', userAuth, getSingleBlog);

// Add this test route
blogRouter.get('/test-like/:blogId/:userId', async (req, res) => {
  try {
    const { blogId, userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID format'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    const blog = await Blog.findById(blogId);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    // Initialize likes array if it doesn't exist
    if (!blog.likes) {
      blog.likes = [];
    }
    
    // Check if user already liked the blog
    const alreadyLiked = blog.likes.some(id => id.toString() === userId);
    
    if (alreadyLiked) {
      // Unlike the blog
      blog.likes = blog.likes.filter(id => id.toString() !== userId);
    } else {
      // Like the blog
      blog.likes.push(userId);
    }
    
    // Make sure previewContent exists
    if (!blog.previewContent && blog.content) {
      blog.previewContent = blog.content.replace(/<img[^>]*>/g, '');
    }
    
    await blog.save();
    
    res.json({
      success: true,
      liked: !alreadyLiked,
      likeCount: blog.likes.length,
      likes: blog.likes
    });
  } catch (error) {
    console.error('Test like error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

export default blogRouter; 
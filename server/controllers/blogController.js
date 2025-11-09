import Blog from '../models/blogModel.js';
import User from '../models/usermodel.js';
import mongoose from 'mongoose';

export const getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    // Create search query - only search in title
    const searchQuery = search
      ? {
          title: { $regex: search, $options: 'i' }
        }
      : {};

    const [blogs, total] = await Promise.all([
      Blog.find(searchQuery)
        .populate('author', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Blog.countDocuments(searchQuery)
    ]);

    // Make sure likes are included in the response
    const processedBlogs = blogs.map(blog => ({
      ...blog,
      previewContent: blog.previewContent || blog.content.replace(/<img[^>]*>/g, ''),
      likes: blog.likes || [] // Ensure likes array is always present
    }));

    res.json({
      success: true,
      blogs: processedBlogs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + blogs.length < total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMyBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find({ author: req.body.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Blog.countDocuments({ author: req.body.userId })
    ]);

    // Make sure likes are included in the response
    const processedBlogs = blogs.map(blog => ({
      ...blog,
      previewContent: blog.previewContent || blog.content.replace(/<img[^>]*>/g, ''),
      likes: blog.likes || [] // Ensure likes array is always present
    }));

    res.json({
      success: true,
      blogs: processedBlogs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + blogs.length < total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const createBlog = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const previewContent = content.replace(/<img[^>]*>/g, '');

    const blog = new Blog({
      title,
      content,
      previewContent,
      tags,
      author: req.body.userId
    });

    await blog.save();
    res.json({
      success: true,
      message: 'Blog created successfully',
      blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { title, content, tags } = req.body;
    const previewContent = content.replace(/<img[^>]*>/g, '');
    
    const blog = await Blog.findOne({
      _id: blogId,
      author: req.body.userId
    });
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found or unauthorized'
      });
    }
    
    blog.title = title;
    blog.content = content;
    blog.previewContent = previewContent;
    blog.tags = tags;
    blog.updatedAt = Date.now();
    
    await blog.save();
    res.json({
      success: true,
      message: 'Blog updated successfully',
      blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findOneAndDelete({
      _id: blogId,
      author: req.body.userId
    });
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found or unauthorized'
      });
    }
    
    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const searchBlogs = async (req, res) => {
  try {
    const { searchTerm } = req.query;
    
    const blogs = await Blog.find({
      $or: [
        { tags: { $regex: searchTerm, $options: 'i' } },
        { title: { $regex: searchTerm, $options: 'i' } },
        { content: { $regex: searchTerm, $options: 'i' } }
      ]
    }).populate('author', 'name').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const likeBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.body.userId;
    
    console.log(`Like request for blog ${blogId} by user ${userId}`);
    
    if (!blogId || !mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID'
      });
    }
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User authentication required'
      });
    }
    
    // First check if the blog exists
    const blogExists = await Blog.findById(blogId);
    if (!blogExists) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    // Check if user already liked the blog
    const alreadyLiked = blogExists.likes && blogExists.likes.some(id => id.toString() === userId);
    
    let updateOperation;
    if (alreadyLiked) {
      // Unlike the blog - pull the userId from likes array
      updateOperation = {
        $pull: { likes: userId }
      };
    } else {
      // Like the blog - add userId to likes array
      updateOperation = {
        $addToSet: { likes: userId }
      };
    }
    
    // Update the blog without triggering validation
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      updateOperation,
      { new: true } // Return the updated document
    );
    
    res.json({
      success: true,
      liked: !alreadyLiked,
      likeCount: updatedBlog.likes.length
    });
  } catch (error) {
    console.error(`Error in likeBlog: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const addComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { content } = req.body;
    const userId = req.body.userId;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }
    
    const blog = await Blog.findById(blogId);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    const comment = {
      user: userId,
      content,
      createdAt: new Date()
    };
    
    blog.comments.push(comment);
    await blog.save();
    
    // Populate user info for the new comment
    const populatedBlog = await Blog.findById(blogId).populate({
      path: 'comments.user',
      select: 'name'
    });
    
    const newComment = populatedBlog.comments[populatedBlog.comments.length - 1];
    
    res.json({
      success: true,
      comment: newComment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getComments = async (req, res) => {
  try {
    const { blogId } = req.params;
    
    const blog = await Blog.findById(blogId).populate({
      path: 'comments.user',
      select: 'name'
    });
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    res.json({
      success: true,
      comments: blog.comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { blogId, commentId } = req.params;
    const userId = req.body.userId;
    
    const blog = await Blog.findById(blogId);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    // Find the comment
    const comment = blog.comments.id(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Check if user is the comment author or blog author
    if (comment.user.toString() !== userId && blog.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }
    
    // Remove the comment
    comment.deleteOne();
    await blog.save();
    
    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getSingleBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId)
      .populate('author', 'name')
      .populate({
        path: 'comments.user',
        select: 'name'
      })
      .lean(); // Use lean() for better performance
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Ensure likes array is always present
    blog.likes = blog.likes || [];

    res.json({
      success: true,
      blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
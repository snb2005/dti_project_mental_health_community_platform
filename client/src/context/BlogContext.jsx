import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { AppContent } from './AppContext';

export const BlogContext = createContext();

export const BlogProvider = ({ children }) => {
  const { backendUrl, userData } = useContext(AppContent);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch all blogs
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await axios.get(`${backendUrl}/api/blogs`, {
        withCredentials: true
      });
      
      if (data.success) {
        setBlogs(data.blogs);
      } else {
        setError('Failed to load blogs');
      }
    } catch (error) {
      setError('Error loading blogs: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Update a blog's likes
  const updateBlogLikes = (blogId, liked) => {
    setBlogs(prevBlogs => 
      prevBlogs.map(blog => 
        blog._id === blogId 
          ? { 
              ...blog, 
              likes: liked 
                ? [...(blog.likes || []), userData._id] 
                : (blog.likes || []).filter(id => id.toString() !== userData._id.toString())
            } 
          : blog
      )
    );
  };
  
  // Like/unlike a blog
  const likeBlog = async (blogId) => {
    if (!userData || !userData._id) {
      return { success: false, message: 'Please log in to like posts' };
    }
    
    try {
      // Optimistically update UI
      const blog = blogs.find(b => b._id === blogId);
      const isLiked = blog?.likes?.some(id => id.toString() === userData._id.toString());
      updateBlogLikes(blogId, !isLiked);
      
      // Send request to server
      const { data } = await axios.post(
        `${backendUrl}/api/blogs/${blogId}/like`,
        {},
        { withCredentials: true }
      );
      
      if (data.success) {
        // Update with actual server data
        setBlogs(prevBlogs => 
          prevBlogs.map(blog => 
            blog._id === blogId 
              ? { ...blog, likes: data.likes } 
              : blog
          )
        );
        
        return { success: true, liked: data.liked, likeCount: data.likeCount };
      } else {
        // Revert optimistic update
        updateBlogLikes(blogId, isLiked);
        return { success: false, message: data.message };
      }
    } catch (error) {
      // Revert optimistic update
      const blog = blogs.find(b => b._id === blogId);
      const isLiked = blog?.likes?.some(id => id.toString() === userData._id.toString());
      updateBlogLikes(blogId, isLiked);
      
      return { success: false, message: error.message };
    }
  };
  
  return (
    <BlogContext.Provider value={{
      blogs,
      loading,
      error,
      fetchBlogs,
      likeBlog,
      updateBlogLikes
    }}>
      {children}
    </BlogContext.Provider>
  );
}; 
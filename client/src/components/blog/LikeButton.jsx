import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Heart } from 'lucide-react';
import { toast } from 'react-toastify';
import { AppContent } from '../../context/AppContext';

const LikeButton = ({ 
  blogId, 
  initialLikes = [], 
  currentUserId, 
  size = "default", 
  onLikeUpdate = null,
  backendUrl 
}) => {
  const [likes, setLikes] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Get user ID directly from the server if not provided
  useEffect(() => {
    const getUserId = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`, {
          withCredentials: true
        });
        
        if (data.success && data.userData && data.userData._id) {
          setUserId(data.userData._id);
        }
      } catch (error) {
        // Silently handle error
      }
    };
    
    if (backendUrl && !currentUserId) {
      getUserId();
    }
  }, [backendUrl, currentUserId]);

  // Initialize likes array
  useEffect(() => {
    if (Array.isArray(initialLikes)) {
      setLikes(initialLikes);
    } else {
      setLikes([]);
    }
  }, [initialLikes]);

  // Check if current user has liked the post
  useEffect(() => {
    const effectiveUserId = userId || currentUserId;
    
    if (!effectiveUserId || !Array.isArray(likes)) {
      setIsLiked(false);
      return;
    }

    // Check if user ID is in likes array
    const userHasLiked = likes.some(id => {
      if (typeof id === 'string' && typeof effectiveUserId === 'string') {
        return id === effectiveUserId;
      }
      
      if (id && id.toString && effectiveUserId && effectiveUserId.toString) {
        return id.toString() === effectiveUserId.toString();
      }
      
      return false;
    });
    
    setIsLiked(userHasLiked);
  }, [likes, userId, currentUserId]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const effectiveUserId = userId || currentUserId;
    
    // Check if user is logged in
    if (!effectiveUserId) {
      toast.info('Please log in to like posts');
      return;
    }
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // Trigger animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
      
      const { data } = await axios.post(
        `${backendUrl}/api/blogs/${blogId}/like`,
        {},
        { withCredentials: true }
      );
      
      if (data.success) {
        // Update local state based on server response
        if (data.liked) {
          setLikes(prev => [...prev, effectiveUserId]);
          setIsLiked(true);
        } else {
          setLikes(prev => prev.filter(id => {
            if (typeof id === 'string' && typeof effectiveUserId === 'string') {
              return id !== effectiveUserId;
            }
            return id.toString() !== effectiveUserId.toString();
          }));
          setIsLiked(false);
        }
        
        // Call callback if provided
        if (onLikeUpdate) {
          onLikeUpdate(data.liked, data.likeCount);
        }
      }
    } catch (error) {
      toast.error('Failed to like post');
    } finally {
      setIsLoading(false);
    }
  };

  // Determine icon size based on prop
  const iconSize = size === "small" ? "w-4 h-4" : "w-5 h-5";
  const textSize = size === "small" ? "text-xs" : "text-sm";
  const buttonSize = size === "small" ? "px-2 py-1" : "px-3 py-1.5";

  return (
    <button 
      onClick={handleLike}
      disabled={isLoading}
      className={`
        ${buttonSize} 
        ${isLiked 
          ? 'bg-primary-lighter/20 text-primary dark:bg-primary-dark/20 dark:text-primary-lighter' 
          : 'text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-lighter'
        }
        rounded-lg flex items-center gap-1.5 transition-all duration-200
        ${isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <Heart 
        className={`
          ${iconSize} 
          ${isLiked ? 'fill-primary' : 'fill-transparent'} 
          transition-all duration-300
          ${isAnimating ? 'scale-125' : 'scale-100'}
        `} 
      />
      <span className={textSize}>{likes.length}</span>
    </button>
  );
};

export default LikeButton;

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';
import LikeButton from './LikeButton';
import { AppContent } from '../../context/AppContext';

const BlogCard = ({ blog, onLikeUpdate }) => {
  const { userData, backendUrl } = useContext(AppContent);
  
  // Function to strip HTML tags for preview
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  // Get a clean preview text
  const getPreviewText = () => {
    const text = stripHtml(blog.previewContent || blog.content);
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
  };

  // Calculate read time (rough estimate)
  const getReadTime = () => {
    const text = stripHtml(blog.content);
    const wordCount = text.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute
    return readTime < 1 ? 1 : readTime;
  };

  // Handle like updates at the card level
  const handleCardLikeUpdate = (liked, likeCount) => {
    if (onLikeUpdate) {
      onLikeUpdate(blog._id, liked, likeCount);
    }
  };

  // Get the current user ID safely
  const currentUserId = userData && userData._id ? userData._id : null;
  
  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-card-border overflow-hidden h-full flex flex-col hover:shadow-card transition-all duration-300 transform hover:-translate-y-1">
      <div className="p-6 flex-1">
        {/* Title with link */}
        <Link to={`/blog/${blog._id}`} className="block group">
          <h3 className="text-xl font-semibold mb-3 text-primary group-hover:text-primary-dark transition-colors line-clamp-2">
            {blog.title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-full bg-primary-lighter/20 flex items-center justify-center text-primary font-medium">
            {getInitials(blog.author?.name)}
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{blog.author?.name || 'Anonymous'}</span>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(blog.createdAt), 'MMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getReadTime()} min read
              </span>
            </div>
          </div>
        </div>
        
        {/* Preview text */}
        <Link to={`/blog/${blog._id}`} className="block">
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{getPreviewText()}</p>
        </Link>
      </div>
      
      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {blog.tags && blog.tags.length > 0 && 
            blog.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="bg-primary-lighter/10 text-primary px-2 py-1 rounded-full text-xs">
                {tag}
              </span>
            ))
          }
          {blog.tags && blog.tags.length > 2 && (
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full text-xs">
              +{blog.tags.length - 2}
            </span>
          )}
        </div>
        
        {/* Like button */}
        <LikeButton 
          blogId={blog._id} 
          initialLikes={blog.likes || []} 
          currentUserId={currentUserId}
          backendUrl={backendUrl}
          size="small"
          onLikeUpdate={handleCardLikeUpdate}
        />
      </div>
    </div>
  );
};

export default BlogCard;

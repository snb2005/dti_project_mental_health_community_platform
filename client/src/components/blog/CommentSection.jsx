import React, { useState, useEffect, useContext } from 'react';
import { format } from 'date-fns';
import { AppContent } from '../../context/AppContext';
import { BlogContext } from '../../context/BlogContext';
import { toast } from 'react-toastify';
import { MessageSquare, Send, Trash2 } from 'lucide-react';

const CommentSection = ({ blogId }) => {
  const { userData } = useContext(AppContent);
  const { getComments, addComment, deleteComment } = useContext(BlogContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Fetch comments when component mounts
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      const commentsData = await getComments(blogId);
      setComments(commentsData);
      setLoading(false);
    };
    
    if (blogId) {
      fetchComments();
    }
  }, [blogId, getComments]);
  
  // Handle comment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userData) {
      toast.info('Please log in to comment');
      return;
    }
    
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    
    setSubmitting(true);
    
    const result = await addComment(blogId, newComment);
    
    if (result.success) {
      setComments(prev => [...prev, result.comment]);
      setNewComment('');
      toast.success('Comment added successfully');
    } else {
      toast.error('Failed to add comment');
    }
    
    setSubmitting(false);
  };
  
  // Handle comment deletion
  const handleDelete = async (commentId) => {
    const result = await deleteComment(blogId, commentId);
    
    if (result.success) {
      setComments(prev => prev.filter(comment => comment._id !== commentId));
      toast.success('Comment deleted successfully');
    } else {
      toast.error('Failed to delete comment');
    }
  };
  
  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  return (
    <div className="mt-12">
      <div className="h-px w-full bg-gradient-to-r from-primary-lighter/30 via-primary-lighter to-primary-lighter/30 my-8" />
      
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gradient">
        <MessageSquare className="w-6 h-6" />
        Discussions ({comments.length})
      </h2>
      
      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          {userData ? (
            <div className="h-10 w-10 rounded-full bg-primary-lighter/20 flex items-center justify-center text-primary font-medium shrink-0">
              {getInitials(userData?.name)}
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0">
              ?
            </div>
          )}
          
          <div className="flex-1 space-y-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={userData ? "Write a comment..." : "Please log in to comment"}
              className="w-full min-h-[100px] px-4 py-3 border border-primary-lighter/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light dark:bg-gray-800 dark:text-gray-100 resize-none"
              rows="3"
              disabled={!userData || submitting}
            ></textarea>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!userData || submitting || !newComment.trim()}
                className="bg-gradient-to-r from-primary to-primary-light text-white px-4 py-2 rounded-xl hover:shadow-button transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Post Comment
                  </>
                )}
              </button>
            </div>
            
            {!userData && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Please log in to join the discussion</p>
            )}
          </div>
        </div>
      </form>
      
      {/* Comments list */}
      <div className="space-y-6">
        {loading ? (
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary-lighter/20 shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-primary-lighter/20 rounded-xl w-1/4"></div>
                  <div className="h-3 bg-primary-lighter/10 rounded-xl w-1/5"></div>
                  <div className="h-4 bg-primary-lighter/10 rounded-xl w-full"></div>
                  <div className="h-4 bg-primary-lighter/10 rounded-xl w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment._id} className="flex gap-4 group">
              <div className="h-10 w-10 rounded-full bg-primary-lighter/20 flex items-center justify-center text-primary font-medium shrink-0 mt-0.5">
                {getInitials(comment.user?.name || 'Anonymous')}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{comment.user?.name || 'Anonymous'}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(comment.createdAt), 'MMM d, yyyy • h:mm a')}
                    </div>
                  </div>
                  
                  {userData && (userData._id === comment.user?._id || userData._id === comment.user) && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="text-gray-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 w-4" />
                    </button>
                  )}
                </div>
                
                <p className="mt-2 text-gray-700 dark:text-gray-300">{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-primary-lighter/5 rounded-xl border border-primary-lighter/20">
            <p className="text-gray-600 dark:text-gray-400">No comments yet. Be the first to join the discussion!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;

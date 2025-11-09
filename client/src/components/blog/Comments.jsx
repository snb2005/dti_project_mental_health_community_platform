import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { AppContent } from '../../context/AppContext';
import { MessageSquare, Send, Trash2 } from 'lucide-react';

const Comments = ({ blogId, blogAuthorId }) => {
  const { userData, backendUrl } = useContext(AppContent);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [blogId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/blogs/${blogId}/comments`,
        { withCredentials: true }
      );
      
      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/blogs/${blogId}/comments`,
        { content: newComment },
        { withCredentials: true }
      );
      
      if (data.success) {
        setComments([...comments, data.comment]);
        setNewComment('');
        toast.success('Comment added');
      }
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/blogs/${blogId}/comments/${commentId}`,
        { withCredentials: true }
      );
      
      if (data.success) {
        setComments(comments.filter(comment => comment._id !== commentId));
        toast.success('Comment deleted');
      }
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const canDeleteComment = (commentUserId) => {
    return userData._id === commentUserId || userData._id === blogAuthorId;
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="mt-12">
      <div className="h-px w-full bg-gradient-to-r from-primary-lighter/30 via-primary-lighter to-primary-lighter/30 my-8" />
      
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-primary">
        <MessageSquare className="w-5 h-5" />
        Responses ({comments.length})
      </h3>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex gap-4">
              <div className="rounded-full bg-primary-lighter/20 h-10 w-10"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-primary-lighter/20 rounded w-1/4"></div>
                <div className="h-4 bg-primary-lighter/10 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-primary-lighter/20 flex items-center justify-center text-primary font-medium">
                {getInitials(userData?.name)}
              </div>
              <div className="flex-1 space-y-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add to the discussion"
                  className="w-full min-h-[80px] px-4 py-2 border border-primary-lighter/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light dark:bg-gray-800 dark:text-gray-100 resize-none"
                  disabled={isSubmitting}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !newComment.trim()}
                    className="bg-gradient-to-r from-primary to-primary-light text-white px-4 py-2 rounded-xl hover:shadow-button transition-all duration-300 disabled:opacity-50 flex items-center gap-2 text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Respond
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div className="space-y-6">
            {comments.length === 0 ? (
              <div className="text-center py-8 bg-primary-lighter/5 rounded-xl border border-primary-lighter/20">
                <p className="text-gray-600 dark:text-gray-400">No responses yet. Start the conversation!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="flex gap-4 group">
                  <div className="h-10 w-10 rounded-full bg-primary-lighter/20 flex items-center justify-center text-primary font-medium shrink-0 mt-0.5">
                    {getInitials(comment.user?.name)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{comment.user?.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(comment.createdAt), 'MMM d, yyyy • h:mm a')}
                        </div>
                      </div>
                      
                      {canDeleteComment(comment.user._id) && (
                        <button
                          onClick={() => handleDelete(comment._id)}
                          className="text-gray-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-gray-700 dark:text-gray-300">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Comments;

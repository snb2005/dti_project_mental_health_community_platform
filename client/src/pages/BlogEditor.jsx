import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Save, X } from 'lucide-react';

function BlogEditor() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContent);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If editing an existing blog, fetch its data
    if (blogId) {
      const fetchBlog = async () => {
        try {
          const { data } = await axios.get(`${backendUrl}/api/blogs/${blogId}`, { withCredentials: true });
          if (data.success) {
            setTitle(data.blog.title);
            setContent(data.blog.content);
            setTags(data.blog.tags?.join(', ') || '');
          }
        } catch (error) {
          toast.error('Error loading blog');
        }
      };
      fetchBlog();
    }
  }, [blogId, backendUrl]);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please add a title for your blog');
      return;
    }

    if (!content.trim()) {
      toast.error('Blog content cannot be empty');
      return;
    }

    try {
      setIsLoading(true);
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      // Create a preview version without images for card display
      const previewContent = content.replace(/<img[^>]*>/g, '');
      
      const endpoint = blogId 
        ? `${backendUrl}/api/blogs/${blogId}`
        : `${backendUrl}/api/blogs`;
      
      const method = blogId ? 'put' : 'post';
      
      const { data } = await axios[method](
        endpoint,
        { 
          title, 
          content,
          previewContent, // Add preview content
          tags: tagsArray 
        },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(blogId ? 'Blog updated successfully!' : 'Blog published successfully!');
        navigate('/my-blogs');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving blog');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pattern-bg">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-card-border p-6">
          <div className="mb-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Blog Title"
              className="w-full text-2xl font-bold mb-4 p-3 border border-primary-lighter/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light bg-white/80 backdrop-blur-sm transition-all"
            />
            
            <div className="relative">
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Tags (comma-separated)"
                className="w-full p-3 border border-primary-lighter/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light bg-white/80 backdrop-blur-sm transition-all"
              />
              <div className="absolute right-3 top-3 text-xs text-gray-500">e.g. mental health, wellness, self-care</div>
            </div>
          </div>

          <div className="mb-6 border border-primary-lighter/30 rounded-xl overflow-hidden">
            <ReactQuill 
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              className="h-96 mb-12 bg-white"
              placeholder="Start writing your blog post..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate('/my-blogs')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl shadow-button hover:shadow-lg transition-all duration-300 transform hover:scale-102"
              disabled={isLoading}
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? 'Saving...' : (blogId ? 'Update' : 'Publish')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogEditor;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AuthTest = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [likeResponse, setLikeResponse] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [selectedBlogId, setSelectedBlogId] = useState('');
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`, {
          withCredentials: true
        });
        console.log('Direct auth check response:', data);
        
        if (data.success) {
          setUserData(data.userData);
        } else {
          setError('Authentication failed: ' + data.message);
        }
      } catch (err) {
        setError('Error checking auth: ' + err.message);
      }
    };
    
    const fetchBlogs = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/blogs`, {
          withCredentials: true
        });
        
        if (data.success && data.blogs.length > 0) {
          setBlogs(data.blogs);
          setSelectedBlogId(data.blogs[0]._id);
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
      }
    };
    
    if (backendUrl) {
      checkAuth();
      fetchBlogs();
    }
  }, [backendUrl]);
  
  const testLike = async () => {
    if (!selectedBlogId) {
      setError('No blog selected');
      return;
    }
    
    try {
      console.log(`Testing like for blog ID: ${selectedBlogId}`);
      const { data } = await axios.post(
        `${backendUrl}/api/blogs/${selectedBlogId}/like`,
        {},
        { withCredentials: true }
      );
      console.log('Direct like response:', data);
      setLikeResponse(data);
    } catch (err) {
      console.error('Like error details:', err);
      setError(`Error testing like: ${err.message}`);
      if (err.response) {
        console.error('Error response:', err.response.data);
      }
    }
  };
  
  return (
    <div className="p-4 bg-gray-100 rounded-lg mb-4">
      <h2 className="text-lg font-bold mb-2">Authentication Test</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
          {error}
        </div>
      )}
      
      {userData ? (
        <div className="mb-4">
          <p className="text-green-600 font-bold">✓ Authenticated</p>
          <p>User ID: {userData._id}</p>
          <p>Name: {userData.name}</p>
          <p>Email: {userData.email}</p>
        </div>
      ) : (
        <p className="text-red-600 font-bold">✗ Not authenticated</p>
      )}
      
      <div className="mb-4">
        <h3 className="font-bold mb-2">Select a blog to like:</h3>
        <select 
          value={selectedBlogId} 
          onChange={(e) => setSelectedBlogId(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        >
          {blogs.length === 0 && <option value="">No blogs available</option>}
          {blogs.map(blog => (
            <option key={blog._id} value={blog._id}>
              {blog.title}
            </option>
          ))}
        </select>
        
        <button 
          onClick={testLike}
          disabled={!selectedBlogId}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          Test Like API
        </button>
      </div>
      
      {likeResponse && (
        <div className="mt-4">
          <h3 className="font-bold">Like Response:</h3>
          <pre className="bg-gray-200 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(likeResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AuthTest; 
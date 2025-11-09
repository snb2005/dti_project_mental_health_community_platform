"use client"

import { useState, useEffect, useContext, useRef, useCallback } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { AppContent } from "../context/AppContext"
import Navbar from "../components/Navbar"
import BlogCard from "../components/blog/BlogCard"
import { Edit, Plus, Loader2, FileText, X } from "lucide-react"

function MyBlogs() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingBlog, setEditingBlog] = useState(null)
  const [formData, setFormData] = useState({ title: "", content: "", tags: "" })

  const { isLoggedin, backendUrl } = useContext(AppContent)
  const navigate = useNavigate()
  const modalRef = useRef(null)

  // Create a ref for the intersection observer
  const observer = useRef()
  const lastBlogElementRef = useCallback(
    (node) => {
      if (loading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1)
        }
      })
      if (node) observer.current.observe(node)
    },
    [loading, hasMore],
  )

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowCreateModal(false)
        setEditingBlog(null)
        setFormData({ title: "", content: "", tags: "" })
      }
    }

    if (showCreateModal) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showCreateModal])

  const fetchMyBlogs = async (pageNum) => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${backendUrl}/api/blogs/my-blogs?page=${pageNum}&limit=9`, {
        withCredentials: true,
      })

      if (data.success) {
        if (pageNum === 1) {
          setBlogs(data.blogs)
        } else {
          setBlogs((prev) => [...prev, ...data.blogs])
        }
        setHasMore(data.hasMore)
      }
    } catch (error) {
      toast.error("Error fetching blogs")
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`, {
          withCredentials: true,
        })
        if (!data.success) {
          navigate("/login")
        } else {
          setPage(1)
          fetchMyBlogs(1)
        }
      } catch (error) {
        navigate("/login")
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    if (page > 1) {
      fetchMyBlogs(page)
    }
  }, [page])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const endpoint = editingBlog ? `${backendUrl}/api/blogs/${editingBlog._id}` : `${backendUrl}/api/blogs`

      const method = editingBlog ? "put" : "post"
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag)

      const { data } = await axios[method](endpoint, { ...formData, tags: tagsArray }, { withCredentials: true })

      if (data.success) {
        toast.success(editingBlog ? "Blog updated!" : "Blog created!")
        fetchMyBlogs(1)
        setShowCreateModal(false)
        setEditingBlog(null)
        setFormData({ title: "", content: "", tags: "" })
      }
    } catch (error) {
      toast.error("Error saving blog")
    }
  }

  const handleDelete = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) {
      return
    }

    try {
      const { data } = await axios.delete(`${backendUrl}/api/blogs/${blogId}`, {
        withCredentials: true,
      })

      if (data.success) {
        toast.success("Blog deleted successfully")
        // Update the blogs state by filtering out the deleted blog
        setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog._id !== blogId))
      }
    } catch (error) {
      toast.error("Error deleting blog")
    }
  }

  // Handle like updates
  const handleLikeUpdate = (blogId, liked, likeCount) => {
    setBlogs((prevBlogs) =>
      prevBlogs.map((blog) =>
        blog._id === blogId
          ? { ...blog, likes: [...blog.likes] } // Create a new array to trigger re-render
          : blog,
      ),
    )
  }

  return (
    <div className="min-h-screen pattern-bg">
      <Navbar />
      <div className="container mx-auto px-4 py-12 mt-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient">My Stories</h1>
            <p className="text-gray-600 mt-1">Manage and edit your published content</p>
          </div>
          <button onClick={() => navigate("/blog/new")} className="btn-primary">
            <Plus className="h-4 w-4" />
            New Story
          </button>
        </div>

        {initialLoad ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="animate-pulse bg-white/90 backdrop-blur-sm rounded-2xl shadow-card p-6 border border-card-border"
              >
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog, index) => {
                if (blogs.length === index + 1 && hasMore) {
                  return (
                    <div
                      ref={lastBlogElementRef}
                      key={blog._id}
                      className="transform transition-transform duration-300 hover:scale-102"
                    >
                      <BlogCard blog={blog} onLikeUpdate={handleLikeUpdate} />
                    </div>
                  )
                } else {
                  return (
                    <div key={blog._id} className="transform transition-transform duration-300 hover:scale-102">
                      <BlogCard key={blog._id} blog={blog} onLikeUpdate={handleLikeUpdate} />
                    </div>
                  )
                }
              })}
            </div>

            {loading && !initialLoad && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2 text-gray-600 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-soft">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading more stories
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl shadow-card border border-card-border">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-primary-lighter/20 rounded-full">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-primary">You haven't written any stories yet</h3>
            <p className="text-gray-600 mb-6">Start creating content and sharing your ideas with the world</p>
            <button onClick={() => navigate("/blog/new")} className="btn-primary">
              <Edit className="h-4 w-4" />
              Write your first story
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div
            ref={modalRef}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 w-full max-w-2xl shadow-card border border-card-border"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-primary">{editingBlog ? "Edit Story" : "Create New Story"}</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingBlog(null)
                  setFormData({ title: "", content: "", tags: "" })
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="input-field h-40 resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="input-field"
                  placeholder="mental health, self-care, wellness"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingBlog(null)
                    setFormData({ title: "", content: "", tags: "" })
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingBlog ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyBlogs


"use client"

import { useState, useEffect, useContext, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import Navbar from "../components/Navbar"
import { AppContent } from "../context/AppContext"
import BlogCard from "../components/blog/BlogCard"
import { Edit, Loader2, Search } from "lucide-react"

function AllBlogs() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const navigate = useNavigate()
  const { backendUrl } = useContext(AppContent)
  const searchInputRef = useRef(null)

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

  const fetchBlogs = async (pageNum, search = "") => {
    try {
      setLoading(true)
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : ""

      const { data } = await axios.get(
        `${backendUrl}/api/blogs?page=${pageNum}&limit=9${searchParam}`,
        { withCredentials: true },
      )

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
      setIsSearching(false)
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
          // Reset page and fetch initial blogs
          setPage(1)
          fetchBlogs(1)
        }
      } catch (error) {
        navigate("/login")
      }
    }

    checkAuth()
  }, []) // Initial auth check and blog fetch

  useEffect(() => {
    if (page > 1 && !isSearching) {
      fetchBlogs(page, searchTerm)
    }
  }, [page])

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault()
    setIsSearching(true)
    setPage(1)
    fetchBlogs(1, searchTerm)
  }

  // Handle like updates at the page level
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
    <div className="min-h-screen bg-gradient-to-b from-primary-lighter/20 to-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12 mt-16">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Discover Stories</h1>
            <p className="text-gray-600 mt-1">Explore ideas, perspectives, and knowledge</p>
          </div>

          <div className="flex gap-3">
            <form onSubmit={handleSearch} className="relative flex-1 md:w-64">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light bg-white text-gray-800"
              />
              <button type="submit" className="absolute right-0 top-0 h-full px-3 text-gray-500" disabled={isSearching}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </button>
            </form>

            <button
              onClick={() => navigate("/blog/new")}
              className="bg-gradient-to-r from-primary to-primary-light hover:opacity-90 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap shadow-md"
            >
              <Edit className="h-4 w-4" />
              Write
            </button>
          </div>
        </div>

        {initialLoad ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="animate-pulse bg-white rounded-xl shadow-md p-6">
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
                      <BlogCard blog={blog} onLikeUpdate={handleLikeUpdate} />
                    </div>
                  )
                }
              })}
            </div>

            {loading && !initialLoad && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2 text-gray-600 bg-white px-4 py-2 rounded-lg shadow">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading more stories
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-primary-lighter/20 rounded-full">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-primary">
              {searchTerm ? "No stories found matching your search" : "No stories available yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? "Try a different search term or browse all stories" : "Be the first to share your ideas with the community"}
            </p>
            {searchTerm ? (
              <button
                onClick={() => {
                  setSearchTerm("")
                  setPage(1)
                  fetchBlogs(1)
                }}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                View all stories
              </button>
            ) : (
              <button
                onClick={() => navigate("/blog/new")}
                className="bg-gradient-to-r from-primary to-primary-light hover:opacity-90 text-white px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 mx-auto shadow-md"
              >
                <Edit className="h-4 w-4" />
                Write the first story
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AllBlogs


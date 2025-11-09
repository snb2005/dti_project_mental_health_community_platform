import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import Navbar from "../components/Navbar"
import { format } from "date-fns"
import { AppContent } from "../context/AppContext"
import LikeButton from "../components/blog/LikeButton"
import Comments from "../components/blog/Comments"
import BlogViewSkeleton from "../components/blog/BlogViewSkeleton"
import { Calendar, Clock, Share2, BookmarkPlus, MoreHorizontal, Edit, Trash2 } from 'lucide-react'

function BlogView() {
  const { blogId } = useParams()
  const navigate = useNavigate()
  const { userData, backendUrl, isLoading: authLoading } = useContext(AppContent)
  const [blog, setBlog] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [readTime, setReadTime] = useState(0)
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)

  useEffect(() => {
    const fetchBlog = async () => {
      setIsLoading(true)
      try {
        const { data } = await axios.get(`${backendUrl}/api/blogs/${blogId}`, { withCredentials: true })

        if (data.success) {
          setBlog(data.blog)

          // Calculate read time
          const text = new DOMParser().parseFromString(data.blog.content, "text/html").body.textContent || ""
          const wordCount = text.split(/\s+/).length
          const time = Math.ceil(wordCount / 200) // Assuming 200 words per minute
          setReadTime(time < 1 ? 1 : time)
        }
      } catch (error) {
        toast.error("Error loading blog post")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlog()
  }, [blogId, backendUrl])

  useEffect(() => {
    const lazyLoadImages = () => {
      const blogContent = document.querySelector(".blog-content")
      if (!blogContent) return

      const images = blogContent.getElementsByTagName("img")

      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target
            img.src = img.dataset.src
            observer.unobserve(img)
          }
        })
      })

      Array.from(images).forEach((img) => {
        if (img.src !== img.dataset.src) {
          imageObserver.observe(img)
        }
      })
    }

    if (blog) {
      // Replace image src with data-src for lazy loading
      const contentWithLazyImages = blog.content.replace(
        /<img([^>]*)src="([^"]*)"([^>]*)>/g,
        '<img$1data-src="$2"$3src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">',
      )

      const blogContentElement = document.querySelector(".blog-content")
      if (blogContentElement) {
        blogContentElement.innerHTML = contentWithLazyImages
        lazyLoadImages()
      }
    }
  }, [blog])

  // Handle like updates
  const handleLikeUpdate = (liked, likeCount) => {
    // Update the blog state with the new like information
    setBlog((prevBlog) => {
      if (!prevBlog) return null

      // Create a new likes array based on the action
      let updatedLikes
      if (liked && userData && userData._id) {
        updatedLikes = [...(prevBlog.likes || []), userData._id]
      } else if (userData && userData._id) {
        updatedLikes = (prevBlog.likes || []).filter((id) => {
          if (typeof id === "string" && typeof userData._id === "string") {
            return id !== userData._id
          }
          return id.toString() !== userData._id.toString()
        })
      } else {
        updatedLikes = prevBlog.likes || []
      }

      return {
        ...prevBlog,
        likes: updatedLikes,
      }
    })
  }

  // Share functionality
  const handleShare = async () => {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: `Check out this blog post: ${blog.title}`,
          url: url,
        })
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard(url)
      }
    } else {
      // Fallback to clipboard
      copyToClipboard(url)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Link copied to clipboard"))
      .catch(() => toast.error("Failed to copy link"))
  }

  // Handle delete blog
  const handleDeleteBlog = async () => {
    if (!window.confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) {
      return
    }

    try {
      const { data } = await axios.delete(`${backendUrl}/api/blogs/${blogId}`, { withCredentials: true })

      if (data.success) {
        toast.success("Blog post deleted successfully")
        navigate("/my-blogs")
      }
    } catch (error) {
      toast.error("Failed to delete blog post")
    }
  }

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "??"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen pattern-bg">
        <Navbar />
        <div className="container mx-auto px-4 py-8 mt-16">
          <BlogViewSkeleton />
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pattern-bg">
        <Navbar />
        <div className="container mx-auto px-4 py-8 mt-16">
          <BlogViewSkeleton />
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen pattern-bg">
        <Navbar />
        <div className="container mx-auto px-4 py-8 mt-16 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-card-border p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-gradient">Blog post not found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The story you're looking for doesn't exist or has been removed
            </p>
            <button
              onClick={() => navigate("/blogs")}
              className="btn-primary"
            >
              Browse all stories
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Get the current user ID safely
  const currentUserId = userData ? userData._id : null
  const isAuthor = userData && blog.author && userData._id === blog.author._id

  return (
    <div className="min-h-screen pattern-bg">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-16">
        <article className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-card-border p-6 md:p-8 animate-fadeIn">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-gradient">
            {blog.title}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-primary-lighter flex items-center justify-center text-primary font-medium">
              {getInitials(blog.author?.name)}
            </div>

            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">{blog.author?.name || "Anonymous"}</div>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(blog.createdAt), "MMM d, yyyy")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {readTime} min read
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-primary-lighter/20 text-primary px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 mb-8">
            <LikeButton
              blogId={blog._id}
              initialLikes={blog.likes || []}
              currentUserId={currentUserId}
              backendUrl={backendUrl}
              onLikeUpdate={handleLikeUpdate}
            />

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-sm">Share</span>
            </button>

            {isAuthor && (
              <div className="relative ml-auto">
                <button
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="text-sm">Options</span>
                </button>

                {showOptionsMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-card-border z-10">
                    <button
                      onClick={() => {
                        setShowOptionsMenu(false)
                        navigate(`/blog/edit/${blog._id}`)
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-xl"
                    >
                      <Edit className="h-4 w-4" />
                      Edit story
                    </button>
                    <button
                      onClick={() => {
                        setShowOptionsMenu(false)
                        handleDeleteBlog()
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-xl"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete story
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="h-px w-full bg-gradient-to-r from-primary-lighter/30 via-primary-lighter to-primary-lighter/30 mb-8"></div>

          {/* Blog content */}
          <div className="prose prose-lg max-w-none dark:prose-invert mb-12 blog-content text-gray-800 dark:text-gray-200" />

          {userData && <Comments blogId={blog._id} blogAuthorId={blog.author?._id} />}
        </article>
      </div>
    </div>
  )
}

export default BlogView

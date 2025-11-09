"use client"

import { useState, useEffect, useContext } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import Navbar from "../components/Navbar"
import { AppContent } from "../context/AppContext"
import {
  Loader2,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Trash2,
  CheckCircle,
  XCircle,
  UserCheck,
} from "lucide-react"

function AdminDashboard() {
  const { backendUrl } = useContext(AppContent)
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [blogs, setBlogs] = useState([])
  const [expertApplications, setExpertApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/users`, {
        withCredentials: true,
      })
      if (data.success) {
        setUsers(data.users)
      } else {
        toast.error("Failed to fetch users")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching users")
    }
  }

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/dashboard-stats`, {
        withCredentials: true,
      })
      if (data.success) {
        setStats(data.stats)
      } else {
        toast.error("Failed to fetch stats")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching stats")
    }
  }

  const fetchBlogs = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/blogs`, {
        withCredentials: true,
      })
      if (data.success) {
        setBlogs(data.blogs)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching blogs")
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return

    try {
      const { data } = await axios.delete(`${backendUrl}/api/admin/users/${userId}`, {
        withCredentials: true,
      })

      if (data.success) {
        toast.success("User deleted successfully")
        fetchUsers() // Refresh user list
        fetchStats() // Refresh stats
      } else {
        toast.error(data.message || "Failed to delete user")
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error(error.response?.data?.message || "Error deleting user")
    }
  }

  const handleToggleExpert = async (userId) => {
    try {
      const userToUpdate = users.find((user) => user._id === userId)
      const { data } = await axios.patch(
        `${backendUrl}/api/admin/users/${userId}`,
        {
          isExpert: !userToUpdate.isExpert,
        },
        {
          withCredentials: true,
        },
      )

      if (data.success) {
        setUsers(users.map((user) => (user._id === userId ? { ...user, isExpert: !user.isExpert } : user)))
        toast.success(`User ${!userToUpdate.isExpert ? "is now an expert" : "is no longer an expert"}`)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating expert status")
    }
  }

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return

    try {
      const { data } = await axios.delete(`${backendUrl}/api/admin/blogs/${blogId}`, {
        withCredentials: true,
      })
      if (data.success) {
        toast.success("Blog deleted successfully")
        setBlogs(blogs.filter((blog) => blog._id !== blogId))
        // Refresh stats to update blog count
        fetchStats()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting blog")
    }
  }

  const fetchExpertApplications = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/expert-applications/all`, {
        withCredentials: true,
      })
      if (data.success) {
        setExpertApplications(data.applications)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching expert applications")
    }
  }

  const handleReviewApplication = async (applicationId, action, adminNotes = '') => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/expert-applications/review`,
        {
          applicationId,
          action, // 'approve' or 'reject'
          adminNotes
        },
        { withCredentials: true }
      )

      if (data.success) {
        toast.success(data.message)
        fetchExpertApplications() // Refresh applications
        fetchUsers() // Refresh users list to see expert status changes
      } else {
        toast.error(data.message || `Failed to ${action} application`)
      }
    } catch (error) {
      console.error('Review application error:', error)
      toast.error(error.response?.data?.message || `Error ${action}ing application`)
    }
  }

  useEffect(() => {
    Promise.all([fetchUsers(), fetchStats(), fetchBlogs(), fetchExpertApplications()]).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen pattern-bg">
        <Navbar />
        <div className="container mx-auto px-4 py-12 mt-16">
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-gray-600">Loading dashboard data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pattern-bg bg-[#F5F0FF]">
      <Navbar />
      <div className="container mx-auto px-4 py-12 mt-16">
        <h1 className="text-3xl font-bold mb-8 text-gradient">Admin Dashboard</h1>

        {/* Dashboard Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 font-medium ${
              activeTab === "overview" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-primary"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 font-medium ${
              activeTab === "users" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-primary"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("expert-applications")}
            className={`px-4 py-2 font-medium ${
              activeTab === "expert-applications" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-primary"
            }`}
          >
            Expert Applications
          </button>
          <button
            onClick={() => setActiveTab("blogs")}
            className={`px-4 py-2 font-medium ${
              activeTab === "blogs" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-primary"
            }`}
          >
            Blogs
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-card border border-card-border flex items-center">
                <div className="p-4 bg-primary-lighter/20 rounded-full mr-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700">Total Users</h3>
                  <p className="text-3xl font-bold text-primary">{stats?.userCount || 0}</p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-card border border-card-border flex items-center">
                <div className="p-4 bg-primary-lighter/20 rounded-full mr-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700">Total Blogs</h3>
                  <p className="text-3xl font-bold text-primary">{stats?.blogCount || 0}</p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-card border border-card-border flex items-center">
                <div className="p-4 bg-primary-lighter/20 rounded-full mr-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700">Forum Rooms</h3>
                  <p className="text-3xl font-bold text-primary">{stats?.roomCount || 0}</p>
                </div>
              </div>
            </div>

            {/* Activity Chart */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-card overflow-hidden border border-card-border mb-8">
              <div className="p-6 bg-gradient-to-r from-primary to-primary-light">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Platform Activity
                </h2>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">Activity chart would be displayed here</p>
                <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
                  <p className="text-gray-400">Activity visualization</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-card overflow-hidden border border-card-border">
            <div className="p-6 bg-gradient-to-r from-primary to-primary-light">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Manage Users
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expert
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-primary-lighter/30 flex items-center justify-center text-primary font-medium">
                            {user.name.charAt(0)}
                          </div>
                          <div className="ml-3">{user.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{user.role}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isAccountVerified ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleExpert(user._id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.isExpert
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          {user.isExpert ? (
                            <span className="flex items-center">
                              <UserCheck className="h-3 w-3 mr-1" /> Expert
                            </span>
                          ) : (
                            "Make Expert"
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Blogs Tab */}
        {activeTab === "blogs" && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-card overflow-hidden border border-card-border">
            <div className="p-6 bg-gradient-to-r from-primary to-primary-light">
              <h2 className="text-xl font-bold text-white flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Manage Blogs
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {blogs.map((blog) => (
                    <tr key={blog._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">{blog.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-primary-lighter/30 flex items-center justify-center text-primary font-medium">
                            {blog.author?.name?.charAt(0) || "?"}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm text-gray-900">{blog.author?.name || "Unknown Author"}</div>
                            <div className="text-sm text-gray-500">{blog.author?.email || "No email"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(blog.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">{new Date(blog.createdAt).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteBlog(blog._id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Expert Applications Tab */}
        {activeTab === "expert-applications" && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-card overflow-hidden border border-card-border">
            <div className="p-6 bg-gradient-to-r from-primary to-primary-light">
              <h2 className="text-xl font-bold text-white flex items-center">
                <UserCheck className="h-5 w-5 mr-2" />
                Expert Applications
              </h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {expertApplications.filter(app => app.status === 'pending').length}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-yellow-800">Pending</p>
                        <p className="text-xs text-yellow-600">Applications awaiting review</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {expertApplications.filter(app => app.status === 'approved').length}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">Approved</p>
                        <p className="text-xs text-green-600">Successfully approved experts</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {expertApplications.filter(app => app.status === 'rejected').length}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">Rejected</p>
                        <p className="text-xs text-red-600">Applications that were declined</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {expertApplications.length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No expert applications found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applicant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Specialization
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Experience
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applied
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {expertApplications.map((application) => (
                        <tr key={application.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-primary-lighter/30 flex items-center justify-center text-primary font-medium">
                                {application.applicant.name.charAt(0)}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm text-gray-900">{application.applicant.name}</div>
                                <div className="text-sm text-gray-500">{application.applicant.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{application.specialization}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{application.yearsOfExperience} years</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{new Date(application.appliedAt).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              application.status === 'approved' ? 'bg-green-100 text-green-800' :
                              application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {application.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {application.status === 'pending' ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    const notes = prompt('Add admin notes (optional):')
                                    if (notes !== null) { // User didn't cancel
                                      handleReviewApplication(application.id, 'approve', notes)
                                    }
                                  }}
                                  className="text-green-600 hover:text-green-900 flex items-center"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    const notes = prompt('Add reason for rejection:')
                                    if (notes !== null) { // User didn't cancel
                                      handleReviewApplication(application.id, 'reject', notes)
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-900 flex items-center"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <div className="text-gray-500 text-sm">
                                {application.reviewedAt && (
                                  <span>Reviewed: {new Date(application.reviewedAt).toLocaleDateString()}</span>
                                )}
                                {application.adminNotes && (
                                  <div className="mt-1 text-xs text-gray-600">
                                    Notes: {application.adminNotes}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard


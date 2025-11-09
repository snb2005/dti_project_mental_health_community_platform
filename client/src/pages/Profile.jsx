import { useState, useEffect, useContext } from 'react'
import { AppContent } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  MessageCircle, 
  Award,
  Settings,
  Edit3,
  Save,
  X,
  Shield,
  CheckCircle,
  XCircle,
  MessageSquare
} from 'lucide-react'

const Profile = () => {
  const { userData, backendUrl, isLoggedin } = useContext(AppContent)
  const [userStats, setUserStats] = useState({
    totalBlogs: 0,
    totalChats: 0,
    joinedDate: '',
    lastActive: ''
  })
  const [userBlogs, setUserBlogs] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    email: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoggedin && userData) {
      fetchUserData()
      setEditData({
        name: userData.name || '',
        email: userData.email || ''
      })
    }
  }, [isLoggedin, userData])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      // Fetch user blogs
      const blogsResponse = await axios.get(`${backendUrl}/api/blogs/my-blogs`, {
        withCredentials: true
      })
      
      if (blogsResponse.data.success) {
        setUserBlogs(blogsResponse.data.blogs)
        setUserStats(prev => ({
          ...prev,
          totalBlogs: blogsResponse.data.blogs.length
        }))
      }

      // Fetch user conversations for chat count
      const conversationsResponse = await axios.get(`${backendUrl}/api/conversations`, {
        withCredentials: true
      })
      
      if (conversationsResponse.data.success) {
        setUserStats(prev => ({
          ...prev,
          totalChats: conversationsResponse.data.conversations.length
        }))
      }

      // Set join date and last active
      setUserStats(prev => ({
        ...prev,
        joinedDate: new Date().toLocaleDateString(), // You can get this from userData if available
        lastActive: new Date().toLocaleDateString()
      }))

    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/user/update-profile`,
        editData,
        { withCredentials: true }
      )

      if (response.data.success) {
        toast.success('Profile updated successfully')
        setIsEditing(false)
        // Update userData context if needed
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  const sendVerificationEmail = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/send-verify-otp`,
        {}, // Empty body, userId comes from middleware
        { withCredentials: true }
      )

      if (response.data.success) {
        toast.success('Verification email sent!')
        navigate('/emailVerify')
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error sending verification:', error)
      toast.error('Failed to send verification email')
    }
  }

  if (!isLoggedin) {
    return (
      <div className="min-h-screen pattern-bg bg-[#F5F0FF]">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view your profile</h1>
            <a href="/login" className="btn-primary">Login</a>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen pattern-bg bg-[#F5F0FF]">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pattern-bg bg-[#F5F0FF]">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Profile Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-card border border-card-border p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-white" />
              </div>
              {userData.role === 'admin' && (
                <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                        className="input-field text-xl font-bold"
                        placeholder="Your name"
                      />
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                        className="input-field"
                        placeholder="Your email"
                      />
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        {userData.name}
                        {userData.role === 'admin' && (
                          <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">Admin</span>
                        )}
                        {userData.isExpert && (
                          <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">Expert</span>
                        )}
                      </h1>
                      <div className="flex items-center gap-2 text-gray-600 mt-1">
                        <Mail className="h-4 w-4" />
                        <span>{userData.email}</span>
                        {userData.isAccountVerified ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleUpdateProfile}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {/* Verification Status */}
              {!userData.isAccountVerified && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <XCircle className="h-5 w-5" />
                      <span>Email not verified</span>
                    </div>
                    <button
                      onClick={sendVerificationEmail}
                      className="text-primary hover:text-primary-dark font-medium"
                    >
                      Send verification email
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-card border border-card-border p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{userStats.totalBlogs}</p>
                <p className="text-gray-600 text-sm">Blogs Written</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-card border border-card-border p-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{userStats.totalChats}</p>
                <p className="text-gray-600 text-sm">Conversations</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-card border border-card-border p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-bold text-gray-800">{userStats.joinedDate}</p>
                <p className="text-gray-600 text-sm">Joined Date</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-card border border-card-border p-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-bold text-gray-800">{userStats.lastActive}</p>
                <p className="text-gray-600 text-sm">Last Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Expert Application Section */}
        {!userData.isExpert && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-card border border-card-border p-6 mb-6">
            <div className="text-center">
              <Award className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Become a Mental Health Expert</h2>
              <p className="text-gray-600 mb-4">
                Are you a licensed mental health professional? Join our team of experts and help support our community.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <MessageSquare className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800">Expert Chat</h3>
                  <p className="text-sm text-gray-600">Provide professional support through one-on-one chats</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800">Verified Status</h3>
                  <p className="text-sm text-gray-600">Get verified expert badge and enhanced credibility</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800">Help Community</h3>
                  <p className="text-sm text-gray-600">Make a meaningful impact in mental health support</p>
                </div>
              </div>
              <a 
                href="/expert-application" 
                className="btn-primary inline-flex items-center gap-2"
              >
                <Award className="h-5 w-5" />
                Apply to Become an Expert
              </a>
            </div>
          </div>
        )}

        {/* Recent Blogs */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-card border border-card-border p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Your Recent Blogs
          </h2>
          
          {userBlogs.length > 0 ? (
            <div className="space-y-4">
              {userBlogs.slice(0, 5).map((blog, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-800 mb-2">{blog.title}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{blog.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{new Date(blog.date).toLocaleDateString()}</span>
                    <a href={`/blog/${blog._id}`} className="text-primary hover:text-primary-dark">
                      Read more →
                    </a>
                  </div>
                </div>
              ))}
              
              {userBlogs.length > 5 && (
                <div className="text-center pt-4">
                  <a href="/my-blogs" className="btn-primary">
                    View All Blogs
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">You haven't written any blogs yet.</p>
              <a href="/blog/new" className="btn-primary">
                Write Your First Blog
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
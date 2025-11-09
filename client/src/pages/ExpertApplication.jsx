import { useState, useContext, useEffect } from 'react'
import { AppContent } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { 
  FileText, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Award,
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send
} from 'lucide-react'

const ExpertApplication = () => {
  const { userData, backendUrl, isLoggedin } = useContext(AppContent)
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    qualifications: '',
    experience: '',
    specialization: '',
    licenseNumber: '',
    yearsOfExperience: '',
    motivation: '',
    availability: ''
  })
  const [loading, setLoading] = useState(false)
  const [existingApplication, setExistingApplication] = useState(null)
  const [checkingApplication, setCheckingApplication] = useState(true)

  const specializations = [
    'Clinical Psychology',
    'Counseling Psychology', 
    'Psychiatry',
    'Social Work',
    'Marriage & Family Therapy',
    'Addiction Counseling',
    'Other'
  ]

  const availabilityOptions = [
    'Full-time',
    'Part-time',
    'Weekend only',
    'Flexible'
  ]

  useEffect(() => {
    if (isLoggedin && userData) {
      if (userData.name) {
        setFormData(prev => ({ ...prev, fullName: userData.name }))
      }
      checkExistingApplication()
    }
  }, [isLoggedin, userData])

  const checkExistingApplication = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/expert-applications/my-application`, {
        withCredentials: true
      })
      
      if (response.data.success) {
        setExistingApplication(response.data.application)
      }
    } catch (error) {
      // No application exists, which is fine
      console.log('No existing application found')
    } finally {
      setCheckingApplication(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post(
        `${backendUrl}/api/expert-applications/apply`,
        formData,
        { withCredentials: true }
      )

      if (response.data.success) {
        toast.success('Expert application submitted successfully!')
        checkExistingApplication() // Refresh application status
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Application submission error:', error)
      toast.error('Failed to submit application')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'rejected':
        return <XCircle className="h-6 w-6 text-red-500" />
      default:
        return <AlertCircle className="h-6 w-6 text-yellow-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'rejected':
        return 'text-red-700 bg-red-50 border-red-200'
      default:
        return 'text-yellow-700 bg-yellow-50 border-yellow-200'
    }
  }

  if (!isLoggedin) {
    return (
      <div className="min-h-screen pattern-bg bg-[#F5F0FF]">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Please log in to apply as an expert</h1>
            <a href="/login" className="btn-primary">Login</a>
          </div>
        </div>
      </div>
    )
  }

  if (checkingApplication) {
    return (
      <div className="min-h-screen pattern-bg bg-[#F5F0FF]">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Checking application status...</p>
          </div>
        </div>
      </div>
    )
  }

  if (userData?.isExpert) {
    return (
      <div className="min-h-screen pattern-bg bg-[#F5F0FF]">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-20">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-card border border-card-border p-8 max-w-2xl mx-auto text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">You are already an expert!</h1>
            <p className="text-gray-600 mb-6">You have expert privileges and can access the expert chat feature.</p>
            <a href="/expert-chat" className="btn-primary">Go to Expert Chat</a>
          </div>
        </div>
      </div>
    )
  }

  if (existingApplication) {
    return (
      <div className="min-h-screen pattern-bg bg-[#F5F0FF]">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-20">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-card border border-card-border p-8 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              {getStatusIcon(existingApplication.status)}
              <h1 className="text-2xl font-bold text-gray-800 mt-4">Expert Application Status</h1>
            </div>

            <div className={`border rounded-lg p-4 mb-6 ${getStatusColor(existingApplication.status)}`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Status: {existingApplication.status.toUpperCase()}</span>
                <span className="text-sm">
                  Applied: {new Date(existingApplication.appliedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm mt-2">Specialization: {existingApplication.specialization}</p>
            </div>

            {existingApplication.adminNotes && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Admin Notes:</h3>
                <p className="text-gray-600">{existingApplication.adminNotes}</p>
              </div>
            )}

            {existingApplication.reviewedAt && (
              <p className="text-sm text-gray-500 text-center">
                Reviewed on: {new Date(existingApplication.reviewedAt).toLocaleDateString()}
              </p>
            )}

            {existingApplication.status === 'pending' && (
              <div className="text-center mt-6">
                <p className="text-gray-600">Your application is under review. We will contact you soon!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pattern-bg bg-[#F5F0FF]">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-card border border-card-border p-8 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Award className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Apply to Become an Expert</h1>
            <p className="text-gray-600">Join our team of mental health professionals and help support our community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-2" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Your phone number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization *
                </label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="">Select your specialization</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-2" />
                  Years of Experience *
                </label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="input-field"
                  placeholder="Number of years"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-2" />
                Professional Qualifications *
              </label>
              <textarea
                name="qualifications"
                value={formData.qualifications}
                onChange={handleInputChange}
                required
                rows="3"
                className="input-field"
                placeholder="List your degrees, certifications, and professional qualifications"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Number *
              </label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                required
                className="input-field"
                placeholder="Your professional license number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Experience *
              </label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                required
                rows="4"
                className="input-field"
                placeholder="Describe your professional experience in mental health"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-2" />
                Availability *
              </label>
              <select
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                required
                className="input-field"
              >
                <option value="">Select your availability</option>
                {availabilityOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="inline h-4 w-4 mr-2" />
                Motivation *
              </label>
              <textarea
                name="motivation"
                value={formData.motivation}
                onChange={handleInputChange}
                required
                rows="4"
                maxLength="1000"
                className="input-field"
                placeholder="Why do you want to become an expert on our platform? (Max 1000 characters)"
              />
              <div className="text-sm text-gray-500 mt-1">
                {formData.motivation.length}/1000 characters
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2 mx-auto"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-5 w-5" />
                )}
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your application will be reviewed by our administrative team</li>
              <li>• We will contact you within 3-5 business days</li>
              <li>• If approved, you'll receive expert privileges and access to expert features</li>
              <li>• You'll be able to provide professional support through our expert chat system</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpertApplication
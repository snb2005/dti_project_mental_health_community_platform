"use client"

import React, { useContext, useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { X, Menu, User, LogOut, MessageCircle, Users, FileText, Info, Phone, Home, AlertCircle, CheckCircle, Mail } from "lucide-react"
import { toast } from "react-toastify"
import axios from "axios"
import { AppContent } from "../context/AppContext"
import { assets } from "../assets/assets"

export default function Navbar({ stayOnPage = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { userData, backendUrl, setUserData, setIsLoggedin } = useContext(AppContent)
  const [showExitPopup, setShowExitPopup] = useState(false)
  const [escPressCount, setEscPressCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    // Show exit popup only on home page ("/") and only once per session
    if (location.pathname === "/" && !sessionStorage.getItem("exitPopupShown")) {
      setShowExitPopup(true)
      sessionStorage.setItem("exitPopupShown", "true")
    }
  }, [location.pathname])

  const logout = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/logout`, {}, { withCredentials: true })
      if (data.success) {
        setIsLoggedin(false)
        setUserData(null)
        setShowUserMenu(false)
        if (!stayOnPage) {
          navigate("/")
        }
        toast.success("Logged out successfully")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed")
    }
  }

  const exitSite = () => {
    window.location.href = "https://www.google.com" // Redirect immediately
  }

  // Handle "Esc" key press to exit
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setEscPressCount((prevCount) => prevCount + 1)

        // Show toast on first press
        if (escPressCount === 0) {
          toast.info("Press ESC again to exit", { autoClose: 2000 })
        }

        // Exit on second "Esc" press
        if (escPressCount >= 1) {
          exitSite()
        }

        // Reset count after 3 seconds if second press doesn't happen
        setTimeout(() => {
          setEscPressCount(0)
        }, 3000)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [escPressCount])

  const navItems = [
    { name: "Home", path: "/", icon: <Home size={18} /> },
    { name: "Blogs", path: "/blogs", icon: <FileText size={18} /> },
    { name: "About", path: "/about", icon: <Info size={18} /> },
    { name: "Resources", path: "/resources", icon: <FileText size={18} /> },
    { name: "Forum", path: "/forum", icon: <Users size={18} /> },
    { name: "Contact", path: "/contact", icon: <Phone size={18} /> },
    {
      name: "Chatbot",
      path: "/chatbot",
      icon: <MessageCircle size={18} />,
      requiresAuth: true,
      authMessage: "Please login to use the chatbot",
    },
    {
      name: "Expert Chat",
      path: "/expert-chat",
      icon: <Users size={18} />,
      requiresAuth: true,
      authMessage: "Please login to access expert chat",
    },
  ]

  const handleNavigation = (item) => {
    if (item.requiresAuth && !userData) {
      toast.info(item.authMessage)
      navigate("/login")
    } else {
      navigate(item.path)
    }
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3 bg-white/95 backdrop-blur-md fixed top-0 z-50 shadow-sm">
        <div className="flex items-center">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault()
              navigate("/")
            }}
            className="mr-6 flex items-center"
          >
            <img
              src={assets.logo || "/placeholder.svg"}
              className="w-12 h-12 object-contain transition-transform hover:scale-105"
              alt="Logo"
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <React.Fragment key={item.name}>
                {(item.name !== "Admin Dashboard" || (userData && userData.role === 'admin')) && (
                  <button
                    onClick={() => handleNavigation(item)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1
                      ${
                        location.pathname === item.path
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </button>
                )}
              </React.Fragment>
            ))}

            {userData && userData.role === 'admin' && (
              <button
                onClick={() => navigate("/admin")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${
                    location.pathname === "/admin"
                      ? "bg-purple-100 text-purple-900"
                      : "text-gray-700 hover:bg-purple-50 hover:text-purple-900"
                  }`}
              >
                Admin Dashboard
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* User Profile / Login Button */}
          {userData ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-9 h-9 flex justify-center items-center rounded-full text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md relative"
                aria-label="User menu"
              >
                {userData.name[0].toUpperCase()}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{userData.name}</p>
                    <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                    {/* Verification Status */}
                    <div className="mt-1 flex items-center">
                      {userData.isAccountVerified ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle size={12} className="mr-1" />
                          <span className="text-xs">Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-yellow-600">
                          <AlertCircle size={12} className="mr-1" />
                          <span className="text-xs">Not verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Verify Email Button (if not verified) */}
                  {!userData.isAccountVerified && (
                    <button
                      onClick={() => {
                        navigate('/emailVerify')
                        setShowUserMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 flex items-center border-b border-gray-100"
                    >
                      <Mail size={16} className="mr-2" />
                      Verify Email
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      navigate('/profile')
                      setShowUserMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <User size={16} className="mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center space-x-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-md"
            >
              <User size={16} />
              <span>Login</span>
            </button>
          )}

          {/* Exit Button */}
          <button
            onClick={exitSite}
            className="w-9 h-9 flex justify-center items-center rounded-full bg-red-500 hover:bg-red-600 transition-all shadow-md"
            aria-label="Exit site"
            title="Exit site immediately"
          >
            <X size={18} className="text-white" />
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            aria-label="Main menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-25 backdrop-blur-sm">
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div className="flex items-center">
                <img src={assets.logo || "/placeholder.svg"} className="w-8 h-8 mr-2" alt="Logo" />
                <span className="font-medium">Menu</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              {navItems.map((item) => (
                <React.Fragment key={item.name}>
                  {(item.name !== "Admin Dashboard" || (userData && userData.role === 'admin')) && (
                    <button
                      onClick={() => handleNavigation(item)}
                      className={`w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-100
                        ${location.pathname === item.path ? "bg-gray-100 font-medium" : ""}`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </button>
                  )}
                </React.Fragment>
              ))}

              {userData && userData.role === 'admin' && (
                <button
                  onClick={() => {
                    navigate("/admin")
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-purple-50
                    ${location.pathname === "/admin" ? "bg-purple-50 font-medium text-purple-700" : ""}`}
                >
                  <span className="mr-3">👑</span>
                  Admin Dashboard
                </button>
              )}
            </div>

            {userData ? (
              <div className="border-t border-gray-200 px-4 py-3">
                <div className="flex items-center">
                  <div className="w-9 h-9 flex justify-center items-center rounded-full text-white bg-gradient-to-r from-purple-600 to-indigo-600 mr-3">
                    {userData.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{userData.name}</p>
                    <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <button
                    onClick={() => {
                      navigate('/profile')
                      setMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <User size={16} className="mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200 p-4">
                <button
                  onClick={() => {
                    navigate("/login")
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-md text-sm font-medium text-white"
                >
                  <User size={16} className="mr-2" />
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Improved Exit Popup */}
      {showExitPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transform transition-all">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center">
                <X size={20} className="mr-2" />
                Quick Exit Available
              </h2>
              <button
                onClick={() => setShowExitPopup(false)}
                className="bg-white/20 hover:bg-white/30 rounded-full p-1 transition-colors"
                aria-label="Close popup"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6 bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                <p className="text-sm text-gray-700 leading-relaxed">
                  For your safety, this site offers quick exit options. If you need to leave this page immediately:
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="bg-red-500 text-white rounded-full p-1 mr-2 mt-0.5">
                      <X size={12} />
                    </span>
                    <span>
                      Click the <strong>red X button</strong> in the top right corner of the navigation bar
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-gray-500 text-white rounded-full p-1 mr-2 mt-0.5">
                      <span className="text-xs font-bold">ESC</span>
                    </span>
                    <span>
                      Press the <strong>ESC key twice</strong> to exit immediately
                    </span>
                  </li>
                </ul>
              </div>

              <div className="text-sm text-gray-500 mb-6">
                <h3 className="font-medium text-gray-700 mb-1">Browsing Safety Tips:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Regularly clear your browser history and cookies</li>
                  <li>Use private/incognito browsing mode when possible</li>
                  <li>Consider using a VPN for additional privacy</li>
                </ul>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={exitSite}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center"
                >
                  <X size={16} className="mr-1" />
                  Exit Now
                </button>
                <button
                  onClick={() => setShowExitPopup(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


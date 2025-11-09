"use client"

import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { ArrowRight, MessageCircle, BookOpen, Heart, Users, Shield, Brain, ChevronRight } from "lucide-react"
import img1 from "../assets/img1.png"
import { useContext, useState, useEffect } from "react"
import { AppContent } from "../context/AppContext"
import BlogCard from "../components/blog/BlogCard"
import axios from "axios"

export default function Home() {
  const navigate = useNavigate()
  const { userData, isLoggedin, backendUrl } = useContext(AppContent)
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/blogs?page=1&limit=3`, {
          withCredentials: true,
        })
        if (data.success) {
          setBlogs(data.blogs)
        }
      } catch (error) {
        console.error("Error fetching blogs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [backendUrl])

  const handleNavigation = (path) => {
    console.log("Navigating to:", path)
    navigate(path)
  }

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <div className="flex flex-col min-h-screen pattern-bg">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary-lighter/30 via-transparent to-transparent opacity-70 z-0"></div>
        <div className="absolute inset-0 bg-dot-pattern opacity-10 z-0"></div>
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex flex-col space-y-6">
              <div className="flex flex-col space-y-3 mb-5">
                <div className="inline-flex items-center px-5 py-2 rounded-full bg-primary-lighter/20 text-primary text-lg font-semibold">
                  <span className="animate-pulse mr-3 text-xl">●</span> Mental Health Support Platform
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-soft border border-card-border">
                    <Brain className="h-5 w-5 text-primary" />
                    <span className="font-medium text-sm">24/7 Support</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-soft border border-card-border">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="font-medium text-sm">100% Confidential</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary-lighter/30 to-primary-lighter/10 rounded-xl border border-primary-lighter/30 shadow-soft">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary">Mental Health Awareness Month</p>
                    <p className="text-sm text-gray-600">Join our special events and workshops this month</p>
                  </div>
                </div>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Your Journey to{" "}
                <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-light">
                  Mental Wellbeing
                </span>{" "}
                Starts Here
              </h1>
              <p className="text-lg text-gray-600 max-w-lg">
                Join our supportive community where you can connect, share, and grow with others on similar journeys.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavigation("/forum")}
                  className="btn-primary"
                >
                  Join Our Community
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavigation("/chatbot")}
                  className="btn-secondary"
                >
                  Talk to an Expert
                </motion.button>
              </div>

              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white bg-primary-lighter/20 flex items-center justify-center text-primary font-bold"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span>Join 10,000+ people already using our platform</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden md:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary-light/20 to-primary/20 rounded-2xl blur-xl"></div>
                <img
                  src={img1 || "/placeholder.svg"}
                  alt="Mental wellbeing illustration"
                  className="relative rounded-2xl shadow-card object-cover h-full w-full z-10"
                />
                <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-card p-4 z-20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-lighter/20 rounded-full flex items-center justify-center text-primary">
                      <Heart className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Mental Health</p>
                      <p className="text-xs text-gray-500">Support & Resources</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Curved divider */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 bg-white z-10"
          style={{ borderTopLeftRadius: "50% 100%", borderTopRightRadius: "50% 100%" }}
        ></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white relative z-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-lighter/20 text-primary text-sm font-medium mb-4">
              <span>Our Services</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">How We Support You</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform offers multiple ways to connect, learn, and grow on your mental health journey.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Community Forum"
              description="Connect with others, share experiences, and find support in our moderated community spaces."
              onClick={() => handleNavigation("/forum")}
            />
            <FeatureCard
              icon={<MessageCircle className="h-8 w-8" />}
              title="1-on-1 Expert Chat"
              description="Schedule private sessions with licensed mental health professionals for personalized support."
              onClick={() => handleNavigation("/chatbot")}
              featured={true}
            />
            <FeatureCard
              icon={<Brain className="h-8 w-8" />}
              title="AI Chatbot"
              description="Get immediate responses to your questions and concerns from our supportive AI assistant."
              onClick={() => handleNavigation("/chatbot")}
            />
            <FeatureCard
              icon={<BookOpen className="h-8 w-8" />}
              title="Resources Library"
              description="Access a curated collection of articles, videos, and tools to support your mental wellbeing."
              onClick={() => handleNavigation("/resources")}
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Educational Blog"
              description="Stay informed with the latest research, tips, and stories from mental health experts."
              onClick={() => handleNavigation("/blogs")}
            />
            <FeatureCard
              icon={<Heart className="h-8 w-8" />}
              title="Self-Care Tools"
              description="Discover practical exercises and techniques to incorporate into your daily routine."
              onClick={() => handleNavigation("/resources")}
            />
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-white to-light-pink relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-lighter/20 text-primary text-sm font-medium mb-4">
              <span>Success Stories</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">Community Stories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Read inspiring stories and insights shared by our community members.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {loading ? (
              // Loading skeleton
              [...Array(3)].map((_, index) => (
                <div key={index} className="animate-pulse bg-white rounded-2xl shadow-soft border border-card-border p-6">
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))
            ) : blogs.length > 0 ? (
              blogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">No stories available at the moment.</p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mt-12"
          >
            <button
              onClick={() => handleNavigation("/blogs")}
              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
            >
              View All Stories <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Begin Your Journey Today</h2>
            <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
              Join thousands of others who are taking positive steps toward better mental wellbeing.
            </p>
            {!isLoggedin && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavigation("/login")}
                className="bg-white text-primary hover:bg-gray-100 font-medium rounded-xl px-8 py-4 transition-colors shadow-xl flex items-center gap-2 mx-auto"
              >
                <span>Create Your Free Account</span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                <div className="font-bold text-2xl">10,000+</div>
                <div className="text-sm text-white/80">Active Users</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                <div className="font-bold text-2xl">24/7</div>
                <div className="text-sm text-white/80">Support</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                <div className="font-bold text-2xl">100%</div>
                <div className="text-sm text-white/80">Confidential</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-bg text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Mental Wellbeing</h3>
              <p className="mb-4 text-white/80">
                Supporting your journey to better mental health through community and resources.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handleNavigation("/forum")
                    }}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Community
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handleNavigation("/chatbot")
                    }}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Expert Chat
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handleNavigation("/resources")
                    }}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Resources
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handleNavigation("/blogs")
                    }}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handleNavigation("/about")
                    }}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handleNavigation("/about")
                    }}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Our Team
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handleNavigation("/contact")
                    }}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="https://x.com/manobala2k25" className="text-white/80 hover:text-white transition-colors">
                  <div className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                    <span className="sr-only">Twitter</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </div>
                </a>
                <a href="https://www.instagram.com/manobala2k25/" className="text-white/80 hover:text-white transition-colors">
                  <div className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                    <span className="sr-only">Instagram</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </a>
                <a href="https://www.facebook.com/profile.php?id=61574460428139" className="text-white/80 hover:text-white transition-colors">
                  <div className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                    <span className="sr-only">Facebook</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </a>
                <a href="http://www.linkedin.com/in/mano-bala-2k25" className="text-white/80 hover:text-white transition-colors">
                  <div className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                    <span className="sr-only">LinkedIn</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </div>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p className="text-white/70">
              &copy; {new Date().getFullYear()} Mental Wellbeing Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Component for feature cards
function FeatureCard({ icon, title, description, onClick, featured = false }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className={`${featured ? "bg-gradient-to-br from-primary-lighter/20 to-primary-lighter/5" : "bg-white"} p-6 rounded-2xl shadow-soft border border-card-border h-full transition-all hover:shadow-card hover:-translate-y-1 cursor-pointer relative overflow-hidden`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
    >
      {featured && (
        <div className="absolute top-0 right-0">
          <div className="bg-gradient-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">Popular</div>
        </div>
      )}
      <div className="p-3 bg-primary-lighter/20 rounded-full w-fit mb-4 text-primary">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-primary">{title}</h3>
      <p className="text-gray-600">{description}</p>
      <div className="mt-4 flex items-center text-primary font-medium">
        <span>Learn more</span>
        <ChevronRight className="h-4 w-4 ml-1" />
      </div>
    </motion.div>
  )
}

// Component for testimonial cards
function TestimonialCard({ quote, author, role, rating, featured = false }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className={`${featured ? "bg-gradient-to-br from-primary-lighter/20 to-primary-lighter/5" : "bg-white"} p-6 rounded-2xl shadow-soft border border-card-border h-full hover:shadow-card transition-all relative`}
      whileHover={{ y: -5 }}
    >
      {featured && (
        <div className="absolute top-0 right-0">
          <div className="bg-gradient-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">Featured</div>
        </div>
      )}
      <div className="mb-4 text-primary-light text-4xl">❝</div>
      <p className="text-gray-700 mb-6 italic">{quote}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary-lighter/30 flex items-center justify-center text-primary font-bold">
            {author.charAt(0)}
          </div>
          <div className="ml-3">
            <p className="text-gray-800 font-medium">{author}</p>
            <p className="text-xs text-gray-500">{role}</p>
          </div>
        </div>
        <div className="flex">
          {[...Array(rating)].map((_, i) => (
            <svg key={i} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          ))}
        </div>
      </div>
    </motion.div>
  )
}


"use client"

import { useState, useEffect, useContext, useRef } from "react"
import axios from "axios"
import { AppContent } from "../context/AppContext"
import Navbar from "../components/Navbar"
import { Loader2, Send, Bot, User, Plus, Trash2 } from "lucide-react"
import Message from "./Message";
import MessageInput from "./MessageInput";


const ChatBot = () => {
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [loading, setLoading] = useState(false)
  const { isLoggedin } = useContext(AppContent)
  const messagesEndRef = useRef(null)
  const [inputValue, setInputValue] = useState("")
  const { userData, backendUrl, isLoading: authLoading } = useContext(AppContent)

  useEffect(() => {
    if (isLoggedin) {
      fetchConversations()
    }
  }, [isLoggedin])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/conversations`, {
        withCredentials: true,
      })
      if (response.data.success) {
        setConversations(response.data.conversations)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    }
  }

  const createNewChat = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/conversations`,
        {
          title: "New Chat",
        },
        { withCredentials: true },
      )

      if (response.data.success) {
        setConversations([response.data.conversation, ...conversations])
        setActiveConversation(response.data.conversation._id)
        setMessages([])
      }
    } catch (error) {
      console.error("Error creating new chat:", error)
    }
  }

  const deleteConversation = async (conversationId) => {
    try {
      await axios.delete(`${backendUrl}/api/conversations/${conversationId}`, {
        withCredentials: true,
      })
      setConversations(conversations.filter((conv) => conv._id !== conversationId))
      if (activeConversation === conversationId) {
        setActiveConversation(null)
        setMessages([])
      }
    } catch (error) {
      console.error("Error deleting conversation:", error)
    }
  }

  const loadConversation = async (conversationId) => {
    try {
      const response = await axios.get(`${backendUrl}/api/conversations/${conversationId}/messages`, {
        withCredentials: true,
      })
      if (response.data.success) {
        setMessages(response.data.messages)
        setActiveConversation(conversationId)
      }
    } catch (error) {
      console.error("Error loading conversation:", error)
    }
  }

  const updateConversationTitle = async (conversationId, firstMessage) => {
    try {
      // Generate a title based on the first message (max 50 characters)
      const title = firstMessage.length > 50 ? firstMessage.substring(0, 47) + "..." : firstMessage

      const response = await axios.put(
        `${backendUrl}/api/conversations/${conversationId}/title`,
        { title },
        { withCredentials: true },
      )

      if (response.data.success) {
        setConversations((prevConversations) =>
          prevConversations.map((conv) => (conv._id === conversationId ? { ...conv, title } : conv)),
        )
      }
    } catch (error) {
      console.error("Error updating conversation title:", error)
    }
  }

  const sendMessage = async (text) => {
    if (!isLoggedin || !activeConversation) return

    const isFirstMessage = messages.length === 0
    const newMessage = { sender: "user", text, timestamp: new Date() }
    setMessages([...messages, newMessage])
    setLoading(true)
    setInputValue("")

    try {
      // Save user message
      await axios.post(
        `${backendUrl}/api/conversations/${activeConversation}/messages`,
        {
          text,
          sender: "user",
        },
        { withCredentials: true },
      )

      // Update conversation title if this is the first message
      if (isFirstMessage) {
        await updateConversationTitle(activeConversation, text)
      }

      // Get AI response
      const response = await axios.post(
        {
          contents: [{
            parts: [{
              text: text
            }]
          }]
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: false
        }
      )

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const botResponse = response.data.candidates[0].content.parts[0].text;
        const botMessage = {
          sender: "bot",
          text: botResponse,
          timestamp: new Date(),
        }

        // Save bot message
        await axios.post(
          `${backendUrl}/api/conversations/${activeConversation}/messages`,
          {
            text: botMessage.text,
            sender: "bot",
          },
          { withCredentials: true },
        )

        setMessages((prev) => [...prev, botMessage])
      }
    } catch (error) {
      console.error("API Error:", error)
      console.error("Error response:", error.response?.data)
      console.error("Error status:", error.response?.status)
      
      // Show error message to user
      const errorMessage = {
        sender: "bot",
        text: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pattern-bg bg-[#F5F0FF] ">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="flex h-[calc(100vh-8rem)] bg-white/90 backdrop-blur-sm rounded-2xl shadow-card overflow-hidden border border-card-border">
          {/* Sidebar */}
          <div className="w-72 flex-shrink-0 bg-gradient-to-b from-primary to-primary-dark rounded-l-2xl overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-white/20">
                <button
                  onClick={createNewChat}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white rounded-2xl py-3 px-4 transition-all duration-300 shadow-md"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">New Conversation</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {conversations.length > 0 ? (
                  <div className="space-y-2">
                    {conversations.map((conv) => (
                      <div
                        key={conv._id}
                        className={`group p-3 rounded-xl cursor-pointer transition-all duration-200 flex justify-between items-center ${activeConversation === conv._id ? "bg-white/30 text-white" : "text-white/80 hover:bg-white/10"
                          }`}
                        onClick={() => loadConversation(conv._id)}
                      >
                        <div className="flex items-center flex-nowrap min-w-0">
                          <Bot className="h-5 w-5 mr-3 flex-shrink-0" />
                          <span className="truncate flex-1">{conv.title}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteConversation(conv._id)
                          }}
                          className="opacity-0 group-hover:opacity-100 text-white/70 hover:text-white transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-white/70">
                    <Bot className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-center">No conversations yet</p>
                    <p className="text-center text-sm mt-2">Start a new chat to begin</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-primary-light/30">
                <div className="text-white/80 text-sm text-center">
                  <p>Powered by Gemini AI</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex flex-col flex-grow">
            <div className="flex-grow overflow-auto p-6 pb-0 space-y-4">
              {messages.length === 0 && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 animate-fadeIn">
                  <div className="w-20 h-20 bg-primary-lighter/20 rounded-full flex items-center justify-center mb-6">
                    <Bot className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2 text-primary">Start a conversation</h3>
                  <p className="text-center max-w-md text-sm">
                    Ask any question about mental health, coping strategies, or resources. I'm here to help.
                  </p>
                </div>
              )}

              {messages.map((msg, index) => (
                <Message key={index} sender={msg.sender} text={msg.text} />
              ))}

              {loading && (
                <div className="flex items-center space-x-2 text-gray-400 p-4 bg-gray-50 rounded-2xl animate-pulse">
                  <div className="flex space-x-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-75"></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-150"></div>
                  </div>
                  <span>Thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (inputValue.trim()) {
                    sendMessage(inputValue.trim())
                  }
                }}
                className="flex gap-2"
              >
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    !activeConversation ? "Select or create a conversation to start" : "Type your message..."
                  }
                  disabled={loading || !activeConversation}
                  className="input-field flex-1"
                />
                <button
                  type="submit"
                  disabled={loading || !activeConversation || !inputValue.trim()}
                  className="btn-primary !py-2 !px-4 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatBot


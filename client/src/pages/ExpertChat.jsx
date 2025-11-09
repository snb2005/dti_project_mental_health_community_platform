"use client"

import { useState, useEffect, useContext, useRef, useMemo } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { AppContent } from "../context/AppContext"
import Navbar from "../components/Navbar"
import { io } from "socket.io-client"
import { Loader2, MessageSquare, User, Clock, Send, UserCheck, Users } from 'lucide-react'

function ExpertChat() {
  const { backendUrl, userData } = useContext(AppContent)
  const [experts, setExperts] = useState([])
  const [chats, setChats] = useState([])
  const [currentChat, setCurrentChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [loadingChats, setLoadingChats] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const socket = useRef()
  const messagesEndRef = useRef(null)
  const messageInputRef = useRef(null)

  // Check if user is expert based on their isExpert field
  const isExpert = useMemo(() => {
    return userData?.isExpert === true
  }, [userData])

  useEffect(() => {
    // Initialize socket connection with proper configuration
    socket.current = io(backendUrl, {
      path: "/socket.io/",
      transports: ["polling", "websocket"],
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      autoConnect: true,
      forceNew: true,
    })

    // Socket connection handlers
    socket.current.on("connect", () => {
      console.log("Connected to socket server:", socket.current.id)

      // Only fetch experts if user is not an expert
      if (!isExpert) {
        fetchExperts()
      }
      fetchChats()
    })

    socket.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message)
      toast.error(`Connection error: ${error.message}. Retrying...`)
    })

    socket.current.on("disconnect", (reason) => {
      console.log("Disconnected:", reason)
      if (reason === "io server disconnect") {
        // Reconnect if server disconnected
        socket.current.connect()
      }
    })

    return () => {
      if (socket.current) {
        socket.current.removeAllListeners()
        socket.current.disconnect()
      }
    }
  }, [backendUrl, isExpert])

  useEffect(() => {
    if (!socket.current?.connected) {
      console.log("Socket not connected, attempting to connect...")
      socket.current?.connect()
      return
    }

    // Listen for new messages
    socket.current.on("expertChatMessage", (data) => {
      console.log("Received message:", data)
      if (currentChat?._id === data.chatId) {
        setMessages((prev) => {
          // Generate a unique ID for the new message
          const messageId =
            data.message._id || `${Date.now()}-${data.message.sender._id}-${Math.random().toString(36).substr(2, 9)}`

          // Check if message already exists
          const messageExists = prev.some(
            (msg) =>
              msg._id === messageId ||
              (msg.timestamp === data.message.timestamp &&
                msg.sender._id === data.message.sender._id &&
                msg.content === data.message.content),
          )

          if (messageExists) return prev

          const newMessage = {
            _id: messageId,
            content: data.message.content,
            sender: {
              _id: data.message.sender._id,
              name: data.message.sender.name,
              email: data.message.sender.email,
            },
            timestamp: data.message.timestamp || new Date().toISOString(),
          }

          return [...prev, newMessage]
        })

        // Update the chat's last message in the sidebar without refetching
        setChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat._id === data.chatId) {
              return {
                ...chat,
                lastMessage: new Date().toISOString(),
                lastMessageContent: data.message.content
              }
            }
            return chat
          })
        })

        // Scroll to bottom
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      } else {
        // If message is for a different chat, just update that chat's last message
        setChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat._id === data.chatId) {
              return {
                ...chat,
                lastMessage: new Date().toISOString(),
                lastMessageContent: data.message.content
              }
            }
            return chat
          })
        })
      }
    })

    // Listen for typing indicators
    socket.current.on("userTyping", (data) => {
      if (currentChat?._id === data.chatId && data.userId !== userData?._id) {
        setIsTyping(true)

        // Clear typing indicator after 3 seconds
        setTimeout(() => {
          setIsTyping(false)
        }, 3000)
      }
    })

    // Listen for room join confirmation
    socket.current.on("joinedRoom", (data) => {
      console.log("Successfully joined room:", data.room)
    })

    return () => {
      if (socket.current) {
        socket.current.off("expertChatMessage")
        socket.current.off("userTyping")
        socket.current.off("joinedRoom")
      }
    }
  }, [currentChat, socket.current?.connected, userData?._id])

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchExperts = async () => {
    // Only fetch experts if user is not an expert
    if (isExpert) return

    try {
      const { data } = await axios.get(`${backendUrl}/api/expert-chat/experts`, {
        withCredentials: true,
      })
      if (data.success) {
        const filteredExperts = data.experts.filter((expert) => expert._id !== userData?._id)
        setExperts(filteredExperts)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching experts")
    }
  }

  const fetchChats = async () => {
    try {
      setLoadingChats(true)
      const { data } = await axios.get(`${backendUrl}/api/expert-chat/chats`, {
        withCredentials: true,
      })

      if (data.success) {
        // Sort chats by last message timestamp
        const sortedChats = data.chats.sort((a, b) => {
          const timeA = new Date(a.lastMessage || a.createdAt).getTime()
          const timeB = new Date(b.lastMessage || b.createdAt).getTime()
          return timeB - timeA
        })

        setChats(sortedChats)
      }
    } catch (error) {
      console.error("Error fetching chats:", error)
      toast.error(error.response?.data?.message || "Error fetching chats")
    } finally {
      setLoadingChats(false)
    }
  }

  const startChat = async (expertId) => {
    try {
      // Prevent chatting with self
      if (expertId === userData?._id) {
        toast.error("You cannot start a chat with yourself")
        return
      }

      // Check if chat already exists
      const existingChat = chats.find((chat) => chat.expert._id === expertId)
      if (existingChat) {
        loadMessages(existingChat)
        return
      }

      const { data } = await axios.post(
        `${backendUrl}/api/expert-chat/chats`,
        {
          expertId,
        },
        {
          withCredentials: true,
        },
      )
      if (data.success) {
        setChats((prev) => [data.chat, ...prev])
        loadMessages(data.chat)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error starting chat")
    }
  }

  const loadMessages = async (chat) => {
    try {
      setLoadingMessages(true)

      if (currentChat?._id) {
        socket.current.emit("leaveExpertChat", currentChat._id)
      }

      setCurrentChat(chat)
      socket.current.emit("joinExpertChat", chat._id)

      const { data } = await axios.get(`${backendUrl}/api/expert-chat/chats/${chat._id}/messages`, {
        withCredentials: true,
      })

      if (data.success) {
        setMessages(data.messages)
        // Focus on message input
        setTimeout(() => {
          messageInputRef.current?.focus()
        }, 100)
      }
    } catch (error) {
      console.error("Error loading messages:", error)
      toast.error(error.response?.data?.message || "Error loading messages")
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleTyping = () => {
    if (currentChat?._id) {
      socket.current.emit("typing", {
        chatId: currentChat._id,
        userId: userData?._id,
      })
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentChat) return

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/expert-chat/chats/${currentChat._id}/messages`,
        {
          content: newMessage.trim(),
        },
        {
          withCredentials: true,
        },
      )

      if (data.success) {
        // Don't update messages here, let the socket handle it
        setNewMessage("")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending message")
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="min-h-screen pattern-bg bg-[#F5F0FF]">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="grid  grid-cols-1 md:grid-cols-4 gap-4">
          {/* Experts/Chats List */}
          <div className="md:col-span-1 bg-gradient-to-b from-primary to-primary-dark backdrop-blur-sm rounded-2xl shadow-card p-4 border border-card-border h-[600px] overflow-hidden flex flex-col">
            {isExpert ? (
              // Expert View - Only Active Chats with User Names
              <div className="h-full flex flex-col">
                <h2 className="text-xl font-bold mb-4 text-primary flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Active Chats
                </h2>

                {loadingChats ? (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2 overflow-y-auto flex-1">
                    {chats.length > 0 ? (
                      chats.map((chat) => (
                        <div
                          key={`chat-${chat._id}`}
                          className={`p-3 rounded-xl cursor-pointer transition-all ${currentChat?._id === chat._id
                              ? "bg-primary-lighter/20 border border-primary-lighter shadow-md"
                              : "bg-gray-50 hover:bg-gray-100"
                            }`}
                          onClick={() => loadMessages(chat)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start">
                              <div className="h-10 w-10 rounded-full bg-primary-lighter/30 flex items-center justify-center text-primary font-bold mr-3">
                                {chat.user?.name?.charAt(0) || "?"}
                              </div>
                              <div>
                                <p className="font-medium text-primary">{chat.user?.name}</p>
                                <div className="flex items-center mt-1">
                                  <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full">
                                    User
                                  </span>
                                </div>
                              </div>
                            </div>
                            {chat.lastMessage && (
                              <p className="text-xs text-gray-400">{formatTime(chat.lastMessage)}</p>
                            )}
                          </div>
                          {chat.lastMessageContent && (
                            <p className="text-sm text-gray-600 mt-2 truncate pl-12">{chat.lastMessageContent}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 text-center py-8 flex flex-col items-center">
                        <MessageSquare className="h-8 w-8 text-gray-300 mb-2" />
                        <p>No active chats</p>
                        <p className="text-xs text-gray-400 mt-1">Users will appear here when they start a chat</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Regular User View - Available Experts and Active Chats
              <div className="h-full flex flex-col overflow-hidden">
                {/* Wrapper for both sections with single scrollbar */}
                <div className="overflow-y-auto flex-1 custom-scrollbar pr-2">
                  {/* Available Experts Section */}
                  <div className="mb-4">
                    <h2 className="text-xl font-bold mb-4 flex items-center text-white bg-gradient-to-r from-purple-500 to-purple-700 px-4 py-2 rounded-lg shadow-md sticky top-0 z-10">
                      <UserCheck className="h-5 w-5 mr-2" />
                      Available Experts
                    </h2>

                    {loadingChats ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {experts.length > 0 ? (
                          experts.map((expert) => (
                            <div
                              key={`expert-${expert._id}`}
                              className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl cursor-pointer transition-all hover:shadow-md"
                              onClick={() => startChat(expert._id)}
                            >
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-primary-lighter/30 flex items-center justify-center text-primary font-bold mr-3">
                                  {expert.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium text-primary">{expert.name}</p>
                                  <div className="flex items-center mt-1">
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full flex items-center">
                                      <UserCheck className="h-3 w-3 mr-1" /> Expert
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 text-center py-4 bg-gray-50 rounded-xl">
                            <p>No experts available at the moment</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Active Chats Section */}
                  <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center text-white bg-gradient-to-r from-purple-500 to-purple-700 px-4 py-2 rounded-lg shadow-md sticky top-0 z-10">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Your Chats
                    </h2>

                    {loadingChats ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {chats.length > 0 ? (
                          chats.map((chat) => (
                            <div
                              key={`chat-${chat._id}`}
                              className={`p-3 rounded-xl cursor-pointer transition-all ${currentChat?._id === chat._id
                                  ? "bg-primary-lighter/20 border border-primary-lighter shadow-md"
                                  : "bg-gray-50 hover:bg-gray-100"
                                }`}
                              onClick={() => loadMessages(chat)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex items-start">
                                  <div className="h-10 w-10 rounded-full bg-primary-lighter/30 flex items-center justify-center text-primary font-bold mr-3">
                                    {chat.expert.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-primary">{chat.expert.name}</p>
                                    <div className="flex items-center mt-1">
                                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full flex items-center">
                                        <UserCheck className="h-3 w-3 mr-1" /> Expert
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {chat.lastMessage && (
                                  <p className="text-xs text-gray-400">{formatTime(chat.lastMessage)}</p>
                                )}
                              </div>
                              {chat.lastMessageContent && (
                                <p className="text-sm text-gray-600 mt-2 truncate pl-12">{chat.lastMessageContent}</p>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 text-center py-8 flex flex-col items-center">
                            <MessageSquare className="h-8 w-8 text-gray-300 mb-2" />
                            <p>No active chats</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Start a conversation with an expert from the list above
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Messages */}
          <div className="md:col-span-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-card border border-card-border">
            {currentChat ? (
              <div className="h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-lighter/30 flex items-center justify-center text-primary font-bold mr-3">
                        {userData?.isExpert
                          ? currentChat.user?.name?.charAt(0) || "?"
                          : currentChat.expert?.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <h3 className="font-bold text-primary">
                          {userData?.isExpert ? currentChat.user?.name : currentChat.expert?.name}
                        </h3>
                        <span className="text-xs text-gray-500 flex items-center">
                          {userData?.isExpert ? (
                            <User className="h-3 w-3 mr-1" />
                          ) : (
                            <UserCheck className="h-3 w-3 mr-1" />
                          )}
                          {userData?.isExpert ? "User" : "Expert"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {loadingMessages ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((message, index) => {
                        // Check if we need to show a date separator
                        const showDateSeparator =
                          index === 0 || formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp)

                        return (
                          <div key={`message-${message._id}`}>
                            {showDateSeparator && (
                              <div className="flex justify-center my-4">
                                <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                                  {formatDate(message.timestamp)}
                                </span>
                              </div>
                            )}
                            <div
                              className={`mb-4 flex ${message.sender.email === userData?.email ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-xl p-3 ${message.sender.email === userData?.email
                                    ? "bg-gradient-to-r from-primary to-primary-light text-white"
                                    : "bg-gray-100"
                                  }`}
                              >
                                <p>{message.content}</p>
                                <p className="text-xs mt-1 opacity-70 text-right">{formatTime(message.timestamp)}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-xl p-3 flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-75"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-150"></div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                      <div className="w-16 h-16 bg-primary-lighter/20 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-center">No messages yet. Start the conversation!</p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      ref={messageInputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleTyping}
                      placeholder="Type your message..."
                      className="input-field flex-1"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="btn-primary !py-2 !px-4 flex items-center"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="h-[600px] flex flex-col items-center justify-center text-gray-500 p-8">
                <div className="w-20 h-20 bg-primary-lighter/20 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2 text-primary">Welcome to Expert Chat</h3>
                <p className="text-center max-w-md mb-6">
                  {isExpert
                    ? "Users seeking expert advice will appear in your chat list. Select a conversation to start helping."
                    : "Connect with mental health professionals for personalized support and guidance. Select an expert to start a conversation."}
                </p>
                {!isExpert && experts.length > 0 && (
                  <button onClick={() => startChat(experts[0]._id)} className="btn-primary">
                    <UserCheck className="h-4 w-4" />
                    Chat with an Expert
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.8);
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
        }

        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.8);
        }
      `}</style>
    </div>
  )
}

export default ExpertChat

import React, { useState, useEffect, useRef, useContext } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { format } from "date-fns"
import { AppContent } from "../../context/AppContext"
import { Check, FileText, LinkIcon } from "lucide-react"

function MessageThread({ room, socket, backendUrl }) {
  const { userData } = useContext(AppContent)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (room?._id) {
      fetchMessages()
    }

    if (socket) {
      socket.on("newMessage", (message) => {
        setMessages((prev) => [...prev, message])
        scrollToBottom()
      })
    }

    return () => {
      if (socket) {
        socket.off("newMessage")
      }
    }
  }, [room?._id, socket])

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/forum/rooms/${room._id}/messages`, { withCredentials: true })
      if (data.success) {
        setMessages(data.messages)
        scrollToBottom()
      }
    } catch (error) {
      toast.error("Error fetching messages")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/forum/rooms/${room._id}/messages`,
        { content: newMessage },
        { withCredentials: true }
      )
      
      if (data.success) {
        setNewMessage("")
        // The message will be added through socket event
      }
    } catch (error) {
      toast.error("Error sending message")
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const isCurrentUser = (authorId) => {
    return authorId === userData?._id;
  };  const renderMessageContent = (message) => {
    if (message.deleted) {
      return <div className="italic text-gray-400 text-sm">This message was deleted.</div>
    }

    if (message.file) {
      return (
        <div className="bg-[#1F1F1F] rounded p-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <div className="flex-1">
              <div className="font-medium">{message.file.name}</div>
              <div className="text-sm text-gray-400">
                {message.file.size} bytes, {message.file.type} File
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button className="bg-[#2A2A2A] text-center py-2 rounded hover:bg-[#333333] transition-colors">Open</button>
            <button className="bg-[#2A2A2A] text-center py-2 rounded hover:bg-[#333333] transition-colors">
              Save as...
            </button>
          </div>
        </div>
      )
    }

    if (message.link) {
      return (
        <div>
          <p className="mb-2">{message.content}</p>
          <div className="bg-[#1F1F1F] rounded p-3">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              <span className="text-emerald-400 font-medium">{message.link.domain}</span>
            </div>
            <p className="text-sm text-gray-300 mt-1 break-all">{message.link.url}</p>
          </div>
        </div>
      )
    }

    return message.content
  }

  const renderDate = (date) => {
    try {
      if (!date) return "Invalid date";
      
      const messageDate = new Date(date);
      
      // Check if the date is valid
      if (isNaN(messageDate.getTime())) {
        return "Invalid date";
      }
      
      const today = new Date();

      // If the message is from today, just show the time
      if (messageDate.toDateString() === today.toDateString()) {
        return format(messageDate, "HH:mm");
      }

      // Otherwise show the full date
      return format(messageDate, "dd-MM-yyyy");
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0F0F0F]">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-gray-100">{room.name}</h2>
        <p className="text-sm text-gray-400">{room.description}</p>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const showDate =
            index === 0 ||
            new Date(message.createdAt || message.timestamp).toDateString() !== 
            new Date(messages[index - 1].createdAt || messages[index - 1].timestamp).toDateString();

          return (
            <React.Fragment key={message._id || index}>
              {showDate && (
                <div className="flex justify-center my-4">
                  <div className="bg-[#1F1F1F] text-gray-400 text-sm px-3 py-1 rounded">
                    {renderDate(message.createdAt || message.timestamp)}
                  </div>
                </div>
              )}
              <div className={`mb-4 flex ${isCurrentUser(message.author?._id) ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 ${
                    isCurrentUser(message.author?._id) ? "bg-emerald-900/40 text-gray-100" : "bg-[#1F1F1F] text-gray-100"
                  }`}
                >
                  {!isCurrentUser(message.author?._id) && (
                    <div className="text-sm text-emerald-400 mb-1">
                      {message.isAnonymous ? "Anonymous" : (message.author?.name || "Unknown User")}
                    </div>
                  )}
                  {renderMessageContent(message)}
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs text-gray-400">
                      {(() => {
                        try {
                          const date = new Date(message.createdAt || message.timestamp);
                          return isNaN(date.getTime()) ? "Invalid time" : format(date, "HH:mm");
                        } catch (error) {
                          return "Invalid time";
                        }
                      })()}
                    </span>
                    {isCurrentUser(message.author?._id) && <Check className="w-3 h-3 text-emerald-400" />}
                  </div>
                </div>
              </div>
            </React.Fragment>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="w-full bg-[#1F1F1F] text-gray-100 border-none rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          placeholder="Type your message..."
        />
      </form>
    </div>
  )
}

export default MessageThread


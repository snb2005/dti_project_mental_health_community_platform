"use client"

import { useState } from "react"
import { Send } from "lucide-react"

const MessageInput = ({ sendMessage }) => {
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    setIsTyping(e.target.value.length > 0)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && inputValue.trim()) {
      e.preventDefault()
      sendMessage(inputValue.trim())
      setInputValue("")
      setIsTyping(false)
    }
  }

  const handleSendClick = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue.trim())
      setInputValue("")
      setIsTyping(false)
    }
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <div className="flex items-end space-x-2">
        <textarea
          className="flex-grow bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl p-3 resize-none border border-primary-lighter/30 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light min-h-[80px] shadow-soft transition-all"
          rows="3"
          placeholder="Type your message..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <button
          className={`p-3 rounded-xl transition-all duration-300 ${
            isTyping
              ? "bg-gradient-to-r from-primary to-primary-light text-white shadow-button hover:shadow-lg transform hover:scale-105"
              : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
          }`}
          onClick={handleSendClick}
          disabled={!isTyping}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">Press Shift + Enter for a new line</div>
    </div>
  )
}

export default MessageInput


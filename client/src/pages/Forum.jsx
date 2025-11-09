"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { AppContent } from "../context/AppContext"
import { toast } from "react-toastify"
import Navbar from "../components/Navbar"
import RoomList from "../components/forum/RoomList"
import MessageThread from "../components/forum/MessageThread"
import { Loader2, MessageSquare } from "lucide-react"
import io from "socket.io-client"

function Forum() {
  const navigate = useNavigate()
  const { backendUrl, isLoggedin, userData } = useContext(AppContent)
  const [rooms, setRooms] = useState([])
  const [activeRoom, setActiveRoom] = useState(null)
  const [socket, setSocket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`, {
          withCredentials: true,
        })

        if (!data.success) {
          navigate("/login")
          return
        }

        // Initialize Socket.IO connection
        setConnecting(true)
        const newSocket = io(backendUrl)

        newSocket.on("connect", () => {
          setConnecting(false)
          setSocket(newSocket)
          console.log("Socket connected successfully")
        })

        newSocket.on("connect_error", (error) => {
          console.error("Socket connection error:", error)
          setConnecting(false)
          toast.error("Error connecting to chat server. Please try again.")
        })

        // Fetch rooms
        fetchRooms()
        setLoading(false)

        return () => {
          if (newSocket) newSocket.close()
        }
      } catch (error) {
        navigate("/login")
      }
    }

    checkAuth()
  }, [backendUrl]) // Added backendUrl to dependencies

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/forum/rooms`, {
        withCredentials: true,
      })
      if (data.success) {
        // Ensure rooms is always an array
        const roomsData = Array.isArray(data.rooms) ? data.rooms : [];
        setRooms(roomsData);
        console.log('Fetched rooms:', roomsData);
      } else {
        console.error('Failed to fetch rooms:', data.message);
        toast.error(data.message || "Failed to fetch rooms");
        setRooms([]);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error("Error fetching rooms");
      setRooms([]);
    }
  }

  const handleRoomSelect = (room) => {
    if (activeRoom) {
      socket.emit("leaveRoom", activeRoom._id)
    }
    setActiveRoom(room)
    socket.emit("joinRoom", room._id)
  }

  if (loading) {
    return (
      <div className="min-h-screen pattern-bg flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
          <div className="text-lg text-primary font-medium">Loading forum...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pattern-bg bg-[#F5F0FF]">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="flex h-[calc(100vh-8rem)] bg-white/90 backdrop-blur-sm rounded-2xl shadow-card overflow-hidden border border-card-border">
          <div className="w-72 flex-shrink-0 bg-gradient-to-b from-primary to-primary-dark rounded-l-2xl overflow-hidden">
            <RoomList rooms={rooms} activeRoom={activeRoom} onRoomSelect={handleRoomSelect} />
          </div>
          <div className="flex-grow bg-white rounded-r-2xl overflow-hidden">
            {connecting ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
                  <p className="text-gray-500">Connecting to chat server...</p>
                </div>
              </div>
            ) : activeRoom ? (
              <MessageThread room={activeRoom} socket={socket} backendUrl={backendUrl} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8">
                <div className="w-16 h-16 bg-primary-lighter/20 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2 text-primary">Welcome to our Community Forum</h3>
                <p className="text-center max-w-md">
                  Select a room from the sidebar to start participating in the discussion. Our forums are moderated safe
                  spaces for sharing experiences and support.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Forum


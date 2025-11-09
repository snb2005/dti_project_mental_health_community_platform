function RoomList({ rooms, activeRoom, onRoomSelect }) {
  // Ensure rooms is always an array
  const safeRooms = Array.isArray(rooms) ? rooms : [];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-gray-100">Support Rooms</h2>
      </div>
      <div className="flex-grow overflow-y-auto">
        {safeRooms.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            <p>No rooms available</p>
          </div>
        ) : (
          safeRooms.map((room) => (
            <button
              key={room._id}
              onClick={() => onRoomSelect(room)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors ${
                activeRoom?._id === room._id ? "bg-gray-600" : ""
              }`}
            >
              <div className="flex items-center mb-1">
                <span className="text-lg mr-2">{room.icon || "🏠"}</span>
                <h3 className="font-medium text-gray-100">{room.name}</h3>
              </div>
              <p className="text-sm text-gray-400 ml-6">{room.description}</p>
              <div className="text-xs text-gray-500 ml-6 mt-1">
                {room.memberCount || 0} members • {room.category}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default RoomList


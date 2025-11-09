import React from 'react';
import { format } from 'date-fns';

const Sidebar = ({ 
  conversations, 
  activeConversation, 
  onConversationClick, 
  onNewChat,
  onDeleteConversation 
}) => {
  return (
    <div className="w-64 bg-gray-800 p-4 flex flex-col">
      <button
        className="bg-gray-700 text-white w-full py-2 rounded-lg mb-4 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
        onClick={onNewChat}
      >
        + New Chat
      </button>

      <div className="flex-grow overflow-auto space-y-2">
        {conversations.map((conv) => (
          <div
            key={conv._id}
            className={`p-3 rounded-lg cursor-pointer ${conv._id === activeConversation ? "bg-gray-700" : "hover:bg-gray-700"}`}
            onClick={() => onConversationClick(conv._id)}
          >
            <div className="flex justify-between items-center">
              <div className="font-medium truncate flex-grow mr-2">{conv.title}</div>
              <button
                className="text-gray-500 hover:text-gray-300 focus:outline-none p-1 rounded hover:bg-gray-600"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteConversation(conv._id)
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-1">{format(new Date(conv.updatedAt), "MMM d, yyyy")}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar; 
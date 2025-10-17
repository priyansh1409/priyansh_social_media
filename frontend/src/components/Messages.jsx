import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useGetAllMessage from '@/hooks/useGetAllMessage';
import useGetRTM from '@/hooks/useGetRTM'; 

const Messages = ({ selectedUser }) => {
    useGetRTM();
    useGetAllMessage();

  // ✅ Safer destructuring with default value in case `messages` is undefined
  const { messages = [] } = useSelector((store) => store.chat);
  const { user } = useSelector((store) => store.auth);

  return (
    <div className="flex-1 flex flex-col">
      
      {/* ✅ Avatar Header Section */}
      <div className="flex justify-center border-b p-4">
        <div className="flex flex-col items-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span className="mt-2 font-semibold">{selectedUser?.username}</span>
          <Link to={`/profile/${selectedUser?._id}`}>
            <Button className="h-8 mt-2" variant="secondary">
              View profile
            </Button>
          </Link>
        </div>
      </div>

      {/* ✅ Message Scroll Section (separated for better layout control) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        
        {/* ✅ Handle empty state nicely */}
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${
                msg.senderId === user?._id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs break-words ${
                  msg.senderId === user?._id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-black'
                }`}
              >
                {/* ✅ Safely fallback if message is missing */}
                {msg.message || ''}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Messages;

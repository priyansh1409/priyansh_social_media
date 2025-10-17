import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { setSelectedUser } from '@/redux/authSlice';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MessageCircleCode } from 'lucide-react';
import Messages from './Messages';
import axios from 'axios';
import { setMessages } from '@/redux/chatSlice';

const ChatPage = () => {
    const [textMessage, setTextMessage] = useState("");
    const { user, suggestedUsers, selectedUser } = useSelector(store => store.auth);
    const { onlineUsers, messages } = useSelector(store => store.chat);
    const dispatch = useDispatch();

    const sendMessageHandler = async (receiverId) => {
        try {
            const res = await axios.post(`https://pranav-social-media.onrender.com/api/v1/message/send/${receiverId}`, { textMessage }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setMessages([...messages, res.data.newMessage]));
                setTextMessage("");
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        return () => {
            dispatch(setSelectedUser(null));
        }
    },[]);

    return (
       <div className="flex h-screen">
  {/* LEFT SIDEBAR */}
  <aside className="w-[16%] border-r border-gray-300 p-4">
    {/* Your sidebar goes here */}
  </aside>

  {/* MAIN CHAT AREA */}
  <div className="flex flex-1">
    
    {/* SUGGESTED USERS */}
    <section className="w-[25%] border-r border-gray-300 p-4 flex flex-col items-center">
      <h1 className="font-bold text-xl mb-6">{user?.username}</h1>
      <div className="space-y-4 w-full max-w-[200px] overflow-y-auto">
        {suggestedUsers.map((suggestedUser) => {
          const isOnline = onlineUsers.includes(suggestedUser?._id);
          return (
            <div
              key={suggestedUser._id}
              onClick={() => dispatch(setSelectedUser(suggestedUser))}
              className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 cursor-pointer"
            >
              <Avatar className="w-12 h-12">
                <AvatarImage src={suggestedUser?.profilePicture} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{suggestedUser?.username}</p>
                <p className={`text-xs ${isOnline ? 'text-green-600' : 'text-red-500'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>

    {/* CHAT SECTION */}
    <section className="flex-1 flex flex-col items-center justify-center">
      {selectedUser ? (
        <div className="flex flex-col w-full max-w-2xl h-full">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b">
            <Avatar className="w-10 h-10">
              <AvatarImage src={selectedUser?.profilePicture} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <h2 className="font-semibold">{selectedUser?.username}</h2>
          </div>

          Messages
          <div className="flex-1 overflow-y-auto p-4">
            <Messages selectedUser={selectedUser} />
          </div>

          {/* Input */}
          <div className="p-4 border-t flex items-center gap-2">
            <Input
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button onClick={() => sendMessageHandler(selectedUser._id)}>Send</Button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <MessageCircleCode className="w-28 h-28 mx-auto mb-4 text-gray-400" />
          <h2 className="font-medium text-lg">Your messages</h2>
          <p className="text-sm text-gray-500">Send a message to start a chat.</p>
        </div>
      )}
    </section>
  </div>
</div>





    )
}

export default ChatPage
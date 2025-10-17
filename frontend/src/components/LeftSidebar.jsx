import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import CreatePost from "./CreatePost";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { clearLikeNotification } from "@/redux/rtnSlice"; // 👈 import the action

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const { likeNotification } = useSelector(
    (store) => store.realTimeNotification
  );
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const logoutHandler = async () => {
    try {
      const res = await axios.get("https://pranav-social-media.onrender.com/api/v1/user/logout", {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const sidebarHandler = (textType) => {
    if (textType === "Logout") {
      logoutHandler();
    } else if (textType === "Create") {
      setOpen(true);
    } else if (textType === "Profile") {
      navigate(`/profile/${user?._id}`);
    } else if (textType === "Home") {
      navigate("/");
    } else if (textType === "Messages") {
      navigate("/chat");
    }
  };

  const sidebarItems = [
    { icon: <Home />, text: "Home" },
    { icon: <MessageCircle />, text: "Messages" },
    { icon: <Heart />, text: "Notifications" },
    { icon: <PlusSquare />, text: "Create" },
    { icon: <Search />, text: "Search" },
    { icon: <TrendingUp />, text: "Explore" },
    {
      icon: (
        <Avatar className="w-6 h-6">
          <AvatarImage src={user?.profilePicture} alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    { icon: <LogOut />, text: "Logout" },
  ];
  return (
    <div className="fixed top-0 z-10 left-0 px-4 border-r border-gray-300 w-[16%] h-screen">
      <div className="flex flex-col">
        <h1 className="my-8 pl-3 font-bold text-xl">LOGO</h1>
        <div>
          {sidebarItems.map((item, index) => {
            const isNotification = item.text === "Notifications";

            return (
              <div key={index}>
                {isNotification ? (
                  <Popover
                    onOpenChange={(isOpen) => {
                      if (isOpen && likeNotification.length > 0) {
                        setTimeout(() => {
                          dispatch(clearLikeNotification());
                        }, 2000); // delay clear to allow rendering
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <div
                        onClick={() => sidebarHandler(item.text)}
                        className="flex items-center gap-3 hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3"
                      >
                        <div className="relative">
                          {item.icon}
                          {likeNotification.length > 0 && (
                            <span className="absolute -top-2 -right-2 text-[10px] min-w-[18px] h-[18px] px-1 bg-red-600 text-white flex items-center justify-center rounded-full shadow-md animate-bounce">
                              {likeNotification.length}
                            </span>
                          )}
                        </div>
                        <span>{item.text}</span>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 z-[9999] bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-4 border border-gray-200">
                      <div>
                        {likeNotification.length === 0 ? (
                          <p className="text-center text-sm text-gray-600">
                            No new notifications
                          </p>
                        ) : (
                          likeNotification.map((notification) => (
                            <div
                              key={notification.userId}
                              className="flex items-center gap-2 my-2"
                            >
                              <Avatar>
                                <AvatarImage
                                  src={notification.userDetails?.profilePicture}
                                />
                                <AvatarFallback>CN</AvatarFallback>
                              </Avatar>
                              <p className="text-sm text-gray-800">
                                <span className="font-bold">
                                  {notification.userDetails?.username}
                                </span>{" "}
                                liked your post
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div
                    onClick={() => sidebarHandler(item.text)}
                    className="flex items-center gap-3 hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3"
                  >
                    {item.icon}
                    <span>{item.text}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <CreatePost open={open} setOpen={setOpen} />
    </div>
  );
};

export default LeftSidebar;

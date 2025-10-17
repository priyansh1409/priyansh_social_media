import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
} from "@radix-ui/react-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MoreHorizontal } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import axios from "axios";

import Comment from "./Comment";
import { setPosts } from "@/redux/postSlice";

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const { selectedPost, posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();
  const [comment, setComment] = useState(selectedPost?.comments || []);

  useEffect(() => {
    if (selectedPost) {
      setComment(selectedPost.comments || []);
    }
  }, [selectedPost]);

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    setText(inputText.trimStart());
  };

  const sendMessageHandler = async () => {
    try {
      const res = await axios.post(
        `https://pranav-social-media.onrender.com/api/v1/post/${selectedPost?._id}/comment`,
        { text },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);

        const updatedPostData = posts.map((p) =>
          p._id === selectedPost._id ? { ...p, comments: updatedCommentData } : p
        );
        dispatch(setPosts(updatedPostData));

        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/40 z-40" />
        <DialogContent className="fixed top-1/2 left-1/2 w-[95vw] max-w-4xl h-[80vh] -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl flex overflow-hidden z-50">
          {/* Left Side - Image */}
          <div className="w-1/2 bg-black">
            <img
              src={selectedPost?.image}
              alt="post"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Side - Comments */}
          <div className="w-1/2 flex flex-col justify-between bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-3">
                <Link to={`/profile/${selectedPost?.author?._id}`}>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={selectedPost?.author?.profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Link>
                <Link to={`/profile/${selectedPost?.author?._id}`} className="text-sm font-semibold">
                  {selectedPost?.author?.username}
                </Link>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <MoreHorizontal className="cursor-pointer" />
                </DialogTrigger>
                <DialogPortal>
                  <DialogOverlay className="fixed inset-0 bg-black/40 z-50" />
                  <DialogContent className="fixed top-1/2 left-1/2 w-[300px] -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-4 flex flex-col gap-2 text-sm text-center z-50">
                    <button className="text-red-600 font-semibold hover:bg-red-100 py-2 rounded">
                      Unfollow
                    </button>
                    <button className="hover:bg-gray-100 py-2 rounded">
                      Add to favorites
                    </button>
                    <button className="hover:bg-gray-100 py-2 rounded">
                      Delete
                    </button>
                  </DialogContent>
                </DialogPortal>
              </Dialog>
            </div>

            {/* Comments Section */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 text-sm">
              {comment.map((comment) => (
                <Comment key={comment._id} comment={comment} />
              ))}
            </div>

            {/* Comment Input */}
            <div className="border-t px-4 py-3 flex items-center gap-3">
              <input
                type="text"
                value={text}
                onChange={changeEventHandler}
                placeholder="Add a comment..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={sendMessageHandler}
                disabled={!text.trim()}
                className="text-blue-600 font-medium disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default CommentDialog;

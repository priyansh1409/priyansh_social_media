import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { FaHeart, FaRegHeart } from "react-icons/fa"
import CommentDialog from './CommentDialog'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Badge } from './ui/badge'
import { DialogOverlay, DialogPortal } from '@radix-ui/react-dialog'

const Post = ({ post }) => {
  const [text, setText] = useState("")
  const [open, setOpen] = useState(false)
  const { user } = useSelector(store => store.auth)
  const { posts, selectedPost } = useSelector(store => store.post)
  const [liked, setLiked] = useState(post.likes.includes(user?._id) || false)
  const [bookmarked, setBookmarked] = useState(post?.bookmarks?.includes(user?._id) || false)
  const [postLike, setPostLike] = useState(post.likes.length)
  const [comment, setComment] = useState(post.comments)
  const dispatch = useDispatch()

  const changeEventHandler = (e) => {
    const inputText = e.target.value
    setText(inputText.trim() ? inputText : "")
  }

  const likeOrDislikeHandler = async () => {
    try {
      const action = liked ? 'dislike' : 'like'
      const res = await axios.get(`https://pranav-social-media.onrender.com/api/v1/post/${post._id}/${action}`, { withCredentials: true })

      if (res.data.success) {
        const updatedLikes = liked ? postLike - 1 : postLike + 1
        setPostLike(updatedLikes)
        setLiked(!liked)

        const updatedPostData = posts.map(p =>
          p._id === post._id ? {
            ...p,
            likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
          } : p
        )
        dispatch(setPosts(updatedPostData))
        toast.success(res.data.message)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const commentHandler = async () => {
    try {
      const res = await axios.post(`https://pranav-social-media.onrender.com/api/v1/post/${post._id}/comment`, { text }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      })

      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment]
        setComment(updatedCommentData)

        const updatedPostData = posts.map(p =>
          p._id === post._id ? { ...p, comments: updatedCommentData } : p
        )
        dispatch(setPosts(updatedPostData))
        toast.success(res.data.message)
        setText("")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const deletePostHandler = async () => {
    try {
      const res = await axios.delete(`https://pranav-social-media.onrender.com/api/v1/post/delete/${post?._id}`, { withCredentials: true })
      if (res.data.success) {
        const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id)
        dispatch(setPosts(updatedPostData))
        toast.success(res.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response.data.message)
    }
  }

  const bookmarkHandler = async () => {
    try {
      const res = await axios.get(`https://pranav-social-media.onrender.com/api/v1/post/${post?._id}/bookmark`, { withCredentials: true })
      if (res.data.success) {
        setBookmarked(prev => !prev)
        toast.success(res.data.message)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className='my-8 w-full max-w-sm mx-auto'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Avatar>
            <AvatarImage src={post.author?.profilePicture} className="w-10 h-10 rounded-full object-cover border border-gray-300" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className='flex items-center gap-3'>
            <h1>{post.author?.username}</h1>
            {user?._id === post.author._id && <Badge variant="secondary">Author</Badge>}
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <MoreHorizontal className="cursor-pointer" />
          </DialogTrigger>
          <DialogPortal>
            <DialogOverlay className="fixed inset-0 bg-black/40 z-40" />
            <DialogContent className="fixed z-50 top-1/2 left-1/2 w-[300px] -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-4 flex flex-col gap-2 text-sm text-center">
              {user && user?._id !== post?.author._id && (
                <button className="text-[#ED4956] font-semibold hover:bg-red-50 py-2 rounded transition">Unfollow</button>
              )}
              <button className="hover:bg-gray-100 py-2 rounded transition">Add to favorites</button>
              {user && user?._id === post?.author._id && (
                <button onClick={deletePostHandler} className="hover:bg-gray-100 py-2 rounded transition">Delete</button>
              )}
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </div>

      {post.image && (
        <img
          className='rounded-sm my-2 w-full aspect-square object-cover'
          src={post.image}
          alt={post.caption || 'post image'}
        />
      )}

      <div className='flex items-center justify-between my-2'>
        <div className='flex items-center gap-3'>
          {liked
            ? <FaHeart onClick={likeOrDislikeHandler} size={24} className='cursor-pointer text-red-600' />
            : <FaRegHeart onClick={likeOrDislikeHandler} size={22} className='cursor-pointer hover:text-gray-600' />
          }
          <MessageCircle onClick={() => {
            dispatch(setSelectedPost(post));
            setTimeout(() => setOpen(true), 0);
          }} className='cursor-pointer hover:text-gray-600' />
          <Send className='cursor-pointer hover:text-gray-600' />
        </div>
        <Bookmark
          onClick={bookmarkHandler}
          className={`cursor-pointer transition ${bookmarked ? 'text-blue-500' : 'hover:text-gray-600'}`}
        />
      </div>

      <span className='font-medium block mb-2'>{postLike} likes</span>
      <p><span className='font-medium mr-2'>{post.author?.username}</span>{post.caption}</p>

      {comment.length > 0 && (
        <span
          onClick={() => {
            dispatch(setSelectedPost(post));
            setTimeout(() => setOpen(true), 0);
          }}
          className='cursor-pointer text-sm text-gray-400'
        >
          View all {comment.length} comments
        </span>
      )}

      {open && selectedPost?._id === post._id && (
        <CommentDialog open={open} setOpen={setOpen} />
      )}

      <div className='flex items-center justify-between'>
        <input
          type="text"
          placeholder='Add a comment...'
          value={text}
          onChange={changeEventHandler}
          className='outline-none text-sm w-full'
        />
        {text && <span onClick={commentHandler} className='text-[#3BADF8] cursor-pointer'>Post</span>}
      </div>
    </div>
  )
}

export default Post

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface Post {
  _id: string;
  slug: string; // ✅ added slug
  title: string;
  content: string;
  author: string;
  image?: string;
  createdAt: string;
  likesCount?: number;
  commentsCount?: number;
  views: number;
}


const stripHtmlAndImages = (html: string) => {
  if (!html) return "No content";
  
  return html
    .replace(/<img[^>]*>/g, "")       // Remove images first
    .replace(/<[^>]*>/g, " ")         // Remove all HTML tags
    .replace(/\s+/g, " ")             // Normalize whitespace
    .trim()
    .slice(0, 300)                    // Optional: limit length
    + (html.length > 300 ? "..." : "");
};
export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const limit = 10;
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/posts?page=${page}&limit=${limit}`
        );
        const all = res.data.posts || res.data || [];
        setTotalPosts(res.data.total || all.length);

        const postsWithCounts = await Promise.all(
          all.map(async (post: Post) => {
            try {
              const likesRes = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/likes/${post._id}`
              );
              const commentsRes = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/comments/${post._id}`
              );
              const commentsData = commentsRes.data;

              return {
                ...post,
                likesCount: likesRes.data.likesCount || 0,
                commentsCount: Array.isArray(commentsData)
                  ? commentsData.length
                  : commentsData.commentsCount || 0,
              };
            } catch {
              return { ...post, likesCount: 0, commentsCount: 0 };
            }
          })
        );

        setPosts(postsWithCounts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page]);

  const handleLike = async (postId: string) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/likes/${postId}`
      );
      const { liked, likesCount } = res.data;

      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likesCount } : p))
      );

      if (liked) {
        setLikedPosts((prev) => [...prev, postId]);
      } else {
        setLikedPosts((prev) => prev.filter((id) => id !== postId));
      }
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  // Auto hide copy modal
  useEffect(() => {
    if (!copyMessage) return;
    const timer = setTimeout(() => setCopyMessage(""), 2000);
    return () => clearTimeout(timer);
  }, [copyMessage]);

  const totalPages = Math.ceil(totalPosts / limit);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#fffaf6]">
        <Loader2 className="animate-spin text-yellow-700 w-10 h-10" />
      </div>
    );

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fff8f2] via-[#fff3e6] to-[#fffaf6] text-[#3e2a1a] px-4 sm:px-6 md:px-10 lg:px-16 py-10 sm:py-16">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-center mb-8 sm:mb-10"
      >
        All <span className="text-yellow-700">Posts</span>
      </motion.h1>

      {/* POSTS GRID */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 max-w-7xl mx-auto"
      >
        {posts.map((post, index) => (
          <motion.div
            key={post._id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden transform hover:-translate-y-1 transition-all duration-500"
          >
            {/* ✅ Updated to use slug */}
            <Link href={`/post/${post.slug}`}>
              <div className="relative">
                <motion.img
                  src={post.image || "https://via.placeholder.com/500x300"}
                  alt={post.title}
                  className="w-full h-48 sm:h-56 md:h-64 object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <h3 className="absolute bottom-3 left-4 text-lg sm:text-xl font-semibold text-white drop-shadow-md line-clamp-2">
                  {post.title}
                </h3>
              </div>
            </Link>

            <div className="p-4 sm:p-5 flex flex-col justify-between h-44 sm:h-48">
              <p className="text-gray-600 text-sm line-clamp-3">
  {stripHtmlAndImages(post.content)}
</p>

              <div className="flex flex-wrap justify-between items-center mt-3 gap-2 sm:gap-4">
                <p className="text-sm font-medium">{post.author}</p>
                <p className="text-gray-400 text-xs sm:text-sm">
                  {new Date(post.createdAt).toDateString()}
                </p>

                <div className="flex items-center gap-4">
                  {/* ❤️ LIKE BUTTON */}
                  <button
                    onClick={() => handleLike(post._id)}
                    className="flex items-center gap-1 text-pink-500 hover:scale-110 transition-transform"
                  >
                    <Heart
                      size={18}
                      fill={likedPosts.includes(post._id) ? "currentColor" : "none"}
                    />
                    <span>{post.likesCount || 0}</span>
                  </button>

                              {/* 👁 VIEW COUNT */}
            <div className="flex items-center gap-1 text-gray-500">
              👁️‍🗨️ <span>{post.views || 0}</span>
            </div>


                  {/* 💬 COMMENT BUTTON */}
                  <Link
                    href={`/post/${post.slug}#comments`} // ✅ updated to use slug
                    className="flex items-center gap-1 text-blue-500 hover:scale-110 transition-transform"
                  >
                    <MessageCircle size={18} />
                    <span>{post.commentsCount || 0}</span>
                  </Link>

                  {/* 📤 SHARE BUTTON */}
                  <button
                    onClick={() => {
                      const postUrl = `${window.location.origin}/post/${post.slug}`; // ✅ updated
                      navigator.clipboard
                        .writeText(postUrl)
                        .then(() => setCopyMessage("Link copied!"))
                        .catch(() => setCopyMessage("Failed to copy link"));
                    }}
                    className="flex items-center gap-1 text-green-500 hover:scale-110 transition-transform"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm sm:text-base">Share</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* COPY MODAL */}
      {copyMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-20 right-5 bg-black/80 text-white px-4 py-2 rounded-lg z-50 shadow-lg"
        >
          {copyMessage}
        </motion.div>
      )}

      {/* PAGINATION */}
      <div className="flex flex-wrap justify-center items-center mt-10 sm:mt-16 gap-4 sm:gap-6">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className={`flex items-center gap-1 px-4 sm:px-5 py-2 rounded-full text-white font-semibold transition ${
            page === 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-yellow-700 hover:bg-yellow-800"
          }`}
        >
          <ChevronLeft size={18} />
          Prev
        </button>

        <span className="text-gray-700 font-semibold text-sm sm:text-base">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className={`flex items-center gap-1 px-4 sm:px-5 py-2 rounded-full text-white font-semibold transition ${
            page === totalPages
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-yellow-700 hover:bg-yellow-800"
          }`}
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>
    </main>
  );
}

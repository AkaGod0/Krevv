"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Share2,
  Calendar,
  User,
} from "lucide-react";
import Link from "next/link";

interface Post {
  _id: string;
  slug: string;
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
    .replace(/<img[^>]*>/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120) + (html.length > 120 ? "..." : "");
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const limit = 12;
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/posts?page=${page}&limit=${limit}`
        );
        const all = Array.isArray(res.data.data) ? res.data.data : [];
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  useEffect(() => {
    if (!copyMessage) return;
    const timer = setTimeout(() => setCopyMessage(""), 2000);
    return () => clearTimeout(timer);
  }, [copyMessage]);

  const totalPages = Math.ceil(totalPosts / limit);

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#fffaf6]">
        <Loader2 className="animate-spin text-yellow-700 w-12 h-12 mb-4" />
        <p className="text-yellow-800 font-medium animate-pulse">Fetching latest stories...</p>
      </div>
    );

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#fffaf6] via-[#fff8f0] to-[#fef6ea] text-[#3e2a1a] pb-20">
      {/* Hero Header with Decorative Elements */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-50/50 to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="relative max-w-7xl mx-auto px-4 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2 mb-6 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-900 text-sm font-black tracking-widest uppercase shadow-lg"
          >
            <div className="w-2 h-2 bg-yellow-700 rounded-full animate-pulse" />
            Insights & Stories
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-[#3e2a1a] via-yellow-800 to-[#3e2a1a] bg-clip-text text-transparent"
          >
            The <span className="text-yellow-700">Chronicle</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 max-w-2xl mx-auto text-lg font-medium"
          >
            Exploring perspectives through words. Join our community of writers and readers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex items-center justify-center gap-8"
          >
          </motion.div>
        </div>
      </section>

      {/* Grid Container with Masonry-like Feel */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {posts.map((post, index) => (
            <motion.article
              key={post._id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-yellow-700/10 transition-all duration-500 flex flex-col h-full border-2 border-transparent hover:border-yellow-100"
            >
              {/* Image Header with Overlay Badge */}
              <Link href={`/post/${post.slug}`} className="relative block aspect-[16/11] overflow-hidden bg-gradient-to-br from-yellow-50 to-orange-50">
                <motion.img
                  src={post.image || "https://via.placeholder.com/500x300"}
                  alt={post.title}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                
                {/* Floating View Count */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                  <Eye size={14} className="text-yellow-700" />
                  <span className="text-xs font-black text-gray-800">{post.views || 0}</span>
                </div>

                {/* Author Badge on Image */}
                <div className="absolute bottom-3 left-3 bg-gradient-to-r from-yellow-700 to-orange-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                  <User size={12} />
                  <span className="text-xs font-bold uppercase tracking-wide">{post.author}</span>
                </div>
              </Link>

              {/* Content Body */}
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-500">
                  <Calendar size={12} className="text-yellow-600" />
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>

                <Link href={`/post/${post.slug}`}>
                  <h2 className="text-lg font-black leading-snug mb-3 group-hover:text-yellow-700 transition-colors line-clamp-2 tracking-tight">
                    {post.title}
                  </h2>
                </Link>

                <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-5 font-medium">
                  {stripHtmlAndImages(post.content)}
                </p>

                {/* Interaction Footer with Gradient Border */}
                <div className="mt-auto pt-4 border-t-2 border-gradient-to-r from-yellow-100 via-orange-50 to-yellow-100 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-1.5 transition-all duration-300 ${
                        likedPosts.includes(post._id) 
                          ? "text-pink-600 scale-110" 
                          : "text-gray-400 hover:text-pink-500 hover:scale-105"
                      }`}
                    >
                      <Heart
                        size={20}
                        fill={likedPosts.includes(post._id) ? "currentColor" : "none"}
                        className="transition-all"
                        strokeWidth={2.5}
                      />
                      <span className="text-sm font-black">{post.likesCount || 0}</span>
                    </button>

                    <Link
                      href={`/post/${post.slug}`}
                      className="flex items-center gap-1.5 text-gray-400 hover:text-blue-500 hover:scale-105 transition-all"
                    >
                      <MessageCircle size={20} strokeWidth={2.5} />
                      <span className="text-sm font-black">{post.commentsCount || 0}</span>
                    </Link>
                  </div>

                  <button
                    onClick={() => {
                      const postUrl = `${window.location.origin}/post/${post.slug}`;
                      navigator.clipboard.writeText(postUrl)
                        .then(() => setCopyMessage("Link copied!"))
                        .catch(() => setCopyMessage("Error copying"));
                    }}
                    className="p-2.5 bg-gradient-to-br from-yellow-50 to-orange-50 text-yellow-700 rounded-xl hover:from-yellow-700 hover:to-orange-600 hover:text-white transition-all duration-300 hover:scale-110 shadow-sm"
                    title="Share post"
                  >
                    <Share2 size={17} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>

      {/* Enhanced Copy Notification */}
      <AnimatePresence>
        {copyMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-8 right-8 bg-gradient-to-r from-[#3e2a1a] to-yellow-900 text-white px-6 py-4 rounded-2xl z-50 shadow-2xl flex items-center gap-3 border-2 border-yellow-600"
          >
            <div className="bg-green-500 rounded-full p-1.5 shadow-lg">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <span className="font-black text-sm">{copyMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-16 gap-3">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className={`p-3.5 rounded-xl shadow-md transition-all duration-300 ${
              page === 1 
                ? "bg-gray-100 text-gray-300 cursor-not-allowed" 
                : "bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 hover:from-yellow-700 hover:to-orange-600 hover:text-white hover:scale-110 hover:shadow-lg"
            }`}
          >
            <ChevronLeft size={22} strokeWidth={3} />
          </button>

          <div className="bg-white px-8 py-4 rounded-xl shadow-lg border-2 border-yellow-100 flex items-center gap-3">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Page</span>
            <span className="text-2xl font-black text-yellow-700">{page}</span>
            <span className="text-gray-300 mx-0.5 text-xl font-bold">/</span>
            <span className="text-xl font-black text-gray-400">{totalPages}</span>
          </div>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className={`p-3.5 rounded-xl shadow-md transition-all duration-300 ${
              page === totalPages 
                ? "bg-gray-100 text-gray-300 cursor-not-allowed" 
                : "bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 hover:from-yellow-700 hover:to-orange-600 hover:text-white hover:scale-110 hover:shadow-lg"
            }`}
          >
            <ChevronRight size={22} strokeWidth={3} />
          </button>
        </div>
      )}
    </main>
  );
}
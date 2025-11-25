"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminHomePage() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalViews: 0, // ← NEW: Total Page Views
  });

 useEffect(() => {
  const fetchStats = async () => {
    try {
      // Request all posts, remove limit if your API allows it
      const res = await fetch(`${API}/posts?limit=0`); // <-- 'limit=0' often means fetch all
      const data = await res.json();

      const postsArray = Array.isArray(data.data) ? data.data : [];

      const totalLikes = postsArray.reduce(
        (acc: number, post: any) => acc + (post.likes?.length || 0),
        0
      );
       // Calculate total comments by fetching per post
        const totalCommentsArray = await Promise.all(
          postsArray.map(async (post: { _id: any; }) => {
            try {
              const commentsRes = await fetch(`${API}/comments/${post._id}`);
              const commentsData = await commentsRes.json();
              return Array.isArray(commentsData) ? commentsData.length : 0;
            } catch (err) {
              console.error(`Failed to fetch comments for post ${post._id}:`, err);
              return 0;
            }
          })
        );

        const totalComments = totalCommentsArray.reduce((acc, num) => acc + num, 0);
        
      const totalViews = postsArray.reduce(
        (acc: number, post: any) => acc + (post.views || 0),
        0
      );

      setStats({
        totalPosts: postsArray.length,
        totalLikes,
        totalComments,
        totalViews,
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  fetchStats();
}, []);


  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
      <motion.h1
        className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-400 text-transparent bg-clip-text"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Admin Dashboard
      </motion.h1>

      <motion.p
        className="text-gray-300 text-lg max-w-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Real-time insights into your blog's performance. Track engagement and growth.
      </motion.p>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {/* Total Posts */}
        <div className="bg-white/10 backdrop-blur-lg border border-purple-500/30 p-8 rounded-2xl shadow-2xl hover:shadow-purple-500/20 transition-shadow">
          <h2 className="text-xl font-semibold text-purple-300 mb-3">Total Posts</h2>
          <p className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {stats.totalPosts}
          </p>
        </div>

        {/* Total Likes */}
        <div className="bg-white/10 backdrop-blur-lg border border-pink-500/30 p-8 rounded-2xl shadow-2xl hover:shadow-pink-500/20 transition-shadow">
          <h2 className="text-xl font-semibold text-pink-300 mb-3">Total Likes</h2>
          <p className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
            {stats.totalLikes}
          </p>
        </div>

        {/* Total Comments */}
        <div className="bg-white/10 backdrop-blur-lg border border-blue-500/30 p-8 rounded-2xl shadow-2xl hover:shadow-blue-500/20 transition-shadow">
          <h2 className="text-xl font-semibold text-blue-300 mb-3">Total Comments</h2>
          <p className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {stats.totalComments}
          </p>
        </div>

        {/* Total Page Views - NEW */}
        <div className="bg-white/10 backdrop-blur-lg border border-green-500/30 p-8 rounded-2xl shadow-2xl hover:shadow-green-500/20 transition-shadow">
          <h2 className="text-xl font-semibold text-green-300 mb-3">Total Views</h2>
          <p className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            {stats.totalViews.toLocaleString()}
          </p>
        </div>
      </motion.div>

      <motion.div
        className="mt-16 text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 1 }}
      >
        <p>Live stats • Updated in real-time</p>
      </motion.div>
    </div>
  );
}
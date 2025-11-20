"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Loader2,
  Share2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";


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
  views:number;
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState<string | null>(null);
  const [copied, setCopied] = useState(false); // ✅ new state

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts`);
        const all = res.data || [];
        const postsWithCounts = await Promise.all(
          all.slice(0, 10).map(async (post: Post) => {
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
  }, []);

  const handleLike = async (postId: string) => {
    try {
      setLiking(postId);
      const ipAddress = await axios.get("https://api.ipify.org?format=json");
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/likes/${postId}`,
        { ipAddress: ipAddress.data.ip }
      );
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, likesCount: res.data.likesCount } : p
        )
      );
    } catch (err) {
      console.error("Error liking post:", err);
    } finally {
      setLiking(null);
    }
  };

  const handleShare = (slug: string) => {
    const url = `${window.location.origin}/post/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true); // ✅ show modal
    setTimeout(() => setCopied(false), 2000); // ✅ hide after 2s
  };


  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-yellow-50 to-white">
        <Loader2 className="animate-spin text-yellow-700 w-8 h-8" />
      </div>
    );

  return (
    <main className="bg-[#fffaf6] min-h-screen text-gray-800 overflow-x-hidden scroll-smooth relative">
      {/* ✅ Copied Modal */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-8 right-8 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
          >
            ✅ Link copied!
          </motion.div>
        )}
      </AnimatePresence>

     {/* INTRO HERO - 100% WORKING */}
<section className="relative h-[70vh] flex items-center justify-center text-center overflow-hidden">
  {/* Background Image */}
  <img
    src="/coverpage.jpeg"
    alt="coverpage"
    className="absolute inset-0 w-full h-full object-cover brightness-75 z-0"
    loading="eager"
  />

  {/* Dark Gradient Overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-0" />

  {/* Text Content ON TOP of the Image */}
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
    className="relative z-10 max-w-5xl px-6"
  >
    <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight drop-shadow-2xl">
      The future of work is here —{" "}
      <span className="text-amber-400">flexible, global,</span> and in your hands
    </h1>

    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.8 }}
      className="mt-8 text-lg md:text-2xl font-medium text-amber-100 max-w-3xl mx-auto leading-relaxed drop-shadow-lg"
    >
      We are your trusted guide through the world of freelancing and remote jobs, helping you build a career that fits your life, not the other way around.
    </motion.p>
  </motion.div>
</section>



      {/* POSTS LIST */}
      <section className="max-w-5xl mx-auto mt-16 space-y-10 px-5 pb-20">
        {posts.slice(0).map((post) => (
          <motion.div
            key={post._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden hover:-translate-y-1"
          >
            <div className="flex flex-col md:flex-row cursor-pointer">
              <Link href={`/post/${post.slug}`} className="md:w-60">
                <img
                  src={post.image || "https://via.placeholder.com/250x180"}
                  alt={post.title}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <Link href={`/post/${post.slug}`}>
                    <h3 className="text-lg font-semibold text-[#3e2a1a] mb-2 hover:text-amber-700 transition">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm line-clamp-2">
                     {stripHtmlAndImages(post.content)}
                  </p>
                  <div className="flex items-center text-sm text-gray-400 mt-3 gap-2">
                    <span>{post.author}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-4">
                  <button
                    onClick={() => handleLike(post._id)}
                    disabled={liking === post._id}
                    className={`flex items-center gap-1 transition ${
                      liking === post._id
                        ? "opacity-50 cursor-not-allowed"
                        : "text-pink-500 hover:text-pink-600"
                    }`}
                    type="button"
                  >
                    <Heart size={20} />
                    <span>{post.likesCount || 0}</span>
                  </button>

                   <div className="flex items-center gap-1 text-gray-500">
              👁️‍🗨️ <span>{post.views || 0}</span>
            </div>


                  <Link
                    href={`/post/${post.slug}`}
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-600 transition"
                  >
                    <MessageCircle size={20} />
                    <span>{post.commentsCount || 0}</span>
                  </Link>

                  {/* ✅ Share Button */}
                  <button
                    onClick={() => handleShare(post.slug)}
                    className="flex items-center gap-1 text-green-600 hover:text-green-700 transition"
                  >
                    <Share2 size={20} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* CLOSING SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center py-20 bg-gradient-to-t from-[#fef6e4] to-[#fffaf6]"
      >
        <Link href="/post" className="inline-block mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-all"
          >
            View More Posts
          </motion.button>
        </Link>

        <h3 className="text-3xl font-bold text-[#3e2a1a] mb-4">
          Thank You for Visiting 💛
        </h3>
        <p className="text-gray-600 max-w-lg mx-auto">
          Stay connected for more inspiring stories, updates, and insights.
          Every post is a piece of our journey — and you’re part of it.
        </p>
      </motion.section>
    </main>
  );
}

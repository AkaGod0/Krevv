"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Edit, Trash } from "lucide-react";
import Cookies from "js-cookie"; 
import { isTokenExpired } from "../utils/checkToken"; 
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ManagePostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  const router = useRouter(); 


  // ✅ Token check logic
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token || isTokenExpired(token)) {
      Cookies.remove("token");
      router.push("/admin/login");
    }
  }, [router]);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API}/posts`);
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDeleteClick = (id: string) => {
    setPostToDelete(id);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    try {
      const token = Cookies.get("token");
      await fetch(`${API}/posts/${postToDelete}`, { 
        method: "DELETE", 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setPosts(posts.filter((p) => p._id !== postToDelete));
      setMessage("🗑️ Post deleted");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setModalOpen(false);
      setPostToDelete(null);
    }
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const handleNextPage = () => {
    if (indexOfLastPost < posts.length) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-purple-900 text-white p-4 sm:p-10">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 sm:mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-300">
        Manage All Posts ✨
      </h1>

      {message && (
        <motion.div
          initial={{ opacity: 0, x: 50, y: 50 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 50, y: 50 }}
          className="fixed bottom-5 right-2 sm:right-5 bg-black/70 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm sm:text-base"
        >
          {message}
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {currentPosts.map((post) => (
          <motion.div
            key={post._id}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
            className="bg-black/50 backdrop-blur-lg p-4 sm:p-6 rounded-2xl shadow-lg border border-purple-700/30 flex flex-col"
          >
            {post.image && (
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-40 sm:h-48 object-cover rounded-xl mb-4"
              />
            )}
  

            <h3 className="text-2xl sm:text-4xl font-bold mb-2">{post.title}</h3>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">{post.slug}</h3>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">{post.category}</h3>
          

        
            <div className="flex justify-between text-xs sm:text-sm text-gray-400 mb-4">
              <span>❤️ {post.likes?.length || 0}</span>
              <span>💬 {post.comments?.length || 0}</span>
              <span>👁️ {post.views || 0}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <a
                href={`/admin/edit/${post._id}`}
                className="flex items-center justify-center gap-1 bg-blue-600 px-3 py-2 rounded-lg hover:opacity-80"
              >
                <Edit size={16} /> Edit
              </a>
              <button
                onClick={() => handleDeleteClick(post._id)}
                className="flex items-center justify-center gap-1 bg-red-600 px-3 py-2 rounded-lg hover:opacity-80"
              >
                <Trash size={16} /> Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 sm:mt-8">
        {currentPage > 1 && (
          <button
            onClick={handlePrevPage}
            className="bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition"
          >
            Prev
          </button>
        )}
        {indexOfLastPost < posts.length && (
          <button
            onClick={handleNextPage}
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Next
          </button>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white text-black rounded-xl shadow-xl w-full max-w-sm sm:w-96 p-4 sm:p-6"
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Delete Post</h2>
            <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 sm:px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition text-sm sm:text-base"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}

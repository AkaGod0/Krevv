"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Edit, 
  Trash, 
  Search, 
  Eye, 
  Heart, 
  MessageCircle, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle,
  CheckSquare,
  Square,
  Trash2,
  X,
  CheckCircle
} from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ManagePostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  // Multi-select states
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Search states
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);

  const router = useRouter();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("admin_token") || Cookies.get("token");
      const res = await fetch(`${API}/posts?page=${page}&limit=${limit}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      setPosts(Array.isArray(json.data) ? json.data : []);
      setTotal(json.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page]);

  // Clear selection when exiting select mode
  useEffect(() => {
    if (!selectMode) {
      setSelectedPosts(new Set());
    }
  }, [selectMode]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteClick = (id: string) => {
    setPostToDelete(id);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    try {
      const token = Cookies.get("admin_token") || Cookies.get("token");
      await fetch(`${API}/posts/${postToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(posts.filter((p) => p._id !== postToDelete));
      showMessage("success", "Post deleted successfully!");
      fetchPosts();
    } catch (err) {
      console.error(err);
      showMessage("error", "Failed to delete post");
    } finally {
      setModalOpen(false);
      setPostToDelete(null);
    }
  };

  // Toggle single post selection
  const togglePostSelection = (postId: string) => {
    setSelectedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  // Select all posts on current page
  const selectAllPosts = () => {
    const allPostIds = posts.map((p) => p._id);
    setSelectedPosts(new Set(allPostIds));
  };

  // Deselect all posts
  const deselectAllPosts = () => {
    setSelectedPosts(new Set());
  };

  // Check if all posts are selected
  const allSelected = posts.length > 0 && posts.every((p) => selectedPosts.has(p._id));

  // Bulk delete handler
  const confirmBulkDelete = async () => {
    if (selectedPosts.size === 0) return;
    
    setBulkDeleting(true);
    const token = Cookies.get("admin_token") || Cookies.get("token");
    
    let successCount = 0;
    let failCount = 0;

    for (const postId of selectedPosts) {
      try {
        const res = await fetch(`${API}/posts/${postId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        console.error(err);
        failCount++;
      }
    }

    setBulkDeleting(false);
    setBulkDeleteModal(false);
    setSelectedPosts(new Set());
    setSelectMode(false);

    if (failCount === 0) {
      showMessage("success", `Successfully deleted ${successCount} post${successCount > 1 ? 's' : ''}`);
    } else {
      showMessage("error", `Deleted ${successCount}, failed ${failCount}`);
    }

    fetchPosts();
  };

  // Search posts
  useEffect(() => {
    if (!searchText.trim()) {
      fetchPosts();
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API}/posts/search?q=${encodeURIComponent(searchText.trim())}&all=true`
        );
        const json = await res.json();

        let results: any[] = [];
        if (Array.isArray(json)) results = json;
        else if (json.posts) results = json.posts;
        else if (json.results) results = json.results;
        else if (json.data) results = json.data;

        const exactMatches = results.filter((p) =>
          p.title.toLowerCase().includes(searchText.toLowerCase())
        );

        setPosts(exactMatches);
        setSuggestions(exactMatches);
        setShowSuggestions(true);
      } catch (err) {
        console.error(err);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [searchText]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Success/Error Toast - Top Right */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: 100 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -50, x: 100 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-4 right-4 ${
              message.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 max-w-md`}
          >
            {message.type === "success" ? (
              <CheckCircle size={24} className="flex-shrink-0" />
            ) : (
              <AlertCircle size={24} className="flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-semibold">{message.type === "success" ? "Success!" : "Error"}</p>
              <p className={`text-sm ${message.type === "success" ? "text-green-50" : "text-red-50"}`}>
                {message.text}
              </p>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-white hover:text-gray-200 transition"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-3 mb-2">
          <Edit size={32} />
          <h1 className="text-3xl font-bold">Manage Posts</h1>
        </div>
        <p className="text-blue-100">
          Edit, delete, and manage all your blog posts
        </p>
      </motion.div>

      {/* Search Bar & Select Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search posts by title..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800"
            />

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute inset-x-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
                {suggestions.map((post) => (
                  <div
                    key={post._id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setPosts([post]);
                      setSearchText(post.title);
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition cursor-pointer"
                  >
                    {post.image && (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{post.title}</p>
                      <p className="text-xs text-gray-500">
                        {post.views || 0} views • {post.category || "General"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Select Mode Toggle */}
          <button
            onClick={() => setSelectMode(!selectMode)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
              selectMode
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            <CheckSquare size={20} />
            {selectMode ? "Cancel Select" : "Select Posts"}
          </button>
        </div>

        {/* Selection Actions Bar */}
        <AnimatePresence>
          {selectMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={allSelected ? deselectAllPosts : selectAllPosts}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
                  >
                    {allSelected ? (
                      <>
                        <Square size={18} />
                        Deselect All
                      </>
                    ) : (
                      <>
                        <CheckSquare size={18} />
                        Select All ({posts.length})
                      </>
                    )}
                  </button>
                  
                  <span className="text-gray-600 font-medium">
                    {selectedPosts.size} selected
                  </span>
                </div>

                <button
                  onClick={() => setBulkDeleteModal(true)}
                  disabled={selectedPosts.size === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                    selectedPosts.size === 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  <Trash2 size={18} />
                  Delete Selected ({selectedPosts.size})
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
          <p className="text-xl font-semibold text-gray-600">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 text-lg">No posts found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const isSelected = selectedPosts.has(post._id);
              
              return (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden relative ${
                    isSelected ? "ring-2 ring-purple-500 ring-offset-2" : ""
                  }`}
                >
                  {/* Selection Checkbox */}
                  {selectMode && (
                    <button
                      onClick={() => togglePostSelection(post._id)}
                      className={`absolute top-3 left-3 z-10 p-2 rounded-lg shadow-lg transition ${
                        isSelected
                          ? "bg-purple-600 text-white"
                          : "bg-white/90 text-gray-600 hover:bg-white"
                      }`}
                    >
                      {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>
                  )}

                  {/* Selected Overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-purple-500/10 pointer-events-none z-0" />
                  )}

                  {post.image && (
                    <div 
                      className={`relative ${selectMode ? "cursor-pointer" : ""}`}
                      onClick={selectMode ? () => togglePostSelection(post._id) : undefined}
                    >
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                  
                  <div 
                    className={`p-6 ${selectMode ? "cursor-pointer" : ""}`}
                    onClick={selectMode ? () => togglePostSelection(post._id) : undefined}
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                        {post.category || "General"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        <span>{post.views || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart size={14} />
                        <span>{post.likes?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle size={14} />
                        <span>{post.comments?.length || 0}</span>
                      </div>
                    </div>

                    {/* Action Buttons - Hidden in select mode */}
                    {!selectMode && (
                      <div className="flex gap-2">
                        <a
                          href={`/admin/edit/${post._id}`}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                        >
                          <Edit size={16} />
                          Edit
                        </a>
                        <button
                          onClick={() => handleDeleteClick(post._id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition"
                        >
                          <Trash size={16} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                disabled={page === 1}
                onClick={() => {
                  setPage(page - 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                  page === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <ChevronLeft size={18} />
                Previous
              </button>
              
              <span className="text-lg font-semibold text-gray-700">
                Page {page} of {totalPages}
              </span>
              
              <button
                disabled={page === totalPages}
                onClick={() => {
                  setPage(page + 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                  page === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Single Delete Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Delete Post</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Delete Modal */}
      <AnimatePresence>
        {bulkDeleteModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => !bulkDeleting && setBulkDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Delete Multiple Posts</h2>
              </div>
              
              <p className="text-gray-600 mb-2">
                You are about to delete <span className="font-bold text-red-600">{selectedPosts.size}</span> post{selectedPosts.size > 1 ? 's' : ''}.
              </p>
              <p className="text-gray-600 mb-6">
                This action cannot be undone. Are you sure you want to continue?
              </p>

              {bulkDeleting ? (
                <div className="flex items-center justify-center gap-3 py-4">
                  <Loader2 className="animate-spin text-red-600" size={24} />
                  <span className="text-gray-600 font-medium">Deleting posts...</span>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setBulkDeleteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmBulkDelete}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} />
                    Delete All
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
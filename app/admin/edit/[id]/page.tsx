"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import type { Editor } from "@tiptap/react";
import React from "react";

const NovelEditor = dynamic(() => import("@/components/NovelEditor"), { ssr: false });
const API = process.env.NEXT_PUBLIC_API_URL;

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const editorRef = useRef<Editor | null>(null);

  const [form, setForm] = useState({
    title: "", content: "", image: "", category: "", slug: "", contentImages: [] as string[],
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fetching, setFetching] = useState(true);
  const [comments, setComments] = useState<any[]>([]);

  // Modals
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; commentId: string | null }>({
    open: false,
    commentId: null,
  });
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`${API}/posts/${id}`);
        const data = await res.json();
        setForm({
          title: data.title || "",
          content: data.content || "",
          image: data.image || "",
          category: data.category || "",
          slug: data.slug || "",
          contentImages: data.contentImages || [],
        });

        const commentsRes = await fetch(`${API}/comments/${id}`);
        const commentsData = await commentsRes.json();
        setComments(commentsData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchPost();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", editorRef.current?.getHTML() || "");
    formData.append("category", form.category);
    formData.append("slug", form.slug);
    if (file) formData.append("image", file);

    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("Please login again");

      const res = await fetch(`${API}/posts/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");

      setMessage("Post updated successfully!");
      setTimeout(() => { setMessage(""); router.push("/admin/manage"); }, 2000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
      setTimeout(() => setMessage(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!deleteModal.commentId) return;

    const token = Cookies.get("token");
    if (!token) return setMessage("Please login again");

    const res = await fetch(`${API}/comments/${deleteModal.commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const removeComment = (comments: any[]): any[] => {
        return comments
          .filter(c => c._id !== deleteModal.commentId)
          .map(c => ({
            ...c,
            replies: c.replies ? removeComment(c.replies) : []
          }));
      };
      setComments(removeComment);
      setMessage("Comment deleted");
      setTimeout(() => setMessage(""), 3000);
    }

    setDeleteModal({ open: false, commentId: null });
  };

  // FIXED: CommentItem with proper callback
  const CommentItem = React.memo(({ 
    comment, 
    depth = 0,
    onReplySuccess 
  }: { 
    comment: any; 
    depth?: number;
    onReplySuccess?: () => void;
  }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (isReplying && textareaRef.current) {
        textareaRef.current.focus();
      }
    }, [isReplying]);

    const startReply = () => {
      setIsReplying(true);
      setReplyText("");
    };

    const cancelReply = () => {
      setIsReplying(false);
      setReplyText("");
    };

    const sendReply = async () => {
      if (!replyText.trim()) return;

      const token = Cookies.get("token");
      if (!token) {
        setMessage("Please login again");
        return;
      }

      const res = await fetch(`${API}/comments/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: "Admin",
          message: replyText.trim(),
          parent: comment._id,
          isAdmin: true,
        }),
      });

      if (res.ok) {
        const newReply = await res.json();
        const addReply = (comments: any[]): any[] => {
          return comments.map(c => {
            if (c._id === comment._id) {
              return { ...c, replies: [...(c.replies || []), { ...newReply, replies: [] }] };
            }
            if (c.replies?.length) {
              return { ...c, replies: addReply(c.replies) };
            }
            return c;
          });
        };
        setComments(prev => addReply(prev));
        cancelReply();
        onReplySuccess?.(); // This triggers the success modal
      }
    };

    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className={`mb-8 ${depth > 0 ? "ml-4 sm:ml-10 border-l-4 border-purple-500 pl-6" : ""}`}
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
                {comment.name[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-purple-300">{comment.name}</span>
                  {comment.isAdmin && (
                    <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1.5 rounded-full text-white font-bold">
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
                <p className="text-gray-200 mt-4 leading-relaxed">{comment.message}</p>
              </div>
            </div>

            <button
              onClick={() => setDeleteModal({ open: true, commentId: comment._id })}
              className="text-red-400 hover:text-red-300 font-bold text-sm self-start"
            >
              Delete
            </button>
          </div>

          {!isReplying && (
            <button onClick={startReply} className="text-purple-400 hover:text-purple-300 text-sm font-medium mt-5 block">
              Reply
            </button>
          )}

          <AnimatePresence>
            {isReplying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 overflow-hidden"
              >
                <textarea
                  ref={textareaRef}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply as Admin..."
                  className="w-full bg-white/10 border border-purple-500/50 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={4}
                />
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button onClick={sendReply} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold hover:opacity-90 transition shadow-lg">
                    Send Reply
                  </button>
                  <button onClick={cancelReply} className="px-6 py-3 bg-gray-700 rounded-xl hover:bg-gray-600 transition">
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {comment.replies?.length > 0 && (
          <div className="mt-8">
            {comment.replies.map((reply: any) => (
              <CommentItem key={reply._id} comment={reply} depth={depth + 1} onReplySuccess={onReplySuccess} />
            ))}
          </div>
        )}
      </motion.div>
    );
  });
  CommentItem.displayName = "CommentItem";

 if (fetching) {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-blue-900 to-purple-900 text-white">
      <div className="flex flex-col items-center space-y-6">

        {/* Animated Spinner */}
        <div className="w-16 h-16 border-4 border-white/40 border-t-white rounded-full animate-spin"></div>

        {/* Text */}
        <p className="text-2xl font-semibold tracking-wide animate-pulse">
          Loading Post...
        </p>
      </div>
    </main>
  );
}


  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 text-white p-6 sm:p-10">
      <motion.h1
        className="text-4xl sm:text-6xl font-extrabold text-center bg-gradient-to-r from-pink-400 to-purple-300 bg-clip-text text-transparent mb-12"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Edit Post
      </motion.h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 max-w-7xl mx-auto">
        <div className="xl:col-span-2 space-y-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <input type="text" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="p-4 rounded-xl bg-white/90 text-black font-bold text-lg focus:ring-4 focus:ring-purple-500 outline-none" required />
              <input type="text" placeholder="Slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="p-4 rounded-xl bg-white/90 text-black outline-none" required />
              <input type="text" placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="p-4 rounded-xl bg-white/90 text-black outline-none md:col-span-2" required />
            </div>

            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <NovelEditor content={form.content} onChange={html => setForm(p => ({ ...p, content: html }))} onCreate={({ editor }) => (editorRef.current = editor)} />
            </div>

            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-purple-700/40">
              <label className="block text-xl font-bold mb-6">Featured Image</label>
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                {form.image && <img src={form.image} alt="Featured" className="w-full max-w-md h-64 object-cover rounded-xl shadow-2xl" />}
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="text-gray-300 file:mr-6 file:py-4 file:px-8 file:rounded-xl file:bg-gradient-to-r file:from-purple-600 file:to-pink-600 file:text-white file:font-bold file:border-0 hover:file:opacity-90" />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.95 }}
              className="w-full py-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold text-2xl shadow-2xl hover:opacity-90 transition"
            >
              {loading ? "Saving Changes..." : "Save Changes"}
            </motion.button>
          </form>
        </div>

        <div className="xl:col-span-1">
          <div className="bg-black/60 backdrop-blur-2xl rounded-3xl border border-purple-700/60 p-8 h-screen overflow-y-auto sticky top-6 shadow-2xl">
            <h2 className="text-4xl font-extrabold mb-10 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Comments ({comments.length})
            </h2>

            {comments.length === 0 ? (
              <p className="text-center text-gray-400 py-20 text-lg">No comments yet.</p>
            ) : (
              <div className="space-y-8">
                {comments.map(comment => (
                  <CommentItem 
                    key={comment._id} 
                    comment={comment} 
                    onReplySuccess={() => {
                      setSuccessModal(true);
                      setTimeout(() => setSuccessModal(false), 3000);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteModal({ open: false, commentId: null })}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-red-500/50 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-3xl font-bold text-red-400 mb-4">Delete Comment?</h3>
              <p className="text-gray-300 mb-8">
                This will permanently delete the comment and all its replies. This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button onClick={() => setDeleteModal({ open: false, commentId: null })} className="px-6 py-3 bg-gray-700 rounded-xl hover:bg-gray-600 transition">
                  Cancel
                </button>
                <button onClick={handleDeleteComment} className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold transition shadow-lg">
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUCCESS MODAL - NOW WORKS 100% */}
      <AnimatePresence>
        {successModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -30 }}
              className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-12 shadow-3xl text-center max-w-md w-full border-4 border-white/20"
              onClick={e => e.stopPropagation()}
            >
    
              <h3 className="text-4xl font-bold text-white mb-3">Reply Sent!</h3>
              <p className="text-white/90 text-lg">Your admin reply has been posted successfully.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-24 right-6 bg-black/90 backdrop-blur-xl px-8 py-4 rounded-2xl shadow-2xl border border-purple-500 z-50"
          >
            <p className="text-xl font-bold text-white">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
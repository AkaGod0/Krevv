"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import type { Editor } from "@tiptap/react";
import React from "react";
import {
  FileText,
  Image as ImageIcon,
  Tag,
  Save,
  MessageCircle,
  Trash2,
  Reply,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Link2,
  AlignLeft,
} from "lucide-react";

const NovelEditor = dynamic(() => import("@/components/NovelEditor"), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-center">
      <Loader2 className="animate-spin text-blue-500 w-8 h-8 mx-auto" />
      <p className="mt-2 text-gray-400">Loading editor...</p>
    </div>
  ),
});

const API = process.env.NEXT_PUBLIC_API_URL;

// Utility function to clean/sanitize slugs
const cleanSlug = (slug: string): string => {
  if (!slug) return "";
  
  return decodeURIComponent(slug)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^\w-]/g, '')         // Remove special characters except hyphens
    .replace(/-+/g, '-')            // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '');       // Remove leading/trailing hyphens
};

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const editorRef = useRef<Editor | null>(null);

  const [form, setForm] = useState({
    title: "",
    content: "",
    image: "",
    category: "",
    slug: "",
    metaDescription: "",
    contentImages: [] as string[],
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const [comments, setComments] = useState<any[]>([]);

  // Modals
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; commentId: string | null }>({
    open: false,
    commentId: null,
  });
  const [successToast, setSuccessToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = Cookies.get("admin_token") || Cookies.get("token");
        const res = await fetch(`${API}/posts/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setForm({
          title: data.title || "",
          content: data.content || "",
          image: data.image || "",
          category: data.category || "",
          slug: cleanSlug(data.slug || ""), // Clean slug on load
          metaDescription: data.metaDescription || "",
          contentImages: data.contentImages || [],
        });

        const commentsRes = await fetch(`${API}/comments/${id}`);
        const commentsData = await commentsRes.json();
        setComments(commentsData || []);
      } catch (err) {
        console.error(err);
        setErrorMessage("Failed to load post");
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchPost();
  }, [id]);

  const showSuccessToast = (message: string) => {
    setSuccessToast({ show: true, message });
    setTimeout(() => {
      setSuccessToast({ show: false, message: "" });
    }, 3000);
  };

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  // Handle slug input with real-time sanitization
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawSlug = e.target.value;
    // Allow typing but sanitize (convert spaces to hyphens in real-time)
    const sanitized = rawSlug
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/-+/g, '-');
    
    setForm(prev => ({ ...prev, slug: sanitized }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    // Final slug sanitization before submit
    const finalSlug = cleanSlug(form.slug);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", editorRef.current?.getHTML() || "");
    formData.append("category", form.category);
    formData.append("slug", finalSlug);
    formData.append("metaDescription", form.metaDescription);
    if (file) formData.append("image", file);

    try {
      const token = Cookies.get("admin_token") || Cookies.get("token");
      if (!token) throw new Error("Please login again");

      const res = await fetch(`${API}/posts/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");

      showSuccessToast("Post updated successfully!");
      setTimeout(() => {
        router.push("/admin/manage");
      }, 2000);
    } catch (err: any) {
      showErrorMessage(err.message || "Failed to update post");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!deleteModal.commentId) return;

    const token = Cookies.get("admin_token") || Cookies.get("token");
    if (!token) {
      showErrorMessage("Please login again");
      return;
    }

    const res = await fetch(`${API}/comments/${deleteModal.commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const removeComment = (comments: any[]): any[] => {
        return comments
          .filter((c) => c._id !== deleteModal.commentId)
          .map((c) => ({
            ...c,
            replies: c.replies ? removeComment(c.replies) : [],
          }));
      };
      setComments(removeComment);
      showSuccessToast("Comment deleted successfully");
    }

    setDeleteModal({ open: false, commentId: null });
  };

  const CommentItem = React.memo(
    ({
      comment,
      depth = 0,
      onReplySuccess,
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

        const token = Cookies.get("admin_token") || Cookies.get("token");
        if (!token) {
          showErrorMessage("Please login again");
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
            return comments.map((c) => {
              if (c._id === comment._id) {
                return {
                  ...c,
                  replies: [...(c.replies || []), { ...newReply, replies: [] }],
                };
              }
              if (c.replies?.length) {
                return { ...c, replies: addReply(c.replies) };
              }
              return c;
            });
          };
          setComments((prev) => addReply(prev));
          cancelReply();
          onReplySuccess?.();
        }
      };

      return (
        <motion.div
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${depth > 0 ? "ml-6 border-l-2 border-blue-500 pl-4" : ""}`}
        >
          <div className="bg-gray-50 rounded-lg p-4 mb-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold flex-shrink-0">
                {comment.name[0].toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-gray-800">{comment.name}</span>
                  {comment.isAdmin && (
                    <span className="px-2 py-0.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded">
                      ADMIN
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700">{comment.message}</p>

                <div className="flex items-center gap-3 mt-2">
                  {!isReplying && (
                    <button
                      onClick={startReply}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      <Reply size={14} />
                      Reply
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteModal({ open: true, commentId: comment._id })}
                    className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>

                <AnimatePresence>
                  {isReplying && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3"
                    >
                      <textarea
                        ref={textareaRef}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your admin reply..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-gray-800"
                        rows={3}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={sendReply}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm flex items-center gap-1"
                        >
                          <Send size={14} />
                          Send
                        </button>
                        <button
                          onClick={cancelReply}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {comment.replies?.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply: any) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  depth={depth + 1}
                  onReplySuccess={onReplySuccess}
                />
              ))}
            </div>
          )}
        </motion.div>
      );
    }
  );
  CommentItem.displayName = "CommentItem";

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-500 w-12 h-12 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Toast - Top Right */}
      <AnimatePresence>
        {successToast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: 100 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -50, x: 100 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 max-w-md"
          >
            <CheckCircle size={24} className="flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Success!</p>
              <p className="text-sm text-green-50">{successToast.message}</p>
            </div>
            <button
              onClick={() => setSuccessToast({ show: false, message: "" })}
              className="text-white hover:text-green-100 transition"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast - Top Right */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: 100 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -50, x: 100 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 max-w-md"
          >
            <AlertCircle size={24} className="flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Error</p>
              <p className="text-sm text-red-50">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-white hover:text-red-100 transition"
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
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-3 mb-2">
          <FileText size={32} />
          <h1 className="text-3xl font-bold">Edit Post</h1>
        </div>
        <p className="text-indigo-100">Update your blog post content and settings</p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="xl:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title & Category */}
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={18} />
                    Post Title *
                  </div>
                </label>
                <input
                  type="text"
                  placeholder="Enter post title..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-800"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Link2 size={18} />
                    URL Slug
                  </div>
                </label>
                <div className="flex items-center">
                  <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">
                    /post/
                  </span>
                  <input
                    type="text"
                    placeholder="your-post-url-slug"
                    value={form.slug}
                    onChange={handleSlugChange}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-800"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Only lowercase letters, numbers, and hyphens allowed. Spaces will be converted to hyphens.
                </p>
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <AlignLeft size={18} />
                    Meta Description
                  </div>
                </label>
                <textarea
                  placeholder="Write a compelling description for search engines (150-160 characters recommended)..."
                  value={form.metaDescription}
                  onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                  rows={3}
                  maxLength={200}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-800 resize-none"
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    Used for SEO and social media previews
                  </p>
                  <p className={`text-xs ${form.metaDescription.length > 160 ? 'text-orange-500' : 'text-gray-500'}`}>
                    {form.metaDescription.length}/160
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Tag size={18} />
                    Category *
                  </div>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Technology, Lifestyle"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-800"
                />
              </div>
            </div>

            {/* Editor */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Content</h3>
              </div>
              <NovelEditor
                content={form.content}
                onChange={(html) => setForm((p) => ({ ...p, content: html }))}
                onCreate={({ editor }) => (editorRef.current = editor)}
              />
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                <div className="flex items-center gap-2">
                  <ImageIcon size={18} />
                  Featured Image
                </div>
              </label>

              {form.image && (
                <div className="mb-4">
                  <img
                    src={form.image}
                    alt="Current featured"
                    className="w-full max-w-md h-48 object-cover rounded-lg"
                  />
                  <p className="text-sm text-gray-500 mt-2">Current image</p>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">New image selected: {file.name}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Comments Sidebar */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-6">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4">
              <div className="flex items-center gap-2 text-white">
                <MessageCircle size={24} />
                <h2 className="text-xl font-bold">
                  Comments ({comments.length})
                </h2>
              </div>
            </div>

            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {comments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500">No comments yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment._id}
                      comment={comment}
                      onReplySuccess={() => {
                        showSuccessToast("Reply sent successfully!");
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal.open && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteModal({ open: false, commentId: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Delete Comment</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this comment and all its replies? This action
                cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ open: false, commentId: null })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteComment}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
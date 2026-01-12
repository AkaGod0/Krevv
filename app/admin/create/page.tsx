"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import dynamic from 'next/dynamic';
import type { Editor } from '@tiptap/react';
import { FileText, Image as ImageIcon, Tag, Sparkles, CheckCircle, AlertCircle, X, Link2, AlignLeft } from "lucide-react";

// Dynamic import (no SSR) + get editor instance
const NovelEditor = dynamic(() => import('@/components/NovelEditor'), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-2 text-gray-400">Loading editor...</p>
    </div>
  ),
});

const API = process.env.NEXT_PUBLIC_API_URL;

// Utility function to generate clean slugs
const generateSlug = (text: string): string => {
  if (!text) return "";
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')      // Remove special characters
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/-+/g, '-')            // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '')        // Remove leading/trailing hyphens
    .substring(0, 100);             // Limit length
};

// Utility function to clean/sanitize existing slugs
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

export default function CreatePostPage() {
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "",
    image: null as File | null,
    keywords: "",
    contentImages: [] as File[],
    slug: "",
    metaDescription: "",
  });

  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  // Reference to the editor instance
  const editorRef = useRef<Editor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    
    // If changing slug, sanitize it immediately
    if (name === "slug") {
      setForm({ ...form, [name]: cleanSlug(value) });
    } else {
      setForm({ ...form, [name]: files ? files[0] : value });
    }
  };

  // Handle title change with auto-slug generation
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const newSlug = generateSlug(title);
    
    setForm(prev => ({
      ...prev,
      title,
      // Auto-generate slug if slug is empty or was auto-generated from previous title
      slug: prev.slug === '' || prev.slug === generateSlug(prev.title) 
        ? newSlug 
        : prev.slug
    }));
  };

  // Handle direct slug input with sanitization
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

  const resetForm = () => {
    setForm({
      title: "",
      content: "",
      category: "",
      image: null,
      keywords: "",
      contentImages: [],
      slug: "",
      metaDescription: "",
    });
    
    // Clear editor content
    if (editorRef.current) {
      editorRef.current.commands.clearContent();
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Final slug sanitization before submit
    const finalSlug = cleanSlug(form.slug) || generateSlug(form.title);

    // Step 1: Collect all images + their blob URLs from editor
    const imageMap: { file: File; blobUrl: string }[] = [];

    editorRef.current?.state.doc.descendants((node: any) => {
      if (node.type.name === "image" && node.attrs.src.startsWith("blob:")) {
        const savedFile = node.attrs["data-file"];
        if (savedFile instanceof File) {
          imageMap.push({ file: savedFile, blobUrl: node.attrs.src });
        } else {
          fetch(node.attrs.src)
            .then(r => r.blob())
            .then(blob => {
              const file = new File([blob], `image-${Date.now()}.jpg`, { type: blob.type });
              imageMap.push({ file, blobUrl: node.attrs.src });
            });
        }
      }
    });

    await new Promise(resolve => setTimeout(resolve, 200));

    // Step 2: Upload post with TEMP content + files
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", "TEMP_CONTENT");
    formData.append("category", form.category);
    formData.append("keywords", form.keywords);
    formData.append("slug", finalSlug);
    formData.append("metaDescription", form.metaDescription);

    if (form.image) formData.append("image", form.image);

    imageMap.forEach(({ file }) => formData.append("contentImages", file));
    form.contentImages.forEach(file => formData.append("contentImages", file));

    try {
      const token = Cookies.get("admin_token") || Cookies.get("token");
      if (!token) throw new Error("Please login");

      const res = await fetch(`${API}/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create post");

      // Step 3: Replace blob URLs with real Cloudinary URLs
      let finalContent = editorRef.current?.getHTML() || "";

      imageMap.forEach(({ blobUrl }, index) => {
        const realUrl = data.contentImages?.[index];
        if (realUrl) {
          finalContent = finalContent.split(blobUrl).join(realUrl);
        }
      });

      // Step 4: Update post with REAL content
      const updateRes = await fetch(`${API}/posts/${data._id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: finalContent }),
      });

      if (!updateRes.ok) throw new Error("Failed to update content");

      // ✅ Show success modal
      setSuccessModal(true);
      
      // ✅ Reset form
      resetForm();

      // ✅ Auto-hide modal after 3 seconds
      setTimeout(() => {
        setSuccessModal(false);
      }, 3000);

    } catch (err: any) {
      setErrorModal({
        show: true,
        message: err.message || 'Failed to create post'
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Toast Modal - Top Right */}
      <AnimatePresence>
        {successModal && (
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
              <p className="text-sm text-green-50">Post created successfully</p>
            </div>
            <button
              onClick={() => setSuccessModal(false)}
              className="text-white hover:text-green-100 transition"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Modal */}
      <AnimatePresence>
        {errorModal.show && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setErrorModal({ show: false, message: "" })}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Error</h3>
              </div>

              <p className="text-gray-600 mb-6">{errorModal.message}</p>

              <button
                onClick={() => setErrorModal({ show: false, message: "" })}
                className="w-full px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-3 mb-2">
          <Sparkles size={32} />
          <h1 className="text-3xl font-bold">Create New Post</h1>
        </div>
        <p className="text-purple-100">
          Create engaging content for your blog
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-8 space-y-6"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <FileText size={18} />
              Post Title *
            </div>
          </label>
          <input
            type="text"
            name="title"
            placeholder="Enter an engaging title..."
            value={form.title}
            onChange={handleTitleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-800"
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
              name="slug"
              placeholder="your-post-url-slug"
              value={form.slug}
              onChange={handleSlugChange}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-800"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Auto-generated from title. Only lowercase letters, numbers, and hyphens allowed.
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
            name="metaDescription"
            placeholder="Write a compelling description for search engines (150-160 characters recommended)..."
            value={form.metaDescription}
            onChange={handleChange}
            rows={3}
            maxLength={200}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-800 resize-none"
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

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Tag size={18} />
              Category *
            </div>
          </label>
          <input
            type="text"
            name="category"
            placeholder="e.g., Technology, Lifestyle, Business"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-800"
          />
        </div>

        {/* Editor */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Content *
          </label>
          <div className="rounded-lg overflow-hidden border border-gray-300">
            <NovelEditor
              content={form.content}
              onChange={(html) => setForm(prev => ({ ...prev, content: html }))}
              onCreate={({ editor }) => { editorRef.current = editor; }}
            />
          </div>
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <ImageIcon size={18} />
              Featured Image
            </div>
          </label>
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              name="image" 
              accept="image/*"
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>
          {form.image && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {form.image.name}
            </p>
          )}
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Keywords (comma separated)
          </label>
          <input
            type="text"
            name="keywords"
            placeholder="e.g., technology, innovation, future"
            value={form.keywords}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-800"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Creating Post...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Create Post
            </>
          )}
        </button>
      </motion.form>
    </div>
  );
}
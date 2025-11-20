// admin/create/page.tsx
"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import dynamic from 'next/dynamic';
import type { Editor } from '@tiptap/react';

// Dynamic import (no SSR) + get editor instance
const NovelEditor = dynamic(() => import('@/components/NovelEditor'), {
  ssr: false,
  loading: () => <p className="p-8 text-center">Loading editor...</p>,
});

const API = process.env.NEXT_PUBLIC_API_URL;

export default function CreatePostPage() {
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "",
    image: null as File | null,
    keywords: "",
    contentImages: [] as File[],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // This is the key: reference to the editor instance
  const editorRef = useRef<Editor | null>(null);

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");

  // Step 1: Collect all images + their blob URLs from editor
  const imageMap: { file: File; blobUrl: string }[] = [];

  editorRef.current?.state.doc.descendants((node: any) => {
    if (node.type.name === "image" && node.attrs.src.startsWith("blob:")) {
      // Try to get original File if you saved it with data-file
      const savedFile = node.attrs["data-file"];
      if (savedFile instanceof File) {
        imageMap.push({ file: savedFile, blobUrl: node.attrs.src });
      } else {
        // Fallback: convert blob URL to File
        fetch(node.attrs.src)
          .then(r => r.blob())
          .then(blob => {
            const file = new File([blob], `image-${Date.now()}.jpg`, { type: blob.type });
            imageMap.push({ file, blobUrl: node.attrs.src });
          });
      }
    }
  });

  // Wait for any async blob → File conversions
  await new Promise(resolve => setTimeout(resolve, 200));

  // Step 2: Upload post with TEMP content + files
  const formData = new FormData();
  formData.append("title", form.title);
  formData.append("content", "TEMP_CONTENT"); // ← Don't send real HTML yet!
  formData.append("category", form.category);
  formData.append("keywords", JSON.stringify(form.keywords.split(",").map(k => k.trim()).filter(Boolean)));

  if (form.image) formData.append("image", form.image);

  // Add all editor images
  imageMap.forEach(({ file }) => formData.append("contentImages", file));

  // Add manual uploads too
  form.contentImages.forEach(file => formData.append("contentImages", file));

  try {
    const token = Cookies.get("token");
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

    // Step 4: Update post with REAL content (real image URLs)
    const updateRes = await fetch(`${API}/posts/${data._id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: finalContent }),
    });

    if (!updateRes.ok) throw new Error("Failed to update content");

    setMessage("Post Created Successfully with Images!");
    setTimeout(() => {
  setMessage("");
}, 4000); // Message disappears after 4 seconds
    setForm({
      title: "",
      content: "",
      category: "",
      image: null,
      keywords: "",
      contentImages: []
    });
    editorRef.current?.commands.clearContent();

  } catch (err: any) {
    setMessage("Error: " + err.message);
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 text-white p-4 sm:p-10">
      <motion.h1
        className="text-3xl sm:text-5xl font-extrabold text-center bg-gradient-to-r from-pink-400 to-purple-300 bg-clip-text text-transparent mb-8 sm:mb-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Create New Post
      </motion.h1>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-black/40 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-2xl border border-purple-700/40">
        <div className="grid gap-6">
          <input type="text" name="title" placeholder="Post Title" value={form.title} onChange={handleChange} required className="p-4 rounded-xl bg-white/90 text-black" />
          
          <input type="text" name="category" placeholder="Category" value={form.category} onChange={handleChange} required className="p-4 rounded-xl bg-white/90 text-black" />

          {/* Editor */}
          <div>
            <label className="block mb-3 text-lg font-medium">Content</label>
            <div className="rounded-xl overflow-hidden border border-purple-500/30">
              <NovelEditor
                content={form.content}
                onChange={(html) => setForm(prev => ({ ...prev, content: html }))}
                // This exposes the editor instance
                onCreate={({ editor }) => { editorRef.current = editor; }}
              />
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block mb-2">Featured Image</label>
            <input type="file" name="image" accept="image/*" onChange={handleChange} className="w-full text-gray-300" />
          </div>

          {/* Keywords */}
          <input type="text" name="keywords" placeholder="Keywords (comma separated)" value={form.keywords} onChange={handleChange} className="p-4 rounded-xl bg-white/90 text-black" />

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-xl font-bold text-xl"
          >
            {loading ? "Creating Post..." : "Create Post"}
          </motion.button>
        </div>
      </form>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`fixed top-20 right-5 px-6 py-3 rounded-xl text-lg font-medium ${message.includes("Success") ? "bg-green-600" : "bg-red-600"}`}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
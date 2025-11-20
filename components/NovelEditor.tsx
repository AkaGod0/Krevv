// components/NovelEditor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Heading from "@tiptap/extension-heading";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";


import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListOrderedIcon,
  ListIcon,
  Link2Icon,
  ImageIcon,
  CodeIcon,
  QuoteIcon,
} from "lucide-react";

import type { Editor } from "@tiptap/react";

interface NovelEditorProps {
  content: string;
  onChange: (html: string) => void;
  onCreate?: ({ editor }: { editor: Editor }) => void;
}

const NovelEditor = ({ content, onChange, onCreate }: NovelEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),

      Heading.configure({
        levels: [1, 2, 3],
      }),

      BulletList,
      OrderedList,
      ListItem,

   
      Typography,

      Placeholder.configure({
        placeholder: "Start writing your article...",
      }),

      Image.configure({
        HTMLAttributes: {
          class:
            "rounded-lg my-8 max-w-full h-auto border border-gray-200 shadow-sm cursor-pointer",
        },
        allowBase64: true,
        inline: false,
      }),

      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
          target: "_blank",
        },
      }),

      Underline,
    ],

    immediatelyRender: false,
    content,

    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none p-8 min-h-96 focus:outline-none bg-white text-black prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-a:text-blue-600 prose-img:rounded-xl prose-img:shadow-md prose-img:my-10",
      },
    },

    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onCreate: ({ editor }) => onCreate?.({ editor }),
  });

  const addImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          editor?.chain().focus().setImage({ src: ev.target?.result as string }).run();
        };
        reader.readAsDataURL(file);
      });
    };

    input.click();
  };

  const setLink = () => {
    const url = window.prompt("Enter URL:", editor?.getAttributes("link").href || "");
    if (url === null) return;
    if (url === "") editor?.chain().focus().unsetLink().run();
    else editor?.chain().focus().setLink({ href: url }).run();
  };

  if (!editor)
    return <div className="p-10 text-center text-gray-500">Loading editor...</div>;

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Bold */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2.5 rounded-lg transition-all ${
              editor.isActive("bold")
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            <BoldIcon className="w-5 h-5" />
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2.5 rounded-lg transition-all ${
              editor.isActive("italic")
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            <ItalicIcon className="w-5 h-5" />
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2.5 rounded-lg transition-all ${
              editor.isActive("underline")
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            <UnderlineIcon className="w-5 h-5" />
          </button>

          <div className="w-px h-8 bg-gray-300 mx-2" />

          {/* Headings */}
          <button
          type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
              editor.isActive("heading", { level: 1 })
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            H1
          </button>

          <button
          type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
              editor.isActive("heading", { level: 2 })
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            H2
          </button>

          <button
          type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
              editor.isActive("heading", { level: 3 })
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            H3
          </button>

          <div className="w-px h-8 bg-gray-300 mx-2" />

          {/* Ordered List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2.5 rounded-lg transition-all ${
              editor.isActive("orderedList")
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            <ListOrderedIcon className="w-5 h-5" />
          </button>

          {/* Bullet List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2.5 rounded-lg transition-all ${
              editor.isActive("bulletList")
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            <ListIcon className="w-5 h-5" />
          </button>

          <div className="w-px h-8 bg-gray-300 mx-2" />

          {/* Quote */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2.5 rounded-lg transition-all ${
              editor.isActive("blockquote")
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            <QuoteIcon className="w-5 h-5" />
          </button>

          {/* Code Block */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2.5 rounded-lg transition-all ${
              editor.isActive("codeBlock")
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            <CodeIcon className="w-5 h-5" />
          </button>

          {/* Right side actions */}
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={setLink}
              className={`p-2.5 rounded-lg transition-all ${
                editor.isActive("link")
                  ? "bg-purple-600 text-white"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              <Link2Icon className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={addImage}
              className="p-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="min-h-96 bg-white" />

      {/* Image Hover Controls */}
      <style jsx global>{`
        .ProseMirror img {
          position: relative;
          transition: outline 0.2s;
        }
        .ProseMirror img:hover {
          outline: 4px solid rgba(99, 102, 241, 0.5);
        }
      `}</style>
    </div>
  );
};

export default NovelEditor;

"use client";

import { useState } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { api, useAuth } from "@/app/context/AuthContext";

interface StartChatButtonProps {
  developerId: string;
  serviceId?: string;
  className?: string;
  variant?: "primary" | "secondary";
}

export default function StartChatButton({
  developerId,
  serviceId,
  className = "",
  variant = "primary",
}: StartChatButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleStartChat = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      
      // Create or get conversation
      const res = await api.post('/chat/conversations/start', {
        developerId,
        serviceId,
      });

      // Navigate to chat
     router.push(`/marketplace/chat/${res.data._id}`);
    } catch (err) {
      console.error('Error starting chat:', err);
      alert('Failed to start chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const baseStyles = "flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-xl transition-all shadow-lg";
  
  const variantStyles = variant === "primary"
    ? "bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white"
    : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-200";

  return (
    <button
      onClick={handleStartChat}
      disabled={loading}
      className={`${baseStyles} ${variantStyles} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? (
        <>
          <Loader2 size={20} className="animate-spin" />
          <span>Starting Chat...</span>
        </>
      ) : (
        <>
          <MessageCircle size={20} />
          <span>Chat with Developer</span>
        </>
      )}
    </button>
  );
}
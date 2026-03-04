"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Search,
  Loader2,
  User,
  Building2,
  Sparkles,
  ChevronRight,
  Inbox,
  Zap,
  Clock,
} from "lucide-react";
import { useAuth, api } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Conversation {
  _id: string;
  developerId: string;  // ObjectId as string in frontend
  developer?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    email?: string;
  };
  developerModel: 'User' | 'Company';
  clientId: string;  // ObjectId as string in frontend
  client?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    email?: string;
  };
  clientModel: 'User' | 'Company';
  serviceId?: string;  // ObjectId as string in frontend
  service?: {
    _id: string;
    title: string;
    category: string;
    budget: number;
  };
  lastMessageText?: string;
  lastMessageAt?: string;
  unreadByDeveloper: number;
  unreadByClient: number;
}

export default function ChatListPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchConversations();
    }
  }, [user, authLoading]);

 const fetchConversations = async () => {
  try {
    setLoading(true);
    const res = await api.get('/chat/conversations');
    console.log('🔍 Conversations data:', JSON.stringify(res.data[0], null, 2)); // ADD THIS
    setConversations(res.data || []);
  } catch (err) {
    console.error('Error fetching conversations:', err);
  } finally {
    setLoading(false);
  }
};

  const filteredConversations = conversations.filter((conv) => {
    const q = searchTerm.toLowerCase();
    
    const developer = conv.developer || { companyName: '', firstName: '', lastName: '' };
    const developerName = conv.developerModel === 'Company'
      ? developer.companyName
      : `${developer.firstName} ${developer.lastName}`;
    
    const client = conv.client || { companyName: '', firstName: '', lastName: '' };
    const clientName = conv.clientModel === 'Company'
      ? client.companyName
      : `${client.firstName} ${client.lastName}`;
    
    const serviceTitle = conv.service?.title || '';
    
    return (
      developerName?.toLowerCase().includes(q) ||
      clientName?.toLowerCase().includes(q) ||
      serviceTitle.toLowerCase().includes(q) ||
      conv.lastMessageText?.toLowerCase().includes(q)
    );
  });
const getOtherPerson = (conv: Conversation) => {
  const myId = user?._id?.toString() || (user as any)?.id?.toString() || '';
  
  // ✅ conv.developerId is a raw string ObjectId from backend
  const isDeveloper = conv.developerId?.toString() === myId;

  if (isDeveloper) {
    // I am the developer, show the client
    const client = conv.client || {}; // ✅ populated object is in conv.client
    return {
      name: conv.clientModel === 'Company'
        ? (client.companyName || 'Unknown Company')
        : `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Unknown Client',
      type: conv.clientModel,
      role: 'CLIENT' as const,
      unread: conv.unreadByDeveloper,
    };
  } else {
    // I am the client, show the developer
    const developer = conv.developer || {}; // ✅ populated object is in conv.developer
    return {
      name: conv.developerModel === 'Company'
        ? (developer.companyName || 'Unknown Company')
        : `${developer.firstName || ''} ${developer.lastName || ''}`.trim() || 'Unknown Developer',
      type: conv.developerModel,
      role: 'DEVELOPER' as const,
      unread: conv.unreadByClient,
    };
  }
};

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-violet-500 w-9 h-9 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8 px-3 sm:px-5 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-5 sm:mb-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Messages
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none text-sm text-slate-800 placeholder:text-slate-400 shadow-sm"
            />
          </div>
        </div>

        {/* Empty State */}
        {filteredConversations.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center"
          >
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Inbox size={26} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">
              {searchTerm ? "No results" : "No conversations yet"}
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              {searchTerm
                ? "Try adjusting your search"
                : "Start chatting with developers on the marketplace"}
            </p>
            {!searchTerm && (
              <Link href="/marketplace">
                <button className="px-6 py-3 bg-slate-900 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-colors">
                  Browse Services
                </button>
              </Link>
            )}
          </motion.div>
        )}

        {/* Conversation List */}
        <div className="space-y-2.5">
          {filteredConversations.map((conv, idx) => {
            const other = getOtherPerson(conv);
            const initials = other.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';
           const key = conv._id || `conv-${idx}`;
            return (
              <motion.div
                key={key} 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-shadow hover:shadow-md ${
                  other.unread > 0 ? 'border-red-200' : 'border-slate-100 hover:border-violet-200'
                }`}
              >
               <Link href={`/marketplace/chat/${conv._id}`}>
                  <div className="p-4 sm:p-5 cursor-pointer group">
                    <div className="flex items-start gap-3 sm:gap-4">
                      
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                          {initials}
                        </div>
                        {other.unread > 0 && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white font-black rounded-full flex items-center justify-center border-2 border-white shadow text-[10px]">
                            {other.unread > 9 ? '9+' : other.unread}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                            <h3 className={`text-sm sm:text-base font-bold truncate group-hover:text-violet-600 transition-colors ${
                              other.unread > 0 ? 'text-slate-900' : 'text-slate-700'
                            }`}>
                              {other.name}
                            </h3>
                            
                            {other.type === 'Company' && (
                              <Building2 size={13} className="text-violet-400 flex-shrink-0" />
                            )}

                            {/* Role Badge */}
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black border ${
                              other.role === 'DEVELOPER'
                                ? 'bg-purple-100 text-purple-700 border-purple-300'
                                : 'bg-green-100 text-green-700 border-green-300'
                            }`}>
                              {other.role === 'DEVELOPER' ? <Zap size={9} /> : <User size={9} />}
                              {other.role}
                            </span>

                            {other.unread > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-full">
                                <MessageCircle size={9} />
                                {other.unread} new
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {conv.lastMessageAt && (
                              <span className="text-[10px] text-slate-400 hidden sm:block">
                                {new Date(conv.lastMessageAt).toLocaleDateString()}
                              </span>
                            )}
                            <ChevronRight size={15} className="text-slate-300 group-hover:text-violet-500 transition-colors" />
                          </div>
                        </div>

                        {/* Service Badge */}
                        {conv.service && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-violet-50 text-violet-700 border border-violet-100 rounded-lg text-[11px] font-semibold max-w-[180px] truncate">
                              <Sparkles size={9} className="flex-shrink-0" />
                              {conv.service.title}
                            </span>
                          </div>
                        )}

                        {/* Last Message */}
                        {conv.lastMessageText && (
                          <p className={`text-xs sm:text-sm truncate ${
                            other.unread > 0 ? 'text-slate-700 font-medium' : 'text-slate-500'
                          }`}>
                            {conv.lastMessageText}
                          </p>
                        )}

                        {conv.lastMessageAt && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                            <Clock size={10} />
                            {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
"use client";

import { use, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { api, getToken, useAuth } from "@/app/context/AuthContext";
import {
  Send, ArrowLeft, Loader2, User, Building2, Zap, DollarSign,
  CheckCircle, XCircle, Plus, ChevronDown, CreditCard, PartyPopper,
  Clock, AlertCircle,
} from "lucide-react";
import { io, Socket } from "socket.io-client";

interface Message {
  _id: string;
  conversationId: string;
  senderId: {
    _id?: string; firstName?: string; lastName?: string;
    companyName?: string; email?: string;
  };
  senderModel: 'User' | 'Company';
  text: string;
  messageType: 'text' | 'order_request' | 'system';
  orderRequest?: {
    title: string; description: string; price: number;
    deliveryTime: number; status: 'pending' | 'accepted' | 'declined' | 'paid';
    orderId?: string;
  };
  timestamp: string;
}

interface Conversation {
  _id: string;
  developerId: string;
  developer?: { _id?: string; firstName?: string; lastName?: string; companyName?: string; email?: string; };
  developerModel: 'User' | 'Company';
  clientId: string;
  client?: { _id?: string; firstName?: string; lastName?: string; companyName?: string; email?: string; };
  clientModel: 'User' | 'Company';
  service?: { _id: string; title: string; category: string; budget: number; };
  lastMessageText?: string;
  lastMessageAt?: string;
  unreadByDeveloper: number;
  unreadByClient: number;
}

// ── Validation Error Modal ────────────────────────────────────────────────────
function ValidationModal({ errors, onClose }: { errors: string[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-red-50 to-rose-50 border-b-2 border-red-200 px-5 py-5 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md">
            <AlertCircle size={30} className="text-red-500" />
          </div>
          <h3 className="text-base font-black text-gray-900">Please fill in all fields</h3>
        </div>
        {/* Body */}
        <div className="px-5 py-5">
          <ul className="space-y-2 mb-5">
            {errors.map((err, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2 font-semibold">
                <XCircle size={15} className="flex-shrink-0" /> {err}
              </li>
            ))}
          </ul>
          <button onClick={onClose}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors text-sm">
            Got it
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ChatRoomContent({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderForm, setOrderForm] = useState({ title: "", description: "", price: "", deliveryTime: "7" });

  // ── Validation modal state ────────────────────────────────────────────────
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const showValidation = validationErrors.length > 0;

  const myId = user?._id?.toString() || (user as any)?.id?.toString() || '';
  const isDeveloper = conversation?.developerId?.toString() === myId;

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (user) { fetchConversationAndMessages(); initializeSocket(); }
    return () => { if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; } };
  }, [user, authLoading, conversationId]);

  useEffect(() => {
    const paid = searchParams.get('paid');
    const paidOrderId = searchParams.get('orderId');
    if (paid === 'true' && paidOrderId && messages.length > 0) {
      setMessages((prev) => prev.map((m) =>
        m.orderRequest?.orderId === paidOrderId
          ? { ...m, orderRequest: { ...m.orderRequest!, status: 'paid' } } : m
      ));
    }
  }, [searchParams, messages.length]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const fetchConversationAndMessages = async () => {
    try {
      setLoading(true);
      const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = getToken();
      const probe = await fetch(`${BASE}/chat/conversations/${conversationId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });

      if (probe.ok) {
        const [convoRes, messagesRes] = await Promise.all([
          api.get(`/chat/conversations/${conversationId}`),
          api.get(`/chat/conversations/${conversationId}/messages`),
        ]);
        setConversation(convoRes.data);
        setMessages(messagesRes.data || []);
        await api.post(`/chat/conversations/${conversationId}/read`).catch(() => {});
        return;
      }

      if (probe.status !== 404) { console.error("Unexpected error:", probe.status); return; }
    
      // Check if conversationId is an order ID (prefixed with "order-")
if (conversationId.startsWith('order-')) {
  const actualOrderId = conversationId.replace('order-', '');
  console.log('[Chat] Detected order ID:', actualOrderId);
  
  try {
    const orderRes = await api.get(`/marketplace/orders/${actualOrderId}`);
    const order = orderRes.data?.data || orderRes.data;
    console.log('[Chat] Found order:', order);
    
    // If order has conversationId, use it directly
    if (order.conversationId) {
      console.log('[Chat] Order has conversationId, fetching conversation:', order.conversationId);
      try {
        const convRes = await api.get(`/chat/conversations/${order.conversationId}`);
        setConversation(convRes.data);
        const messagesRes = await api.get(`/chat/conversations/${order.conversationId}/messages`);
        setMessages(messagesRes.data || []);
        await api.post(`/chat/conversations/${order.conversationId}/read`).catch(() => {});
        return;
      } catch (convErr) {
        console.error('[Chat] Failed to fetch conversation by ID:', convErr);
      }
    }
    
    // Fallback: Fetch all conversations and search
    console.log('[Chat] No conversationId on order, searching all conversations...');
    const allConvosRes = await api.get('/chat/conversations');
    const allConvos = allConvosRes.data || [];
    console.log('[Chat] Total conversations available:', allConvos.length);
    
    const serviceId = order.serviceId?._id || order.serviceId;
    const developerId = order.developerId?._id || order.developerId;
    const clientId = order.clientId?._id || order.clientId;
    
    console.log('[Chat] Looking for conversation with:', {
      serviceId,
      developerId,
      clientId,
      myId: user?._id || (user as any)?.id
    });
    
    // Debug: Log all conversations to see structure
    allConvos.forEach((c: any, i: number) => {
      console.log(`[Chat] Conversation ${i}:`, {
        _id: c._id,
        serviceId: c.serviceId?._id || c.serviceId,
        developerId: c.developerId?._id || c.developerId,
        clientId: c.clientId?._id || c.clientId,
      });
    });
    
    // Find conversation matching this order
  // Find conversation matching this order
const matchingConvo = allConvos.find((c: any) => {
  const convDeveloperId = c.developerId?._id || c.developerId || c.developer?._id;
  const convClientId = c.clientId?._id || c.clientId || c.client?._id;
  
  const devMatch = convDeveloperId?.toString() === developerId?.toString();
  const clientMatch = convClientId?.toString() === clientId?.toString();
  
  console.log(`[Chat] Checking conversation ${c._id}:`, {
    devMatch,
    clientMatch,
    bothMatch: devMatch && clientMatch  // ← Changed from requiring serviceMatch too
  });
  
  // ✅ Just match developer + client (no serviceId check since it's undefined)
  return devMatch && clientMatch;
});
    
    if (matchingConvo) {
      console.log('[Chat] ✅ Found matching conversation:', matchingConvo._id);
      setConversation(matchingConvo);
      const messagesRes = await api.get(`/chat/conversations/${matchingConvo._id}/messages`);
      setMessages(messagesRes.data || []);
      await api.post(`/chat/conversations/${matchingConvo._id}/read`).catch(() => {});
      return;
    }
    
    // If still no match, try creating a new conversation as fallback
    console.log('[Chat] No matching conversation found, attempting to create one...');
    const startRes = await api.post('/chat/conversations/start', {
      developerId: developerId.toString(),
      serviceId: serviceId.toString(),
    });
    const newConversation = startRes.data;
    console.log('[Chat] Created new conversation:', newConversation._id);
    
    // Redirect to the new conversation ID
    router.replace(`/marketplace/chat/${newConversation._id}`);
    return;
    
  } catch (err) {
    console.error('[Chat] Error handling order ID:', err);
    setLoading(false);
    return;
  }
}

      // If not an order, try fetching as service ID
      const serviceRes = await api.get(`/marketplace/services/${conversationId}`);
      const service = serviceRes.data?.data || serviceRes.data;
      const developerId = service?.clientId?._id || service?.clientId;
      if (!developerId) { console.error('Could not resolve developerId'); return; }

      const startRes = await api.post('/chat/conversations/start', {
        developerId: developerId.toString(), serviceId: conversationId,
      });
      const realConversationId = startRes.data?._id;
      if (realConversationId) router.replace(`/marketplace/chat/${realConversationId}`);
    } catch (err) {
      console.error('Error fetching conversation:', err);
    } finally {
      setLoading(false);
    }
  };

  const initializeSocket = () => {
    const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const socket = io(`${SOCKET_URL}/chat`, { transports: ["polling", "websocket"], reconnection: true });
    socket.on("connect", () => socket.emit("joinConversation", { conversationId }));
    socket.on("newMessage", (message: Message) => {
      setMessages((prev) => prev.some((m) => m._id === message._id) ? prev : [...prev, message]);
    });
    socketRef.current = socket;
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || sending) return;
    const text = messageText.trim();
    setMessageText("");
    setSending(true);
    try {
      const res = await api.post(`/chat/conversations/${conversationId}/messages`, { text });
      const newMsg = res.data.message;
      setMessages((prev) => prev.some((m) => m._id === newMsg._id) ? prev : [...prev, newMsg]);
      if (socketRef.current?.connected) socketRef.current.emit("sendMessage", { conversationId, message: newMsg });
    } catch (err) {
      console.error('Error sending message:', err);
      setMessageText(text);
    } finally {
      setSending(false);
    }
  };

  // ── Validate & send custom order ─────────────────────────────────────────
  const sendOrderRequest = async () => {
    // Collect all missing fields
    const errors: string[] = [];
    if (!orderForm.title.trim())       errors.push("Order title is required");
    if (!orderForm.description.trim()) errors.push("Description is required");
    if (!orderForm.price || parseFloat(orderForm.price) <= 0) errors.push("A valid price is required");
    if (!orderForm.deliveryTime || parseInt(orderForm.deliveryTime) <= 0) errors.push("Delivery time (days) is required");

    if (errors.length > 0) {
      setValidationErrors(errors);
      return; // ← block send
    }

    try {
      const res = await api.post(`/chat/conversations/${conversationId}/order-request`, {
        title: orderForm.title,
        description: orderForm.description,
        price: parseFloat(orderForm.price),
        deliveryTime: parseInt(orderForm.deliveryTime),
      });
      const newMsg = res.data.message;
      setMessages((prev) => prev.some((m) => m._id === newMsg._id) ? prev : [...prev, newMsg]);
      setShowOrderForm(false);
      setOrderForm({ title: "", description: "", price: "", deliveryTime: "7" });
      if (socketRef.current?.connected) socketRef.current.emit("sendMessage", { conversationId, message: newMsg });
    } catch (err) {
      console.error('Error sending order request:', err);
      setValidationErrors(["Failed to send order request. Please try again."]);
    }
  };

  const acceptOrderRequest = async (messageId: string, price: number) => {
    try {
      const res = await api.post(`/chat/messages/${messageId}/accept-order`);
      setMessages((prev) => prev.map((m) =>
        m._id === messageId ? { ...m, orderRequest: { ...m.orderRequest!, status: 'accepted' } } : m
      ));
      if (res.data.orderId) router.push(`/marketplace/tasks/${res.data.orderId}/checkout?source=chat`);
    } catch (err) {
      console.error('Error accepting order:', err);
    }
  };

  const declineOrderRequest = async (messageId: string) => {
    try {
      await api.post(`/chat/messages/${messageId}/decline-order`);
      setMessages((prev) => prev.map((m) =>
        m._id === messageId ? { ...m, orderRequest: { ...m.orderRequest!, status: 'declined' } } : m
      ));
    } catch (err) {
      console.error('Error declining order:', err);
    }
  };

  const getOtherPerson = (conv: Conversation) => {
    const myId = user?._id?.toString() || (user as any)?.id?.toString() || '';
    const isDev = conv.developerId?.toString() === myId;
    if (isDev) {
      const client = conv.client || {};
      return {
        name: conv.clientModel === 'Company' ? (client.companyName || 'Unknown Company') : `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Unknown Client',
        type: conv.clientModel, role: 'CLIENT' as const, unread: conv.unreadByDeveloper,
      };
    } else {
      const developer = conv.developer || {};
      return {
        name: conv.developerModel === 'Company' ? (developer.companyName || 'Unknown Company') : `${developer.firstName || ''} ${developer.lastName || ''}`.trim() || 'Unknown Developer',
        type: conv.developerModel, role: 'DEVELOPER' as const, unread: conv.unreadByClient,
      };
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <Loader2 className="animate-spin text-violet-500 w-12 h-12 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading chat...</p>
        </motion.div>
      </div>
    );
  }

  const other = conversation ? getOtherPerson(conversation) : { name: 'Loading...', type: 'User' as const, role: 'DEVELOPER' as const, unread: 0 };
  const initials = other.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  // Field border helper — red if that field is in error
  const fieldHasError = (field: string) =>
    validationErrors.some(e => e.toLowerCase().includes(field.toLowerCase()));
  const fieldBorder = (field: string) =>
    fieldHasError(field) ? 'border-red-400 bg-red-50' : 'border-purple-200';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto h-screen flex flex-col">

        {/* Header */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
          <div className="px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <button onClick={() => router.push('/marketplace/chat/chat-list')}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                  <ArrowLeft size={20} className="text-gray-700" />
                </button>
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-xl">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-black text-gray-900 text-base sm:text-lg truncate">{other.name}</h2>
                      {other.type === 'Company' && <Building2 size={16} className="text-violet-400" />}
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${other.role === 'DEVELOPER' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                        {other.role === 'DEVELOPER' ? <Zap size={9} className="inline mr-1" /> : <User size={9} className="inline mr-1" />}
                        {other.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {isDeveloper && (
                <button onClick={() => setShowOrderForm(!showOrderForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all text-sm">
                  <Plus size={16} />
                  {/* ✅ Updated label */}
                  <span className="hidden sm:inline">Send Custom Order</span>
                  <span className="sm:hidden">Order</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Custom Order Form ── */}
        <AnimatePresence>
          {showOrderForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-purple-50 border-b border-purple-200 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 space-y-3">
                {/* ✅ Updated heading */}
                <h3 className="font-bold text-gray-900">Send Custom Order</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Title */}
                  <div>
                    <input type="text" placeholder="Order Title *"
                      value={orderForm.title}
                      onChange={(e) => setOrderForm({ ...orderForm, title: e.target.value })}
                      className={`w-full px-4 py-2 rounded-xl border-2 focus:border-purple-500 outline-none transition-colors ${fieldBorder('title')}`}
                    />
                    {fieldHasError('title') && <p className="text-xs text-red-500 mt-1 pl-1">Title is required</p>}
                  </div>
                  {/* Price */}
                  <div>
                    <input type="number" placeholder="Price ($) *"
                      value={orderForm.price}
                      onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })}
                      className={`w-full px-4 py-2 rounded-xl border-2 focus:border-purple-500 outline-none transition-colors ${fieldBorder('price')}`}
                    />
                    {fieldHasError('price') && <p className="text-xs text-red-500 mt-1 pl-1">Valid price is required</p>}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <textarea placeholder="Description *"
                    value={orderForm.description}
                    onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })}
                    rows={2}
                    className={`w-full px-4 py-2 rounded-xl border-2 focus:border-purple-500 outline-none resize-none transition-colors ${fieldBorder('description')}`}
                  />
                  {fieldHasError('description') && <p className="text-xs text-red-500 mt-1 pl-1">Description is required</p>}
                </div>

                <div className="flex gap-3 items-start">
                  {/* Delivery days */}
                  <div className="flex-1">
                    <input type="number" placeholder="Delivery Days *"
                      value={orderForm.deliveryTime}
                      onChange={(e) => setOrderForm({ ...orderForm, deliveryTime: e.target.value })}
                      className={`w-full px-4 py-2 rounded-xl border-2 focus:border-purple-500 outline-none transition-colors ${fieldBorder('delivery')}`}
                    />
                    {fieldHasError('delivery') && <p className="text-xs text-red-500 mt-1 pl-1">Delivery days required</p>}
                  </div>
                  <button onClick={sendOrderRequest}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors whitespace-nowrap">
                    Send Order
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => {
              const myId = user?._id?.toString() || (user as any)?.id?.toString() || '';
              const isMine = message.senderId?._id?.toString() === myId || (message.senderId as any)?.toString() === myId;
              const senderRole = (message.senderId as any)?._id?.toString() === conversation?.developerId?.toString() ? 'DEVELOPER' : 'CLIENT';
              const senderName = (message.senderId as any)?.firstName || (message.senderId as any)?.companyName || '';

              if (message.messageType === 'order_request') {
                const platformFee = message.orderRequest!.price * 0.05;
                const total = message.orderRequest!.price + platformFee;
                const status = message.orderRequest?.status;
                const isPending = status === 'pending';
                const isAccepted = status === 'accepted';
                const isDeclined = status === 'declined';
                const isPaid = status === 'paid';

                return (
                  <motion.div key={message._id} initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ delay: index * 0.05 }} className="flex justify-center">
                    <div className={`rounded-2xl shadow-xl p-6 max-w-md w-full border-2 ${
                      isPaid ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                      : isDeclined ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'
                      : 'bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 border-purple-300'}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                          isPaid ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                          : isDeclined ? 'bg-gradient-to-br from-red-400 to-rose-500'
                          : 'bg-gradient-to-br from-purple-500 to-indigo-600'}`}>
                          {isPaid ? <PartyPopper size={24} className="text-white" />
                            : isDeclined ? <XCircle size={24} className="text-white" />
                            : <DollarSign size={24} className="text-white" />}
                        </div>
                        <div>
                          <h4 className="font-black text-gray-900 text-lg">Custom Order</h4>
                          <p className="text-xs text-gray-600">{message.orderRequest!.title}</p>
                        </div>
                      </div>
                      <div className="bg-white/50 rounded-xl p-4 mb-4">
                        <p className="text-sm text-gray-700">{message.orderRequest!.description}</p>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="text-gray-600 flex items-center gap-1"><Clock size={13} /> Delivery</span>
                          <span className="font-bold">{message.orderRequest!.deliveryTime} days</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-4 mb-4 space-y-2">
                        <div className="flex justify-between text-sm"><span>Order Amount</span><span className="font-bold">${message.orderRequest!.price}</span></div>
                        <div className="flex justify-between text-sm text-gray-600"><span>Platform Fee (5%)</span><span>+${platformFee.toFixed(2)}</span></div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="font-bold">Total</span>
                          <span className={`text-2xl font-black ${isPaid ? 'text-green-600' : 'text-purple-600'}`}>${total.toFixed(2)}</span>
                        </div>
                      </div>
                      {isPending && !isMine && (
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => acceptOrderRequest(message._id, message.orderRequest!.price)}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:from-purple-700 hover:to-indigo-800 transition-all">
                            <CheckCircle size={16} /> Accept & Pay
                          </button>
                          <button onClick={() => declineOrderRequest(message._id)}
                            className="px-4 py-3 bg-red-100 text-red-700 font-bold rounded-xl border-2 border-red-300 hover:bg-red-200 transition-all">
                            Decline
                          </button>
                        </div>
                      )}
                      {isPending && isMine && (
                        <div className="p-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl flex items-center justify-center gap-2">
                          <Clock size={16} className="text-yellow-600" />
                          <span className="text-sm font-bold text-yellow-800">Awaiting client response</span>
                        </div>
                      )}
                      {isAccepted && (
                        <div className="space-y-3">
                          <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center justify-center gap-2">
                            <CreditCard size={16} className="text-blue-600" />
                            <span className="text-sm font-bold text-blue-800">Accepted — Payment Pending</span>
                          </div>
                          {!isMine && (
                            <button onClick={() => router.push(`/marketplace/tasks/${message.orderRequest!.orderId}/checkout?source=chat`)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white font-bold rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-800 transition-all">
                              <CreditCard size={16} /> Pay Now
                            </button>
                          )}
                        </div>
                      )}
                      {isPaid && (
                        <div className="p-4 bg-green-100 border-2 border-green-300 rounded-xl flex items-center justify-center gap-3">
                          <PartyPopper size={20} className="text-green-600" />
                          <div className="text-center">
                            <p className="text-sm font-black text-green-800">Payment Successful!</p>
                            <p className="text-xs text-green-600 mt-0.5">Funds held in escrow · Developer notified</p>
                          </div>
                        </div>
                      )}
                      {isDeclined && (
                        <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl flex items-center justify-center gap-2">
                          <XCircle size={16} className="text-red-600" />
                          <span className="text-sm font-bold text-red-800">Order Declined</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div key={message._id} initial={{ opacity: 0, x: isMine ? 30 : -30 }}
                  animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] sm:max-w-md ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className="flex items-center gap-2 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-black border ${
                        senderRole === 'DEVELOPER' ? 'bg-purple-100 text-purple-700 border-purple-300' : 'bg-green-100 text-green-700 border-green-300'}`}>
                        {senderRole === 'DEVELOPER' ? <Zap size={9} /> : <User size={9} />}
                        {senderRole} - {senderName}
                      </span>
                    </div>
                    <div className={`px-6 py-4 rounded-3xl shadow-lg ${
                      isMine ? 'bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-tr-md'
                      : 'bg-white text-gray-900 border-2 border-gray-100 rounded-tl-md'}`}>
                      <p className="text-sm leading-relaxed font-medium">{message.text}</p>
                      <div className={`text-[11px] mt-2 ${isMine ? 'text-blue-200' : 'text-gray-500'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white/90 backdrop-blur-xl border-t-2 border-gray-200/50 p-4 sm:p-5 shadow-2xl">
          <form onSubmit={sendMessage} className="flex items-center gap-3">
            <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage(e as any))}
              placeholder="Type your message..." rows={1}
              className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none resize-none font-medium text-sm text-gray-900 placeholder-gray-400 transition-all shadow-inner"
            />
            <button type="submit" disabled={!messageText.trim() || sending}
              className="px-7 py-4 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 disabled:from-gray-300 disabled:to-gray-400 text-white font-black rounded-2xl shadow-xl transition-all disabled:cursor-not-allowed flex items-center gap-2">
              {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>

        {messages.length > 5 && (
          <button onClick={scrollToBottom}
            className="fixed bottom-28 right-8 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center">
            <ChevronDown size={24} />
          </button>
        )}
      </div>

      {/* ── Validation Error Modal ── */}
      <AnimatePresence>
        {showValidation && (
          <ValidationModal errors={validationErrors} onClose={() => setValidationErrors([])} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ChatRoomPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = use(params);
  return <ChatRoomContent conversationId={conversationId} />;
}
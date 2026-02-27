"use client";

import { JSX, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Search,
  Loader2,
  Clock,
  DollarSign,
  Package,
  CheckCircle,
  User,
  Building2,
  Sparkles,
  ChevronRight,
  Filter,
  AlertCircle,
  Mail,
  Bell,
  X,
  Layers,
} from "lucide-react";
import { useAuth, api } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNotifications } from "@/app/hooks/useNotifications";

interface OrderEntry {
  orderId: string;
  orderTitle: string;
  orderStatus: string;
  orderAmount: number;
  serviceId: string;
  serviceTitle: string;
  serviceCategory: string;
  paidAt?: string;
}

// ✅ Grouped chat — one per client, containing all their orders/services
interface GroupedChat {
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientType: "User" | "Company";
  orders: OrderEntry[];
  totalAmount: number;
  unreadCount: number;
  lastMessageTime?: string;
  // The primary serviceId to use for chat navigation (most recent active order)
  primaryServiceId: string;
}

export default function ChatsListPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { unreadCount, unreadMessages, markAsRead } = useNotifications(user?._id);

  const [chats, setChats] = useState<GroupedChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showNotification, setShowNotification] = useState(false);
  const [expandedChats, setExpandedChats] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) fetchChats();
  }, [user, authLoading]);

  useEffect(() => {
    if (unreadMessages.length > 0) {
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [unreadMessages.length]);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const servicesRes = await api.get("/marketplace/my-services");
      const services = servicesRes.data || [];

      // Map: clientId → GroupedChat
      const clientMap = new Map<string, GroupedChat>();

      for (const service of services) {
        try {
          const ordersRes = await api.get(`/marketplace/services/${service._id}/orders`);
          const orders = ordersRes.data || [];

          const paidOrders = orders.filter((o: any) =>
            ["paid", "in_progress", "delivered", "completed"].includes(o.status)
          );

          for (const order of paidOrders) {
            const clientId =
              order.clientId?._id || order.clientId?.id || order.clientId || "unknown";

            const clientName =
              order.clientId?.companyName ||
              `${order.clientId?.firstName || ""} ${order.clientId?.lastName || ""}`.trim() ||
              "Client";

            const serviceUnreadCount = unreadMessages.filter(
              (n) => n.serviceId === service._id
            ).length;

            const orderEntry: OrderEntry = {
              orderId: order._id,
              orderTitle: order.title,
              orderStatus: order.status,
              orderAmount: order.totalAmount,
              serviceId: service._id,
              serviceTitle: service.title,
              serviceCategory: service.category,
              paidAt: order.paidAt,
            };

            if (clientMap.has(clientId)) {
              const existing = clientMap.get(clientId)!;
              existing.orders.push(orderEntry);
              existing.totalAmount += order.totalAmount || 0;
              existing.unreadCount += serviceUnreadCount;

              // Update last message time to the most recent
              const existingTime = new Date(existing.lastMessageTime || 0).getTime();
              const newTime = new Date(order.paidAt || 0).getTime();
              if (newTime > existingTime) {
                existing.lastMessageTime = order.paidAt;
                // Use most recent active service as primary
                if (order.status !== "completed") {
                  existing.primaryServiceId = service._id;
                }
              }
            } else {
              clientMap.set(clientId, {
                clientId,
                clientName,
                clientEmail: order.clientId?.email || "",
                clientType: order.clientModel || "User",
                orders: [orderEntry],
                totalAmount: order.totalAmount || 0,
                unreadCount: serviceUnreadCount,
                lastMessageTime: order.paidAt,
                primaryServiceId: service._id,
              });
            }
          }
        } catch (err) {
          console.error(`Error fetching orders for service ${service._id}:`, err);
        }
      }

      // Sort by most recent first
      const chatsList = Array.from(clientMap.values()).sort((a, b) => {
        const timeA = new Date(a.lastMessageTime || 0).getTime();
        const timeB = new Date(b.lastMessageTime || 0).getTime();
        return timeB - timeA;
      });

      setChats(chatsList);
    } catch (err) {
      console.error("Error fetching chats:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (clientId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedChats((prev) => {
      const next = new Set(prev);
      next.has(clientId) ? next.delete(clientId) : next.add(clientId);
      return next;
    });
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const styles: Record<string, string> = {
      paid: "bg-green-100 text-green-700 border-green-300",
      in_progress: "bg-blue-100 text-blue-700 border-blue-300",
      delivered: "bg-purple-100 text-purple-700 border-purple-300",
      completed: "bg-gray-100 text-gray-700 border-gray-300",
    };
    const icons: Record<string, JSX.Element> = {
      paid: <DollarSign size={11} />,
      in_progress: <Clock size={11} />,
      delivered: <Package size={11} />,
      completed: <CheckCircle size={11} />,
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
          styles[status] || "bg-gray-100 text-gray-700 border-gray-300"
        }`}
      >
        {icons[status]}
        {status.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  // Get the "dominant" status across all orders for a grouped chat
  const getDominantStatus = (orders: OrderEntry[]) => {
    const priority = ["in_progress", "delivered", "paid", "completed"];
    for (const s of priority) {
      if (orders.some((o) => o.orderStatus === s)) return s;
    }
    return orders[0]?.orderStatus;
  };

  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      chat.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.orders.some(
        (o) =>
          o.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.orderTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const dominant = getDominantStatus(chat.orders);
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "unread" && chat.unreadCount > 0) ||
      dominant === filterStatus;

    return matchesSearch && matchesFilter;
  });

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 w-10 h-10 mx-auto mb-4" />
          <p className="text-sm text-gray-600 font-medium">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Notification Alert */}
        <AnimatePresence>
          {showNotification && unreadMessages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              className="fixed top-2 sm:top-4 right-2 sm:right-4 left-2 sm:left-auto z-50 bg-blue-600 text-white rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-4 max-w-sm"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm mb-1">New Message!</h3>
                  <p className="text-[10px] sm:text-xs text-blue-100 line-clamp-1">
                    {unreadMessages[0].message || "You have a new message"}
                  </p>
                </div>
                <button onClick={() => setShowNotification(false)} className="text-white/60 hover:text-white flex-shrink-0">
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border-2 border-purple-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <MessageCircle size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-1">My Chats</h1>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {filteredChats.length} client conversation{filteredChats.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-xl border-2 border-red-300"
                >
                  <Bell size={16} />
                  <span className="font-bold text-sm sm:text-base">{unreadCount} Unread</span>
                </motion.div>
              )}
            </div>

            {/* Search and Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by client or service..."
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-sm sm:text-base"
                />
              </div>

              <div className="relative">
                <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all appearance-none bg-white text-sm sm:text-base"
                >
                  <option value="all">All Chats</option>
                  <option value="unread">Unread Only</option>
                  <option value="paid">Paid</option>
                  <option value="in_progress">In Progress</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chats List */}
        {filteredChats.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-8 sm:p-12 md:p-16 text-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <MessageCircle size={32} className="text-gray-300" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2 sm:mb-3">
              {searchTerm || filterStatus !== "all" ? "No Chats Found" : "No Active Chats"}
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Your active chats with clients will appear here"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Link href="/marketplace/create-service">
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl text-sm sm:text-base">
                  Create a Service
                </button>
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredChats.map((chat, idx) => {
              const isExpanded = expandedChats.has(chat.clientId);
              const dominantStatus = getDominantStatus(chat.orders);
              const hasMultiple = chat.orders.length > 1;

              return (
                <motion.div
                  key={chat.clientId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-purple-100 hover:border-purple-300 hover:shadow-2xl transition-all overflow-hidden"
                >
                  {/* Main Chat Row — navigates to primary chat */}
                  <Link href={`/marketplace/chat/${chat.primaryServiceId}`}>
                    <div className="p-4 sm:p-6 cursor-pointer group">
                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-lg">
                            {chat.clientName[0]}
                          </div>
                          {chat.unreadCount > 0 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center border-2 border-white"
                            >
                              {chat.unreadCount}
                            </motion.div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-purple-600 transition truncate">
                                {chat.clientName}
                              </h3>
                              {chat.clientType === "Company" && (
                                <Building2 size={14} className="text-purple-500 flex-shrink-0" />
                              )}
                              {getStatusBadge(dominantStatus)}
                            </div>
                            <ChevronRight
                              size={18}
                              className="text-purple-400 group-hover:text-purple-600 flex-shrink-0 transition-colors"
                            />
                          </div>

                          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1 truncate">
                            <Mail size={11} className="flex-shrink-0" />
                            {chat.clientEmail}
                          </p>

                          {/* Services summary */}
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Show first service inline */}
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold truncate max-w-[180px]">
                              <Sparkles size={10} className="flex-shrink-0" />
                              {chat.orders[0].serviceTitle}
                            </span>

                            {/* If multiple services, show count badge */}
                            {hasMultiple && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold">
                                <Layers size={10} />
                                +{chat.orders.length - 1} more
                              </span>
                            )}

                            {/* Total amount */}
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 ml-auto">
                              <DollarSign size={11} />
                              ${chat.totalAmount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* ✅ Expand/collapse toggle for multiple services */}
                  {hasMultiple && (
                    <>
                      <button
                        onClick={(e) => toggleExpand(chat.clientId, e)}
                        className="w-full px-4 sm:px-6 py-2 bg-purple-50 hover:bg-purple-100 transition-colors flex items-center justify-center gap-2 text-xs font-bold text-purple-600 border-t border-purple-100"
                      >
                        <Layers size={13} />
                        {isExpanded ? "Hide" : "Show"} all {chat.orders.length} services
                        <motion.span
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="inline-block"
                        >
                          ▼
                        </motion.span>
                      </button>

                      {/* Expanded service list */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-purple-100 divide-y divide-gray-100">
                              {chat.orders.map((order) => (
                                <Link
                                  key={order.orderId}
                                  href={`/marketplace/chat/${order.serviceId}`}
                                >
                                  <div className="flex items-center gap-3 px-4 sm:px-6 py-3 hover:bg-purple-50 transition-colors cursor-pointer group/item">
                                    {/* Service color dot */}
                                    <div className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />

                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-gray-800 group-hover/item:text-purple-600 transition truncate">
                                        {order.serviceTitle}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">{order.orderTitle}</p>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      {getStatusBadge(order.orderStatus)}
                                      <span className="text-xs font-bold text-green-600">${order.orderAmount}</span>
                                      <ChevronRight
                                        size={14}
                                        className="text-gray-300 group-hover/item:text-purple-500 transition-colors"
                                      />
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Stats Footer */}
        {chats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 sm:mt-8 bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-blue-100"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Total Clients</p>
                <p className="text-xl sm:text-2xl font-black text-gray-900">{chats.length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Unread</p>
                <p className="text-xl sm:text-2xl font-black text-red-600">
                  {chats.filter((c) => c.unreadCount > 0).length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">In Progress</p>
                <p className="text-xl sm:text-2xl font-black text-blue-600">
                  {chats.filter((c) => c.orders.some((o) => o.orderStatus === "in_progress")).length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Completed</p>
                <p className="text-xl sm:text-2xl font-black text-green-600">
                  {chats.filter((c) => c.orders.every((o) => o.orderStatus === "completed")).length}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
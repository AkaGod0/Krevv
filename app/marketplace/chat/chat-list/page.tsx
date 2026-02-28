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
  Building2,
  Sparkles,
  ChevronRight,
  Bell,
  X,
  Layers,
  MessageSquare,
  Eye,
  AlertCircle,
  Inbox,
} from "lucide-react";
import { useAuth, api } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNotifications } from "@/app/hooks/useNotifications";

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface ServiceInquiry {
  serviceId: string;
  serviceTitle: string;
  serviceCategory: string;
  hasUnread: boolean;
  unreadCount: number;
}

interface GroupedChat {
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientType: "User" | "Company";
  orders: OrderEntry[];
  inquiries: ServiceInquiry[];
  totalAmount: number;
  unreadCount: number;
  lastMessageTime?: string;
  primaryServiceId: string;
  hasPaidOrders: boolean;
  // All serviceIds for this client — used to mark all as read at once
  allServiceIds: string[];
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: JSX.Element }
> = {
  paid:        { label: "Paid",        bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: <DollarSign size={10} /> },
  in_progress: { label: "In Progress", bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    icon: <Clock size={10} /> },
  delivered:   { label: "Delivered",   bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200",  icon: <Package size={10} /> },
  completed:   { label: "Completed",   bg: "bg-gray-100",   text: "text-gray-600",    border: "border-gray-200",    icon: <CheckCircle size={10} /> },
  inquiry:     { label: "Inquiry",     bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   icon: <MessageSquare size={10} /> },
};

const getStatusBadge = (status: string) => {
  const cfg = STATUS_CFG[status] || {
    label: status, bg: "bg-gray-100", text: "text-gray-600",
    border: "border-gray-200", icon: <AlertCircle size={10} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.icon}{cfg.label.toUpperCase()}
    </span>
  );
};

const getDominant = (orders: OrderEntry[], hasInquiry: boolean) => {
  for (const s of ["in_progress", "delivered", "paid", "completed"]) {
    if (orders.some((o) => o.orderStatus === s)) return s;
  }
  return hasInquiry ? "inquiry" : (orders[0]?.orderStatus || "inquiry");
};

// ─── Unread badge ─────────────────────────────────────────────────────────────

function UnreadBadge({ count, size = "md" }: { count: number; size?: "sm" | "md" }) {
  if (count === 0) return null;
  const sz = size === "sm" ? "w-4 h-4 text-[9px]" : "w-5 h-5 text-[10px]";
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`${sz} bg-red-500 text-white font-black rounded-full flex items-center justify-center border-2 border-white shadow flex-shrink-0`}
    >
      {count > 9 ? "9+" : count}
    </motion.div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  name, unreadCount, hasPaidOrders,
}: {
  name: string; unreadCount: number; hasPaidOrders: boolean;
}) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="relative flex-shrink-0">
      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md
        ${hasPaidOrders ? "bg-gradient-to-br from-violet-500 to-blue-600" : "bg-gradient-to-br from-amber-400 to-orange-500"}`}>
        {initials}
      </div>
      {/* paid vs inquiry dot */}
      <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${hasPaidOrders ? "bg-emerald-500" : "bg-amber-400"}`} />
      {unreadCount > 0 && (
        <div className="absolute -top-1.5 -right-1.5">
          <UnreadBadge count={unreadCount} />
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChatsListPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // ✅ Destructure all three mark functions
  const { unreadCount, unreadMessages, markAsRead, markAllAsRead, markMultipleAsRead } =
    useNotifications(user?._id);

  const [chats, setChats] = useState<GroupedChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showToast, setShowToast] = useState(false);
  const [expandedChats, setExpandedChats] = useState<Set<string>>(new Set());

  // ✅ Mark ALL as read the moment this page mounts — navbar badge clears immediately
  useEffect(() => {
    if (user && unreadCount > 0) {
      markAllAsRead();
    }
  }, [user]); // only on mount, not on every unreadCount change

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (user) fetchChats();
  }, [user, authLoading]);

  useEffect(() => {
    if (unreadMessages.length > 0) {
      setShowToast(true);
      const t = setTimeout(() => setShowToast(false), 6000);
      return () => clearTimeout(t);
    }
  }, [unreadMessages.length]);

  // ─── Fetch ─────────────────────────────────────────────────────────────────
  // Per service:
  //   A) Paid orders → group by clientId
  //   B) All messages → find senders with no order = inquiry chats

  const fetchChats = async () => {
    setLoading(true);
    try {
      const servicesRes = await api.get("/marketplace/my-services");
      const services = servicesRes.data || [];

      const clientMap = new Map<string, GroupedChat>();

      for (const service of services) {

        // ── A: paid orders ─────────────────────────────────────────────────
        try {
          const ordersRes = await api.get(`/marketplace/services/${service._id}/orders`);
          const paidOrders = (ordersRes.data || []).filter((o: any) =>
            ["paid", "in_progress", "delivered", "completed"].includes(o.status)
          );

          for (const order of paidOrders) {
            const clientId =
              order.clientId?._id || order.clientId?.id || order.clientId || "unknown";
            const clientName =
              order.clientId?.companyName ||
              `${order.clientId?.firstName || ""} ${order.clientId?.lastName || ""}`.trim() ||
              "Client";

            // How many unread notifications for this service from server data
            const svcUnread = unreadMessages.filter((n) => n.serviceId === service._id).length;

            const entry: OrderEntry = {
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
  const ex = clientMap.get(clientId)!;
  
  // ✅ Only add if this exact orderId isn't already in the list
  const alreadyHasOrder = ex.orders.some((o) => o.orderId === order._id);
  if (!alreadyHasOrder) {
    ex.orders.push(entry);
    ex.totalAmount += order.totalAmount || 0;
    ex.unreadCount += svcUnread;
  }
  
  ex.hasPaidOrders = true;
  if (!ex.allServiceIds.includes(service._id)) ex.allServiceIds.push(service._id);
  const t = new Date(order.paidAt || 0).getTime();
  if (t > new Date(ex.lastMessageTime || 0).getTime()) {
    ex.lastMessageTime = order.paidAt;
    if (order.status !== "completed") ex.primaryServiceId = service._id;
  }
} else {
              clientMap.set(clientId, {
                clientId, clientName,
                clientEmail: order.clientId?.email || "",
                clientType: order.clientModel || "User",
                orders: [entry],
                inquiries: [],
                totalAmount: order.totalAmount || 0,
                unreadCount: svcUnread,
                lastMessageTime: order.paidAt,
                primaryServiceId: service._id,
                hasPaidOrders: true,
                allServiceIds: [service._id],
              });
            }
          }
        } catch (err) {
          console.error(`Orders fetch failed for service ${service._id}:`, err);
        }

        // ── B: inquiry senders (messaged without buying) ───────────────────
        try {
          const msgsRes = await api.get(`/marketplace/services/${service._id}/messages`);
          const messages: any[] = msgsRes.data || [];
          const svcUnread = unreadMessages.filter((n) => n.serviceId === service._id).length;

          const senderMap = new Map<
            string,
            { name: string; email: string; type: "User" | "Company"; lastTime: string }
          >();

          for (const msg of messages) {
            const sid =
              msg.senderId?._id ||
              msg.senderId?.id ||
              (typeof msg.senderId === "string" ? msg.senderId : null);
            if (!sid || sid === user?._id || sid === (user as any)?.id) continue;

            const name =
              msg.senderId?.companyName ||
              `${msg.senderId?.firstName || ""} ${msg.senderId?.lastName || ""}`.trim() ||
              "Visitor";
            const t = msg.timestamp || msg.createdAt;

            if (!senderMap.has(sid)) {
              senderMap.set(sid, { name, email: msg.senderId?.email || "", type: msg.senderModel || "User", lastTime: t });
            } else {
              const ex = senderMap.get(sid)!;
              if (new Date(t).getTime() > new Date(ex.lastTime).getTime()) ex.lastTime = t;
            }
          }

          for (const [sid, sender] of senderMap.entries()) {
            const inquiry: ServiceInquiry = {
              serviceId: service._id,
              serviceTitle: service.title,
              serviceCategory: service.category,
              hasUnread: svcUnread > 0,
              unreadCount: svcUnread,
            };

           // In the inquiry loop, after building the inquiry object:
            if (clientMap.has(sid)) {
              const ex = clientMap.get(sid)!;
              // ✅ Don't add as inquiry if this service already exists as a paid order
              const alreadyAsOrder = ex.orders.some((o) => o.serviceId === service._id);
              if (!alreadyAsOrder && !ex.inquiries.some((i) => i.serviceId === service._id)) {
                ex.inquiries.push(inquiry);
                ex.unreadCount += svcUnread;
              }
              if (!ex.allServiceIds.includes(service._id)) ex.allServiceIds.push(service._id);
            } else {
              clientMap.set(sid, {
                clientId: sid,
                clientName: sender.name,
                clientEmail: sender.email,
                clientType: sender.type,
                orders: [],
                inquiries: [inquiry],
                totalAmount: 0,
                unreadCount: svcUnread,
                lastMessageTime: sender.lastTime,
                primaryServiceId: service._id,
                hasPaidOrders: false,
                allServiceIds: [service._id],
              });
            }
          }
        } catch (err) {
          console.error(`Messages fetch failed for service ${service._id}:`, err);
        }
      }

      // Sort: unread first, then most recent
      const list = Array.from(clientMap.values()).sort((a, b) => {
        if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
        if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
        return new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime();
      });

      setChats(list);
    } catch (err) {
      console.error("fetchChats error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedChats((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  // ─── Filter ───────────────────────────────────────────────────────────────

  const filteredChats = chats.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      c.clientName.toLowerCase().includes(q) ||
      c.clientEmail.toLowerCase().includes(q) ||
      c.orders.some((o) => o.serviceTitle.toLowerCase().includes(q) || o.orderTitle.toLowerCase().includes(q)) ||
      c.inquiries.some((i) => i.serviceTitle.toLowerCase().includes(q));

    const dominant = getDominant(c.orders, c.inquiries.length > 0);
    const matchFilter =
      filterStatus === "all" ||
      (filterStatus === "unread" && c.unreadCount > 0) ||
      (filterStatus === "inquiry" && !c.hasPaidOrders) ||
      dominant === filterStatus;

    return matchSearch && matchFilter;
  });

  const totalUnread = chats.reduce((s, c) => s + c.unreadCount, 0);
  const inquiryOnly = chats.filter((c) => !c.hasPaidOrders).length;

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-violet-500 w-9 h-9 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Loading conversations...</p>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-6 md:py-8 px-3 sm:px-5 md:px-8">
      <div className="max-w-4xl mx-auto">

        {/* ── Toast for new incoming messages ── */}
        <AnimatePresence>
          {showToast && unreadMessages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              className="fixed top-4 right-4 z-50 bg-slate-900 text-white rounded-2xl shadow-2xl p-4 w-72 border border-white/10"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-violet-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">New message</p>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                    {unreadMessages[0].message || "You have a new message"}
                  </p>
                </div>
                <button onClick={() => setShowToast(false)} className="text-slate-500 hover:text-white">
                  <X size={14} />
                </button>
              </div>
              <div className="mt-3 h-0.5 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 6, ease: "linear" }}
                  className="h-full bg-violet-400 rounded-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Header ── */}
        <div className="mb-5 sm:mb-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Messages</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {filteredChats.length} conversation{filteredChats.length !== 1 ? "s" : ""}
                {inquiryOnly > 0 && (
                  <span className="ml-1.5 text-amber-600 font-semibold">
                    · {inquiryOnly} inquiry{inquiryOnly !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>

            {totalUnread > 0 && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setFilterStatus("unread")}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm shadow-md transition-colors"
              >
                <Bell size={15} />
                {totalUnread} unread
              </motion.button>
            )}
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap mb-4">
            {[
              { label: "All",         value: "all",         count: chats.length,                                                                                               color: "bg-slate-900 text-white" },
              { label: "Unread",      value: "unread",      count: chats.filter((c) => c.unreadCount > 0).length,                                                              color: "bg-red-500 text-white" },
              { label: "Inquiry",     value: "inquiry",     count: inquiryOnly,                                                                                                color: "bg-amber-500 text-white" },
              { label: "In Progress", value: "in_progress", count: chats.filter((c) => c.orders.some((o) => o.orderStatus === "in_progress")).length,                          color: "bg-blue-500 text-white" },
              { label: "Delivered",   value: "delivered",   count: chats.filter((c) => c.orders.some((o) => o.orderStatus === "delivered")).length,                            color: "bg-purple-500 text-white" },
              { label: "Completed",   value: "completed",   count: chats.filter((c) => c.orders.every((o) => o.orderStatus === "completed") && c.hasPaidOrders).length,        color: "bg-emerald-500 text-white" },
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => setFilterStatus(p.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterStatus === p.value
                    ? p.color + " shadow-md"
                    : "bg-white text-slate-500 border border-slate-200 hover:border-slate-400"
                }`}
              >
                {p.label}
                <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-black ${filterStatus === p.value ? "bg-white/20" : "bg-slate-100"}`}>
                  {p.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email or service…"
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none text-sm text-slate-800 placeholder:text-slate-400 shadow-sm"
            />
          </div>
        </div>

        {/* ── Empty state ── */}
        {filteredChats.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center"
          >
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Inbox size={26} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">
              {searchTerm || filterStatus !== "all" ? "No results" : "No conversations yet"}
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter"
                : "Paid orders and inquiries from clients will appear here"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Link href="/marketplace/create-service">
                <button className="px-6 py-3 bg-slate-900 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-colors">
                  Create a Service
                </button>
              </Link>
            )}
          </motion.div>
        )}

        {/* ── Chat cards ── */}
        <div className="space-y-2.5">
          {filteredChats.map((chat, idx) => {
            const isExpanded = expandedChats.has(chat.clientId);
            const dominant = getDominant(chat.orders, chat.inquiries.length > 0);
            const totalEntries = chat.orders.length + chat.inquiries.length;
            const hasMultiple = totalEntries > 1;

            // Unread counts straight from the live unreadMessages array (not stale chat state)
            const liveUnreadForClient = unreadMessages.filter((n) =>
              chat.allServiceIds.includes(n.serviceId)
            ).length;

            return (
              <motion.div
                key={chat.clientId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-shadow hover:shadow-md ${
                  liveUnreadForClient > 0
                    ? "border-red-200"
                    : chat.hasPaidOrders
                    ? "border-slate-100 hover:border-violet-200"
                    : "border-amber-100 hover:border-amber-300"
                }`}
              >
                {/* ── Main row ── */}
                {/* ✅ markMultipleAsRead clears ALL services for this client at once */}
                <Link
                  href={`/marketplace/chat/${chat.primaryServiceId}`}
                  onClick={() => markMultipleAsRead(chat.allServiceIds)}
                >
                  <div className="p-4 sm:p-5 cursor-pointer group">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <Avatar
                        name={chat.clientName}
                        unreadCount={liveUnreadForClient}
                        hasPaidOrders={chat.hasPaidOrders}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                            <h3 className={`text-sm sm:text-base font-bold truncate group-hover:text-violet-600 transition-colors ${liveUnreadForClient > 0 ? "text-slate-900" : "text-slate-700"}`}>
                              {chat.clientName}
                            </h3>
                            {chat.clientType === "Company" && (
                              <Building2 size={13} className="text-violet-400 flex-shrink-0" />
                            )}
                            {getStatusBadge(dominant)}

                            {/* ✅ Unread pill — driven by live unreadMessages, not stale chat state */}
                            {liveUnreadForClient > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-full">
                                <MessageCircle size={9} />
                                {liveUnreadForClient} new
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {chat.lastMessageTime && (
                              <span className="text-[10px] text-slate-400 hidden sm:block">
                                {new Date(chat.lastMessageTime).toLocaleDateString()}
                              </span>
                            )}
                            <ChevronRight size={15} className="text-slate-300 group-hover:text-violet-500 transition-colors" />
                          </div>
                        </div>

                        {chat.clientEmail && (
                          <p className="text-[11px] text-slate-400 mb-2 truncate">{chat.clientEmail}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-1.5">
                          {chat.orders[0] && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-violet-50 text-violet-700 border border-violet-100 rounded-lg text-[11px] font-semibold max-w-[160px] truncate">
                              <Sparkles size={9} className="flex-shrink-0" />
                              {chat.orders[0].serviceTitle}
                            </span>
                          )}
                          {!chat.hasPaidOrders && chat.inquiries[0] && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-[11px] font-semibold max-w-[160px] truncate">
                              <MessageSquare size={9} className="flex-shrink-0" />
                              {chat.inquiries[0].serviceTitle}
                            </span>
                          )}
                          {hasMultiple && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-semibold">
                              <Layers size={9} />+{totalEntries - 1}
                            </span>
                          )}
                          {chat.totalAmount > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-xs font-black text-emerald-600 ml-auto">
                              <DollarSign size={11} />{chat.totalAmount.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* ✅ Unread service chips — shows exactly WHICH chat has unread */}
              {/* Unread service chips */}
{liveUnreadForClient > 0 && (
  <div className="px-4 sm:px-5 pb-3 flex flex-wrap gap-2">
    
    {/* ✅ Deduplicate by serviceId before mapping — one chip per service */}
    {Array.from(
      new Map(
        chat.orders
          .filter((o) => unreadMessages.some((n) => n.serviceId === o.serviceId))
          .map((o) => [o.serviceId, o])  // Map keyed by serviceId — auto-deduplicates
      ).values()
    ).map((o) => {
      const cnt = unreadMessages.filter((n) => n.serviceId === o.serviceId).length;
      return (
        <Link
          key={`order-chip-${o.serviceId}`}
          href={`/marketplace/chat/${o.serviceId}`}
          onClick={() => markAsRead(o.serviceId)}
        >
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 hover:bg-red-100 transition-colors">
            <span className="w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center flex-shrink-0">
              {cnt}
            </span>
            <span className="truncate max-w-[120px]">{o.serviceTitle}</span>
            <Eye size={11} className="flex-shrink-0" />
          </div>
        </Link>
      );
    })}

    {/* Inquiry chips unchanged */}
    {chat.inquiries
      .filter((i) => unreadMessages.some((n) => n.serviceId === i.serviceId))
      .map((i) => {
        const cnt = unreadMessages.filter((n) => n.serviceId === i.serviceId).length;
        return (
          <Link
            key={`inquiry-chip-${i.serviceId}`}
            href={`/marketplace/chat/${i.serviceId}`}
            onClick={() => markAsRead(i.serviceId)}
          >
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-700 hover:bg-amber-100 transition-colors">
              <span className="w-4 h-4 bg-amber-500 text-white text-[9px] font-black rounded-full flex items-center justify-center flex-shrink-0">
                {cnt}
              </span>
              <span className="truncate max-w-[120px]">{i.serviceTitle}</span>
              <Eye size={11} className="flex-shrink-0" />
            </div>
          </Link>
        );
      })}
  </div>
)}

                {/* ── Expand / collapse ── */}
                {hasMultiple && (
                  <>
                    <button
                      onClick={(e) => toggleExpand(chat.clientId, e)}
                      className="w-full px-4 sm:px-5 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 text-xs font-bold text-slate-500 border-t border-slate-100"
                    >
                      <Layers size={12} />
                      {isExpanded ? "Collapse" : `View all ${totalEntries} services`}
                      <motion.span
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="inline-block text-[10px]"
                      >▼</motion.span>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-slate-100 divide-y divide-slate-50">

                            {/* Paid order rows */}
                            {chat.orders.map((order) => {
                              const cnt = unreadMessages.filter((n) => n.serviceId === order.serviceId).length;
                              return (
                                <Link
                                  key={`order-row-${order.orderId}`}
                                  href={`/marketplace/chat/${order.serviceId}`}
                                  onClick={() => markAsRead(order.serviceId)}  // ✅
                                >
                                  <div className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-violet-50 transition-colors cursor-pointer group/item">
                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-slate-800 group-hover/item:text-violet-600 transition truncate">
                                        {order.serviceTitle}
                                      </p>
                                      <p className="text-xs text-slate-400 truncate">{order.orderTitle}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      {cnt > 0 && <UnreadBadge count={cnt} size="sm" />}
                                      {getStatusBadge(order.orderStatus)}
                                      <span className="text-xs font-bold text-emerald-600">${order.orderAmount}</span>
                                      <ChevronRight size={13} className="text-slate-300 group-hover/item:text-violet-500 transition-colors" />
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}

                            {/* Inquiry rows */}
                            {chat.inquiries.map((inq) => {
                              const cnt = unreadMessages.filter((n) => n.serviceId === inq.serviceId).length;
                              return (
                                <Link
                                   key={`inquiry-row-${inq.serviceId}`}
                                  href={`/marketplace/chat/${inq.serviceId}`}
                                  onClick={() => markAsRead(inq.serviceId)}  // ✅
                                >
                                  <div className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-amber-50 transition-colors cursor-pointer group/item">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-slate-800 group-hover/item:text-amber-600 transition truncate">
                                        {inq.serviceTitle}
                                      </p>
                                      <p className="text-[11px] text-amber-600 font-semibold">Inquiry — no order yet</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      {cnt > 0 && <UnreadBadge count={cnt} size="sm" />}
                                      {getStatusBadge("inquiry")}
                                      <ChevronRight size={13} className="text-slate-300 group-hover/item:text-amber-500 transition-colors" />
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
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

        {/* ── Stats footer ── */}
        {chats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 sm:mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {[
                { label: "Clients",     value: chats.length,                                                                          color: "text-slate-900" },
                { label: "Unread",      value: chats.filter((c) => c.unreadCount > 0).length,                                         color: "text-red-600"   },
                { label: "Inquiries",   value: inquiryOnly,                                                                            color: "text-amber-600" },
                { label: "In Progress", value: chats.filter((c) => c.orders.some((o) => o.orderStatus === "in_progress")).length,      color: "text-blue-600"  },
              ].map((s) => (
                <div key={s.label}>
                  <p className={`text-2xl sm:text-3xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
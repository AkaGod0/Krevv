"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, DollarSign, Clock, CheckCircle, Play, Package,
  ArrowLeft, MessageCircle, AlertCircle, Truck, Trophy,
  User, Building2, XCircle, RefreshCw, HeadphonesIcon,
} from "lucide-react";
import { useAuth, api } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PayoutRequest {
  _id: string;
  status: "pending" | "approved" | "rejected";
  amount: number;
  requestedAt: string;
  paypalPayoutId?: string;
  adminNotes?: string;
}

interface Order {
  _id: string;
  title: string;
  description: string;
  price: number;
  platformFee: number;
  totalAmount: number;
  deliveryTime: number;
  status: string;
  source?: string;
  conversationId?: string;
  paidAt?: string;
  createdAt: string;
  clientModel: string;
  clientId: { _id: string; firstName?: string; lastName?: string; companyName?: string; email: string; };
  serviceId?: { _id: string; title: string; category: string; };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  paid:        { label: "Paid — Start Work",           color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",     icon: Play },
  in_progress: { label: "In Progress",                 color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: Clock },
  delivered:   { label: "Delivered — Awaiting Review", color: "text-amber-700",  bg: "bg-amber-50 border-amber-200",   icon: Truck },
  completed:   { label: "Completed",                   color: "text-green-700",  bg: "bg-green-50 border-green-200",   icon: Trophy },
};

type ModalType = "success" | "error" | "confirm";
interface ModalState {
  show: boolean; type: ModalType; title: string; message: string;
  confirmLabel?: string; onConfirm?: () => void;
}
const MODAL_DEFAULTS: ModalState = { show: false, type: "success", title: "", message: "" };

function NotifModal({ modal, onClose }: { modal: ModalState; onClose: () => void }) {
  if (!modal.show) return null;
  const icons   = { success: <CheckCircle size={30} className="text-green-500" />, error: <XCircle size={30} className="text-red-500" />, confirm: <AlertCircle size={30} className="text-amber-500" /> };
  const headers = { success: "from-green-50 to-emerald-50 border-green-200", error: "from-red-50 to-rose-50 border-red-200", confirm: "from-amber-50 to-yellow-50 border-amber-200" };
  const btns    = { success: "bg-green-600 hover:bg-green-700", error: "bg-red-600 hover:bg-red-700", confirm: "bg-amber-500 hover:bg-amber-600" };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={modal.type !== "confirm" ? onClose : undefined}>
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
        onClick={e => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className={`bg-gradient-to-br ${headers[modal.type]} border-b-2 p-6 flex flex-col items-center text-center`}>
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md mb-3">{icons[modal.type]}</div>
          <h3 className="text-lg font-black text-gray-900">{modal.title}</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600 text-center text-sm leading-relaxed mb-5">{modal.message}</p>
          {modal.type === "confirm" ? (
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition">Cancel</button>
              <button onClick={() => { modal.onConfirm?.(); onClose(); }} className={`flex-1 py-2.5 text-white font-bold rounded-xl transition ${btns[modal.type]}`}>{modal.confirmLabel || "Confirm"}</button>
            </div>
          ) : (
            <button onClick={onClose} className={`w-full py-2.5 text-white font-bold rounded-xl transition ${btns[modal.type]}`}>OK</button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function DeveloperOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [deliveryModal, setDeliveryModal] = useState<{ show: boolean; orderId: string; note: string }>({ show: false, orderId: "", note: "" });
  const [payoutMap, setPayoutMap] = useState<Record<string, PayoutRequest[]>>({});
  const [requestingPayout, setRequestingPayout] = useState<string | null>(null);
  const [notifModal, setNotifModal] = useState<ModalState>(MODAL_DEFAULTS);

  const closeModal = () => setNotifModal(MODAL_DEFAULTS);
  const showSuccess = (title: string, message: string) => setNotifModal({ show: true, type: "success", title, message });
  const showError   = (title: string, message: string) => setNotifModal({ show: true, type: "error",   title, message });
  const showConfirm = (title: string, message: string, onConfirm: () => void, confirmLabel = "Confirm") =>
    setNotifModal({ show: true, type: "confirm", title, message, onConfirm, confirmLabel });

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (user) { fetchOrders(); fetchPayouts(); }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/marketplace/my-developer-orders");
      setOrders(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchPayouts = async () => {
    try {
      const res = await api.get("/marketplace/my-payout-requests");
      const map: Record<string, PayoutRequest[]> = {};
      (res.data || []).forEach((req: any) => {
        const oid = typeof req.orderId === "string" ? req.orderId : req.orderId?._id;
        if (oid) { if (!map[oid]) map[oid] = []; map[oid].push(req); }
      });
      setPayoutMap(map);
    } catch (err) { console.error(err); }
  };

  const getPayoutState = (orderId: string) => {
    const all = payoutMap[orderId] || [];
    const rejectedCount = all.filter(r => r.status === "rejected").length;
    const pending  = all.find(r => r.status === "pending");
    const approved = all.find(r => r.status === "approved");
    const latestRejected = [...all.filter(r => r.status === "rejected")]
      .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())[0];
    return {
      all, rejectedCount, pending, approved, latestRejected,
      canRetry:  rejectedCount > 0 && rejectedCount < 3 && !pending && !approved,
      maxReached: rejectedCount >= 3 && !pending && !approved,
    };
  };

  const handleRequestPayout = (orderId: string, isRetry = false) => {
    const state = getPayoutState(orderId);
    if (state.maxReached) {
      showError("Max Attempts Reached", "You've used all 3 payout attempts. Contact supports@krevv.com for help."); return;
    }
    showConfirm(
      isRetry ? "Re-submit Payout?" : "Request Payout?",
      isRetry
        ? `Attempt ${state.rejectedCount + 1} of 3. Admin will review shortly.`
        : "Your request will be reviewed and processed within 24-48 hours.",
      async () => {
        setRequestingPayout(orderId);
        try {
          const res = await api.post(`/marketplace/orders/${orderId}/request-payout`);
          setPayoutMap(prev => ({ ...prev, [orderId]: [...(prev[orderId] || []), res.data.payoutRequest] }));
          showSuccess(
            isRetry ? "Payout Re-submitted!" : "Payout Requested!",
            isRetry ? `Attempt ${state.rejectedCount + 1}/3 submitted.` : "Admin will process within 24-48 hours."
          );
        } catch (err: any) {
          showError("Request Failed", err.response?.data?.message || "Failed to request payout.");
        } finally { setRequestingPayout(null); }
      },
      isRetry ? "Re-submit" : "Request Payout"
    );
  };

  const handleStartWork = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      await api.post(`/marketplace/orders/${orderId}/start-work`);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: "in_progress" } : o));
      showSuccess("Work Started!", "The client has been notified.");
    } catch (err: any) {
      showError("Failed", err.response?.data?.message || "Failed to start work.");
    } finally { setActionLoading(null); }
  };

  const handleSubmitDelivery = async () => {
    if (!deliveryModal.note.trim()) return;
    setActionLoading(deliveryModal.orderId);
    try {
      await api.post(`/marketplace/orders/${deliveryModal.orderId}/submit-delivery`, { deliveryNote: deliveryModal.note });
      setOrders(prev => prev.map(o => o._id === deliveryModal.orderId ? { ...o, status: "delivered" } : o));
      setDeliveryModal({ show: false, orderId: "", note: "" });
      showSuccess("Delivery Submitted!", "Awaiting client review.");
    } catch (err: any) {
      showError("Failed", err.response?.data?.message || "Failed to submit delivery.");
    } finally { setActionLoading(null); }
  };

  const getClientName = (o: Order) => {
    if (!o.clientId) return "Unknown Client";
    if (o.clientModel === "Company") return o.clientId.companyName || "Unknown Company";
    return `${o.clientId.firstName || ""} ${o.clientId.lastName || ""}`.trim() || "Unknown";
  };

  const filteredOrders = activeFilter === "all" ? orders : orders.filter(o => o.status === activeFilter);
  const counts = {
    all: orders.length,
    paid: orders.filter(o => o.status === "paid").length,
    in_progress: orders.filter(o => o.status === "in_progress").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    completed: orders.filter(o => o.status === "completed").length,
  };

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50">
      <Loader2 className="animate-spin text-purple-500 w-10 h-10" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-4 font-semibold transition-colors">
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="text-3xl font-black text-gray-900 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            My Developer Orders
          </h1>
          <p className="text-gray-500 mt-1">Start work, submit deliveries, request payouts</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { key: "paid",        label: "Needs Start", color: "border-blue-500 text-blue-600" },
            { key: "in_progress", label: "In Progress", color: "border-purple-500 text-purple-600" },
            { key: "delivered",   label: "Delivered",   color: "border-amber-500 text-amber-600" },
            { key: "completed",   label: "Completed",   color: "border-green-500 text-green-600" },
          ].map(s => (
            <div key={s.key} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${s.color.split(" ")[0]}`}>
              <p className="text-gray-500 text-xs mb-1">{s.label}</p>
              <p className={`text-2xl font-black ${s.color.split(" ")[1]}`}>{counts[s.key as keyof typeof counts]}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { key: "all", label: "All" },
            { key: "paid", label: "Start Work" },
            { key: "in_progress", label: "In Progress" },
            { key: "delivered", label: "Delivered" },
            { key: "completed", label: "Completed" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeFilter === tab.key ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}>
              {tab.label} ({counts[tab.key as keyof typeof counts] ?? orders.length})
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <Package className="w-16 h-16 text-purple-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No orders here</h3>
            <p className="text-gray-500 text-sm">
              {activeFilter === "all" ? "When clients pay for your custom orders, they'll appear here." : `No "${activeFilter}" orders.`}
            </p>
          </motion.div>
        )}

        <div className="space-y-4">
          {filteredOrders.map((order, idx) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.paid;
            const Icon = cfg.icon;
            const isChat = order.source === "chat_order";
            const ps = getPayoutState(order._id);
            const isRequesting = requestingPayout === order._id;

            return (
              <motion.div key={order._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border-2 ${cfg.bg} overflow-hidden`}>
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border ${cfg.bg} ${cfg.color}`}>
                          <Icon size={12} /> {cfg.label}
                        </span>
                        {isChat && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full border border-purple-200">
                            <MessageCircle size={10} /> Chat Order
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-black text-gray-900 mb-1 truncate">{order.title}</h3>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{order.description}</p>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                          {order.clientModel === "Company" ? <Building2 size={13} className="text-white" /> : <User size={13} className="text-white" />}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{getClientName(order)}</span>
                        <span className="text-xs text-gray-400">· {order.clientId?.email}</span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1 font-bold text-green-600"><DollarSign size={14} />${order.price.toFixed(2)}</span>
                        <span className="flex items-center gap-1"><Clock size={14} />{order.deliveryTime} days</span>
                        {order.paidAt && (
                          <span className="flex items-center gap-1">
                            <CheckCircle size={14} className="text-blue-400" /> Paid {new Date(order.paidAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col gap-2 sm:min-w-[165px]">

                      {/* ── Chat button — uses conversationId for chat orders ── */}
                      {isChat && order.conversationId && (
                        <Link href={`/marketplace/chat/${order.conversationId || `order-${order._id}`}`} className="flex-1 sm:flex-initial">
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold rounded-xl transition-all text-sm border border-purple-200">
                          <MessageCircle size={15} /> Open Chat
                        </button>
                      </Link>
                      )}

                      {/* ── Start Work ── */}
                      {order.status === "paid" && (
                        <button onClick={() => handleStartWork(order._id)} disabled={actionLoading === order._id}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 disabled:opacity-50 text-white font-bold rounded-xl transition-all text-sm shadow-lg">
                          {actionLoading === order._id ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
                          Start Work
                        </button>
                      )}

                      {/* ── Submit Delivery ── */}
                      {order.status === "in_progress" && (
                        <button onClick={() => setDeliveryModal({ show: true, orderId: order._id, note: "" })}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all text-sm shadow-lg">
                          <Truck size={15} /> Submit Delivery
                        </button>
                      )}

                      {/* ── Awaiting review ── */}
                      {order.status === "delivered" && (
                        <div className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 font-bold rounded-xl text-sm">
                          <Clock size={15} /> Awaiting Review
                        </div>
                      )}

                      {/* ── Payout (completed) ── */}
                      {order.status === "completed" && (() => {
                        if (ps.approved) return (
                          <div className="flex flex-col gap-1 flex-1 sm:flex-initial">
                            <div className="flex items-center justify-center gap-1 px-4 py-2.5 bg-green-100 text-green-700 font-bold rounded-xl border border-green-300 text-sm">
                              <CheckCircle size={14} /> Payout Approved
                            </div>
                            {ps.approved.paypalPayoutId && (
                              <p className="text-[10px] text-green-600 text-center font-mono px-1 truncate">TX: {ps.approved.paypalPayoutId}</p>
                            )}
                          </div>
                        );
                        if (ps.pending) return (
                          <div className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-100 text-yellow-700 font-bold rounded-xl border border-yellow-300 text-sm">
                            <Clock size={14} /> Payout Pending
                          </div>
                        );
                        if (ps.maxReached) return (
                          <div className="flex flex-col gap-1 flex-1 sm:flex-initial">
                            <div className="flex items-center justify-center gap-1 px-4 py-2 bg-red-100 text-red-700 font-bold rounded-xl border border-red-300 text-xs">
                              <XCircle size={13} /> Rejected (3/3)
                            </div>
                            <a href="mailto:supports@krevv.com?subject=Payout Issue"
                              className="flex items-center justify-center gap-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition">
                              <HeadphonesIcon size={13} /> Contact Support
                            </a>
                          </div>
                        );
                        if (ps.canRetry) return (
                          <div className="flex flex-col gap-1 flex-1 sm:flex-initial">
                            <div className="flex items-center justify-center gap-1 px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl border border-red-200 text-xs">
                              <XCircle size={13} /> Rejected ({ps.rejectedCount}/3)
                            </div>
                            {ps.latestRejected?.adminNotes && (
                              <p className="text-[10px] text-red-500 px-1 line-clamp-2">Reason: {ps.latestRejected.adminNotes}</p>
                            )}
                            <button onClick={() => handleRequestPayout(order._id, true)} disabled={isRequesting}
                              className="flex items-center justify-center gap-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition disabled:opacity-50">
                              {isRequesting ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                              Re-submit ({ps.rejectedCount + 1}/3)
                            </button>
                          </div>
                        );
                        return (
                          <button onClick={() => handleRequestPayout(order._id, false)} disabled={isRequesting}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all text-sm shadow-lg disabled:opacity-50">
                            {isRequesting ? <Loader2 size={15} className="animate-spin" /> : <DollarSign size={15} />}
                            Request Payout (${order.price})
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Delivery Modal */}
      <AnimatePresence>
        {deliveryModal.show && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => !actionLoading && setDeliveryModal({ show: false, orderId: "", note: "" })}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              onClick={e => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Truck size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Submit Delivery</h3>
                  <p className="text-sm text-gray-500">Describe what you've completed</p>
                </div>
              </div>
              <textarea value={deliveryModal.note} onChange={e => setDeliveryModal(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Describe your delivery — what was built, how to use it, any notes for the client..."
                rows={5} className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none resize-none text-sm font-medium text-gray-800 mb-6" />
              <div className="flex gap-3">
                <button onClick={() => setDeliveryModal({ show: false, orderId: "", note: "" })} disabled={!!actionLoading}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition">Cancel</button>
                <button onClick={handleSubmitDelivery} disabled={!deliveryModal.note.trim() || !!actionLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2">
                  {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Truck size={18} />} Submit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notifModal.show && <NotifModal modal={notifModal} onClose={closeModal} />}
      </AnimatePresence>
    </div>
  );
}
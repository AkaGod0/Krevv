"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Loader2,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Tag,
  Trash2,
  MessageCircle,
  Package,
  Sparkles,
  Bell,
  X,
  ExternalLink,
  Info,
} from "lucide-react";
import { useAuth, api } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNotifications } from "@/app/hooks/useNotifications";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Application {
  _id: string;
  coverLetter: string;
  resumeUrl?: string;
  status: "pending" | "reviewing" | "accepted" | "rejected";
  appliedAt: string;
  job?: {
    _id: string;
    title: string;
    slug: string;
    company: string;
    location: string;
    salary: string;
    type: string;
  } | null;
}

interface Order {
  _id: string;
  title: string;
  description: string;
  price: number;
  totalAmount: number;
  deliveryTime: number;
  status:
    | "pending_payment"
    | "paid"
    | "in_progress"
    | "delivered"
    | "completed"
    | "cancelled";
  serviceId: {
    _id: string;
    title: string;
    category: string;
    budget: number;
  };
  developerId: {
    _id: string;
    firstName: string;
    lastName: string;
    companyName: string;
  };
  clientId?: string;
  createdAt: string;
  paidAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  deliveryNote?: string;
}

// ─── Render text with clickable links ────────────────────────────────────────

const renderTextWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1 break-all"
        >
          {part}
          <ExternalLink size={12} className="flex-shrink-0" />
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

// ─── Notification Modal ───────────────────────────────────────────────────────

type ModalType = "success" | "error" | "info" | "confirm";

interface ModalState {
  show: boolean;
  type: ModalType;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
}

const MODAL_DEFAULTS: ModalState = {
  show: false,
  type: "info",
  title: "",
  message: "",
};

function NotificationModal({
  modal,
  onClose,
}: {
  modal: ModalState;
  onClose: () => void;
}) {
  if (!modal.show) return null;

  const config = {
    success: {
      icon: <CheckCircle size={30} className="text-green-500" />,
      header: "from-green-50 to-emerald-50 border-green-200",
      btn: "bg-green-600 hover:bg-green-700",
    },
    error: {
      icon: <XCircle size={30} className="text-red-500" />,
      header: "from-red-50 to-rose-50 border-red-200",
      btn: "bg-red-600 hover:bg-red-700",
    },
    info: {
      icon: <Info size={30} className="text-blue-500" />,
      header: "from-blue-50 to-indigo-50 border-blue-200",
      btn: "bg-blue-600 hover:bg-blue-700",
    },
    confirm: {
      icon: <AlertCircle size={30} className="text-amber-500" />,
      header: "from-amber-50 to-yellow-50 border-amber-200",
      btn: "bg-amber-500 hover:bg-amber-600",
    },
  }[modal.type];

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={modal.type !== "confirm" ? onClose : undefined}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-[320px] sm:max-w-sm overflow-hidden"
      >
        {/* Header */}
        <div
          className={`bg-gradient-to-br ${config.header} border-b-2 px-5 py-6 flex flex-col items-center text-center gap-3`}
        >
          <div className="w-14 h-14 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md">
            {config.icon}
          </div>
          <h3 className="text-base sm:text-lg font-black text-gray-900 leading-snug px-2">
            {modal.title}
          </h3>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          <p className="text-gray-600 text-center text-sm leading-relaxed mb-5">
            {modal.message}
          </p>
          {modal.type === "confirm" ? (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors text-sm"
              >
                {modal.cancelLabel || "Cancel"}
              </button>
              <button
                onClick={() => {
                  modal.onConfirm?.();
                  onClose();
                }}
                className={`flex-1 py-2.5 text-white font-bold rounded-xl transition-colors text-sm ${config.btn}`}
              >
                {modal.confirmLabel || "Confirm"}
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className={`w-full py-2.5 text-white font-bold rounded-xl transition-colors text-sm ${config.btn}`}
            >
              OK
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MyApplicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { unreadCount, unreadMessages, markAsRead } = useNotifications(
    user?._id
  );

  const [applications, setApplications] = useState<Application[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMessageAlert, setShowMessageAlert] = useState(false);
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);

  const [jobStats, setJobStats] = useState({
    total: 0,
    pending: 0,
    reviewing: 0,
    accepted: 0,
    rejected: 0,
  });
  const [orderStats, setOrderStats] = useState({
    total: 0,
    paid: 0,
    in_progress: 0,
    delivered: 0,
    completed: 0,
  });

  // ✅ Single modal — replaces ALL alert() calls
  const [notifModal, setNotifModal] = useState<ModalState>(MODAL_DEFAULTS);
  const closeModal = () => setNotifModal(MODAL_DEFAULTS);

  const showSuccess = (title: string, message: string) =>
    setNotifModal({ show: true, type: "success", title, message });

  const showError = (title: string, message: string) =>
    setNotifModal({ show: true, type: "error", title, message });

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel"
  ) =>
    setNotifModal({
      show: true,
      type: "confirm",
      title,
      message,
      onConfirm,
      confirmLabel,
      cancelLabel,
    });

  // ─── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) fetchAllData();
  }, [user, authLoading, router]);

  useEffect(() => {
    if (unreadMessages.length > 0) {
      setShowMessageAlert(true);
      const timer = setTimeout(() => setShowMessageAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [unreadMessages.length]);

  // ─── Data Fetching ────────────────────────────────────────────────────────

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const jobsRes = await api.get("/applications/my-applications");
      setApplications(jobsRes.data);

      const totalJobStats = jobsRes.data.reduce(
        (acc: any, app: Application) => {
          acc.total++;
          acc[app.status] = (acc[app.status] || 0) + 1;
          return acc;
        },
        { total: 0, pending: 0, reviewing: 0, accepted: 0, rejected: 0 }
      );
      setJobStats(totalJobStats);

      try {
        const ordersRes = await api.get("/marketplace/my-orders");
        const allOrders = (ordersRes.data || []).sort(
          (a: Order, b: Order) =>
            new Date(b.paidAt || b.createdAt).getTime() -
            new Date(a.paidAt || a.createdAt).getTime()
        );
        setOrders(allOrders);

        const totalOrderStats = allOrders.reduce(
          (acc: any, order: Order) => {
            acc.total++;
            const s = order.status as keyof typeof acc;
            acc[s] = (acc[s] || 0) + 1;
            return acc;
          },
          { total: 0, paid: 0, in_progress: 0, delivered: 0, completed: 0 }
        );
        totalOrderStats.paid = allOrders.length;
        setOrderStats(totalOrderStats);
      } catch (err) {
        console.error("Error fetching marketplace orders:", err);
        setOrders([]);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Accept Delivery ──────────────────────────────────────────────────────

  const handleAcceptDelivery = (orderId: string) => {
    showConfirm(
      "Accept Delivery?",
      "Confirm that you've reviewed the work and are happy with the delivery. This will mark the order as complete and cannot be undone.",
      async () => {
        setAcceptingOrderId(orderId);
        try {
          await api.post(`/marketplace/orders/${orderId}/accept-delivery`, {
            review: "Order completed successfully",
            rating: 5,
          });
          setOrders((prev) =>
            prev.map((o) =>
              o._id === orderId
                ? {
                    ...o,
                    status: "completed" as any,
                    completedAt: new Date().toISOString(),
                  }
                : o
            )
          );
          showSuccess(
            "Delivery Accepted!",
            "The order is now marked as complete. Thank you for using our platform!"
          );
        } catch (err) {
          console.error("Error accepting delivery:", err);
          showError(
            "Failed to Accept",
            "Could not accept the delivery. Please try again."
          );
        } finally {
          setAcceptingOrderId(null);
        }
      },
      "Accept Delivery"
    );
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const getServiceUnreadCount = (serviceId: string) =>
    unreadMessages.filter((n) => n.serviceId === serviceId).length;

  const handleChatClick = async (serviceId: string) => {
    await markAsRead(serviceId);
  };

  const handleNotificationClick = async () => {
    if (unreadMessages.length > 0) {
      const first = unreadMessages[0];
      await markAsRead(first.serviceId);
      router.push(`/marketplace/chat/${first.serviceId}`);
      setShowMessageAlert(false);
    }
  };

  const getJobStatusColor = (status: string) =>
    ({
      pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      reviewing: "bg-blue-100 text-blue-700 border-blue-300",
      accepted: "bg-green-100 text-green-700 border-green-300",
      rejected: "bg-red-100 text-red-700 border-red-300",
    }[status] || "bg-gray-100 text-gray-700 border-gray-300");

  const getOrderStatusColor = (status: string) =>
    ({
      paid: "bg-green-100 text-green-700 border-green-300",
      in_progress: "bg-blue-100 text-blue-700 border-blue-300",
      delivered: "bg-purple-100 text-purple-700 border-purple-300",
      completed: "bg-gray-100 text-gray-700 border-gray-300",
    }[status] || "bg-gray-100 text-gray-700 border-gray-300");

  const getJobStatusIcon = (status: string) =>
    ({
      pending: <Clock size={11} />,
      reviewing: <Eye size={11} />,
      accepted: <CheckCircle size={11} />,
      rejected: <XCircle size={11} />,
    }[status] || <AlertCircle size={11} />);

  const getOrderStatusIcon = (status: string) =>
    ({
      paid: <DollarSign size={11} />,
      in_progress: <Clock size={11} />,
      delivered: <Package size={11} />,
      completed: <CheckCircle size={11} />,
    }[status] || <AlertCircle size={11} />);

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <Loader2 className="animate-spin text-amber-500 w-8 h-8" />
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-4 sm:py-6 md:py-10 px-3 sm:px-5 md:px-8">
      <div className="max-w-5xl mx-auto">

        {/* ── Toast notification ── */}
        <AnimatePresence>
          {showMessageAlert && unreadMessages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -80 }}
              className="fixed top-3 left-3 right-3 sm:left-auto sm:right-4 sm:top-4 z-50 bg-blue-600 text-white rounded-xl shadow-2xl p-3 sm:p-4 sm:w-72 md:w-80"
            >
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageCircle size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs sm:text-sm">New Message!</p>
                  <p className="text-[10px] sm:text-xs text-blue-100 mt-0.5 line-clamp-1">
                    {unreadMessages[0].message || "You have a new message"}
                  </p>
                </div>
                <button
                  onClick={() => setShowMessageAlert(false)}
                  className="text-white/60 hover:text-white flex-shrink-0 ml-1"
                >
                  <X size={14} />
                </button>
              </div>
              <button
                onClick={handleNotificationClick}
                className="mt-2.5 w-full py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition-colors"
              >
                View Chat
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 sm:mb-7 flex items-start justify-between gap-3"
        >
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 leading-tight mb-1">
              My Applications & Orders
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Track your job applications and marketplace orders
            </p>
          </div>

          {/* Bell */}
          <button
            onClick={handleNotificationClick}
            className="relative flex-shrink-0 p-2 sm:p-2.5 bg-white hover:bg-amber-50 rounded-xl transition-colors shadow-sm border border-gray-100"
          >
            <Bell size={18} className="text-gray-600" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </button>
        </motion.div>

        {/* ── Job Application Stats ── */}
        {applications.length > 0 && (
          <section className="mb-5 sm:mb-7">
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-700 mb-2.5 flex items-center gap-2">
              <Briefcase size={15} className="text-amber-500 flex-shrink-0" />
              Job Applications
            </h2>
            <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
              {[
                { label: "Total",     val: jobStats.total,     color: "border-l-gray-400",   text: "text-gray-800" },
                { label: "Pending",   val: jobStats.pending,   color: "border-l-yellow-400", text: "text-yellow-600" },
                { label: "Reviewing", val: jobStats.reviewing, color: "border-l-blue-400",   text: "text-blue-600" },
                { label: "Accepted",  val: jobStats.accepted,  color: "border-l-green-400",  text: "text-green-600", hideOnMobile: true },
                { label: "Rejected",  val: jobStats.rejected,  color: "border-l-red-400",    text: "text-red-600",   hideOnMobile: true },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`bg-white rounded-lg sm:rounded-xl shadow-sm p-2.5 sm:p-4 border-l-4 ${stat.color} ${
                    (stat as any).hideOnMobile ? "hidden sm:block" : ""
                  }`}
                >
                  <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-semibold truncate mb-1">
                    {stat.label}
                  </p>
                  <p className={`text-xl sm:text-2xl font-bold ${stat.text}`}>{stat.val}</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ── Marketplace Order Stats ── */}
        {orders.length > 0 && (
          <section className="mb-5 sm:mb-7">
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-700 mb-2.5 flex items-center gap-2">
              <Sparkles size={15} className="text-purple-500 flex-shrink-0" />
              Marketplace Orders
            </h2>
            <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
              {[
                { label: "Total",       val: orderStats.total,       color: "border-l-gray-400",   text: "text-gray-800" },
                { label: "Paid",        val: orderStats.paid,        color: "border-l-green-400",  text: "text-green-600" },
                { label: "In Progress", val: orderStats.in_progress, color: "border-l-blue-400",   text: "text-blue-600" },
                { label: "Delivered",   val: orderStats.delivered,   color: "border-l-purple-400", text: "text-purple-600", hideOnMobile: true },
                { label: "Completed",   val: orderStats.completed,   color: "border-l-gray-400",   text: "text-gray-600",   hideOnMobile: true },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`bg-white rounded-lg sm:rounded-xl shadow-sm p-2.5 sm:p-4 border-l-4 ${stat.color} ${
                    (stat as any).hideOnMobile ? "hidden sm:block" : ""
                  }`}
                >
                  <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-semibold truncate mb-1">
                    {stat.label}
                  </p>
                  <p className={`text-xl sm:text-2xl font-bold ${stat.text}`}>{stat.val}</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ── Empty state ── */}
        {applications.length === 0 && orders.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-8 sm:p-14 text-center">
            <Briefcase size={44} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-base sm:text-xl font-bold text-gray-700 mb-2">
              No Applications or Orders Yet
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mb-6">
              Start applying to jobs or browse marketplace services
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/jobs">
                <button className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-sm font-semibold shadow">
                  Browse Jobs
                </button>
              </Link>
              <Link href="/marketplace">
                <button className="w-full sm:w-auto px-6 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm font-semibold shadow">
                  Browse Services
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* ── Main content ── */}
        {(applications.length > 0 || orders.length > 0) && (
          <div className="space-y-3 sm:space-y-4">

            {/* ════════ JOB APPLICATIONS ════════ */}
            {applications.map((app, idx) => {
              const jobData = app.job;

              if (!jobData) {
                return (
                  <div
                    key={app._id}
                    className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-dashed border-gray-300 opacity-60"
                  >
                    <p className="text-xs text-gray-500 italic flex items-center gap-2">
                      <Trash2 size={13} /> Job posting removed or reference broken.
                    </p>
                  </div>
                );
              }

              return (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-md border-2 border-amber-100 hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="p-4 sm:p-5 md:p-6">
                    {/* Top row: title + status badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded uppercase mb-1.5">
                          <Briefcase size={9} /> JOB
                        </span>
                        <Link href={`/jobs/${jobData.slug}`}>
                          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 hover:text-amber-600 transition leading-snug line-clamp-2">
                            {jobData.title}
                          </h3>
                        </Link>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold border-2 flex-shrink-0 ${getJobStatusColor(app.status)}`}
                      >
                        {getJobStatusIcon(app.status)}
                        <span className="hidden xs:inline">{app.status.toUpperCase()}</span>
                        <span className="xs:hidden">{app.status[0].toUpperCase()}</span>
                      </span>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Building2 size={11} className="flex-shrink-0" />
                        <span className="truncate max-w-[90px] sm:max-w-none">{jobData.company}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={11} className="flex-shrink-0" />
                        <span className="truncate max-w-[80px] sm:max-w-none">{jobData.location}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign size={11} />{jobData.salary}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Cover letter */}
                    <div className="bg-amber-50 rounded-lg border border-amber-100 p-3 mb-4">
                      <p className="text-[9px] sm:text-[10px] font-bold text-amber-500 uppercase mb-1 flex items-center gap-1.5">
                        <FileText size={9} /> Cover Letter
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2 italic">
                        "{app.coverLetter}"
                      </p>
                    </div>

                    {/* Action row */}
                    <div className="flex gap-2 flex-wrap">
                      <Link href={`/jobs/${jobData.slug}`}>
                        <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-xs transition shadow-sm">
                          View Job
                        </button>
                      </Link>
                      {app.resumeUrl && (
                        <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer">
                          <button className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-semibold text-xs hover:bg-gray-50 transition flex items-center gap-1.5">
                            <FileText size={12} /> Resume
                          </button>
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* ════════ MARKETPLACE ORDERS ════════ */}
            {orders.map((order, idx) => {
              const canChat = ["paid", "in_progress", "delivered"].includes(order.status);
              const serviceUnreadCount = getServiceUnreadCount(order.serviceId._id);
              const isAccepting = acceptingOrderId === order._id;

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-md border-2 border-purple-100 hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="p-4 sm:p-5 md:p-6">
                    {/* Top row: title + status badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-[9px] font-bold rounded uppercase">
                            <Sparkles size={9} /> ORDER
                          </span>
                          {canChat && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold rounded uppercase">
                              <MessageCircle size={9} /> CHAT OPEN
                            </span>
                          )}
                        </div>
                        <Link href={`/marketplace/tasks/${order.serviceId._id}`}>
                          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 hover:text-purple-600 transition leading-snug line-clamp-2">
                            {order.title}
                          </h3>
                        </Link>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold border-2 flex-shrink-0 whitespace-nowrap ${getOrderStatusColor(order.status)}`}
                      >
                        {getOrderStatusIcon(order.status)}
                        {/* Full label on sm+, short on mobile */}
                        <span className="hidden sm:inline">
                          {order.status.replace(/_/g, " ").toUpperCase()}
                        </span>
                        <span className="sm:hidden">
                          {order.status === "in_progress"
                            ? "WIP"
                            : order.status[0].toUpperCase()}
                        </span>
                      </span>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1 font-semibold text-green-600">
                        <DollarSign size={11} />${order.totalAmount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 size={11} className="flex-shrink-0" />
                        <span className="truncate max-w-[80px] sm:max-w-none">{order.serviceId.category}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />{order.deliveryTime}d
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag size={11} className="flex-shrink-0" />
                        <span className="truncate max-w-[90px] sm:max-w-none">
                          {order.developerId.companyName ||
                            `${order.developerId.firstName} ${order.developerId.lastName}`}
                        </span>
                      </span>
                      {order.paidAt && (
                        <span className="flex items-center gap-1">
                          <CheckCircle size={11} className="text-green-400" />
                          {new Date(order.paidAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Order description */}
                    <div className="bg-purple-50 rounded-lg border border-purple-100 p-3 mb-3">
                      <p className="text-[9px] sm:text-[10px] font-bold text-purple-500 uppercase mb-1 flex items-center gap-1.5">
                        <Package size={9} /> Order Description
                      </p>
                      <p className="text-xs text-gray-700 line-clamp-2">{order.description}</p>
                    </div>

                    {/* Delivery note with clickable links */}
                    {order.deliveryNote && (
                      <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-3 mb-3">
                        <p className="text-[9px] sm:text-[10px] font-bold text-blue-600 uppercase mb-1.5 flex items-center gap-1.5">
                          <FileText size={9} /> Delivery Note
                        </p>
                        <p className="text-xs text-blue-900 leading-relaxed break-words">
                          {renderTextWithLinks(order.deliveryNote)}
                        </p>
                        {order.deliveredAt && (
                          <p className="text-[9px] text-blue-400 mt-1.5">
                            Delivered: {new Date(order.deliveredAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action row */}
                    <div className="flex gap-2 flex-wrap">
                      {/* Chat */}
                      {canChat && (
                        <Link
                          href={`/marketplace/services/${order.serviceId._id}/chat`}
                          onClick={() => handleChatClick(order.serviceId._id)}
                          className="relative"
                        >
                          <button className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold text-xs transition shadow-md">
                            <MessageCircle size={12} />
                            <span className="hidden sm:inline">Open Chat</span>
                            <span className="sm:hidden">Chat</span>
                          </button>
                          {serviceUnreadCount > 0 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow"
                            >
                              {serviceUnreadCount > 9 ? "9+" : serviceUnreadCount}
                            </motion.span>
                          )}
                        </Link>
                      )}

                      {/* View Service */}
                      <Link href={`/marketplace/tasks/${order.serviceId._id}`}>
                        <button className="px-3 sm:px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold text-xs transition">
                          <span className="hidden sm:inline">View Service</span>
                          <span className="sm:hidden">View</span>
                        </button>
                      </Link>

                      {/* Accept Delivery */}
                      {order.status === "delivered" && (
                        <button
                          onClick={() => handleAcceptDelivery(order._id)}
                          disabled={isAccepting}
                          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-xs transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isAccepting ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <CheckCircle size={12} />
                          )}
                          Accept Delivery
                        </button>
                      )}

                      {/* Completed badge */}
                      {order.status === "completed" && (
                        <div className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500">
                          <CheckCircle size={11} className="text-green-400" />
                          COMPLETED
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════
          NOTIFICATION MODAL — replaces all alert() calls
      ════════════════════════════════════ */}
      <AnimatePresence>
        {notifModal.show && (
          <NotificationModal modal={notifModal} onClose={closeModal} />
        )}
      </AnimatePresence>
    </div>
  );
}
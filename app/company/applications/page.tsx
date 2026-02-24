"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, api, getToken } from "@/app/context/AuthContext";
import {
  Users,
  Search,
  Eye,
  Mail,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ChevronLeft,
  AlertCircle,
  Briefcase,
  MoreVertical,
  X,
  Tag,
  DollarSign,
  MessageCircle,
  Package,
  Sparkles,
  FileText,
  User,
  ExternalLink,
} from "lucide-react";

interface Application {
  _id: string;
  isMarketplace?: boolean;
  job?: {
    _id: string;
    title: string;
    slug: string;
  };
  serviceId?: {
    _id: string;
    title: string;
    budget: number;
  };
  developerId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  coverLetter?: string;
  resumeUrl?: string;
  proposedTimeline?: string;
  proposedRate?: number;
  portfolioUrl?: string;
  status: string;
  appliedAt: string;
  notes?: string;
}

interface Order {
  _id: string;
  title: string;
  description: string;
  price: number;
  totalAmount: number;
  deliveryTime: number;
  status: "pending_payment" | "paid" | "in_progress" | "delivered" | "completed";
  serviceId: {
    _id: string;
    title: string;
  };
  clientId: {
    _id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    email: string;
    avatar?: string;
  };
  developerId?: {
    _id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    email: string;
  };
  paidAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  deliveryNote?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ✅ Helper: Parse text and make URLs clickable
function renderTextWithLinks(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline font-medium break-all"
        >
          {part}
          <ExternalLink size={12} className="flex-shrink-0" />
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function CompanyApplicationsPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [acceptingDelivery, setAcceptingDelivery] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "error"; message: string }>({
    show: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    if (authLoading) return;
    const token = getToken();
    if (!token) {
      router.push("/company/login");
      return;
    }
    fetchApplications();
  }, [authLoading, pagination.page, statusFilter, typeFilter]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "success", message: "" }), 3000);
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);

      let jobApps: Application[] = [];
      let marketOrders: Order[] = [];

      if (typeFilter === "all" || typeFilter === "job") {
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        });
        if (statusFilter) params.append("status", statusFilter);

        const jobAppsRes = await api.get(`/company/applications?${params}`);
        jobApps = (jobAppsRes.data.data || []).map((app: any) => ({
          ...app,
          isMarketplace: false,
        }));
      }

      if (typeFilter === "all" || typeFilter === "marketplace") {
        try {
          const response = await api.get("/marketplace/my-orders");
          marketOrders = (response.data || [])
            .filter((order: any) => {
              const isValidStatus = ["paid", "in_progress", "delivered", "completed"].includes(order.status);
              if (statusFilter) return isValidStatus && order.status === statusFilter;
              return isValidStatus;
            })
            .map((order: any) => ({
              ...order,
              serviceId: order.serviceId || { _id: "N/A", title: "Unknown Service" },
            }));
        } catch (err) {
          console.error("Error fetching marketplace orders:", err);
        }
      }

      setApplications(jobApps);
      setOrders(marketOrders);

      const totalCount = jobApps.length + marketOrders.length;
      setPagination({ page: 1, limit: 10, total: totalCount, pages: Math.ceil(totalCount / 10) });
    } catch (err: any) {
      console.error("Error fetching applications:", err);
      if (err.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (app: Application, newStatus: string) => {
    try {
      const endpoint = app.isMarketplace
        ? `/marketplace/applications/${app._id}/status`
        : `/company/applications/${app._id}/status`;

      await api.patch(endpoint, { status: newStatus });

      setApplications((prev) => prev.map((a) => (a._id === app._id ? { ...a, status: newStatus } : a)));

      if (selectedApplication?._id === app._id) {
        setSelectedApplication((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      showToast("success", `Status updated to ${newStatus}`);
    } catch (err: any) {
      showToast("error", "Failed to update status");
    } finally {
      setActionMenuOpen(null);
    }
  };

  const handleAcceptDelivery = async (orderId: string) => {
    setAcceptingDelivery(true);
    try {
      await api.post(`/marketplace/orders/${orderId}/accept-delivery`, {
        review: "Order completed successfully",
        rating: 5,
      });

      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: "completed" as any, completedAt: new Date().toISOString() } : o
        )
      );

      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: "completed", completedAt: new Date().toISOString() } : null
        );
      }

      showToast("success", "Delivery accepted! Order completed.");
      fetchApplications();
    } catch (err) {
      console.error("Error accepting delivery:", err);
      showToast("error", "Failed to accept delivery");
    } finally {
      setAcceptingDelivery(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const applicantData = app.user || app.developerId;
    const name = `${applicantData?.firstName || ""} ${applicantData?.lastName || ""}`.toLowerCase();
    const email = applicantData?.email?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  const filteredOrders = orders.filter((order) => {
    const name = `${order.clientId?.firstName || ""} ${order.clientId?.lastName || ""}`.toLowerCase();
    const email = order.clientId?.email?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any; label: string }> = {
      pending: { color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: Clock, label: "Pending" },
      reviewing: { color: "bg-blue-100 text-blue-700 border-blue-300", icon: Eye, label: "Reviewing" },
      accepted: { color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle, label: "Accepted" },
      rejected: { color: "bg-red-100 text-red-700 border-red-300", icon: XCircle, label: "Rejected" },
      paid: { color: "bg-green-100 text-green-700 border-green-300", icon: DollarSign, label: "Paid" },
      in_progress: { color: "bg-blue-100 text-blue-700 border-blue-300", icon: Clock, label: "In Progress" },
      delivered: { color: "bg-purple-100 text-purple-700 border-purple-300", icon: Package, label: "Delivered" },
      completed: { color: "bg-gray-100 text-gray-700 border-gray-300", icon: CheckCircle, label: "Completed" },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1 whitespace-nowrap ${badge.color}`}>
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  if (authLoading || (loading && applications.length === 0 && orders.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-[90vw] ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white text-sm`}
          >
            {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/company/dashboard" className="text-gray-500 hover:text-gray-700">
                <ChevronLeft size={24} />
              </Link>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Applications & Orders</h1>
                <p className="text-xs sm:text-sm text-gray-500">{pagination.total} total items</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
              />
            </div>

            {/* Filter row */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white text-sm"
              >
                <option value="all">All Items</option>
                <option value="job">Job Applications</option>
                <option value="marketplace">Marketplace Orders</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white text-sm"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="paid">Paid</option>
                <option value="in_progress">In Progress</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {filteredApplications.length === 0 && filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center">
            <Users className="mx-auto text-gray-300 mb-4" size={56} />
            <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">No items found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {/* Job Applications */}
            {filteredApplications.map((app, idx) => {
              const applicantData = app.user || app.developerId;

              return (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="bg-white rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition cursor-pointer border-2 border-transparent hover:border-amber-200"
                  onClick={() => setSelectedApplication(app)}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-full flex-shrink-0 flex items-center justify-center text-amber-700 font-bold text-base sm:text-lg overflow-hidden">
                      {applicantData?.avatar ? (
                        <img src={applicantData.avatar} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        `${applicantData?.firstName?.[0] || ""}${applicantData?.lastName?.[0] || ""}`
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-sm sm:text-base font-bold text-gray-800 truncate">
                          {applicantData?.firstName} {applicantData?.lastName}
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded uppercase">
                          <Briefcase size={10} /> JOB
                        </span>
                        {getStatusBadge(app.status)}
                      </div>
                      <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                        <Mail size={12} /> {applicantData?.email}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Briefcase size={12} /> {app.job?.title}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400 hidden sm:block">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuOpen(actionMenuOpen === app._id ? null : app._id);
                          }}
                          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          <MoreVertical size={18} className="text-gray-500" />
                        </button>

                        <AnimatePresence>
                          {actionMenuOpen === app._id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                            >
                              <button
                                onClick={() => handleStatusChange(app, "reviewing")}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700 w-full text-left text-sm transition"
                              >
                                <Eye size={15} /> Mark Reviewing
                              </button>
                              <hr className="my-1 border-gray-100" />
                              <button
                                onClick={() => handleStatusChange(app, "accepted")}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-green-50 text-green-600 w-full text-left text-sm transition"
                              >
                                <CheckCircle size={15} /> Accept
                              </button>
                              <button
                                onClick={() => handleStatusChange(app, "rejected")}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 w-full text-left text-sm transition"
                              >
                                <XCircle size={15} /> Reject
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Marketplace Orders */}
            {filteredOrders.map((order, idx) => {
              const canChat = ["paid", "in_progress", "delivered"].includes(order.status);
              const developerName =
                order.developerId?.companyName ||
                `${order.developerId?.firstName || ""} ${order.developerId?.lastName || ""}`.trim() ||
                "Unknown Developer";

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (filteredApplications.length + idx) * 0.03 }}
                  className="bg-white rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition cursor-pointer border-2 border-transparent hover:border-purple-200"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex-shrink-0 flex items-center justify-center text-purple-700 font-bold">
                          <User size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-sm sm:text-base font-bold text-gray-800 truncate">{order.title}</h3>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-black rounded uppercase">
                              <Sparkles size={10} /> ORDER
                            </span>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <User size={11} />
                            Dev: <span className="font-semibold truncate">{developerName}</span>
                          </p>
                        </div>
                      </div>

                      {/* Paid Amount */}
                      <div className="bg-green-50 px-3 py-2 rounded-xl border-2 border-green-200 flex-shrink-0 text-right">
                        <p className="text-[10px] font-bold text-green-600 uppercase">Paid</p>
                        <p className="text-base sm:text-xl font-black text-green-600">${order.totalAmount}</p>
                      </div>
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div className="bg-gray-50 p-2.5 rounded-xl">
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Service</p>
                        <p className="text-xs font-semibold text-gray-800 truncate">{order.serviceId?.title}</p>
                      </div>
                      <div className="bg-gray-50 p-2.5 rounded-xl">
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Delivery</p>
                        <p className="text-xs font-semibold text-gray-800">{order.deliveryTime} days</p>
                      </div>
                      <div className="bg-gray-50 p-2.5 rounded-xl col-span-2 sm:col-span-1">
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Paid On</p>
                        <p className="text-xs font-semibold text-gray-800">
                          {order.paidAt ? new Date(order.paidAt).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* ✅ Delivery Note with clickable links */}
                    {order.deliveryNote && (
                      <div className="bg-blue-50 p-3 sm:p-4 rounded-xl border-2 border-blue-200">
                        <p className="text-[10px] font-bold text-blue-600 uppercase mb-2 flex items-center gap-1">
                          <FileText size={12} /> Delivery Note
                        </p>
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed break-words">
                          {renderTextWithLinks(order.deliveryNote)}
                        </p>
                        {order.deliveredAt && (
                          <p className="text-xs text-blue-600 mt-2">
                            Delivered: {new Date(order.deliveredAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {canChat && (
                        <Link
                          href={`/marketplace/chat/${order.serviceId._id}`}
                          className="flex-1 min-w-[120px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-xs sm:text-sm rounded-lg transition flex items-center justify-center gap-2">
                            <MessageCircle size={14} /> Open Chat
                          </button>
                        </Link>
                      )}

                      {order.status === "delivered" && (
                        <button
                          disabled={acceptingDelivery}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptDelivery(order._id);
                          }}
                          className="flex-1 min-w-[120px] py-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-xs sm:text-sm rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {acceptingDelivery ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle size={14} />
                          )}
                          Accept Delivery
                        </button>
                      )}

                      {order.status === "completed" && (
                        <div className="flex-1 min-w-[120px] py-2 bg-gray-100 text-gray-700 font-semibold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2">
                          <CheckCircle size={14} className="text-green-600" />
                          Completed
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs sm:text-sm rounded-lg transition flex items-center gap-1.5"
                      >
                        <Eye size={14} /> View
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Application Detail Modal */}
      <AnimatePresence>
        {selectedApplication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setSelectedApplication(null)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 sm:p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Application Details</h2>
                <button onClick={() => setSelectedApplication(null)} className="p-2 hover:bg-gray-100 rounded-full transition">
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 sm:p-8">
                <div className="flex items-center gap-4 mb-6 sm:mb-8">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 bg-amber-500 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg">
                    {(selectedApplication.user?.firstName?.[0] || "") + (selectedApplication.user?.lastName?.[0] || "")}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-800">
                      {selectedApplication.user?.firstName} {selectedApplication.user?.lastName}
                    </h3>
                    <p className="text-gray-500 text-sm">{selectedApplication.user?.email}</p>
                    <p className="text-xs sm:text-sm text-amber-600 font-medium mt-1">
                      Applied for: {selectedApplication.job?.title}
                    </p>
                  </div>
                </div>

                <div className="mb-6 sm:mb-8">
                  <h4 className="text-xs font-bold text-gray-800 mb-3 uppercase tracking-wider">Cover Letter</h4>
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-100 text-gray-600 leading-relaxed whitespace-pre-wrap italic text-sm">
                    "{selectedApplication.coverLetter || "No cover letter provided."}"
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <button
                    onClick={() => handleStatusChange(selectedApplication, "reviewing")}
                    className="py-2.5 sm:py-3 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition border border-blue-200 text-sm"
                  >
                    Review
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedApplication, "accepted")}
                    className="py-2.5 sm:py-3 bg-green-50 text-green-700 rounded-xl font-bold hover:bg-green-100 transition border border-green-200 text-sm"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedApplication, "rejected")}
                    className="py-2.5 sm:py-3 bg-red-50 text-red-700 rounded-xl font-bold hover:bg-red-100 transition border border-red-200 text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 sm:p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Order Details</h2>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                    <Sparkles size={12} /> Marketplace
                  </span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0">
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 sm:p-8 space-y-4 sm:space-y-6">
                {/* Developer Info */}
                <div className="bg-purple-50 p-4 sm:p-5 rounded-2xl border-2 border-purple-200">
                  <p className="text-xs font-bold text-purple-600 uppercase mb-2">Developer</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">
                    {selectedOrder.developerId?.companyName ||
                      `${selectedOrder.developerId?.firstName || ""} ${selectedOrder.developerId?.lastName || ""}`.trim() ||
                      "Unknown Developer"}
                  </p>
                  {selectedOrder.developerId?.email && (
                    <p className="text-sm text-gray-600 mt-1">{selectedOrder.developerId.email}</p>
                  )}
                </div>

                {/* Order Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 p-3 sm:p-4 rounded-xl border-2 border-green-200">
                    <p className="text-xs text-green-600 uppercase font-bold mb-1">Amount Paid</p>
                    <p className="text-xl sm:text-2xl font-black text-green-600">${selectedOrder.totalAmount}</p>
                  </div>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Delivery Time</p>
                    <p className="text-base sm:text-lg font-bold text-gray-700">{selectedOrder.deliveryTime} days</p>
                  </div>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Service</p>
                    <p className="text-xs sm:text-sm font-semibold text-gray-700">{selectedOrder.serviceId?.title}</p>
                  </div>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Paid On</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-700">
                      {selectedOrder.paidAt ? new Date(selectedOrder.paidAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Order Description */}
                <div>
                  <h4 className="text-xs font-bold text-gray-800 mb-3 uppercase tracking-wider">Order Description</h4>
                  <div className="bg-purple-50 rounded-xl p-4 sm:p-5 border-2 border-purple-100 text-gray-700 leading-relaxed">
                    <p className="font-bold mb-2 text-sm sm:text-base">{selectedOrder.title}</p>
                    <p className="text-sm">{selectedOrder.description}</p>
                  </div>
                </div>

                {/* ✅ Delivery Note with clickable links */}
                {selectedOrder.deliveryNote && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 mb-3 uppercase tracking-wider">Delivery Note</h4>
                    <div className="bg-blue-50 rounded-xl p-4 sm:p-5 border-2 border-blue-200 text-gray-700 leading-relaxed">
                      <p className="text-sm break-words">{renderTextWithLinks(selectedOrder.deliveryNote)}</p>
                      {selectedOrder.deliveredAt && (
                        <p className="text-xs text-blue-600 mt-3">
                          Delivered on: {new Date(selectedOrder.deliveredAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/marketplace/chat/${selectedOrder.serviceId._id}`}
                    className="flex-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
                      <MessageCircle size={18} />
                      Open Chat
                    </button>
                  </Link>

                  {selectedOrder.status === "delivered" && (
                    <button
                      disabled={acceptingDelivery}
                      onClick={() => handleAcceptDelivery(selectedOrder._id)}
                      className="flex-1 py-3 sm:py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                    >
                      {acceptingDelivery ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Accepting...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          Accept Delivery
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
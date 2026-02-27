"use client";

import { JSX, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  TrendingUp,
  Sparkles,
  Filter,
  Search,
  AlertCircle,
  Mail,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Building2,
  User,
  CreditCard,
  FileText,
  RefreshCw,
  X,
  Hash,
  MessageSquare,
  BadgeCheck,
  Ban,
} from "lucide-react";
import { useAdmin, adminApi } from "../context/AdminContext";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Developer {
  _id: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email: string;
  paypalEmail?: string;
  phone?: string;
}

interface PayoutRequest {
  _id: string;
  amount: number;
  paypalEmail: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  processedAt?: string;
  paypalPayoutId?: string;
  adminNotes?: string;
  developerModel: "User" | "Company";
  developerId: Developer;
  orderId: {
    _id: string;
    title: string;
    price: number;
    totalAmount: number;
    status: string;
    serviceId?: { _id: string; title: string; category: string; budget: number };
    clientId?: { firstName?: string; lastName?: string; companyName?: string; email: string };
  };
}

interface DashboardStats {
  payoutRequests: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    last30Days: number;
  };
  amounts: {
    totalPending: number;
    totalApproved: number;
    last30Days: number;
  };
  completedOrders: {
    total: number;
    awaitingPayout: number;
  };
}

const ITEMS_PER_PAGE = 10;

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminPayoutsPage() {
  const { loading: authLoading } = useAdmin();

  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [approveModal, setApproveModal] = useState<{ show: boolean; payout: PayoutRequest | null }>({ show: false, payout: null });
  const [rejectModal, setRejectModal] = useState<{ show: boolean; payout: PayoutRequest | null }>({ show: false, payout: null });

  // Form state
  const [approveForm, setApproveForm] = useState({ paypalPayoutId: "", notes: "" });
  const [rejectForm, setRejectForm] = useState({ reason: "" });
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "error"; message: string }>({ show: false, type: "success", message: "" });

  // ── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchPayouts();
    fetchStats();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "success", message: "" }), 3500);
  };

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get("/admin/payouts");
      setPayouts(res.data.payoutRequests || []);
    } catch (err) {
      console.error("Error fetching payouts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await adminApi.get("/admin/payouts/stats/dashboard");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // ── Actions ────────────────────────────────────────────────────────────────

const handleApprove = async () => {
  if (!approveModal.payout) return;
  setProcessing(true);
  try {
    await adminApi.post(`/admin/payouts/${approveModal.payout._id}/approve`, {
      paypalPayoutId: approveForm.paypalPayoutId || undefined,
      notes: approveForm.notes || undefined,
    });

    // ✅ Update local state so UI reflects change immediately
    setPayouts((prev) =>
      prev.map((p) =>
        p._id === approveModal.payout!._id
          ? {
              ...p,
              status: "approved",
              processedAt: new Date().toISOString(),
              paypalPayoutId: approveForm.paypalPayoutId || undefined,
              adminNotes: approveForm.notes || undefined,
            }
          : p
      )
    );

    // ✅ Close modal and reset form
    setApproveModal({ show: false, payout: null });
    setApproveForm({ paypalPayoutId: "", notes: "" });

    // ✅ Show success toast
    showToast("success", "Payout approved successfully!");

    // ✅ Refresh stats
    fetchStats();
  } catch (err: any) {
    showToast("error", err.response?.data?.message || "Failed to approve payout");
  } finally {
    // ✅ Always reset processing state
    setProcessing(false);
  }
};

  const handleReject = async () => {
    if (!rejectModal.payout || !rejectForm.reason.trim()) return;
    setProcessing(true);
    try {
      await adminApi.post(`/admin/payouts/${rejectModal.payout._id}/reject`, {
        reason: rejectForm.reason,
      });

      setPayouts((prev) =>
        prev.map((p) =>
          p._id === rejectModal.payout!._id
            ? { ...p, status: "rejected", processedAt: new Date().toISOString(), adminNotes: rejectForm.reason }
            : p
        )
      );

      setRejectModal({ show: false, payout: null });
      setRejectForm({ reason: "" });
      showToast("success", "Payout rejected.");
      fetchStats();
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to reject payout");
    } finally {
      setProcessing(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getStatusBadge = (status: string) => {
    const map: Record<string, { cls: string; icon: JSX.Element; label: string }> = {
      pending:  { cls: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: <Clock size={12} />, label: "Pending" },
      approved: { cls: "bg-green-100 text-green-700 border-green-300",   icon: <BadgeCheck size={12} />, label: "Approved" },
      rejected: { cls: "bg-red-100 text-red-700 border-red-300",         icon: <Ban size={12} />, label: "Rejected" },
    };
    const s = map[status] || map.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border-2 ${s.cls}`}>
        {s.icon} {s.label}
      </span>
    );
  };

  const developerName = (d: Developer) =>
    d?.companyName || `${d?.firstName || ""} ${d?.lastName || ""}`.trim() || "Unknown";

  // ── Pagination ─────────────────────────────────────────────────────────────

  const filtered = payouts.filter((p) => {
    const search = searchTerm.toLowerCase();
    const matchSearch =
      developerName(p.developerId).toLowerCase().includes(search) ||
      p.developerId?.email?.toLowerCase().includes(search) ||
      p.paypalEmail?.toLowerCase().includes(search) ||
      p.orderId?.title?.toLowerCase().includes(search);
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const goToPage = (p: number) => {
    setCurrentPage(Math.max(1, Math.min(p, totalPages)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, 5];
    if (currentPage >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
        <Loader2 className="animate-spin text-green-600 w-12 h-12" />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 py-8 px-4">

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-white text-sm font-semibold ${
              toast.type === "success" ? "bg-green-600" : "bg-red-500"
            }`}
          >
            {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-1">Payout Requests</h1>
              <p className="text-gray-500">Review and process developer payout requests</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { fetchPayouts(); fetchStats(); }}
                className="p-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-green-400 hover:text-green-600 transition-all shadow-sm"
                title="Refresh"
              >
                <RefreshCw size={18} />
              </button>
              <Link href="/admin">
                <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow-lg">
                  Back to Dashboard
                </button>
              </Link>
            </div>
          </div>

          {/* ── Stats ── */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-yellow-500">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Pending</p>
                <p className="text-3xl font-black text-yellow-600">{stats.payoutRequests.pending}</p>
                <p className="text-xs text-gray-400 mt-1">${stats.amounts.totalPending.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Approved</p>
                <p className="text-3xl font-black text-green-600">{stats.payoutRequests.approved}</p>
                <p className="text-xs text-gray-400 mt-1">${stats.amounts.totalApproved.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-red-500">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Rejected</p>
                <p className="text-3xl font-black text-red-600">{stats.payoutRequests.rejected}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-gray-500">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total</p>
                <p className="text-3xl font-black text-gray-800">{stats.payoutRequests.total}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Last 30d</p>
                <p className="text-3xl font-black text-blue-600">{stats.payoutRequests.last30Days}</p>
                <p className="text-xs text-gray-400 mt-1">${stats.amounts.last30Days.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-purple-500">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Awaiting</p>
                <p className="text-3xl font-black text-purple-600">{stats.completedOrders.awaitingPayout}</p>
                <p className="text-xs text-gray-400 mt-1">no request yet</p>
              </div>
            </div>
          )}

          {/* ── Filters ── */}
          <div className="bg-white rounded-xl p-5 shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by developer, email, PayPal or order..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 
             focus:ring-4 focus:ring-green-100 outline-none transition-all text-sm text-gray-900"
                />
              </div>
              <div className="relative">
                <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all appearance-none bg-white text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
              <span>
                Showing <span className="font-bold text-gray-800">{filtered.length === 0 ? 0 : startIdx + 1}–{Math.min(startIdx + ITEMS_PER_PAGE, filtered.length)}</span> of <span className="font-bold text-gray-800">{filtered.length}</span> requests
              </span>
              {totalPages > 1 && <span>Page {currentPage} of {totalPages}</span>}
            </div>
          </div>
        </motion.div>

        {/* ── List ── */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-lg">
            <DollarSign size={64} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 mb-2">No Payout Requests</h3>
            <p className="text-gray-400">{searchTerm || statusFilter !== "all" ? "Try adjusting filters" : "Payout requests will appear here"}</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginated.map((payout, idx) => (
                <motion.div
                  key={payout._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`bg-white rounded-2xl p-6 shadow-lg border-2 hover:shadow-xl transition-all ${
                    payout.status === "pending"
                      ? "border-yellow-200 hover:border-yellow-400"
                      : payout.status === "approved"
                      ? "border-green-100 hover:border-green-300"
                      : "border-red-100 hover:border-red-300"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left info */}
                    <div className="flex-1">
                      {/* Header row */}
                      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded uppercase">
                            <DollarSign size={10} /> PAYOUT
                          </span>
                          {getStatusBadge(payout.status)}
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">
                            {payout.developerModel === "Company" ? <Building2 size={10} /> : <User size={10} />}
                            {payout.developerModel}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-green-600">${payout.amount.toFixed(2)}</p>
                          <p className="text-xs text-gray-400">Requested {new Date(payout.requestedAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Developer & Order grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Developer */}
                        <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-100">
                          <p className="text-xs font-black text-purple-600 uppercase mb-2">Developer</p>
                          <p className="font-bold text-gray-900 text-sm">{developerName(payout.developerId)}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Mail size={11} /> {payout.developerId?.email}
                          </p>
                          <p className="text-xs text-blue-600 flex items-center gap-1 mt-1 font-semibold">
                            <CreditCard size={11} /> PayPal: {payout.paypalEmail}
                          </p>
                        </div>

                        {/* Order */}
                        <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-100">
                          <p className="text-xs font-black text-blue-600 uppercase mb-2">Order</p>
                          <p className="font-bold text-gray-900 text-sm truncate">{payout.orderId?.title}</p>
                          {payout.orderId?.serviceId && (
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              Service: {payout.orderId.serviceId.title}
                            </p>
                          )}
                          <p className="text-xs text-green-600 font-bold mt-1">
                            Order total: ${payout.orderId?.totalAmount?.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Processed info */}
                      {payout.status !== "pending" && (
                        <div className={`rounded-xl p-3 border-2 text-xs ${
                          payout.status === "approved" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                        }`}>
                          <div className="flex flex-wrap gap-4">
                            {payout.processedAt && (
                              <span className="flex items-center gap-1 text-gray-600">
                                <Calendar size={11} /> Processed: {new Date(payout.processedAt).toLocaleDateString()}
                              </span>
                            )}
                            {payout.paypalPayoutId && (
                              <span className="flex items-center gap-1 text-blue-600 font-semibold">
                                <Hash size={11} /> TX: {payout.paypalPayoutId}
                              </span>
                            )}
                            {payout.adminNotes && (
                              <span className="flex items-center gap-1 text-gray-600">
                                <MessageSquare size={11} /> {payout.adminNotes}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-2 lg:min-w-[140px]">
                      <button
                        onClick={() => setSelectedPayout(payout)}
                        className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition text-sm flex items-center justify-center gap-1.5"
                      >
                        <Eye size={15} /> View
                      </button>

                      {payout.status === "pending" && (
                        <>
                          <button
                            onClick={() => { setApproveModal({ show: true, payout }); setApproveForm({ paypalPayoutId: "", notes: "" }); }}
                            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition text-sm flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle size={15} /> Approve
                          </button>
                          <button
                            onClick={() => { setRejectModal({ show: true, payout }); setRejectForm({ reason: "" }); }}
                            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition text-sm flex items-center justify-center gap-1.5"
                          >
                            <XCircle size={15} /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
                <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="p-2 rounded-xl bg-white border-2 border-gray-200 hover:border-green-400 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"><ChevronsLeft size={18} /></button>
                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-xl bg-white border-2 border-gray-200 hover:border-green-400 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"><ChevronLeft size={18} /></button>
                {pageNumbers().map((p) => (
                  <button key={p} onClick={() => goToPage(p)} className={`w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm border-2 ${currentPage === p ? "bg-green-600 border-green-600 text-white scale-105 shadow-green-200 shadow-md" : "bg-white border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-600"}`}>{p}</button>
                ))}
                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-xl bg-white border-2 border-gray-200 hover:border-green-400 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"><ChevronRight size={18} /></button>
                <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-xl bg-white border-2 border-gray-200 hover:border-green-400 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"><ChevronsRight size={18} /></button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════
          DETAIL MODAL
      ════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedPayout && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setSelectedPayout(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-white border-b-2 border-gray-100 p-6 rounded-t-3xl z-10 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-1">Payout Details</h2>
                  <p className="text-xs text-gray-400 font-mono">ID: {selectedPayout._id}</p>
                  <div className="mt-2">{getStatusBadge(selectedPayout.status)}</div>
                </div>
                <button onClick={() => setSelectedPayout(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Amount */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-green-600 uppercase mb-1">Payout Amount</p>
                    <p className="text-4xl font-black text-green-700">${selectedPayout.amount.toFixed(2)}</p>
                  </div>
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                    <DollarSign size={32} className="text-green-600" />
                  </div>
                </div>

                {/* Developer */}
                <div className="bg-purple-50 rounded-2xl p-5 border-2 border-purple-100">
                  <p className="text-xs font-black text-purple-600 uppercase mb-3">Developer Info</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                      {developerName(selectedPayout.developerId)[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{developerName(selectedPayout.developerId)}</p>
                      <p className="text-sm text-gray-500">{selectedPayout.developerId?.email}</p>
                    </div>
                    <span className="ml-auto inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                      {selectedPayout.developerModel === "Company" ? <Building2 size={11} /> : <User size={11} />}
                      {selectedPayout.developerModel}
                    </span>
                  </div>
                  <div className="bg-white rounded-xl p-3 flex items-center gap-2 border border-blue-100">
                    <CreditCard size={16} className="text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 font-semibold">PayPal Email</p>
                      <p className="text-sm font-bold text-blue-700">{selectedPayout.paypalEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Order */}
                <div className="bg-blue-50 rounded-2xl p-5 border-2 border-blue-100">
                  <p className="text-xs font-black text-blue-600 uppercase mb-3">Linked Order</p>
                  <p className="font-bold text-gray-900 mb-1">{selectedPayout.orderId?.title}</p>
                  {selectedPayout.orderId?.serviceId && (
                    <p className="text-sm text-gray-600 mb-2">Service: <span className="font-semibold">{selectedPayout.orderId.serviceId.title}</span></p>
                  )}
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-600">Order total: <span className="font-bold text-green-600">${selectedPayout.orderId?.totalAmount?.toFixed(2)}</span></span>
                    <span className="text-gray-600">Payout: <span className="font-bold text-green-600">${selectedPayout.amount.toFixed(2)}</span></span>
                  </div>
                  {selectedPayout.orderId?.clientId && (
                    <p className="text-xs text-gray-500 mt-2">
                      Client: {selectedPayout.orderId.clientId.companyName || `${selectedPayout.orderId.clientId.firstName || ""} ${selectedPayout.orderId.clientId.lastName || ""}`.trim()} — {selectedPayout.orderId.clientId.email}
                    </p>
                  )}
                </div>

                {/* Processed info */}
                {selectedPayout.status !== "pending" && (
                  <div className={`rounded-2xl p-5 border-2 ${selectedPayout.status === "approved" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                    <p className="text-xs font-black uppercase mb-3" style={{ color: selectedPayout.status === "approved" ? "#16a34a" : "#dc2626" }}>Processing Info</p>
                    <div className="space-y-2 text-sm">
                      {selectedPayout.processedAt && <p className="text-gray-600 flex items-center gap-2"><Calendar size={14} /> Processed: {new Date(selectedPayout.processedAt).toLocaleString()}</p>}
                      {selectedPayout.paypalPayoutId && <p className="text-blue-600 font-semibold flex items-center gap-2"><Hash size={14} /> Transaction ID: {selectedPayout.paypalPayoutId}</p>}
                      {selectedPayout.adminNotes && <p className="text-gray-600 flex items-start gap-2"><MessageSquare size={14} className="mt-0.5 flex-shrink-0" /> {selectedPayout.adminNotes}</p>}
                    </div>
                  </div>
                )}

                {/* Action buttons inside modal for pending */}
                {selectedPayout.status === "pending" && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => { setApproveModal({ show: true, payout: selectedPayout }); setApproveForm({ paypalPayoutId: "", notes: "" }); setSelectedPayout(null); }}
                      className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} /> Approve Payout
                    </button>
                    <button
                      onClick={() => { setRejectModal({ show: true, payout: selectedPayout }); setRejectForm({ reason: "" }); setSelectedPayout(null); }}
                      className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} /> Reject Payout
                    </button>
                  </div>
                )}

                <button onClick={() => setSelectedPayout(null)} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black rounded-2xl transition-colors">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════
          APPROVE MODAL
      ════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {approveModal.show && approveModal.payout && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !processing && setApproveModal({ show: false, payout: null })}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={28} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Approve Payout</h3>
                  <p className="text-sm text-gray-500">This will notify the developer</p>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-green-50 rounded-2xl p-4 mb-6 border-2 border-green-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-600">Developer</span>
                  <span className="text-sm font-bold text-gray-900">{developerName(approveModal.payout.developerId)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-600">PayPal Email</span>
                  <span className="text-sm font-bold text-blue-600">{approveModal.payout.paypalEmail}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-600">Amount</span>
                  <span className="text-xl font-black text-green-600">${approveModal.payout.amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    PayPal Transaction ID <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={approveForm.paypalPayoutId}
                      onChange={(e) => setApproveForm({ ...approveForm, paypalPayoutId: e.target.value })}
                      placeholder="e.g. 5YK82679XY123456T"
                       className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 
                        focus:ring-4 focus:ring-green-100 outline-none transition-all text-sm text-gray-900"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Enter the PayPal transaction ID after manually sending the payment</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Admin Notes <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                      value={approveForm.notes}
                      onChange={(e) => setApproveForm({ ...approveForm, notes: e.target.value })}
                      placeholder="Any notes about this payout..."
                      rows={3}
                       className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 
                         focus:ring-4 focus:ring-green-100 outline-none transition-all text-sm resize-none text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setApproveModal({ show: false, payout: null })}
                  disabled={processing}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={processing}
                  className="flex-1 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
                >
                  {processing ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : <><CheckCircle size={18} /> Approve</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════
          REJECT MODAL
      ════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {rejectModal.show && rejectModal.payout && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !processing && setRejectModal({ show: false, payout: null })}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <XCircle size={28} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Reject Payout</h3>
                  <p className="text-sm text-gray-500">Developer will be notified with reason</p>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-red-50 rounded-2xl p-4 mb-6 border-2 border-red-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-600">Developer</span>
                  <span className="text-sm font-bold text-gray-900">{developerName(rejectModal.payout.developerId)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-600">Amount</span>
                  <span className="text-xl font-black text-red-600">${rejectModal.payout.amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Reason */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MessageSquare size={16} className="absolute left-3 top-3 text-gray-400" />
                  <textarea
                    value={rejectForm.reason}
                    onChange={(e) => setRejectForm({ reason: e.target.value })}
                    placeholder="Explain why this payout is being rejected..."
                    rows={4}
                     className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 
                        focus:ring-4 focus:ring-red-100 outline-none transition-all text-sm resize-none text-gray-900"
                  />
                </div>
                {!rejectForm.reason.trim() && (
                  <p className="text-xs text-red-500 mt-1">Reason is required</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setRejectModal({ show: false, payout: null })}
                  disabled={processing}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing || !rejectForm.reason.trim()}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
                >
                  {processing ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : <><XCircle size={18} /> Reject</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
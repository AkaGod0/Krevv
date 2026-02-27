"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Loader2,
  ArrowLeft,
  AlertCircle,
  Calendar,
  Eye,
  Mail,
} from "lucide-react";
import { useAuth, api } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PayoutRequest {
  _id: string;
  orderId: {
    _id: string;
    title: string;
    description: string;
    price: number;
    totalAmount: number;
    serviceId: {
      _id: string;
      title: string;
      category: string;
    };
    clientId: {
      firstName: string;
      lastName: string;
      companyName?: string;
      email: string;
    };
  };
  amount: number;
  paypalEmail: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  processedAt?: string;
  adminNotes?: string;
  paypalPayoutId?: string;
}

export default function MyPayoutRequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalPending: 0,
    totalApproved: 0,
  });


  const backLink = user?.role === "company" 
  ? "/company/jobs" 
  : user?.role === "user" 
    ? "/jobs/my-jobs" 
    : "/company/jobs"; // Default fallback
  const backLabel = user?.role === "company"
    

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      fetchPayoutRequests();
    }
  }, [user, authLoading]);

  const fetchPayoutRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get("/marketplace/my-payout-requests");
      const requests = res.data || [];
      setPayoutRequests(requests);

      // Calculate stats
      const totalPending = requests
        .filter((r: PayoutRequest) => r.status === "pending")
        .reduce((sum: number, r: PayoutRequest) => sum + r.amount, 0);

      const totalApproved = requests
        .filter((r: PayoutRequest) => r.status === "approved")
        .reduce((sum: number, r: PayoutRequest) => sum + r.amount, 0);

      setStats({
        total: requests.length,
        pending: requests.filter((r: PayoutRequest) => r.status === "pending").length,
        approved: requests.filter((r: PayoutRequest) => r.status === "approved").length,
        rejected: requests.filter((r: PayoutRequest) => r.status === "rejected").length,
        totalPending,
        totalApproved,
      });
    } catch (err) {
      console.error("Error fetching payout requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      approved: "bg-green-100 text-green-700 border-green-300",
      rejected: "bg-red-100 text-red-700 border-red-300",
    };

    const icons = {
      pending: <Clock size={14} />,
      approved: <CheckCircle size={14} />,
      rejected: <XCircle size={14} />,
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 ${
          styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700 border-gray-300"
        }`}
      >
        {icons[status as keyof typeof icons] || <AlertCircle size={14} />}
        {status.toUpperCase()}
      </span>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
         <Link href={backLink}>
  <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-6 transition-colors">
    <ArrowLeft size={20} />
    {backLabel}
  </button>
</Link>

          <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-green-100 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <DollarSign size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900">My Payout Requests</h1>
                <p className="text-gray-600">Track your payment requests and earnings</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-gray-500">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-500 uppercase">Total Requests</p>
                <Package size={18} className="text-gray-400" />
              </div>
              <p className="text-3xl font-black text-gray-900">{stats.total}</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-yellow-500">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-500 uppercase">Pending</p>
                <Clock size={18} className="text-yellow-400" />
              </div>
              <p className="text-3xl font-black text-yellow-600">{stats.pending}</p>
              <p className="text-xs text-gray-500 mt-1">${stats.totalPending.toFixed(2)}</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-500 uppercase">Approved</p>
                <CheckCircle size={18} className="text-green-400" />
              </div>
              <p className="text-3xl font-black text-green-600">{stats.approved}</p>
              <p className="text-xs text-gray-500 mt-1">${stats.totalApproved.toFixed(2)}</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-500 uppercase">Rejected</p>
                <XCircle size={18} className="text-red-400" />
              </div>
              <p className="text-3xl font-black text-red-600">{stats.rejected}</p>
            </div>
          </div>
        </motion.div>

        {/* Payout Requests List */}
        {payoutRequests.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-lg">
            <DollarSign size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Payout Requests Yet</h3>
            <p className="text-gray-500 mb-6">
              Complete orders and request payout to see your payment requests here
            </p>
            <Link href="/applications">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg">
                View My Orders
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {payoutRequests.map((request, idx) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100 hover:shadow-xl transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Request Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {getStatusBadge(request.status)}
                          <span className="text-xs text-gray-500">
                            Requested {new Date(request.requestedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{request.orderId.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{request.orderId.description}</p>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="bg-blue-50 rounded-xl p-4 mb-4 border-2 border-blue-100">
                      <p className="text-xs font-bold text-blue-600 uppercase mb-2">Order Details</p>
                      <div className="space-y-1 text-sm">
                        <p className="font-semibold text-gray-900">{request.orderId.serviceId.title}</p>
                        <p className="text-gray-600">
                          Client:{" "}
                          {request.orderId.clientId.companyName ||
                            `${request.orderId.clientId.firstName} ${request.orderId.clientId.lastName}`}
                        </p>
                        <p className="text-gray-600 flex items-center gap-1">
                          <Mail size={12} />
                          {request.orderId.clientId.email}
                        </p>
                      </div>
                    </div>

                    {/* Amount Info */}
                    <div className="grid grid-cols-2 gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-100">
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Payout Amount</p>
                        <p className="text-2xl font-black text-green-600">${request.amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">PayPal Email</p>
                        <p className="text-sm font-bold text-gray-700 truncate">{request.paypalEmail}</p>
                      </div>
                    </div>

                    {/* Status-specific info */}
                    {request.status === "approved" && request.processedAt && (
                      <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                        <p className="text-xs font-bold text-green-600 uppercase mb-1">✅ Payment Sent</p>
                        <p className="text-sm text-green-700">
                          Processed on {new Date(request.processedAt).toLocaleDateString()}
                        </p>
                        {request.paypalPayoutId && (
                          <p className="text-xs text-green-600 mt-1">
                            Transaction ID: {request.paypalPayoutId}
                          </p>
                        )}
                        {request.adminNotes && (
                          <p className="text-xs text-green-700 mt-2 italic">{request.adminNotes}</p>
                        )}
                      </div>
                    )}

                    {request.status === "rejected" && (
                      <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                        <p className="text-xs font-bold text-red-600 uppercase mb-1">❌ Request Rejected</p>
                        {request.adminNotes && (
                          <p className="text-sm text-red-700">
                            <strong>Reason:</strong> {request.adminNotes}
                          </p>
                        )}
                        {request.processedAt && (
                          <p className="text-xs text-red-600 mt-2">
                            Rejected on {new Date(request.processedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {request.status === "pending" && (
                      <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                        <p className="text-xs font-bold text-yellow-600 uppercase mb-1">⏳ Under Review</p>
                        <p className="text-sm text-yellow-700">
                          Your payout request is being reviewed by admin. You'll be notified once processed
                          (typically within 24-48 hours).
                        </p>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        Requested: {new Date(request.requestedAt).toLocaleDateString()}
                      </div>
                      {request.processedAt && (
                        <div className="flex items-center gap-1">
                          <CheckCircle size={12} />
                          Processed: {new Date(request.processedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2 lg:min-w-[140px]">
                    <Link
                      href={`/marketplace/chat/${request.orderId.serviceId._id}`}
                      className="flex-1"
                    >
                      <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition text-sm flex items-center justify-center gap-1.5">
                        <Eye size={16} />
                        View Chat
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Loader2,
  Briefcase,
  Tag,
  DollarSign,
  Sparkles,
  MapPin,
  Phone,
  AlertCircle,
  FileText,
  TrendingUp,
  MessageCircle,
  Package,
  Star,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, api } from "@/app/context/AuthContext";

interface Application {
  _id: string;
  coverLetter: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  status: "pending" | "reviewing" | "accepted" | "rejected";
  appliedAt: string;
  applicantData?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
  };
  user?: any;
}

interface Order {
  _id: string;
  title: string;
  description: string;
  clientModel: 'User' | 'Company';
  price: number;
  platformFee: number;
  totalAmount: number;
  deliveryTime: number;
  status: "pending_payment" | "paid" | "in_progress" | "delivered" | "completed" | "cancelled";
  clientId: {
    companyName: string;
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  developerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  serviceId: string;
  createdAt: string;
  paidAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  deliveryNote?: string;
  clientReview?: string;
  clientRating?: number;
}

export default function JobApplicationsPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [job, setJob] = useState<any>(null);
  const [service, setService] = useState<any>(null);
  const [isMarketplace, setIsMarketplace] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    in_progress: 0,
    delivered: 0,
    completed: 0,
  });
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deliveryModal, setDeliveryModal] = useState<{ show: boolean; orderId: string }>({
    show: false,
    orderId: "",
  });
  const [deliveryNote, setDeliveryNote] = useState("");
  const [submittingDelivery, setSubmittingDelivery] = useState(false);

  const backLink = authUser?.role === 'company' || authUser?.companyName 
    ? "/company/jobs" 
    : "/jobs/my-jobs";

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push("/login");
      return;
    }
    if (authUser) {
      initFetch();
    }
  }, [authUser, authLoading, jobId]);

  const initFetch = async () => {
    setLoading(true);
    setError(false);
    
    try {
      // Try marketplace first
      try {
        const serviceRes = await api.get(`/marketplace/services/${jobId}`, {
          validateStatus: (status) => status < 500,
        });

        if (serviceRes.status === 200) {
          const serviceData = serviceRes.data.data || serviceRes.data;
          setService(serviceData);
          setIsMarketplace(true);

          // Fetch orders instead of applications for marketplace
          const ordersRes = await api.get(`/marketplace/services/${jobId}/orders`, {
            validateStatus: (status) => status < 500,
          });

          if (ordersRes.status === 200) {
            const rawOrders = ordersRes.data.data || ordersRes.data;
            // Only show paid orders and above
            const paidOrders = rawOrders.filter((o: Order) => 
              ["paid", "in_progress", "delivered", "completed"].includes(o.status)
            );
            
            setOrders(paidOrders);
            calculateOrderStats(paidOrders);
            setLoading(false);
            return;
          }
        }
      } catch (marketErr) {
        // Continue to try as job
      }

      // Try as standard Job
      const jobRes = await api.get(`/jobs/${jobId}`, {
        validateStatus: (status) => status < 500,
      });

      if (jobRes.status === 200) {
        setJob(jobRes.data);
        setIsMarketplace(false);

        const appRes = await api.get(`/applications/job/${jobId}`, {
          validateStatus: (status) => status < 500,
        });

        if (appRes.status === 200) {
          const rawApps = appRes.data.data || appRes.data;
          const normalized = rawApps.map((a: any) => ({
            ...a,
            applicantData: a.user,
          }));

          setApplications(normalized);
          calculateAppStats(normalized);
          setLoading(false);
          return;
        }
      }

      setError(true);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const calculateAppStats = (apps: Application[]) => {
    setStats({
      total: apps.length,
      paid: apps.filter((app) => app.status === "pending").length,
      in_progress: apps.filter((app) => app.status === "reviewing").length,
      delivered: apps.filter((app) => app.status === "accepted").length,
      completed: apps.filter((app) => app.status === "rejected").length,
    });
  };

  const calculateOrderStats = (ords: Order[]) => {
    setStats({
      total: ords.length,
      paid: ords.length,
      in_progress: ords.filter((o) => o.status === "in_progress").length,
      delivered: ords.filter((o) => o.status === "delivered").length,
      completed: ords.filter((o) => o.status === "completed").length,
    });
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: Application["status"]) => {
    setUpdatingStatus(true);
    try {
      await api.patch(`/applications/${applicationId}/status`, { status: newStatus });
      
      const updated = applications.map((app) =>
        app._id === applicationId ? { ...app, status: newStatus } : app
      );
      setApplications(updated);
      calculateAppStats(updated);

      if (selectedApplication?._id === applicationId) {
        setSelectedApplication({ ...selectedApplication, status: newStatus });
      }

      alert(`Application status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update application status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const startWork = async (orderId: string) => {
    setUpdatingStatus(true);
    try {
      await api.post(`/marketplace/orders/${orderId}/start-work`);

      const updated = orders.map((o) =>
        o._id === orderId ? { ...o, status: "in_progress" as any } : o
      );
      setOrders(updated);
      calculateOrderStats(updated);

      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: "in_progress" });
      }

      alert("Work started! You can now begin working on this order.");
    } catch (err) {
      console.error("Error starting work:", err);
      alert("Failed to start work. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const submitDelivery = async () => {
    if (!deliveryNote.trim()) {
      alert("Please enter a delivery note");
      return;
    }

    setSubmittingDelivery(true);
    try {
      await api.post(`/marketplace/orders/${deliveryModal.orderId}/submit-delivery`, {
        deliveryNote: deliveryNote,
        deliveryFiles: [],
      });

      const updated = orders.map((o) =>
        o._id === deliveryModal.orderId
          ? { ...o, status: "delivered" as any, deliveryNote, deliveredAt: new Date().toISOString() }
          : o
      );
      setOrders(updated);
      calculateOrderStats(updated);

      if (selectedOrder?._id === deliveryModal.orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: "delivered",
          deliveryNote,
          deliveredAt: new Date().toISOString(),
        });
      }

      setDeliveryModal({ show: false, orderId: "" });
      setDeliveryNote("");
      alert("Delivery submitted successfully! Waiting for client to review.");
    } catch (err) {
      console.error("Error submitting delivery:", err);
      alert("Failed to submit delivery. Please try again.");
    } finally {
      setSubmittingDelivery(false);
    }
  };

  const getApplicationStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      reviewing: "bg-blue-50 text-blue-700 border-blue-200",
      accepted: "bg-green-50 text-green-700 border-green-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
    };
    const icons = {
      pending: <Clock size={14} />,
      reviewing: <Eye size={14} />,
      accepted: <CheckCircle size={14} />,
      rejected: <XCircle size={14} />,
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 ${
          styles[status as keyof typeof styles] || "bg-gray-50 text-gray-700 border-gray-200"
        }`}
      >
        {icons[status as keyof typeof icons] || <FileText size={14} />}
        {status.toUpperCase()}
      </span>
    );
  };

  const getOrderStatusBadge = (status: string) => {
    const styles = {
      paid: "bg-green-50 text-green-700 border-green-200",
      in_progress: "bg-blue-50 text-blue-700 border-blue-200",
      delivered: "bg-purple-50 text-purple-700 border-purple-200",
      completed: "bg-gray-50 text-gray-700 border-gray-200",
    };
    const icons = {
      paid: <DollarSign size={14} />,
      in_progress: <Clock size={14} />,
      delivered: <Package size={14} />,
      completed: <CheckCircle size={14} />,
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 ${
          styles[status as keyof typeof styles] || "bg-gray-50 text-gray-700 border-gray-200"
        }`}
      >
        {icons[status as keyof typeof icons] || <FileText size={14} />}
        {status.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 w-12 h-12 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Resource Not Found</h2>
          <p className="text-gray-600 mb-8">
            This job or service doesn't exist or you don't have permission to view it.
          </p>
          <Link href={backLink}>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg">
              Back to My Listings
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href={backLink}>
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-6 transition-colors">
              <ArrowLeft size={20} />
              Back to My Listings
            </button>
          </Link>

          <div
            className={`bg-white rounded-3xl shadow-xl p-8 border-2 ${
              isMarketplace ? "border-purple-200" : "border-amber-200"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black mb-4 ${
                    isMarketplace
                      ? "bg-purple-100 text-purple-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {isMarketplace ? (
                    <>
                      <Sparkles size={14} /> MARKETPLACE SERVICE
                    </>
                  ) : (
                    <>
                      <Briefcase size={14} /> JOB POSTING
                    </>
                  )}
                </span>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
                  {isMarketplace ? service?.title : job?.title}
                </h1>
                <p className="text-lg font-semibold text-gray-600">
                  {isMarketplace ? "Paid Orders" : "Applications"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {isMarketplace ? (
                <>
                  <div className="flex items-center gap-2 font-semibold text-green-600">
                    <DollarSign size={18} />
                    <span className="text-lg">${service?.budget}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag size={16} />
                    {service?.category?.replace("_", " ")}
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} />
                    {service?.status?.replace("_", " ").toUpperCase()}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} />
                    {job?.company}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    {job?.location}
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {!isMarketplace && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Total", val: stats.total, color: "border-l-gray-500", icon: FileText },
              { label: "Pending", val: stats.paid, color: "border-l-yellow-500", icon: Clock },
              { label: "Reviewing", val: stats.in_progress, color: "border-l-blue-500", icon: Eye },
              { label: "Accepted", val: stats.delivered, color: "border-l-green-500", icon: CheckCircle },
              { label: "Rejected", val: stats.completed, color: "border-l-red-500", icon: XCircle },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`bg-white p-5 rounded-2xl border-l-4 ${stat.color} shadow-md hover:shadow-lg transition-shadow`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <Icon size={16} className="text-gray-400" />
                  </div>
                  <p className="text-3xl font-black text-gray-900">{stat.val}</p>
                </motion.div>
              );
            })}
          </div>
        )}

        {isMarketplace && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Total", val: stats.total, color: "border-l-gray-500", icon: FileText },
              { label: "Paid", val: stats.paid, color: "border-l-green-500", icon: DollarSign },
              { label: "In Progress", val: stats.in_progress, color: "border-l-blue-500", icon: Clock },
              { label: "Delivered", val: stats.delivered, color: "border-l-purple-500", icon: Package },
              { label: "Completed", val: stats.completed, color: "border-l-gray-500", icon: CheckCircle },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`bg-white p-5 rounded-2xl border-l-4 ${stat.color} shadow-md hover:shadow-lg transition-shadow`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <Icon size={16} className="text-gray-400" />
                  </div>
                  <p className="text-3xl font-black text-gray-900">{stat.val}</p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Job Applications List */}
        {!isMarketplace && (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-16 text-center rounded-3xl border-2 border-dashed border-gray-200 shadow-lg"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User size={48} className="text-gray-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No Applications Yet</h3>
                <p className="text-gray-500">
                  Applications will appear here once candidates apply for this job.
                </p>
              </motion.div>
            ) : (
              applications.map((app, idx) => (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-6 rounded-3xl shadow-lg border-2 border-amber-100 transition-all hover:shadow-xl"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex gap-4 items-center flex-1">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                        {app.applicantData?.firstName?.[0] || "?"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-black text-xl text-gray-900">
                            {app.applicantData?.firstName} {app.applicantData?.lastName}
                          </h3>
                          {getApplicationStatusBadge(app.status)}
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-600 flex items-center gap-2">
                            <Mail size={14} />
                            {app.applicantData?.email}
                          </p>
                          {app.applicantData?.phone && (
                            <p className="text-gray-600 flex items-center gap-2">
                              <Phone size={14} />
                              {app.applicantData.phone}
                            </p>
                          )}
                          {app.applicantData?.location && (
                            <p className="text-gray-600 flex items-center gap-2">
                              <MapPin size={14} />
                              {app.applicantData.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 p-5 rounded-2xl border-2 border-amber-100 mb-4">
                    <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <FileText size={14} />
                      Cover Letter
                    </h4>
                    <p className="text-gray-800 leading-relaxed">{app.coverLetter}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {app.resumeUrl && (
                      <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer">
                        <button className="flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl">
                          <Download size={18} />
                          Download Resume
                        </button>
                      </a>
                    )}

                    {app.portfolioUrl && (
                      <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer">
                        <button className="flex items-center gap-2 px-5 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl">
                          <Eye size={18} />
                          View Portfolio
                        </button>
                      </a>
                    )}

                    <button
                      onClick={() => setSelectedApplication(app)}
                      className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                    >
                      <Eye size={18} />
                      View Details
                    </button>

                    {app.status === "pending" && (
                      <>
                        <button
                          disabled={updatingStatus}
                          onClick={() => updateApplicationStatus(app._id, "reviewing")}
                          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                        >
                          <Eye size={18} />
                          Review
                        </button>
                        <button
                          disabled={updatingStatus}
                          onClick={() => updateApplicationStatus(app._id, "accepted")}
                          className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                        >
                          <CheckCircle size={18} />
                          Accept
                        </button>
                        <button
                          disabled={updatingStatus}
                          onClick={() => updateApplicationStatus(app._id, "rejected")}
                          className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                        >
                          <XCircle size={18} />
                          Reject
                        </button>
                      </>
                    )}

                    {app.status === "reviewing" && (
                      <>
                        <button
                          disabled={updatingStatus}
                          onClick={() => updateApplicationStatus(app._id, "accepted")}
                          className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                        >
                          <CheckCircle size={18} />
                          Accept
                        </button>
                        <button
                          disabled={updatingStatus}
                          onClick={() => updateApplicationStatus(app._id, "rejected")}
                          className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                        >
                          <XCircle size={18} />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Orders List for Marketplace */}
        {isMarketplace && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-16 text-center rounded-3xl border-2 border-dashed border-gray-200 shadow-lg"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package size={48} className="text-gray-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No Paid Orders Yet</h3>
                <p className="text-gray-500">
                  Orders will appear here once clients pay for your custom orders.
                </p>
              </motion.div>
            ) : (
              orders.map((order, idx) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-6 rounded-3xl shadow-lg border-2 border-purple-100 transition-all hover:shadow-xl"
                >
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex gap-4 items-center flex-1">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg bg-gradient-to-br from-purple-400 to-blue-500 text-white">
                        {order.clientModel === 'Company' 
                          ? order.clientId?.companyName?.[0] 
                          : order.clientId?.firstName?.[0] || "?"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-black text-xl text-gray-900">
                            {order.clientModel === 'Company' 
                              ? order.clientId?.companyName 
                              : `${order.clientId?.firstName || ""} ${order.clientId?.lastName || ""}`.trim() || "Client"}
                          </h3>
                          {getOrderStatusBadge(order.status)}
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-600 flex items-center gap-2">
                            <Mail size={14} />
                            {order.clientId?.email}
                          </p>
                          {order.clientModel === 'Company' && order.clientId?.firstName && (
                            <p className="text-xs text-gray-500 font-medium">
                              Contact: {order.clientId.firstName} {order.clientId.lastName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-5 bg-purple-50 rounded-2xl border-2 border-purple-100">
                    <div>
                      <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
                        Order Amount
                      </p>
                      <p className="text-2xl font-black text-purple-700">${order.price}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">
                        💰 Paid
                      </p>
                      <p className="text-xl font-black text-green-600">${order.totalAmount}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">includes platform fee</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
                        Delivery Time
                      </p>
                      <p className="text-lg font-bold text-gray-800">{order.deliveryTime} days</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
                        Paid On
                      </p>
                      <p className="text-sm font-bold text-gray-700">
                        {order.paidAt ? new Date(order.paidAt).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Order Title and Description */}
                  <div className="mb-6 p-5 bg-gray-50 rounded-2xl border-2 border-gray-100">
                    <h4 className="font-bold text-gray-900 text-lg mb-2">{order.title}</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{order.description}</p>
                  </div>

                  {/* Delivery Note (if delivered) */}
                  {order.deliveryNote && (
                    <div className="mb-6 p-5 bg-blue-50 rounded-2xl border-2 border-blue-100">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <FileText size={14} />
                        Delivery Note
                      </p>
                      <p className="text-gray-700 leading-relaxed">{order.deliveryNote}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/marketplace/chat/${order.serviceId}/`}>
                      <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl">
                        <MessageCircle size={18} />
                        Open Chat
                      </button>
                    </Link>

                    {order.status === "paid" && (
                      <button
                        disabled={updatingStatus}
                        onClick={() => startWork(order._id)}
                        className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingStatus ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Clock size={18} />
                        )}
                        Start Work
                      </button>
                    )}

                    {order.status === "in_progress" && (
                      <button
                        onClick={() => setDeliveryModal({ show: true, orderId: order._id })}
                        className="flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
                      >
                        <Package size={18} />
                        Submit Delivery
                      </button>
                    )}

                    {order.status === "delivered" && (
                      <div className="flex items-center gap-2 px-5 py-3 bg-blue-100 text-blue-700 font-bold rounded-xl border-2 border-blue-200">
                        <Clock size={18} />
                        Awaiting Client Review
                      </div>
                    )}

                    {order.status === "completed" && (
                      <div className="flex items-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl">
                        <Star size={18} className="text-yellow-500" />
                        Order Completed
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                    >
                      <Eye size={18} />
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      <AnimatePresence>
        {selectedApplication && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedApplication(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[32px] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-white border-b-2 border-gray-100 p-8 rounded-t-[32px] z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">Application Details</h2>
                    <p className="text-gray-600 font-semibold">
                      {selectedApplication.applicantData?.firstName}{" "}
                      {selectedApplication.applicantData?.lastName}
                    </p>
                    {getApplicationStatusBadge(selectedApplication.status)}
                  </div>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <XCircle size={24} className="text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-3xl border-2 border-amber-100">
                  <h4 className="text-xs font-black uppercase text-amber-600 mb-4 tracking-widest">
                    Applicant Information
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail size={16} className="text-amber-600" />
                      {selectedApplication.applicantData?.email}
                    </div>
                    {selectedApplication.applicantData?.phone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone size={16} className="text-amber-600" />
                        {selectedApplication.applicantData.phone}
                      </div>
                    )}
                    {selectedApplication.applicantData?.location && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin size={16} className="text-amber-600" />
                        {selectedApplication.applicantData.location}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock size={16} className="text-amber-600" />
                      Applied: {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-3">Cover Letter</h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedApplication.coverLetter}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {selectedApplication.resumeUrl && (
                    <a href={selectedApplication.resumeUrl} target="_blank" rel="noopener noreferrer">
                      <button className="w-full flex items-center justify-center gap-3 py-4 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-2xl transition-all shadow-lg hover:shadow-xl">
                        <Download size={20} />
                        Download Resume
                      </button>
                    </a>
                  )}

                  {selectedApplication.portfolioUrl && (
                    <a href={selectedApplication.portfolioUrl} target="_blank" rel="noopener noreferrer">
                      <button className="w-full flex items-center justify-center gap-3 py-4 bg-purple-500 hover:bg-purple-600 text-white font-black rounded-2xl transition-all shadow-lg hover:shadow-xl">
                        <Eye size={20} />
                        View Portfolio
                      </button>
                    </a>
                  )}
                </div>

                {selectedApplication.status === "pending" && (
                  <div className="flex gap-3">
                    <button
                      disabled={updatingStatus}
                      onClick={() => {
                        updateApplicationStatus(selectedApplication._id, "accepted");
                        setSelectedApplication(null);
                      }}
                      className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} />
                      Accept
                    </button>
                    <button
                      disabled={updatingStatus}
                      onClick={() => {
                        updateApplicationStatus(selectedApplication._id, "rejected");
                        setSelectedApplication(null);
                      }}
                      className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <XCircle size={20} />
                      Reject
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setSelectedApplication(null)}
                  className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black rounded-2xl transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[32px] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-white border-b-2 border-gray-100 p-8 rounded-t-[32px] z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">Order Details</h2>
                    <p className="text-gray-600 font-semibold">
                      Client: {selectedOrder.clientId?.firstName} {selectedOrder.clientId?.lastName}
                    </p>
                    {getOrderStatusBadge(selectedOrder.status)}
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <XCircle size={24} className="text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-3xl border-2 border-purple-100">
                  <h4 className="text-xs font-black uppercase text-purple-600 mb-4 tracking-widest">
                    Order Information
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">Title</p>
                      <p className="text-xl font-bold text-gray-900">{selectedOrder.title}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">Description</p>
                      <p className="text-gray-800 leading-relaxed">{selectedOrder.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Amount</p>
                        <p className="text-2xl font-black text-green-600">${selectedOrder.price}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Delivery Time</p>
                        <p className="text-xl font-bold text-gray-900">{selectedOrder.deliveryTime} days</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <Link href={`/marketplace/chat/${selectedOrder.serviceId}`} className="w-full">
                    <button className="w-full flex items-center justify-center gap-3 py-5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-black rounded-2xl transition-all shadow-xl hover:shadow-2xl text-lg">
                      <MessageCircle size={22} />
                      Open Chat
                    </button>
                  </Link>

                  {selectedOrder.status === "paid" && (
                    <button
                      disabled={updatingStatus}
                      onClick={() => startWork(selectedOrder._id)}
                      className="w-full flex items-center justify-center gap-3 py-5 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl transition-all shadow-xl hover:shadow-2xl text-lg disabled:opacity-50"
                    >
                      {updatingStatus ? (
                        <Loader2 size={22} className="animate-spin" />
                      ) : (
                        <Clock size={22} />
                      )}
                      Start Work
                    </button>
                  )}

                  {selectedOrder.status === "in_progress" && (
                    <button
                      onClick={() => {
                        setDeliveryModal({ show: true, orderId: selectedOrder._id });
                        setSelectedOrder(null);
                      }}
                      className="w-full flex items-center justify-center gap-3 py-5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-2xl transition-all shadow-xl hover:shadow-2xl text-lg"
                    >
                      <Package size={22} />
                      Submit Delivery
                    </button>
                  )}

                  {selectedOrder.status === "delivered" && (
                    <div className="w-full flex items-center justify-center gap-3 py-5 bg-blue-100 text-blue-700 font-black rounded-2xl border-2 border-blue-200 text-lg">
                      <Clock size={22} />
                      Awaiting Client Review
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full py-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black rounded-2xl transition-colors text-lg"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delivery Submission Modal */}
      <AnimatePresence>
        {deliveryModal.show && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => !submittingDelivery && setDeliveryModal({ show: false, orderId: "" })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[32px] max-w-2xl w-full shadow-2xl"
            >
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 rounded-t-[32px]">
                <div className="flex items-center gap-4 text-white">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Package size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black">Submit Delivery</h2>
                    <p className="text-purple-100 font-medium mt-1">
                      Provide details about the completed work
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Delivery Note <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="Describe what you've delivered, include any important details, links, or instructions..."
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all resize-none font-medium"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    This note will be visible to the client
                  </p>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                  <div className="flex gap-3">
                    <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-bold mb-1">Important:</p>
                      <p>
                        Once you submit delivery, the client will be notified to review your work.
                        Make sure all deliverables are complete and accessible.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setDeliveryModal({ show: false, orderId: "" });
                      setDeliveryNote("");
                    }}
                    disabled={submittingDelivery}
                    className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitDelivery}
                    disabled={submittingDelivery || !deliveryNote.trim()}
                    className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-black rounded-2xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submittingDelivery ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Package size={20} />
                        Submit Delivery
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
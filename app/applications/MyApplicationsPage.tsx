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
} from "lucide-react";
import { useAuth, api } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNotifications } from '@/app/hooks/useNotifications';

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
  status: "pending_payment" | "paid" | "in_progress" | "delivered" | "completed" | "cancelled";
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

// ✅ Function to convert URLs in text to clickable links
const renderTextWithLinks = (text: string) => {
  // Regex to detect URLs
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

export default function MyApplicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { unreadCount, unreadMessages, markAsRead } = useNotifications(user?._id);
  const [applications, setApplications] = useState<Application[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMessageAlert, setShowMessageAlert] = useState(false);
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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchAllData();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (unreadMessages.length > 0) {
      setShowMessageAlert(true);
      const timer = setTimeout(() => setShowMessageAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [unreadMessages.length]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const jobsRes = await api.get('/applications/my-applications');
      setApplications(jobsRes.data);

      const totalJobStats = jobsRes.data.reduce((acc: any, app: Application) => {
        acc.total++;
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, { total: 0, pending: 0, reviewing: 0, accepted: 0, rejected: 0 });
      setJobStats(totalJobStats);

      try {
        const ordersRes = await api.get('/marketplace/my-orders');
        const allOrders = ordersRes.data || [];

        allOrders.sort((a: Order, b: Order) => 
          new Date(b.paidAt || b.createdAt).getTime() - new Date(a.paidAt || a.createdAt).getTime()
        );

        setOrders(allOrders);

        const totalOrderStats = allOrders.reduce((acc: any, order: Order) => {
          acc.total++;
          const status = order.status as keyof typeof acc;
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, { total: 0, paid: 0, in_progress: 0, delivered: 0, completed: 0 });
        
        totalOrderStats.paid = allOrders.length;
        
        setOrderStats(totalOrderStats);
      } catch (err) {
        console.error("Error fetching marketplace orders:", err);
        setOrders([]);
        setOrderStats({ total: 0, paid: 0, in_progress: 0, delivered: 0, completed: 0 });
      }

    } catch (err: any) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getServiceUnreadCount = (serviceId: string) => {
    return unreadMessages.filter(n => n.serviceId === serviceId).length;
  };

  const handleChatClick = async (serviceId: string) => {
    await markAsRead(serviceId);
  };

  const handleNotificationClick = async () => {
    if (unreadMessages.length > 0) {
      const firstMessage = unreadMessages[0];
      await markAsRead(firstMessage.serviceId);
      router.push(`/marketplace/services/${firstMessage.serviceId}/chat`);
      setShowMessageAlert(false);
    }
  };

  const getJobStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      reviewing: "bg-blue-100 text-blue-700 border-blue-300",
      accepted: "bg-green-100 text-green-700 border-green-300",
      rejected: "bg-red-100 text-red-700 border-red-300",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const getOrderStatusColor = (status: string) => {
    const colors = {
      paid: "bg-green-100 text-green-700 border-green-300",
      in_progress: "bg-blue-100 text-blue-700 border-blue-300",
      delivered: "bg-purple-100 text-purple-700 border-purple-300",
      completed: "bg-gray-100 text-gray-700 border-gray-300",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const getJobStatusIcon = (status: string) => {
    const icons = {
      pending: <Clock size={14} className="sm:w-4 sm:h-4" />,
      reviewing: <Eye size={14} className="sm:w-4 sm:h-4" />,
      accepted: <CheckCircle size={14} className="sm:w-4 sm:h-4" />,
      rejected: <XCircle size={14} className="sm:w-4 sm:h-4" />,
    };
    return icons[status as keyof typeof icons] || <AlertCircle size={14} className="sm:w-4 sm:h-4" />;
  };

  const getOrderStatusIcon = (status: string) => {
    const icons = {
      paid: <DollarSign size={14} className="sm:w-4 sm:h-4" />,
      in_progress: <Clock size={14} className="sm:w-4 sm:h-4" />,
      delivered: <Package size={14} className="sm:w-4 sm:h-4" />,
      completed: <CheckCircle size={14} className="sm:w-4 sm:h-4" />,
    };
    return icons[status as keyof typeof icons] || <AlertCircle size={14} className="sm:w-4 sm:h-4" />;
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <Loader2 className="animate-spin text-amber-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-4 sm:py-6 md:py-12 px-3 sm:px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* ✅ Message Notification Alert - Responsive */}
        <AnimatePresence>
          {showMessageAlert && unreadMessages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              className="fixed top-2 sm:top-4 right-2 sm:right-4 left-2 sm:left-auto z-50 bg-blue-600 text-white rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-4 max-w-sm"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={16} className="sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm mb-1">New Message!</h3>
                  <p className="text-[10px] sm:text-xs text-blue-100 line-clamp-1 break-words">
                    {unreadMessages[0].message || 'You have a new message'}
                  </p>
                </div>
                <button 
                  onClick={() => setShowMessageAlert(false)}
                  className="text-white/60 hover:text-white flex-shrink-0"
                >
                  <X size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>
              <button
                onClick={handleNotificationClick}
                className="mt-2 sm:mt-3 w-full py-1.5 sm:py-2 bg-white/20 hover:bg-white/30 text-center rounded-lg text-xs sm:text-sm font-semibold transition-colors"
              >
                View Chat
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header with Bell Icon - Responsive */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-4 sm:mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0"
        >
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">
              My Applications & Orders
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">
              Track your job applications and marketplace orders
            </p>
          </div>

          {/* ✅ Persistent Notification Bell - Responsive */}
          <button 
            onClick={handleNotificationClick}
            className="relative p-2 sm:p-3 hover:bg-white rounded-lg sm:rounded-xl transition-colors shadow-sm"
          >
            <Bell size={20} className="sm:w-6 sm:h-6 text-gray-600" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center"
              >
                {unreadCount}
              </motion.span>
            )}
          </button>
        </motion.div>

        {/* Job Applications Stats - Responsive */}
        {applications.length > 0 && (
          <>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
              <Briefcase size={18} className="sm:w-5 sm:h-5 text-amber-500" />
              <span className="text-base sm:text-xl">Job Applications</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
              {[
                { label: "Total", val: jobStats.total, color: "border-gray-500", text: "text-gray-800" },
                { label: "Pending", val: jobStats.pending, color: "border-yellow-500", text: "text-yellow-600" },
                { label: "Reviewing", val: jobStats.reviewing, color: "border-blue-500", text: "text-blue-600" },
                { label: "Accepted", val: jobStats.accepted, color: "border-green-500", text: "text-green-600" },
                { label: "Rejected", val: jobStats.rejected, color: "border-red-500", text: "text-red-600" },
              ].map((stat, i) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border-l-4 ${stat.color}`}
                >
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-semibold truncate">{stat.label}</p>
                  <p className={`text-xl sm:text-2xl font-bold ${stat.text}`}>{stat.val}</p>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Marketplace Orders Stats - Responsive */}
        {orders.length > 0 && (
          <>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 mt-6 sm:mt-8">
              <Sparkles size={18} className="sm:w-5 sm:h-5 text-purple-500" />
              <span className="text-base sm:text-xl">Marketplace Orders</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
              {[
                { label: "Total", val: orderStats.total, color: "border-gray-500", text: "text-gray-800" },
                { label: "Paid", val: orderStats.paid, color: "border-green-500", text: "text-green-600" },
                { label: "In Progress", val: orderStats.in_progress, color: "border-blue-500", text: "text-blue-600" },
                { label: "Delivered", val: orderStats.delivered, color: "border-purple-500", text: "text-purple-600" },
                { label: "Completed", val: orderStats.completed, color: "border-gray-500", text: "text-gray-600" },
              ].map((stat, i) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border-l-4 ${stat.color}`}
                >
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-semibold truncate">{stat.label}</p>
                  <p className={`text-xl sm:text-2xl font-bold ${stat.text}`}>{stat.val}</p>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Empty State - Responsive */}
        {applications.length === 0 && orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 sm:p-12 text-center">
            <Briefcase size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">No Applications or Orders Yet</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">Start applying to jobs or browse marketplace services</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/jobs" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-sm sm:text-base">
                  Browse Jobs
                </button>
              </Link>
              <Link href="/marketplace" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm sm:text-base">
                  Browse Services
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Job Applications List - Responsive */}
            {applications.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                {applications.map((app, idx) => {
                  const jobData = app.job;

                  if (!jobData) {
                    return (
                      <div key={app._id} className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-dashed border-gray-300 opacity-60">
                        <p className="text-xs sm:text-sm text-gray-500 italic flex items-center gap-2">
                          <Trash2 size={14} className="sm:w-4 sm:h-4" /> Job posting removed or reference broken.
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
                      className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 border-2 border-amber-100 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0 mb-3 sm:mb-2">
                            <div className="flex-1 min-w-0 w-full sm:w-auto">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] sm:text-[10px] font-bold rounded uppercase flex-shrink-0">
                                  <Briefcase size={10} /> JOB
                                </span>
                              </div>
                              <Link href={`/jobs/${jobData.slug}`}>
                                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 hover:text-amber-600 transition break-words line-clamp-2">
                                  {jobData.title}
                                </h3>
                              </Link>
                            </div>
                            <span className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border-2 ${getJobStatusColor(app.status)} flex-shrink-0`}>
                              {getJobStatusIcon(app.status)} 
                              <span className="hidden sm:inline">{app.status.toUpperCase()}</span>
                              <span className="sm:hidden">{app.status.toUpperCase()}</span>
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                            <span className="flex items-center gap-1 truncate">
                              <Building2 size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" /> 
                              <span className="truncate">{jobData.company}</span>
                            </span>
                            <span className="flex items-center gap-1 truncate">
                              <MapPin size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" /> 
                              <span className="truncate">{jobData.location}</span>
                            </span>
                            <span className="flex items-center gap-1 truncate">
                              <DollarSign size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" /> 
                              <span className="truncate">{jobData.salary}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" /> 
                              {new Date(app.appliedAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100">
                            <h4 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-2">
                              <FileText size={12} className="sm:w-3.5 sm:h-3.5 text-amber-500" /> Cover Letter
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 italic break-words">"{app.coverLetter}"</p>
                          </div>
                        </div>

                        <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto lg:min-w-[140px]">
                          <Link href={`/jobs/${jobData.slug}`} className="flex-1 lg:flex-initial">
                            <button className="w-full py-2 bg-amber-500 text-white rounded-lg font-semibold text-xs sm:text-sm hover:bg-amber-600 transition">
                              View Job
                            </button>
                          </Link>
                          
                          {app.resumeUrl && (
                            <a href={app.resumeUrl} target="_blank" className="flex-1 lg:flex-initial">
                              <button className="w-full py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-semibold text-xs sm:text-sm hover:bg-gray-50 transition flex items-center justify-center gap-1 sm:gap-2">
                                <FileText size={14} className="sm:w-4 sm:h-4" /> Resume
                              </button>
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Marketplace Orders List - Responsive with Clickable Links */}
            {orders.length > 0 && (
              <div className="space-y-3 sm:space-y-4 mt-6 sm:mt-8">
                {orders.map((order, idx) => {
                  const canChat = ["paid", "in_progress", "delivered"].includes(order.status);
                  const serviceUnreadCount = getServiceUnreadCount(order.serviceId._id);

                  return (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 border-2 border-purple-100 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0 mb-3 sm:mb-2">
                            <div className="flex-1 min-w-0 w-full sm:w-auto">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-[9px] sm:text-[10px] font-bold rounded uppercase flex-shrink-0">
                                  <Sparkles size={10} /> ORDER
                                </span>
                                {canChat && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] sm:text-[10px] font-bold rounded uppercase flex-shrink-0">
                                    <MessageCircle size={10} /> CHAT
                                  </span>
                                )}
                              </div>
                              <Link href={`/marketplace/tasks/${order.serviceId._id}`}>
                                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 hover:text-purple-600 transition break-words line-clamp-2">
                                  {order.title}
                                </h3>
                              </Link>
                            </div>
                            <span className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border-2 ${getOrderStatusColor(order.status)} flex-shrink-0 whitespace-nowrap`}>
                              {getOrderStatusIcon(order.status)} 
                              <span className="hidden sm:inline">{order.status.replace("_", " ").toUpperCase()}</span>
                              <span className="sm:hidden">{order.status.split("_")[0].toUpperCase()}</span>
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                            <span className="flex items-center gap-1 font-semibold text-green-600">
                              <DollarSign size={12} className="sm:w-3.5 sm:h-3.5" /> ${order.totalAmount}
                            </span>
                            <span className="flex items-center gap-1 truncate">
                              <Building2 size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" /> 
                              <span className="truncate">{order.serviceId.category}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} className="sm:w-3.5 sm:h-3.5" /> {order.deliveryTime}d
                            </span>
                            <span className="flex items-center gap-1 truncate max-w-full">
                              <Tag size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" /> 
                              <span className="truncate">
                                {order.developerId.companyName || `${order.developerId.firstName} ${order.developerId.lastName}`}
                              </span>
                            </span>
                          </div>

                          <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border-2 border-purple-100 mb-3">
                            <h4 className="text-[10px] sm:text-xs font-bold text-purple-600 uppercase mb-1 flex items-center gap-2">
                              <Package size={12} className="sm:w-3.5 sm:h-3.5" /> Order Description
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-700 line-clamp-2 break-words">{order.description}</p>
                          </div>

                          {/* ✅ Delivery Note with Clickable Links - Responsive */}
                          {order.deliveryNote && (
                            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border-2 border-blue-200 mb-3">
                              <h4 className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase mb-1 flex items-center gap-2">
                                <FileText size={12} className="sm:w-3.5 sm:h-3.5" /> Delivery Note
                              </h4>
                              <p className="text-xs sm:text-sm text-blue-900 leading-relaxed break-words">
                                {renderTextWithLinks(order.deliveryNote)}
                              </p>
                              {order.deliveredAt && (
                                <p className="text-[10px] sm:text-xs text-blue-600 mt-2">
                                  Delivered: {new Date(order.deliveredAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          )}

                          {order.paidAt && (
                            <div className="text-[10px] sm:text-xs text-gray-500">
                              Paid: {new Date(order.paidAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto lg:min-w-[140px]">
                          {canChat && (
                            <Link 
                              href={`/marketplace/services/${order.serviceId._id}/chat`}
                              onClick={() => handleChatClick(order.serviceId._id)}
                              className="flex-1 lg:flex-initial relative"
                            >
                              <button className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-1 sm:gap-2">
                                <MessageCircle size={14} className="sm:w-4 sm:h-4" /> 
                                <span className="hidden sm:inline">Open Chat</span>
                                <span className="sm:hidden">Chat</span>
                                
                                {serviceUnreadCount > 0 && (
                                  <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1.5 sm:-top-2 -right-1.5 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
                                  >
                                    {serviceUnreadCount}
                                  </motion.span>
                                )}
                              </button>
                            </Link>
                          )}

                          <Link href={`/marketplace/tasks/${order.serviceId._id}`} className="flex-1 lg:flex-initial">
                            <button className="w-full py-2 bg-purple-500 text-white rounded-lg font-semibold text-xs sm:text-sm hover:bg-purple-600 transition">
                              <span className="hidden sm:inline">View Service</span>
                              <span className="sm:hidden">View</span>
                            </button>
                          </Link>

                          {order.status === "delivered" && (
                            <button
                              onClick={async () => {
                                try {
                                  await api.post(`/marketplace/orders/${order._id}/accept-delivery`, {
                                    review: "Order completed successfully",
                                    rating: 5,
                                  });
                                  
                                  setOrders(orders.map(o => 
                                    o._id === order._id 
                                      ? { ...o, status: "completed" as any, completedAt: new Date().toISOString() } 
                                      : o
                                  ));
                                  
                                  alert("Delivery accepted! Order is now complete.");
                                } catch (err) {
                                  console.error("Error accepting delivery:", err);
                                  alert("Failed to accept delivery");
                                }
                              }}
                              className="flex-1 lg:flex-initial py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-1 sm:gap-2"
                            >
                              <CheckCircle size={14} className="sm:w-4 sm:h-4" /> 
                              <span className="hidden sm:inline">Accept</span>
                              <span className="sm:hidden">Accept</span>
                            </button>
                          )}

                          {order.status === "completed" && (
                            <div className="text-center py-2 bg-gray-100 rounded-lg text-[10px] sm:text-xs font-bold text-gray-600">
                              ✓ COMPLETED
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
        )}
      </div>
    </div>
  );
}
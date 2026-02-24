"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, api } from "@/app/context/AuthContext";
import {
  Building2, Briefcase, Users, Plus, Settings, LogOut, Loader2,
  CheckCircle, Menu, X, Home, PanelLeftClose, PanelLeftOpen,
  UserPlus, ShoppingBag, Zap, MessageCircle, Bell, DollarSign
} from "lucide-react";
import { useNotifications } from '@/app/hooks/useNotifications';

export default function CompanyDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const { unreadCount, unreadMessages, markAsRead } = useNotifications(user?._id);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentPostings, setRecentPostings] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMessageAlert, setShowMessageAlert] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user?.companyName) {
      router.push("/company/login");
      return;
    }

    fetchDashboardData();
  }, [authLoading, isAuthenticated, user]);

  useEffect(() => {
    if (unreadMessages.length > 0) {
      setShowMessageAlert(true);
      const timer = setTimeout(() => setShowMessageAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [unreadMessages.length]);

  const fetchDashboardData = async () => {
    try {
      // ✅ Fetch stats, services AND company orders (as buyer) in parallel
      const [statsRes, servicesRes, myOrdersRes] = await Promise.all([
        api.get("/company/dashboard/stats"),
        api.get("/marketplace/my-services"),
        // ✅ Fetch all orders where this company is the CLIENT/BUYER
        api.get("/marketplace/my-orders").catch(() => ({ data: [] })),
      ]);

      const marketplaceServices = servicesRes.data || [];
      const myOrders = myOrdersRes.data || [];

      // ✅ Count only paid/active orders from the company's perspective as buyer
      const paidBuyerOrders = myOrders.filter((o: any) =>
        ["paid", "in_progress", "delivered", "completed"].includes(o.status)
      );

      // ✅ Also count orders received by company's OWN services (as seller)
      let paidSellerOrdersCount = 0;
      if (marketplaceServices.length > 0) {
        const ordersPromises = marketplaceServices.map((service: any) =>
          api
            .get(`/marketplace/services/${service._id}/orders`)
            .then((res) => res.data || [])
            .catch(() => [])
        );
        const allOrdersArrays = await Promise.all(ordersPromises);
        const allSellerOrders = allOrdersArrays.flat();
        paidSellerOrdersCount = allSellerOrders.filter((o: any) =>
          ["paid", "in_progress", "delivered", "completed"].includes(o.status)
        ).length;
      }

      // ✅ Total paid orders = buyer orders + seller orders (deduplicated by _id)
      const allOrderIds = new Set<string>();
      [...paidBuyerOrders].forEach((o: any) => allOrderIds.add(o._id));
      const totalPaidOrders = paidBuyerOrders.length + paidSellerOrdersCount;

      // Merge Jobs and Services for the "Recent Postings" list
      const jobs = statsRes.data.data?.recentJobs || [];
      const services = marketplaceServices.map((s: any) => ({
        ...s,
        isService: true,
        orderCount: 0,
      }));

      const combined = [...jobs, ...services]
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      setRecentPostings(combined);

      setStats({
        ...statsRes.data.data,
        marketplace: {
          totalServices: marketplaceServices.length,
          totalOrders: totalPaidOrders,
        },
      });
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async () => {
    if (unreadMessages.length > 0) {
      const firstMessage = unreadMessages[0];
      await markAsRead(firstMessage.serviceId);
      router.push(`/marketplace/chat/${firstMessage.serviceId}`);
      setShowMessageAlert(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500" size={40} />
      </div>
    );
  }

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/company/dashboard", active: true },
    { icon: Briefcase, label: "My Jobs", href: "/company/jobs" },
    { icon: Users, label: "Applications", href: "/company/applications" },
    { icon: UserPlus, label: "Profile", href: "/company/profile" },
    { icon: Settings, label: "Settings", href: "/company/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">

      {/* Message Notification Alert */}
      <AnimatePresence>
        {showMessageAlert && unreadMessages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 right-4 z-50 bg-blue-600 text-white rounded-2xl shadow-2xl p-4 max-w-[calc(100vw-2rem)] sm:max-w-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm mb-1">New Message!</h3>
                <p className="text-xs text-blue-100 line-clamp-1">
                  {unreadMessages[0].message || "You have a new message"}
                </p>
              </div>
              <button onClick={() => setShowMessageAlert(false)} className="text-white/60 hover:text-white flex-shrink-0">
                <X size={16} />
              </button>
            </div>
            <button
              onClick={handleNotificationClick}
              className="mt-3 w-full py-2 bg-white/20 hover:bg-white/30 text-center rounded-lg text-sm font-semibold transition-colors"
            >
              View Chat
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-white shadow-xl z-50 transition-all duration-300 flex flex-col
        ${sidebarOpen ? "fixed inset-y-0 left-0 w-64 translate-x-0" : "fixed inset-y-0 left-0 -translate-x-full lg:relative lg:translate-x-0"}
        ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <div className="p-4 border-b flex items-center justify-between h-20">
          {!isCollapsed && (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 overflow-hidden border border-amber-100 flex-shrink-0">
                {user?.companyLogo ? (
                  <img src={user.companyLogo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={20} />
                )}
              </div>
              <span className="font-bold text-gray-800 truncate">{user?.companyName}</span>
            </div>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 mx-auto bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100">
              {user?.companyLogo ? (
                <img src={user.companyLogo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 size={20} className="text-amber-600" />
              )}
            </div>
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:block text-gray-400 hover:text-amber-500 ml-2">
            {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-2 mt-4">
          {menuItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                item.active ? "bg-amber-500 text-white shadow-lg shadow-amber-200" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon size={22} className="flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 text-red-500 w-full hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b h-16 sm:h-20 flex items-center px-4 sm:px-6 justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600">
              <Menu size={24} />
            </button>
            <h1 className="font-bold text-gray-800 text-sm sm:text-base">Company Portal</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            <button onClick={handleNotificationClick} className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {unreadCount}
                </motion.span>
              )}
            </button>

            <Link
              href="/company/createservice"
              className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm hover:bg-purple-700 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Zap size={15} />
              <span className="hidden xs:inline">Create Service</span>
              <span className="xs:hidden">Service</span>
            </Link>

            <Link
              href="/company/createjob"
              className="bg-amber-500 text-white px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm hover:bg-amber-600 transition-colors flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span className="hidden xs:inline">Post Job</span>
              <span className="xs:hidden">Job</span>
            </Link>
          </div>
        </header>

        {/* Main */}
        <main className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 flex-grow">
          {/* Welcome Banner */}
          <div className="bg-gray-900 rounded-2xl p-5 sm:p-8 text-white relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative z-10">
              <h2 className="text-lg sm:text-2xl font-bold">Welcome, {user?.companyName}! 👋</h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">Review your jobs and marketplace activity.</p>
            </div>
            {user?.companyLogo && (
              <div className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-white/10 flex-shrink-0">
                <img src={user.companyLogo} alt="Logo" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <StatBox label="Total Jobs" value={stats?.overview?.totalJobs} icon={Briefcase} color="blue" />
            <StatBox label="Marketplace Services" value={stats?.marketplace?.totalServices} icon={ShoppingBag} color="purple" />
            {/* ✅ Total Paid Orders - now correctly fetched */}
            <StatBox
              label="Total Paid Orders"
              value={stats?.marketplace?.totalOrders || 0}
              icon={DollarSign}
              color="amber"
            />
          </div>

          {/* Recent Postings */}
          <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b font-bold text-gray-700 flex justify-between items-center">
              <span className="text-sm sm:text-base">Recent Postings (Jobs & Services)</span>
              <Link href="/company/jobs" className="text-xs text-amber-600 hover:underline">
                View All
              </Link>
            </div>
            <div className="divide-y">
              {recentPostings.length > 0 ? (
                recentPostings.map((item: any) => (
                  <div
                    key={item._id}
                    className="p-3 sm:p-4 flex items-center justify-between hover:bg-gray-50 transition-colors gap-3"
                  >
                    <div className="min-w-0 flex-1 flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg flex-shrink-0 ${
                          item.isService ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {item.isService ? <ShoppingBag size={15} /> : <Briefcase size={15} />}
                      </div>
                      <div className="truncate">
                        <h4 className="font-semibold text-gray-800 truncate text-sm">{item.title}</h4>
                        <p className="text-xs text-gray-500">
                          {item.isService
                            ? `${item.orderCount || 0} orders • Marketplace`
                            : `${item.applicationCount} applicants • Job`}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase flex-shrink-0 ${
                        item.status === "active" || item.status === "open"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm italic">No recent postings found.</div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border flex items-center gap-4 shadow-sm"
    >
      <div className={`p-3 rounded-xl flex-shrink-0 ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-gray-800">{value ?? 0}</p>
      </div>
    </motion.div>
  );
}
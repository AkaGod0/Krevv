"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, api } from "@/app/context/AuthContext";
import {
  Building2, Briefcase, Users, Plus, Settings, LogOut, Loader2,
  CheckCircle, Menu, X, Home, PanelLeftClose, PanelLeftOpen,
  UserPlus
} from "lucide-react";

export default function CompanyDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // If not authenticated or not a company, redirect
    if (!isAuthenticated) {
      router.push("/company/login");
      return;
    }

    // Check if user is a company (has companyName)
    if (!user?.companyName) {
      router.push("/company/login");
      return;
    }

    fetchDashboardData();
  }, [authLoading, isAuthenticated, user]);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get("/company/dashboard/stats");
      setStats(statsRes.data.data);
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading while auth is checking
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500" size={40} />
      </div>
    );
  }

  // If not authenticated after loading, don't render (redirect will happen)
  if (!isAuthenticated || !user?.companyName) {
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
      
      {/* Mobile Sidebar Overlay */}
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
            <div className="flex items-center gap-3">
              {/* Dynamic Logo Container */}
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 overflow-hidden border border-amber-100">
                {user?.companyLogo ? (
                  <img src={user.companyLogo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={20}/>
                )}
              </div>
              <span className="font-bold text-gray-800 truncate">Krevv</span>
            </div>
          )}
          {isCollapsed && (
             <div className="w-10 h-10 mx-auto bg-amber-50 rounded-lg flex items-center justify-center overflow-hidden border border-amber-100">
                {user?.companyLogo ? <img src={user.companyLogo} alt="Logo" className="w-full h-full object-cover" /> : <Building2 size={20} className="text-amber-600"/>}
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
              className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${
                item.active ? "bg-amber-500 text-white shadow-lg shadow-amber-200" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon size={22} className="flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2 text-red-500 w-full hover:bg-red-50 rounded-xl transition-colors">
            <LogOut size={20} />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b h-20 flex items-center px-6 justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600">
                <Menu size={24} />
            </button>
            <h1 className="font-bold text-gray-800">Company Portal</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/company/createjob" className="bg-amber-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-amber-600 transition-colors hidden sm:block">
                Post Job
            </Link>
            
            {/* Top Right Header Logo/Profile Circle */}
            <Link href="/company/profile" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-full border-2 border-amber-100 overflow-hidden bg-gray-50 group-hover:border-amber-500 transition-all">
                    {user?.companyLogo ? (
                        <img src={user.companyLogo} alt="Company Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-amber-500"><Building2 size={20}/></div>
                    )}
                </div>
            </Link>
          </div>
        </header>

        <main className="p-6 space-y-6 flex-grow">
          {/* Welcome Banner */}
          <div className="bg-gray-900 rounded-2xl p-8 text-white relative overflow-hidden flex items-center justify-between">
            <div className="relative z-10">
                <h2 className="text-2xl font-bold">Welcome, {user?.companyName}! 👋</h2>
                <p className="text-gray-400 text-sm mt-1">Check your latest application updates below.</p>
            </div>
            
            {/* Large Decorative Logo in Banner */}
            {user?.companyLogo && (
                <div className="hidden md:block relative z-10 w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                    <img src={user.companyLogo} alt="Company Logo" className="w-full h-full object-cover" />
                </div>
            )}
            
            <div className="absolute top-0 right-0 w-32 h-full bg-amber-500/10 skew-x-12 translate-x-10" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatBox label="Total Jobs" value={stats?.overview?.totalJobs} icon={Briefcase} color="blue" />
            <StatBox label="Active Jobs" value={stats?.overview?.activeJobs} icon={CheckCircle} color="green" />
            <StatBox 
              label="Total Applications" 
              value={stats?.overview?.totalApplications} 
              icon={Users} 
              color="amber" 
            />
          </div>

          {/* Recent Jobs Table */}
          <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b font-bold text-gray-700 flex justify-between items-center">
                <span>Recent Job Posts</span>
                <Link href="/company/jobs" className="text-xs text-amber-600 hover:underline">View All</Link>
            </div>
            <div className="divide-y">
              {stats?.recentJobs?.length > 0 ? (
                stats.recentJobs.map((job: any) => (
                    <div key={job._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="truncate pr-4">
                        <h4 className="font-semibold text-gray-800 truncate">{job.title}</h4>
                        <p className="text-xs text-gray-500">{job.applicationCount || 0} applications</p>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                        job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm italic">No recent jobs found.</div>
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
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <motion.div whileHover={{ y: -2 }} className="bg-white p-6 rounded-2xl border flex items-center gap-4 shadow-sm">
      <div className={`p-3 rounded-xl ${colors[color]}`}><Icon size={24} /></div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-gray-800">{value || 0}</p>
      </div>
    </motion.div>
  );
}
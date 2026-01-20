"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  UserCheck,
  UserX,
  TrendingUp,
  Activity,
  Clock,
  Shield,
  FileText,
  Heart,
  MessageCircle,
  Eye,
  Star,
  Flag,
  Building2,
} from "lucide-react";
import { useAdmin, adminApi } from "./context/AdminContext";
import Link from "next/link";

interface Stats {
  totalUsers: number;
  totalJobs: number;
  totalCompanies: number;
  blockedUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  totalReviews: number;
  totalReports: number;
  recentUsers: any[];
  recentJobs: any[];
  recentCompanies: any[];
}

export default function AdminDashboard() {
  const { admin } = useAdmin();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalJobs: 0,
    totalCompanies: 0,
    blockedUsers: 0,
    activeUsers: 0,
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalViews: 0,
    totalReviews: 0,
    totalReports: 0,
    recentUsers: [],
    recentJobs: [],
    recentCompanies: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, jobsRes, blockedRes, postsRes, reviewsRes, reportsRes, companiesRes] = await Promise.all([
        adminApi.get("/admin/users"),
        adminApi.get("/admin/jobs"),
        adminApi.get("/admin/users/blocked"),
        adminApi.get("/posts?limit=1000"),
        adminApi.get("/reviews").catch(() => ({ data: [] })),
        adminApi.get("/jobs/reports/all").catch(() => ({ data: [] })),
        adminApi.get("/admin/companies").catch(() => ({ data: [] })),
      ]);

      const users = usersRes.data || [];
      const jobs = jobsRes.data || [];
      const blocked = blockedRes.data || [];
      const companies = companiesRes.data?.data || companiesRes.data || [];
      
      let posts = Array.isArray(postsRes.data) ? postsRes.data : (postsRes.data?.data || []);
      let reviews = Array.isArray(reviewsRes.data) ? reviewsRes.data : (reviewsRes.data?.data || []);
      let reports = Array.isArray(reportsRes.data) ? reportsRes.data : (reportsRes.data?.data || []);

      let totalLikes = 0, totalComments = 0, totalViews = 0;
      posts.forEach((post: any) => {
        totalLikes += post.likes?.length || 0;
        totalComments += post.comments?.length || 0;
        totalViews += post.views || 0;
      });

      setStats({
        totalUsers: users.length,
        totalJobs: jobs.length,
        totalCompanies: companies.length,
        blockedUsers: blocked.length,
        activeUsers: users.length - blocked.length,
        totalPosts: posts.length,
        totalLikes,
        totalComments,
        totalViews,
        totalReviews: reviews.length,
        totalReports: reports.length,
        recentUsers: users.slice(0, 5),
        recentJobs: jobs.slice(0, 5),
        recentCompanies: companies.slice(0, 5),
      });
    } catch (error: any) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const mainStatCards = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, textColor: "text-blue-600", bgColor: "bg-blue-100" },
    { title: "Total Jobs", value: stats.totalJobs, icon: Briefcase, textColor: "text-green-600", bgColor: "bg-green-100" },
    { title: "Companies", value: stats.totalCompanies, icon: Building2, textColor: "text-amber-600", bgColor: "bg-amber-100" },
    { title: "Blocked Users", value: stats.blockedUsers, icon: UserX, textColor: "text-red-600", bgColor: "bg-red-100" },
  ];

  // Secondary stats added back here
  const engagementStats = [
    { title: "Posts", value: stats.totalPosts, icon: FileText, color: "text-purple-600" },
    { title: "Likes", value: stats.totalLikes, icon: Heart, color: "text-rose-600" },
    { title: "Comments", value: stats.totalComments, icon: MessageCircle, color: "text-indigo-600" },
    { title: "Total Views", value: stats.totalViews, icon: Eye, color: "text-cyan-600" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 px-3 sm:px-4 md:px-0">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 text-white shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
          <div className="bg-white/20 rounded-full p-2.5 sm:p-3 md:p-4">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2">Welcome back, {admin?.firstName || admin?.username}!</h1>
            <p className="text-xs sm:text-sm md:text-base text-blue-100">Managing {stats.totalCompanies} companies across the platform</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
        {mainStatCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white rounded-lg md:rounded-xl shadow-lg p-3 sm:p-4 md:p-6 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                <div className={`${stat.bgColor} p-1.5 sm:p-2 md:p-3 rounded-lg`}><Icon className={`${stat.textColor} w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6`} /></div>
                <TrendingUp className="text-green-500 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </div>
              <h3 className="text-gray-600 text-[10px] sm:text-xs md:text-sm font-medium mb-0.5 sm:mb-1 truncate">{stat.title}</h3>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Engagement Stats Section Added Back */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {engagementStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.title} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + index * 0.1 }} className="bg-white p-3 sm:p-4 rounded-lg shadow border border-gray-100 flex items-center gap-3">
              <div className={`${stat.color} bg-gray-50 p-2 rounded-md`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-wider">{stat.title}</p>
                <p className="text-sm sm:text-lg font-bold text-gray-800">{stat.value.toLocaleString()}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        <div className="bg-white rounded-lg md:rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2"><Users className="text-blue-600" /> Recent Users</h2>
            <Link href="/admin/users" className="text-blue-600 text-xs font-medium">View All →</Link>
          </div>
          <div className="space-y-3">
            {stats.recentUsers.map((user, index) => (
              <div key={user._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">{user.firstName?.charAt(0)}</div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-gray-800 text-sm">{user.firstName} {user.lastName}</p>
                      {user.isEmailVerified ? (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[9px] font-semibold rounded">Verified</span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[9px] font-semibold rounded">Not Verified</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg md:rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2"><Briefcase className="text-green-600" /> Recent Jobs</h2>
            <Link href="/admin/jobs" className="text-green-600 text-xs font-medium">View All →</Link>
          </div>
          <div className="space-y-3">
            {stats.recentJobs.map((job, index) => (
              <div key={job._id || index} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-800 text-sm truncate">{job.title}</p>
                <p className="text-xs text-gray-600">{job.company}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900 rounded-xl p-6 shadow-xl">
        <h2 className="text-white text-lg font-bold mb-4 flex items-center gap-2"><Activity size={20}/> Management</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link href="/admin/users" className="bg-blue-600 text-white p-3 rounded-lg text-center text-sm font-bold hover:bg-blue-700 transition">Manage Users</Link>
          <Link href="/admin/companies" className="bg-amber-600 text-white p-3 rounded-lg text-center text-sm font-bold hover:bg-amber-700 transition">Manage Companies</Link>
          <Link href="/admin/jobs" className="bg-green-600 text-white p-3 rounded-lg text-center text-sm font-bold hover:bg-green-700 transition">Manage Jobs</Link>
          <Link href="/admin/reports" className="bg-red-600 text-white p-3 rounded-lg text-center text-sm font-bold hover:bg-red-700 transition">Reports</Link>
          <Link href="/admin/profile" className="bg-purple-600 text-white p-3 rounded-lg text-center text-sm font-bold hover:bg-purple-700 transition">Profile</Link>
        </div>
      </motion.div>
    </div>
  );
}
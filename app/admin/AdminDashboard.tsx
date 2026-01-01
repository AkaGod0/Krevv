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
} from "lucide-react";
import { useAdmin, adminApi } from "./context/AdminContext";
import Link from "next/link";

interface Stats {
  totalUsers: number;
  totalJobs: number;
  blockedUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  totalReviews: number;
  recentUsers: any[];
  recentJobs: any[];
}

export default function AdminDashboard() {
  const { admin } = useAdmin();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalJobs: 0,
    blockedUsers: 0,
    activeUsers: 0,
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalViews: 0,
    totalReviews: 0,
    recentUsers: [],
    recentJobs: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, jobsRes, blockedRes, postsRes, reviewsRes] = await Promise.all([
        adminApi.get("/admin/users"),
        adminApi.get("/admin/jobs"),
        adminApi.get("/admin/users/blocked"),
        adminApi.get("/posts?limit=1000"),
        adminApi.get("/reviews").catch(() => ({ data: [] })),
      ]);

      const users = usersRes.data;
      const jobs = jobsRes.data;
      const blocked = blockedRes.data;
      
      let posts = [];
      if (Array.isArray(postsRes.data)) {
        posts = postsRes.data;
      } else if (postsRes.data?.data && Array.isArray(postsRes.data.data)) {
        posts = postsRes.data.data;
      } else if (postsRes.data?.posts && Array.isArray(postsRes.data.posts)) {
        posts = postsRes.data.posts;
      }

      let reviews = [];
      if (Array.isArray(reviewsRes.data)) {
        reviews = reviewsRes.data;
      } else if (reviewsRes.data?.data && Array.isArray(reviewsRes.data.data)) {
        reviews = reviewsRes.data.data;
      } else if (reviewsRes.data?.reviews && Array.isArray(reviewsRes.data.reviews)) {
        reviews = reviewsRes.data.reviews;
      }

      let totalLikes = 0;
      let totalComments = 0;
      let totalViews = 0;

      posts.forEach((post: any) => {
        totalLikes += post.likes?.length || 0;
        totalComments += post.comments?.length || 0;
        totalViews += post.views || 0;
      });

      setStats({
        totalUsers: users.length,
        totalJobs: jobs.length,
        blockedUsers: blocked.length,
        activeUsers: users.length - blocked.length,
        totalPosts: posts.length,
        totalLikes,
        totalComments,
        totalViews,
        totalReviews: reviews.length,
        recentUsers: users.slice(0, 5),
        recentJobs: jobs.slice(0, 5),
      });
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      setStats({
        totalUsers: 0,
        totalJobs: 0,
        blockedUsers: 0,
        activeUsers: 0,
        totalPosts: 0,
        totalLikes: 0,
        totalComments: 0,
        totalViews: 0,
        totalReviews: 0,
        recentUsers: [],
        recentJobs: [],
      });
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
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      textColor: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Jobs",
      value: stats.totalJobs,
      icon: Briefcase,
      textColor: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: UserCheck,
      textColor: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Blocked Users",
      value: stats.blockedUsers,
      icon: UserX,
      textColor: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  const contentStatCards = [
    {
      title: "Total Posts",
      value: stats.totalPosts,
      icon: FileText,
      textColor: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Total Likes",
      value: stats.totalLikes,
      icon: Heart,
      textColor: "text-pink-600",
      bgColor: "bg-pink-100",
    },
    {
      title: "Total Comments",
      value: stats.totalComments,
      icon: MessageCircle,
      textColor: "text-cyan-600",
      bgColor: "bg-cyan-100",
    },
    {
      title: "Total Views",
      value: stats.totalViews,
      icon: Eye,
      textColor: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Total Reviews",
      value: stats.totalReviews,
      icon: Star,
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 px-3 sm:px-4 md:px-0">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 text-white shadow-2xl"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
          <div className="bg-white/20 rounded-full p-2.5 sm:p-3 md:p-4">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2">
              Welcome back, {admin?.firstName || admin?.username}!
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-blue-100">
              Here's what's happening with your platform today
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <div>
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4 px-1">
          User & Job Statistics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          {mainStatCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg md:rounded-xl shadow-lg p-3 sm:p-4 md:p-6 hover:shadow-xl transition"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                  <div className={`${stat.bgColor} p-1.5 sm:p-2 md:p-3 rounded-lg`}>
                    <Icon className={`${stat.textColor} w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6`} />
                  </div>
                  <TrendingUp className="text-green-500 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </div>
                <h3 className="text-gray-600 text-[10px] sm:text-xs md:text-sm font-medium mb-0.5 sm:mb-1 truncate">
                  {stat.title}
                </h3>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Content Stats Grid */}
      <div>
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4 px-1">
          Content Statistics
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          {contentStatCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg md:rounded-xl shadow-lg p-3 sm:p-4 md:p-6 hover:shadow-xl transition"
              >
                <div className={`${stat.bgColor} p-1.5 sm:p-2 md:p-3 rounded-lg w-fit mb-2 sm:mb-3 md:mb-4`}>
                  <Icon className={`${stat.textColor} w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6`} />
                </div>
                <h3 className="text-gray-600 text-[10px] sm:text-xs md:text-sm font-medium mb-0.5 sm:mb-1 truncate">
                  {stat.title}
                </h3>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg md:rounded-xl shadow-lg p-3 sm:p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 flex items-center gap-1.5 sm:gap-2">
              <Users className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              <span className="hidden xs:inline">Recent Users</span>
              <span className="xs:hidden">Users</span>
            </h2>
            <Link
              href="/admin/users"
              className="text-blue-600 hover:text-blue-700 text-[10px] sm:text-xs md:text-sm font-medium whitespace-nowrap"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            {stats.recentUsers.length === 0 ? (
              <p className="text-center text-gray-500 py-6 md:py-8 text-xs sm:text-sm md:text-base">
                No users yet
              </p>
            ) : (
              stats.recentUsers.map((user, index) => (
                <div
                  key={user._id || index}
                  className="flex items-center justify-between p-2 sm:p-2.5 md:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                    <div className="bg-blue-600 rounded-full w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center text-white font-bold text-xs sm:text-sm md:text-base flex-shrink-0">
                      {user.firstName?.charAt(0) || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  {user.isBlocked && (
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-100 text-red-600 text-[9px] sm:text-xs font-semibold rounded flex-shrink-0">
                      Blocked
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Jobs */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg md:rounded-xl shadow-lg p-3 sm:p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 flex items-center gap-1.5 sm:gap-2">
              <Briefcase className="text-green-600 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              <span className="hidden xs:inline">Recent Jobs</span>
              <span className="xs:hidden">Jobs</span>
            </h2>
            <Link
              href="/admin/jobs"
              className="text-green-600 hover:text-green-700 text-[10px] sm:text-xs md:text-sm font-medium whitespace-nowrap"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            {stats.recentJobs.length === 0 ? (
              <p className="text-center text-gray-500 py-6 md:py-8 text-xs sm:text-sm md:text-base">
                No jobs yet
              </p>
            ) : (
              stats.recentJobs.map((job, index) => (
                <div
                  key={job._id || index}
                  className="p-2 sm:p-2.5 md:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base truncate">
                        {job.title}
                      </p>
                      <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 truncate">{job.company}</p>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 flex-wrap">
                        <span className="text-[9px] sm:text-xs bg-blue-100 text-blue-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                          {job.type}
                        </span>
                        <span className="text-[9px] sm:text-xs text-gray-500 flex items-center gap-0.5 sm:gap-1">
                          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg md:rounded-xl shadow-lg p-3 sm:p-4 md:p-6"
      >
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2 sm:mb-3 md:mb-4 flex items-center gap-1.5 sm:gap-2">
          <Activity className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <Link href="/admin/users" className="w-full">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-2.5 md:py-3 rounded-lg transition text-xs sm:text-sm md:text-base">
              <span className="hidden xs:inline">Manage </span>Users
            </button>
          </Link>
          <Link href="/admin/jobs" className="w-full">
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 sm:py-2.5 md:py-3 rounded-lg transition text-xs sm:text-sm md:text-base">
              <span className="hidden xs:inline">Manage </span>Jobs
            </button>
          </Link>
          <Link href="/admin/manage" className="w-full">
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 sm:py-2.5 md:py-3 rounded-lg transition text-xs sm:text-sm md:text-base">
              <span className="hidden xs:inline">Manage </span>Posts
            </button>
          </Link>
          <Link href="/admin/profile" className="w-full">
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 sm:py-2.5 md:py-3 rounded-lg transition text-xs sm:text-sm md:text-base">
              <span className="hidden xs:inline">Edit </span>Profile
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, useAuth } from "@/app/context/AuthContext";
import {
  Briefcase,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  MapPin,
  DollarSign,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Users,
  ShoppingBag,
  Zap,
  Sparkles,
} from "lucide-react";

interface Job {
  _id: string;
  title: string;
  slug: string;
  company: string;
  location: string;
  type: string;
  category: string;
  salary?: string;
  budget?: number;
  status: string;
  applicationCount: number;
  applicationsCount?: number;
  requiredSkills?: string[];
  createdAt: string;
  deadline?: string;
  isService?: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function CompanyJobsPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user?.companyName) {
      router.push("/company/login");
      return;
    }
    fetchJobs();
  }, [authLoading, isAuthenticated, user, pagination.page, statusFilter]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "success", message: "" }), 3000);
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const [jobsRes, servicesRes] = await Promise.all([
        api.get("/company/jobs", {
          params: {
            page: pagination.page,
            limit: pagination.limit,
            status: statusFilter || undefined,
          },
        }),
        api.get("/marketplace/my-services"),
      ]);

      let combinedData: Job[] = [];

      if (jobsRes.data.success) {
        combinedData = [...(jobsRes.data.data || [])];
      }

      if (servicesRes.data) {
        // ✅ Fetch orders for each service
        const servicesWithOrders = await Promise.all(
          servicesRes.data.map(async (s: any) => {
            try {
              const ordersRes = await api.get(`/marketplace/services/${s._id}/orders`);
              const orders = ordersRes.data || [];
              // Count only paid orders
              const paidOrdersCount = orders.filter((o: any) => 
                ["paid", "in_progress", "delivered", "completed"].includes(o.status)
              ).length;
              
              return {
                ...s,
                isService: true,
                applicationCount: paidOrdersCount, // Use orders count instead of applications
                location: "Remote",
                type: "freelance",
              };
            } catch (err) {
              return {
                ...s,
                isService: true,
                applicationCount: 0,
                location: "Remote",
                type: "freelance",
              };
            }
          })
        );
        
        combinedData = [...combinedData, ...servicesWithOrders];
      }

      combinedData.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setJobs(combinedData);
      setPagination(
        jobsRes.data.pagination || { ...pagination, total: combinedData.length }
      );
    } catch (err: any) {
      console.error("Error fetching data:", err);
      showToast("error", "Failed to sync jobs and services");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string, isService?: boolean) => {
    try {
      const endpoint = isService
        ? `/marketplace/services/${id}/status`
        : `/company/jobs/${id}/status`;
      await api.patch(endpoint, { status: newStatus });
      showToast("success", `Status updated to ${newStatus}`);
      fetchJobs();
    } catch (err) {
      showToast("error", "Failed to update status");
    }
    setActionMenuOpen(null);
  };

  const handleDelete = async (id: string, isService?: boolean) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    setDeleting(id);
    try {
      const endpoint = isService ? `/marketplace/services/${id}` : `/company/jobs/${id}`;
      await api.delete(endpoint);
      showToast("success", "Removed successfully");
      fetchJobs();
    } catch (err) {
      showToast("error", "Failed to delete");
    } finally {
      setDeleting(null);
    }
    setActionMenuOpen(null);
  };

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    const badges: Record<string, { color: string; icon: any; label: string }> = {
      active: {
        color: "bg-green-100 text-green-700 border-green-300",
        icon: CheckCircle,
        label: "Active",
      },
      open: { color: "bg-blue-100 text-blue-700 border-blue-300", icon: Zap, label: "Open" },
      closed: {
        color: "bg-gray-100 text-gray-700 border-gray-300",
        icon: XCircle,
        label: "Closed",
      },
      draft: {
        color: "bg-yellow-100 text-yellow-700 border-yellow-300",
        icon: FileText,
        label: "Draft",
      },
      expired: {
        color: "bg-red-100 text-red-700 border-red-300",
        icon: AlertCircle,
        label: "Expired",
      },
      in_progress: {
        color: "bg-blue-100 text-blue-700 border-blue-300",
        icon: Clock,
        label: "In Progress",
      },
      completed: {
        color: "bg-purple-100 text-purple-700 border-purple-300",
        icon: CheckCircle,
        label: "Completed",
      },
    };
    const badge = badges[s] || badges.draft;
    const Icon = badge.icon;
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${badge.color}`}
      >
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white`}
          >
            {toast.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/company/dashboard" className="text-gray-500 hover:text-gray-700">
                <ChevronLeft size={24} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Postings & Services</h1>
                <p className="text-sm text-gray-500">{jobs.length} total items</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Link href="/company/createjob">
                            <button className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition shadow-lg">
                              Post a Job
                            </button>
                          </Link>
                          <Link href="/company/create-service">
                            <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition shadow-lg">
                              Create Service
                            </button>
                          </Link>
                          <Link href="/marketplace/payouts">
                            <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition shadow-lg">
                              View Payouts
                            </button>
                          </Link>
                        </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <Briefcase className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {jobs.filter((j) => !j.isService).length}
                </p>
                <p className="text-xs text-gray-500">Jobs</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-lg p-2">
                <Sparkles className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {jobs.filter((j) => j.isService).length}
                </p>
                <p className="text-xs text-gray-500">Services</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-amber-500">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 rounded-lg p-2">
                <ShoppingBag className="text-amber-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0)}
                </p>
                <p className="text-xs text-gray-500">
                  Applications & Orders
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.map((job, idx) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition border-l-4 ${
                job.isService ? "border-l-purple-500" : "border-l-blue-500"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-4">
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex-shrink-0">
                      {job.isService ? (
                        <Sparkles className="text-purple-500" size={24} />
                      ) : (
                        <Briefcase className="text-amber-500" size={24} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-lg font-bold text-gray-800 truncate">
                          {job.title}
                        </h3>
                        {getStatusBadge(job.status)}
                        {job.isService && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-black rounded uppercase">
                            <Sparkles size={10} />
                            SERVICE
                          </span>
                        )}
                      </div>

                      {/* Skills Tags for Marketplace */}
                      {job.isService && job.requiredSkills && job.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {job.requiredSkills.slice(0, 5).map((skill) => (
                            <span
                              key={skill}
                              className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-bold border border-purple-200"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.requiredSkills.length > 5 && (
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-bold">
                              +{job.requiredSkills.length - 5}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign size={14} />
                          {job.budget || job.salary || "Negotiable"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 px-4 py-2 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p
                      className={`text-xl font-bold ${
                        job.isService ? "text-purple-600" : "text-amber-600"
                      }`}
                    >
                      {job.applicationCount}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                      {job.isService ? "Orders" : "Applications"}
                    </p>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() =>
                        setActionMenuOpen(actionMenuOpen === job._id ? null : job._id)
                      }
                      className="p-2 hover:bg-white rounded-full shadow-sm border transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>

                    <AnimatePresence>
                      {actionMenuOpen === job._id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border py-2 z-20"
                        >
                          <Link
                            href={
                              job.isService
                                ? `/marketplace/tasks/${job._id}`
                                : `/jobs/${job.slug}`
                            }
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700 transition-colors"
                          >
                            <Eye size={16} /> View Details
                          </Link>
                          
                          {/* ✅ Edit Link */}
                          <Link
                            href={`/company/jobs/${job._id}/edit`}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 text-blue-600 transition-colors"
                          >
                            <Edit size={16} /> Edit
                          </Link>

                          {/* ✅ Applications/Orders Link */}
                          <Link
                            href={`/applications/job/${job._id}`}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-green-50 text-green-600 transition-colors"
                          >
                            {job.isService ? <ShoppingBag size={16} /> : <Users size={16} />}
                            {job.isService ? "View Orders" : "View Applications"} ({job.applicationCount})
                          </Link>

                          <hr className="my-1 border-gray-100" />

                          <button
                            onClick={() => handleDelete(job._id, job.isService)}
                            disabled={deleting === job._id}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 w-full text-left transition-colors disabled:opacity-50"
                          >
                            {deleting === job._id ? (
                              <>
                                <Loader2 size={16} className="animate-spin" /> Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 size={16} /> Delete
                              </>
                            )}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredJobs.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase size={40} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Postings Found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? "Try adjusting your search"
                  : "Create your first job posting or service"}
              </p>
              <Link href="/company/createjob">
                <button className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition">
                  Create Posting
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Click outside to close menu */}
      {actionMenuOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setActionMenuOpen(null)} />
      )}
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/app/context/AuthContext";
import Cookies from "js-cookie";
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
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Job {
  _id: string;
  title: string;
  slug: string;
  company: string;
  location: string;
  type: string;
  category: string;
  salary?: string;
  status: string;
  applicationCount: number;
  createdAt: string;
  deadline?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function CompanyJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "error"; message: string }>({
    show: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    fetchJobs();
  }, [pagination.page, statusFilter]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "success", message: "" }), 3000);
  };

  const fetchJobs = async () => {
    const token = Cookies.get("company_token") || localStorage.getItem("company_token");
    if (!token) {
      router.push("/company/login");
      return;
    }

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (statusFilter) params.append("status", statusFilter);

      const res = await api.get(`${API}/company/jobs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setJobs(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      if (err.response?.status === 401) {
        router.push("/company/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    const token = Cookies.get("company_token") || localStorage.getItem("company_token");
    try {
      await api.patch(
        `${API}/company/jobs/${jobId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("success", `Job status updated to ${newStatus}`);
      fetchJobs();
    } catch (err) {
      showToast("error", "Failed to update job status");
    }
    setActionMenuOpen(null);
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job? This action cannot be undone.")) return;

    const token = Cookies.get("company_token") || localStorage.getItem("company_token");
    setDeleting(jobId);
    try {
      await api.delete(`${API}/company/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("success", "Job deleted successfully");
      fetchJobs();
    } catch (err) {
      showToast("error", "Failed to delete job");
    } finally {
      setDeleting(null);
    }
    setActionMenuOpen(null);
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any; label: string }> = {
      active: { color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle, label: "Active" },
      closed: { color: "bg-gray-100 text-gray-700 border-gray-300", icon: XCircle, label: "Closed" },
      draft: { color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: FileText, label: "Draft" },
      expired: { color: "bg-red-100 text-red-700 border-red-300", icon: AlertCircle, label: "Expired" },
    };
    const badge = badges[status] || badges.draft;
    const Icon = badge.icon;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${badge.color}`}>
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  const getJobTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      full_time: "Full Time",
      part_time: "Part Time",
      contract: "Contract",
      freelance: "Freelance",
      internship: "Internship",
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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

      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/company/dashboard" className="text-gray-500 hover:text-gray-700">
                <ChevronLeft size={24} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">My Jobs</h1>
                <p className="text-sm text-gray-500">{pagination.total} total jobs</p>
              </div>
            </div>
            <Link
              href="/company/createjob"
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Post New Job</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards - Adjusted to 3 columns since views are removed */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <Briefcase className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{pagination.total}</p>
                <p className="text-xs text-gray-500">Total Jobs Posted</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-lg p-2">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {jobs.filter((j) => j.status === "active").length}
                </p>
                <p className="text-xs text-gray-500">Active Listings</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-amber-500">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 rounded-lg p-2">
                <Users className="text-amber-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0)}
                </p>
                <p className="text-xs text-gray-500">Total Applications</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search jobs by title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Briefcase className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No jobs found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or post a new job.</p>
            <Link
              href="/company/createjob"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg transition"
            >
              <Plus size={20} />
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job, idx) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition border border-gray-100"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4">
                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex-shrink-0">
                        <Briefcase className="text-amber-500" size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-lg font-bold text-gray-800 truncate">{job.title}</h3>
                          {getStatusBadge(job.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1"><MapPin size={14} />{job.location}</span>
                          <span className="flex items-center gap-1"><Clock size={14} />{getJobTypeLabel(job.type)}</span>
                          {job.salary && <span className="flex items-center gap-1"><DollarSign size={14} />{job.salary}</span>}
                          <span className="flex items-center gap-1"><Calendar size={14} />{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 px-4 py-2 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-xl font-bold text-amber-600">{job.applicationCount || 0}</p>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Applications</p>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === job._id ? null : job._id)}
                        className="p-2 hover:bg-white rounded-full shadow-sm transition border border-gray-200"
                      >
                        <MoreVertical size={18} className="text-gray-500" />
                      </button>

                      <AnimatePresence>
                        {actionMenuOpen === job._id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-20"
                          >
                            <Link href={`/company/jobs/${job._id}/edit`} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700">
                              <Edit size={16} /> Edit Job
                            </Link>
                            <Link href={`/jobs/${job.slug}`} target="_blank" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700">
                              <Eye size={16} /> View Public
                            </Link>
                            <hr className="my-2 border-gray-50" />
                            {job.status === "active" ? (
                              <button onClick={() => handleStatusChange(job._id, "closed")} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700 w-full text-left">
                                <XCircle size={16} /> Close Job
                              </button>
                            ) : (
                              <button onClick={() => handleStatusChange(job._id, "active")} className="flex items-center gap-2 px-4 py-2 hover:bg-green-50 text-green-600 w-full text-left">
                                <CheckCircle size={16} /> Activate Job
                              </button>
                            )}
                            <hr className="my-2 border-gray-50" />
                            <button onClick={() => handleDelete(job._id)} disabled={deleting === job._id} className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 w-full text-left">
                              {deleting === job._id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                              Delete Job
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg bg-white shadow-sm disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            {/* ... pagination logic remains same ... */}
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.pages}
              className="p-2 rounded-lg bg-white shadow-sm disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </main>

      {actionMenuOpen && <div className="fixed inset-0 z-10" onClick={() => setActionMenuOpen(null)} />}
    </div>
  );
}
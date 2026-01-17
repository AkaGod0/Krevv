"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, api, getToken } from "@/app/context/AuthContext";
import {
  Users,
  Search,
  Eye,
  Mail,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Briefcase,
  MoreVertical,
  X,
} from "lucide-react";

interface Application {
  _id: string;
  job: {
    _id: string;
    title: string;
    slug: string;
  };
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  coverLetter?: string;
  resumeUrl?: string;
  status: string;
  appliedAt: string;
  notes?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function CompanyApplicationsPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "error"; message: string }>({
    show: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    if (authLoading) return;

    const token = getToken();
    if (!token) {
      router.push("/company/login");
      return;
    }

    fetchApplications();
    fetchJobs();
  }, [authLoading, pagination.page, statusFilter, jobFilter]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "success", message: "" }), 3000);
  };

  const fetchJobs = async () => {
    try {
      const res = await api.get("/company/jobs?limit=100");
      setJobs(res.data.data || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (statusFilter) params.append("status", statusFilter);
      if (jobFilter) params.append("jobId", jobFilter);

      const res = await api.get(`/company/applications?${params}`);

      setApplications(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
    } catch (err: any) {
      console.error("Error fetching applications:", err);
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      await api.patch(`/company/applications/${applicationId}/status`, { status: newStatus });

      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      if (selectedApplication?._id === applicationId) {
        setSelectedApplication((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      showToast("success", `Status updated to ${newStatus}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to update status";
      showToast("error", Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    } finally {
      setActionMenuOpen(null);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const name = `${app.user?.firstName || ""} ${app.user?.lastName || ""}`.toLowerCase();
    const email = app.user?.email?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any; label: string }> = {
      pending: { color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: Clock, label: "Pending" },
      reviewing: { color: "bg-blue-100 text-blue-700 border-blue-300", icon: Eye, label: "Reviewing" },
      accepted: { color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle, label: "Accepted" },
      rejected: { color: "bg-red-100 text-red-700 border-red-300", icon: XCircle, label: "Rejected" },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${badge.color}`}>
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  if (authLoading || (loading && applications.length === 0)) {
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
                <h1 className="text-2xl font-bold text-gray-800">Applications</h1>
                <p className="text-sm text-gray-500">{pagination.total} total applications</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by applicant name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={jobFilter}
                onChange={(e) => {
                  setJobFilter(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="">All Jobs</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>{job.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Users className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No applications found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app, idx) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition cursor-pointer border border-transparent hover:border-amber-200"
                onClick={() => setSelectedApplication(app)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-lg overflow-hidden">
                      {app.user?.avatar ? (
                        <img src={app.user.avatar} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        `${app.user?.firstName?.[0] || ""}${app.user?.lastName?.[0] || ""}`
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {app.user?.firstName} {app.user?.lastName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Mail size={14}/> {app.user?.email}</span>
                        <span className="flex items-center gap-1"><Briefcase size={14}/> {app.job?.title}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-6">
                    <div className="text-right hidden md:block">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Applied On</p>
                      <p className="text-sm font-medium text-gray-700">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(app.status)}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionMenuOpen(actionMenuOpen === app._id ? null : app._id);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        <MoreVertical size={20} className="text-gray-500" />
                      </button>

                      <AnimatePresence>
                        {actionMenuOpen === app._id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                          >
                            <button onClick={() => handleStatusChange(app._id, "reviewing")} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700 w-full text-left transition"><Eye size={16} /> Mark Reviewing</button>
                            <hr className="my-1 border-gray-100" />
                            <button onClick={() => handleStatusChange(app._id, "accepted")} className="flex items-center gap-2 px-4 py-2 hover:bg-green-50 text-green-600 w-full text-left transition"><CheckCircle size={16} /> Accept Candidate</button>
                            <button onClick={() => handleStatusChange(app._id, "rejected")} className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 w-full text-left transition"><XCircle size={16} /> Reject Application</button>
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
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg bg-white border shadow-sm disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium">Page {pagination.page} of {pagination.pages}</span>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.pages}
              className="p-2 rounded-lg bg-white border shadow-sm disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedApplication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedApplication(null)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-gray-800">Application Details</h2>
                <button onClick={() => setSelectedApplication(null)} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={20} /></button>
              </div>

              <div className="p-8">
                <div className="flex items-center gap-5 mb-8">
                   <div className="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg overflow-hidden">
                    {selectedApplication.user?.avatar ? (
                      <img src={selectedApplication.user.avatar} alt="profile" className="w-full h-full object-cover" />
                    ) : (
                      `${selectedApplication.user?.firstName?.[0] || ""}${selectedApplication.user?.lastName?.[0] || ""}`
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{selectedApplication.user?.firstName} {selectedApplication.user?.lastName}</h3>
                    <p className="text-gray-500">{selectedApplication.user?.email}</p>
                    <p className="text-sm text-amber-600 font-medium mt-1">Applied for {selectedApplication.job?.title}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Status</p>
                    {getStatusBadge(selectedApplication.status)}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Date Applied</p>
                    <p className="text-gray-700 font-medium">{new Date(selectedApplication.appliedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedApplication.coverLetter && (
                  <div className="mb-8">
                    <h4 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">Cover Letter</h4>
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {selectedApplication.coverLetter}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  {selectedApplication.resumeUrl && (
                    <a
                      href={selectedApplication.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition shadow-lg"
                    >
                      <Download size={20} /> View & Download Resume
                    </a>
                  )}
                  
                  <div className="grid grid-cols-3 gap-3">
                    <button onClick={() => handleStatusChange(selectedApplication._id, "reviewing")} className="py-3 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition border border-blue-200">Review</button>
                    <button onClick={() => handleStatusChange(selectedApplication._id, "accepted")} className="py-3 bg-green-50 text-green-700 rounded-xl font-bold hover:bg-green-100 transition border border-green-200">Accept</button>
                    <button onClick={() => handleStatusChange(selectedApplication._id, "rejected")} className="py-3 bg-red-50 text-red-700 rounded-xl font-bold hover:bg-red-100 transition border border-red-200">Reject</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {actionMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setActionMenuOpen(null)} />
      )}
    </div>
  );
}
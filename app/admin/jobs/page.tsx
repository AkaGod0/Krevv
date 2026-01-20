"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Search,
  Filter,
  X,
  Loader2,
  Trash2,
  Edit,
  Eye,
  MapPin,
  DollarSign,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Flag,
  Tag,
  Globe,
} from "lucide-react";
import { useAdmin, adminApi } from "../context/AdminContext";
import Link from "next/link";

interface Job {
  _id: string;
  title: string;
  slug: string;
  description: string;
  company: string;
  location: string;
  category: string;
  salary: string;
  type: string;
  status: string;
  experienceLevel: string;
  createdAt: string;
  isExternal?: boolean;
  externalSource?: string;
  postedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  reports: any[];
}

export default function AdminJobsPage() {
  const { admin } = useAdmin();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [deletingJob, setDeletingJob] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const categories = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Marketing',
    'Sales',
    'Design',
    'Engineering',
    'Customer Service',
    'Human Resources',
    'Operations',
    'Legal',
    'Construction',
    'Hospitality',
    'Retail',
    'Transportation',
    'Manufacturing',
    'Agriculture',
    'Real Estate',
    'Other'
  ];

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, filterStatus, filterType, filterCategory, filterSource]);

  const fetchJobs = async () => {
    try {
      const res = await adminApi.get("/admin/jobs");
     
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus) {
      filtered = filtered.filter((job) => job.status === filterStatus);
    }

    if (filterType) {
      filtered = filtered.filter((job) => job.type === filterType);
    }

    if (filterCategory) {
      filtered = filtered.filter((job) => job.category === filterCategory);
    }

    // Source filter
    if (filterSource === 'external') {
      filtered = filtered.filter((job) => job.isExternal === true);
    } else if (filterSource === 'user') {
      filtered = filtered.filter((job) => !job.isExternal);
    }

    setFilteredJobs(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("");
    setFilterType("");
    setFilterCategory("");
    setFilterSource("");
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      return;
    }

    setDeletingJob(jobId);
    try {
      await adminApi.delete(`/admin/jobs/${jobId}`);
      setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
      setToast("Job deleted successfully");
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      console.error("Error deleting job:", err);
      setToast("Failed to delete job");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setDeletingJob(null);
    }
  };

  const getJobTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      full_time: "bg-green-100 text-green-700 border-green-300",
      part_time: "bg-blue-100 text-blue-700 border-blue-300",
      contract: "bg-purple-100 text-purple-700 border-purple-300",
      freelance: "bg-orange-100 text-orange-700 border-orange-300",
      internship: "bg-pink-100 text-pink-700 border-pink-300",
    };
    return colors[type] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-700 border-green-300",
      closed: "bg-red-100 text-red-700 border-red-300",
      draft: "bg-yellow-100 text-yellow-700 border-yellow-300",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const getPendingReportsCount = (job: Job) => {
    if (!job.reports || !Array.isArray(job.reports)) return 0;
    return job.reports.filter(report => report.status === 'pending').length;
  };

  const getTotalReportsCount = (job: Job) => {
    if (!job.reports || !Array.isArray(job.reports)) return 0;
    return job.reports.length;
  };

  const externalCount = jobs.filter(j => j.isExternal).length;
  const userCount = jobs.filter(j => !j.isExternal).length;

  const stats = {
    total: jobs.length,
    active: jobs.filter((j) => j.status === "active").length,
    closed: jobs.filter((j) => j.status === "closed").length,
    draft: jobs.filter((j) => j.status === "draft").length,
    reported: jobs.filter((j) => j.reports && j.reports.length > 0).length,
    external: externalCount,
    user: userCount,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Loader2 className="animate-spin text-green-600 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-6 md:py-12 px-4">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 z-50"
          >
            <CheckCircle size={20} />
            <span className="font-semibold">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white shadow-2xl mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 rounded-full p-4">
              <Briefcase className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Job Management</h1>
              <p className="text-green-100">Manage all job postings on the platform</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-green-100 text-sm">Total Jobs</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-green-100 text-sm">Active</p>
              <p className="text-3xl font-bold">{stats.active}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-green-100 text-sm">Closed</p>
              <p className="text-3xl font-bold">{stats.closed}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-green-100 text-sm">Draft</p>
              <p className="text-3xl font-bold">{stats.draft}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-green-100 text-sm">Reported</p>
              <p className="text-3xl font-bold">{stats.reported}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-green-100 text-sm">🏢 Direct</p>
              <p className="text-3xl font-bold">{stats.user}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-green-100 text-sm">🌐 External</p>
              <p className="text-3xl font-bold">{stats.external}</p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search jobs by title, company, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white text-gray-900 placeholder-gray-400"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
            >
              <Filter size={20} />
              <span>Filters</span>
              {(filterStatus || filterType || filterCategory || filterSource) && (
                <span className="ml-2 bg-white text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  {[filterStatus, filterType, filterCategory, filterSource].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white text-gray-900 appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                  >
                    <option value="" className="text-gray-900">All Statuses</option>
                    <option value="active" className="text-gray-900">Active</option>
                    <option value="closed" className="text-gray-900">Closed</option>
                    <option value="draft" className="text-gray-900">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Type
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white text-gray-900 appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                  >
                    <option value="" className="text-gray-900">All Types</option>
                    <option value="full_time" className="text-gray-900">Full Time</option>
                    <option value="part_time" className="text-gray-900">Part Time</option>
                    <option value="contract" className="text-gray-900">Contract</option>
                    <option value="freelance" className="text-gray-900">Freelance</option>
                    <option value="internship" className="text-gray-900">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white text-gray-900 appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                  >
                    <option value="" className="text-gray-900">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="text-gray-900">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Source Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Source
                  </label>
                  <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white text-gray-900 appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                  >
                    <option value="" className="text-gray-900">All Sources</option>
                    <option value="user" className="text-gray-900">Direct Postings</option>
                    <option value="external" className="text-gray-900">External (Aggregated)</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-green-600 hover:text-green-700 font-semibold transition"
                >
                  <X size={18} />
                  Clear Filters
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Results Count */}
        <p className="text-gray-600 mb-6">
          Showing <span className="font-semibold">{filteredJobs.length}</span> job
          {filteredJobs.length !== 1 && "s"}
          {(searchTerm || filterStatus || filterType || filterCategory || filterSource) && " matching your criteria"}
        </p>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-xl shadow-lg"
          >
            <Briefcase size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No jobs found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus || filterType || filterCategory || filterSource
                ? "Try adjusting your filters"
                : "All jobs will appear here"}
            </p>
            {(searchTerm || filterStatus || filterType || filterCategory || filterSource) && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredJobs.map((job, idx) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getJobTypeColor(
                          job.type
                        )}`}
                      >
                        {job.type?.replace("_", " ").toUpperCase()}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          job.status
                        )}`}
                      >
                        {job.status?.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-purple-100 text-purple-700 border-purple-300">
                        {job.category}
                      </span>
                      {/* External badge */}
                      {job.isExternal && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-blue-100 text-blue-700 border-blue-300 flex items-center gap-1">
                          <Globe size={12} />
                          {job.externalSource || 'External'}
                        </span>
                      )}
                      {getTotalReportsCount(job) > 0 && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-red-100 text-red-700 border-red-300 flex items-center gap-1">
                          <Flag size={14} />
                          {getTotalReportsCount(job)} Report{getTotalReportsCount(job) !== 1 && 's'}
                          {getPendingReportsCount(job) > 0 && (
                            <span className="ml-1 bg-red-600 text-white px-1.5 py-0.5 rounded-full text-[10px]">
                              {getPendingReportsCount(job)} Pending
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Company</p>
                      <p className="text-sm font-semibold">{job.company}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm font-semibold">{job.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Salary</p>
                      <p className="text-sm font-semibold">{job.salary || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {job.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* ✅ FIXED: Check if postedBy exists */}
                    {job.postedBy ? (
                      <span>By {job.postedBy.firstName} {job.postedBy.lastName}</span>
                    ) : (
                      <span>Via {job.company}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Link href={`/jobs/${job.slug}`} target="_blank">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-sm">
                      <Eye size={16} />
                      View Job
                    </button>
                  </Link>

                  {getTotalReportsCount(job) > 0 && (
                    <Link href={`/admin/reports?jobId=${job._id}`}>
                      <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition text-sm">
                        <Flag size={16} />
                        View Reports ({getTotalReportsCount(job)})
                      </button>
                    </Link>
                  )}

                  <button
                    onClick={() => handleDeleteJob(job._id)}
                    disabled={deletingJob === job._id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition text-sm"
                  >
                    {deletingJob === job._id ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
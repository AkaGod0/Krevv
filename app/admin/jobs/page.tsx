"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Search,
  Trash2,
  MapPin,
  DollarSign,
  Building2,
  Calendar,
  Loader2,
  AlertCircle,
  Eye,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";
import { adminApi } from "../context/AdminContext";
import Link from "next/link";

interface Job {
  _id: string;
  title: string;
  company: string;
  slug:string;
  location: string;
  salary: string;
  type: string;
  experienceLevel: string;
  status: string;
  createdAt: string;
  postedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Modal states
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; job: Job | null }>({
    show: false,
    job: null,
  });
  const [successModal, setSuccessModal] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });
  const [errorModal, setErrorModal] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [searchQuery, typeFilter, jobs]);

  const fetchJobs = async () => {
    try {
      const res = await adminApi.get("/admin/jobs");
      setJobs(res.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setErrorModal({
        show: true,
        message: "Failed to fetch jobs. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((j) => j.type === typeFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  };

  const handleDeleteClick = (job: Job) => {
    setDeleteModal({ show: true, job });
  };

  const confirmDelete = async () => {
    if (!deleteModal.job) return;

    setDeleteLoading(true);
    try {
      await adminApi.delete(`/admin/jobs/${deleteModal.job._id}`);
      
      setDeleteModal({ show: false, job: null });
      setSuccessModal({
        show: true,
        message: "Job deleted successfully!",
      });
      fetchJobs();
    } catch (error: any) {
      console.error("Error deleting job:", error);
      setDeleteModal({ show: false, job: null });
      setErrorModal({
        show: true,
        message: error.response?.data?.message || "Failed to delete job. Please try again.",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      full_time: "bg-green-100 text-green-600",
      part_time: "bg-blue-100 text-blue-600",
      contract: "bg-purple-100 text-purple-600",
      freelance: "bg-orange-100 text-orange-600",
      internship: "bg-pink-100 text-pink-600",
    };
    return colors[type] || "bg-gray-100 text-gray-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-green-500 w-12 h-12" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center gap-3 mb-2">
            <Briefcase size={32} />
            <h1 className="text-3xl font-bold">Job Management</h1>
          </div>
          <p className="text-green-100">
            Manage all job postings on the platform
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-600 text-sm mb-1">Total Jobs</p>
            <p className="text-3xl font-bold text-gray-800">{jobs.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-600 text-sm mb-1">Full Time</p>
            <p className="text-3xl font-bold text-green-600">
              {jobs.filter((j) => j.type === "full_time").length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-600 text-sm mb-1">Part Time</p>
            <p className="text-3xl font-bold text-blue-600">
              {jobs.filter((j) => j.type === "part_time").length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-600 text-sm mb-1">Remote</p>
            <p className="text-3xl font-bold text-purple-600">
              {jobs.filter((j) => j.location.toLowerCase().includes("remote")).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, company, or location..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-800"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-800"
            >
              <option value="all">All Types</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No jobs found</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow hover:shadow-lg transition p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-green-600 rounded-lg p-3">
                        <Briefcase className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Building2 size={14} />
                            <span>{job.company}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{job.location}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <DollarSign size={14} />
                            <span>{job.salary}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(
                          job.type
                        )}`}
                      >
                        {job.type.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                        {job.experienceLevel}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={12} />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Posted by:</strong> {job.postedBy.firstName}{" "}
                        {job.postedBy.lastName} ({job.postedBy.email})
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-2">
                    <Link href={`/jobs/${job.slug}`} className="flex-1">
                      <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2">
                        <Eye size={18} />
                        View
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(job)}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && deleteModal.job && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => !deleteLoading && setDeleteModal({ show: false, job: null })}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Delete Job</h3>
              </div>

              <p className="text-gray-600 mb-2">
                Are you sure you want to delete this job?
              </p>
              <p className="text-gray-800 font-semibold mb-4">
                "{deleteModal.job.title}" at {deleteModal.job.company}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, job: null })}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {successModal.show && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSuccessModal({ show: false, message: "" })}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Success</h3>
              </div>

              <p className="text-gray-600 mb-6">{successModal.message}</p>

              <button
                onClick={() => setSuccessModal({ show: false, message: "" })}
                className="w-full px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition"
              >
                OK
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Error Modal */}
      <AnimatePresence>
        {errorModal.show && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setErrorModal({ show: false, message: "" })}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <X className="text-red-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Error</h3>
              </div>

              <p className="text-gray-600 mb-6">{errorModal.message}</p>

              <button
                onClick={() => setErrorModal({ show: false, message: "" })}
                className="w-full px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
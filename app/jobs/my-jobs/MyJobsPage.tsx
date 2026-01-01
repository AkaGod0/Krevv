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
  Plus,
  Edit,
  Trash2,
  Users,
  Eye,
  X,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useAuth, api } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Job {
  _id: string;
  title: string;
  slug: string;
  description: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  status: string;
  experienceLevel: string;
  createdAt: string;
}

export default function MyJobsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; job: Job | null }>({
    show: false,
    job: null,
  });
  const [errorModal, setErrorModal] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });
  const [successModal, setSuccessModal] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }

    if (isAuthenticated) {
      fetchMyJobs();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchMyJobs = async () => {
    try {
      const res = await api.get(
        `${process.env.NEXT_PUBLIC_API_URL}/jobs/user/my-jobs`,
        {
          withCredentials: true,
        }
      );
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setErrorModal({
        show: true,
        message: "Failed to load jobs. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (job: Job) => {
    setDeleteModal({ show: true, job });
  };

  const confirmDelete = async () => {
    if (!deleteModal.job) return;

    setDeleting(true);
    try {
      await api.delete(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${deleteModal.job._id}`, {
        withCredentials: true,
      });
      
      setJobs(jobs.filter((job) => job._id !== deleteModal.job!._id));
      setDeleteModal({ show: false, job: null });
      setSuccessModal({
        show: true,
        message: "Job deleted successfully!",
      });
    } catch (err) {
      console.error("Error deleting job:", err);
      setDeleteModal({ show: false, job: null });
      setErrorModal({
        show: true,
        message: "Failed to delete job. Please try again.",
      });
    } finally {
      setDeleting(false);
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

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <Loader2 className="animate-spin text-amber-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8"
        >
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">
              My Posted Jobs
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage and track your job postings
            </p>
          </div>
          <Link href="../jobs/post-job" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-lg transition text-sm sm:text-base">
              <Plus size={18} className="sm:w-5 sm:h-5" />
              <span className="whitespace-nowrap">Post New Job</span>
            </button>
          </Link>
        </motion.div>

        {/* Stats Summary - Mobile Only */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="md:hidden bg-white rounded-lg shadow-md p-4 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-amber-600">{jobs.length}</p>
              <p className="text-xs text-gray-500">Total Jobs</p>
            </div>
            <div className="h-10 w-px bg-gray-200"></div>
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-green-600">
                {jobs.filter((j) => j.status === "active").length}
              </p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div className="h-10 w-px bg-gray-200"></div>
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-gray-600">
                {jobs.filter((j) => j.status !== "active").length}
              </p>
              <p className="text-xs text-gray-500">Closed</p>
            </div>
          </div>
        </motion.div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-8 sm:p-12 text-center"
          >
            <Briefcase size={48} className="sm:w-16 sm:h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">
              No Jobs Posted Yet
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6">
              Start posting jobs to find the best candidates
            </p>
            <Link href="../jobs/post-job">
              <button className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition">
                Post Your First Job
              </button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {jobs.map((job, idx) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-4 sm:p-6"
              >
                {/* Mobile Layout (< 768px) */}
                <div className="md:hidden">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <Link href={`/jobs/${job.slug}`}>
                        <h3 className="text-lg font-bold text-gray-800 hover:text-amber-600 transition cursor-pointer line-clamp-2">
                          {job.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1.5 text-gray-600 mt-1">
                        <Building2 size={14} className="flex-shrink-0" />
                        <span className="font-medium text-sm truncate">{job.company}</span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getJobTypeColor(
                        job.type
                      )}`}
                    >
                      {job.type.replace("_", " ").toUpperCase()}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {job.description}
                  </p>

                  {/* Info Grid - 2 Columns on Mobile */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} className="flex-shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} className="flex-shrink-0" />
                      <span className="truncate">{job.salary}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase size={14} className="flex-shrink-0" />
                      <span className="truncate">{job.experienceLevel}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="flex-shrink-0" />
                      <span className="truncate">{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                        job.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {job.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Action Buttons - Compact on Mobile */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/jobs/${job.slug}`}>
                      <button className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition text-xs flex items-center justify-center gap-1">
                        <Eye size={14} />
                        View
                      </button>
                    </Link>
                    <Link href={`/applications/job/${job._id}`}>
                      <button className="w-full px-3 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition text-xs flex items-center justify-center gap-1">
                        <Users size={14} />
                        Apps
                      </button>
                    </Link>
                    <Link href={`/jobs/edit/${job.slug}`}>
                      <button className="w-full px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition text-xs flex items-center justify-center gap-1">
                        <Edit size={14} />
                        Edit
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(job)}
                      className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition text-xs flex items-center justify-center gap-1"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Tablet & Desktop Layout (>= 768px) */}
                <div className="hidden md:flex md:flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 pr-4">
                        <Link href={`/jobs/${job.slug}`}>
                          <h3 className="text-xl font-bold text-gray-800 hover:text-amber-600 transition cursor-pointer">
                            {job.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 text-gray-600 mt-1">
                          <Building2 size={16} />
                          <span className="font-medium">{job.company}</span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getJobTypeColor(
                          job.type
                        )}`}
                      >
                        {job.type.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={16} />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign size={16} />
                        <span>{job.salary}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase size={16} />
                        <span>{job.experienceLevel}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={16} />
                        <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          job.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {job.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Actions - Vertical on Desktop */}
                  <div className="flex md:flex-row lg:flex-col gap-2 lg:min-w-[140px]">
                    <Link href={`/jobs/${job.slug}`} className="flex-1 md:flex-1 lg:flex-initial">
                      <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition text-sm flex items-center justify-center gap-1.5">
                        <Eye size={16} />
                        View
                      </button>
                    </Link>
                    <Link
                      href={`/applications/job/${job._id}`}
                      className="flex-1 md:flex-1 lg:flex-initial"
                    >
                      <button className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition text-sm flex items-center justify-center gap-1.5">
                        <Users size={16} />
                        Applications
                      </button>
                    </Link>
                    <Link href={`/jobs/edit/${job.slug}`} className="flex-1 md:flex-1 lg:flex-initial">
                      <button className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition text-sm flex items-center justify-center gap-1.5">
                        <Edit size={16} />
                        Edit
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(job)}
                      className="flex-1 md:flex-1 lg:flex-initial px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition text-sm flex items-center justify-center gap-1.5"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && deleteModal.job && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => !deleting && setDeleteModal({ show: false, job: null })}
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

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold">"{deleteModal.job.title}"</span>? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, job: null })}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {deleting ? (
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
    </div>
  );
}
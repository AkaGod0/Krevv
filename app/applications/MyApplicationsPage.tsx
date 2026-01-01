"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Loader2,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useAuth, api } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Application {
  _id: string;
  coverLetter: string;
  resumeUrl: string;
  status: "pending" | "reviewing" | "accepted" | "rejected";
  appliedAt: string;
  job: {
    _id: string;
    title: string;
    slug:string;
    company: string;
    location: string;
    salary: string;
    type: string;
  } | null; // ✅ Allow null
}

export default function MyApplicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewing: 0,
    accepted: 0,
    rejected: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchApplications();
      fetchStats();
    }
  }, [user, authLoading, router]);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my-applications');
      setApplications(res.data);
    } catch (err: any) {
      console.error("Error fetching applications:", err);
      if (err.response?.status === 401) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/applications/my-applications/stats');
      setStats(res.data);
    } catch (err: any) {
      console.error("Error fetching stats:", err);
      if (err.response?.status === 401) {
        router.push("/login");
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      reviewing: "bg-blue-100 text-blue-700 border-blue-300",
      accepted: "bg-green-100 text-green-700 border-green-300",
      rejected: "bg-red-100 text-red-700 border-red-300",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <Clock size={16} />,
      reviewing: <Eye size={16} />,
      accepted: <CheckCircle size={16} />,
      rejected: <XCircle size={16} />,
    };
    return icons[status as keyof typeof icons] || <AlertCircle size={16} />;
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <Loader2 className="animate-spin text-amber-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-6 md:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            My Applications
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Track the status of all your job applications
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-3 md:p-4 border-l-4 border-gray-500"
          >
            <p className="text-xs md:text-sm text-gray-600 mb-1">Total</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-800">{stats.total}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-3 md:p-4 border-l-4 border-yellow-500"
          >
            <p className="text-xs md:text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-2xl md:text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-3 md:p-4 border-l-4 border-blue-500"
          >
            <p className="text-xs md:text-sm text-gray-600 mb-1">Reviewing</p>
            <p className="text-2xl md:text-3xl font-bold text-blue-600">{stats.reviewing}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-3 md:p-4 border-l-4 border-green-500"
          >
            <p className="text-xs md:text-sm text-gray-600 mb-1">Accepted</p>
            <p className="text-2xl md:text-3xl font-bold text-green-600">{stats.accepted}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-xl shadow-md p-3 md:p-4 border-l-4 border-red-500"
          >
            <p className="text-xs md:text-sm text-gray-600 mb-1">Rejected</p>
            <p className="text-2xl md:text-3xl font-bold text-red-600">{stats.rejected}</p>
          </motion.div>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-8 md:p-12 text-center"
          >
            <Briefcase size={48} className="mx-auto text-gray-300 mb-4 md:w-16 md:h-16" />
            <h3 className="text-xl md:text-2xl font-bold text-gray-700 mb-2">
              No Applications Yet
            </h3>
            <p className="text-sm md:text-base text-gray-500 mb-6">
              Start applying to jobs to see them here
            </p>
            <Link href="/jobs">
              <button className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition">
                Browse Jobs
              </button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {applications.map((application, idx) => {
              // ✅ CRITICAL: Check if job exists
              if (!application.job) {
                console.error('❌ Application missing job data:', application._id);
                return (
                  <motion.div
                    key={application._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="bg-white rounded-xl shadow-md p-4 md:p-6 border-l-4 border-red-500"
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="text-red-500" size={24} />
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          Job No Longer Available
                        </h3>
                        <p className="text-sm text-gray-600">
                          This job has been removed or deleted
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Applied on {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={application._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-4 md:p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Job Info */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                        <div>
                          <Link href={`/jobs/${application.job._id}`}>
                            <h3 className="text-lg md:text-xl font-bold text-gray-800 hover:text-amber-600 transition cursor-pointer">
                              {application.job.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2 text-gray-600 mt-1">
                            <Building2 size={16} />
                            <span className="text-sm md:text-base font-medium">
                              {application.job.company}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 self-start ${getStatusColor(
                            application.status
                          )}`}
                        >
                          {getStatusIcon(application.status)}
                          {application.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="md:w-4 md:h-4" />
                          {application.job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign size={14} className="md:w-4 md:h-4" />
                          {application.job.salary}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="md:w-4 md:h-4" />
                          Applied {new Date(application.appliedAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Cover Letter - Full Display */}
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700 font-semibold mb-2 flex items-center gap-2">
                          <FileText size={16} className="text-amber-500" />
                          Cover Letter
                        </p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                          {application.coverLetter}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto lg:min-w-[140px]">
                      <Link href={`/jobs/${application.job.slug}`} className="flex-1 lg:flex-initial">
                        <button className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition text-sm">
                          View Job
                        </button>
                      </Link>
                      <a
                        href={application.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 lg:flex-initial"
                      >
                        <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition text-sm flex items-center justify-center gap-1">
                          <FileText size={16} />
                          Resume
                        </button>
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flag,
  Search,
  Filter,
  X,
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  User,
  Briefcase,
  AlertTriangle,
  ArrowLeft,
  Tag,
  Building2,
} from "lucide-react";
import { useAdmin, adminApi } from "../context/AdminContext";
import Link from "next/link";

interface Report {
  _id: string;
  jobId: string;
  jobTitle: string;
  jobCompany: string;
  jobSlug: string;
  jobCategory: string;
  postedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    companyName?: string;  // ✅ For companies
    isCompany?: boolean;   // ✅ For companies
  } | null;
  reportedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    companyName?: string;
    isCompany?: boolean; 
  } | null;
  reason: string;
  description: string;
  reportedAt: string;
  status: string;
}

export default function AdminReportsPage() {
  const { admin } = useAdmin();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterReason, setFilterReason] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, filterStatus, filterReason]);

  const fetchReports = async () => {
    try {
      const res = await adminApi.get("/jobs/reports/all");
      console.log("✅ Reports fetched:", res.data);
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];

    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.jobCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.reportedBy?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.reportedBy?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.reportedBy?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus) {
      filtered = filtered.filter((report) => report.status === filterStatus);
    }

    if (filterReason) {
      filtered = filtered.filter((report) => report.reason === filterReason);
    }

    setFilteredReports(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("");
    setFilterReason("");
  };

  const handleUpdateStatus = async (
    jobId: string,
    reportId: string,
    newStatus: string
  ) => {
    setUpdatingStatus(reportId);
    try {
      await adminApi.patch(`/jobs/reports/${jobId}/${reportId}`, {
        status: newStatus,
      });

      setReports((prevReports) =>
        prevReports.map((report) =>
          report._id === reportId ? { ...report, status: newStatus } : report
        )
      );

      setToast(`Report marked as ${newStatus}`);
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      console.error("Error updating report status:", err);
      setToast("Failed to update status");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getReasonColor = (reason: string) => {
    const colors: Record<string, string> = {
      spam: "bg-orange-100 text-orange-700 border-orange-300",
      scam: "bg-red-100 text-red-700 border-red-300",
      inappropriate: "bg-purple-100 text-purple-700 border-purple-300",
      duplicate: "bg-blue-100 text-blue-700 border-blue-300",
      misleading: "bg-yellow-100 text-yellow-700 border-yellow-300",
      other: "bg-gray-100 text-gray-700 border-gray-300",
    };
    return colors[reason] || colors.other;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      reviewed: "bg-blue-100 text-blue-700 border-blue-300",
      resolved: "bg-green-100 text-green-700 border-green-300",
      dismissed: "bg-gray-100 text-gray-700 border-gray-300",
    };
    return colors[status] || colors.pending;
  };

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case "spam":
      case "scam":
      case "misleading":
        return <AlertTriangle size={16} className="flex-shrink-0" />;
      case "inappropriate":
        return <XCircle size={16} className="flex-shrink-0" />;
      case "duplicate":
        return <Flag size={16} className="flex-shrink-0" />;
      default:
        return <Flag size={16} className="flex-shrink-0" />;
    }
  };

  // ✅ Helper function to get user/company display name
  const getUserDisplayName = (user: Report['reportedBy'] | Report['postedBy']): string => {
    if (!user) return 'Unknown User';
    
    // ✅ Check if it's a company
    if (user.isCompany && user.companyName) {
      return user.companyName;
    }
    
    // Regular user
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.email || 'Unknown User';
  };

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    reviewed: reports.filter((r) => r.status === "reviewed").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    dismissed: reports.filter((r) => r.status === "dismissed").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-red-50 to-white">
        <Loader2 className="animate-spin text-red-600 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-6 md:py-12 px-4">
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
        <div className="mb-8">
          <Link
            href="/admin/jobs"
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold mb-4"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-white shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 rounded-full p-4">
                <Flag className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Job Reports</h1>
                <p className="text-red-100">
                  Review and manage reported job postings
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-red-100 text-sm">Total</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-red-100 text-sm">Pending</p>
                <p className="text-3xl font-bold">{stats.pending}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-red-100 text-sm">Reviewed</p>
                <p className="text-3xl font-bold">{stats.reviewed}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-red-100 text-sm">Resolved</p>
                <p className="text-3xl font-bold">{stats.resolved}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-red-100 text-sm">Dismissed</p>
                <p className="text-3xl font-bold">{stats.dismissed}</p>
              </div>
            </div>
          </motion.div>
        </div>

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
                placeholder="Search by job title, company, or reporter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
            >
              <Filter size={20} />
              <span>Filters</span>
              {(filterStatus || filterReason) && (
                <span className="ml-2 bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  {[filterStatus, filterReason].filter(Boolean).length}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason
                  </label>
                  <select
                    value={filterReason}
                    onChange={(e) => setFilterReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  >
                    <option value="">All Reasons</option>
                    <option value="spam">Spam</option>
                    <option value="scam">Scam</option>
                    <option value="inappropriate">Inappropriate</option>
                    <option value="duplicate">Duplicate</option>
                    <option value="misleading">Misleading</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 font-semibold transition"
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
          Showing <span className="font-semibold">{filteredReports.length}</span>{" "}
          report{filteredReports.length !== 1 && "s"}
          {(searchTerm || filterStatus || filterReason) && " matching your criteria"}
        </p>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-xl shadow-lg"
          >
            <Flag size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No reports found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus || filterReason
                ? "Try adjusting your filters"
                : "All job reports will appear here"}
            </p>
            {(searchTerm || filterStatus || filterReason) && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report, idx) => (
              <motion.div
                key={report._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link
                      href={`/jobs/${report.jobSlug}`}
                      target="_blank"
                      className="text-xl font-bold text-gray-800 hover:text-red-600 transition mb-2 block"
                    >
                      {report.jobTitle}
                    </Link>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Briefcase size={16} />
                      <span className="text-sm font-medium">{report.jobCompany}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Tag size={16} />
                      <span className="text-sm">{report.jobCategory}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        report.status
                      )}`}
                    >
                      {report.status.toUpperCase()}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getReasonColor(
                        report.reason
                      )}`}
                    >
                      {getReasonIcon(report.reason)}
                      {report.reason.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {report.description && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Report Details: </span>
                      {report.description}
                    </p>
                  </div>
                )}

                {/* Info Grid - ✅ WITH COMPANY SUPPORT */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 py-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600">
                    {report.reportedBy?.isCompany ? (
                      <Building2 size={16} className="text-blue-600" />
                    ) : (
                      <User size={16} className="text-gray-400" />
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Reported By</p>
                      <p className="text-sm font-semibold flex items-center gap-1">
                        {getUserDisplayName(report.reportedBy)}
                        {report.reportedBy?.isCompany && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            Company
                          </span>
                        )}
                      </p>
                      {report.reportedBy && report.reportedBy.email && (
                        <p className="text-xs text-gray-400">{report.reportedBy.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    {report.postedBy?.isCompany ? (
                      <Building2 size={16} className="text-blue-600" />
                    ) : (
                      <User size={16} className="text-gray-400" />
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Job Posted By</p>
                      <p className="text-sm font-semibold flex items-center gap-1">
                        {getUserDisplayName(report.postedBy)}
                        {report.postedBy?.isCompany && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            Company
                          </span>
                        )}
                      </p>
                      {report.postedBy && report.postedBy.email && (
                        <p className="text-xs text-gray-400">{report.postedBy.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Reported Date</p>
                      <p className="text-sm font-semibold">
                        {new Date(report.reportedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  <Link href={`/jobs/${report.jobSlug}`} target="_blank">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-sm">
                      <Eye size={16} />
                      View Job
                    </button>
                  </Link>

                  {report.status !== "reviewed" && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(report.jobId, report._id, "reviewed")
                      }
                      disabled={updatingStatus === report._id}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition text-sm"
                    >
                      {updatingStatus === report._id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                      Mark as Reviewed
                    </button>
                  )}

                  {report.status !== "resolved" && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(report.jobId, report._id, "resolved")
                      }
                      disabled={updatingStatus === report._id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition text-sm"
                    >
                      {updatingStatus === report._id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <CheckCircle size={16} />
                      )}
                      Mark as Resolved
                    </button>
                  )}

                  {report.status !== "dismissed" && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(report.jobId, report._id, "dismissed")
                      }
                      disabled={updatingStatus === report._id}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition text-sm"
                    >
                      {updatingStatus === report._id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <XCircle size={16} />
                      )}
                      Dismiss
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
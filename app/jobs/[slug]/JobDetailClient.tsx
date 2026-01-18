"use client";

import { use, useEffect, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  ArrowLeft,
  CheckCircle,
  Loader2,
  AlertCircle,
  User,
  Calendar,
  Star,
  Share2,
  Flag,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, api } from "../../context/AuthContext";
import UserProfileCard from "../../../components/UserProfileCard";
import CompanyProfileCard from "../../../components/CompanyPostCard";
import JobReviews from "../../../components/JobReviews";
import ReportJobModal from "../../../components/Reportjobmodal";

interface Job {
  _id: string;
  slug: string;
  title: string;
  description: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  status: string;
  category: string; 
  companyId?: string;
  experienceLevel: string;
  requirements: string[];
  responsibilities: string[];
  createdAt: string;
  companyLogo: string;
  // ✅ Add these fields for company-posted jobs
  postedByCompany?: string | { _id: string; companyName: string; logo?: string; slug?: string };
  postedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function JobDetailClient({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    coverLetter: "",
    resumeUrl: "",
  });
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [error, setError] = useState("");
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(false);
  const [toast, setToast] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [slug]);

  useEffect(() => {
    if (user && job?._id) {
      checkIfApplied();
    }
  }, [user, job?._id]);

  const fetchJob = async () => {
    try {
      const res = await api.get(
        `${process.env.NEXT_PUBLIC_API_URL}/jobs/slug/${slug}`
      );
      console.log('✅ Job fetched:', res.data);
      setJob(res.data);
    } catch (err) {
      console.error("Error fetching job:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkIfApplied = async () => {
    if (!user || !job?._id) return;
    
    setCheckingApplication(true);
    try {
      const res = await api.get(`/applications/check/${job._id}`);
      console.log('✅ Application check result:', res.data);
      setHasApplied(res.data.applied);
    } catch (err) {
      console.error('Error checking application:', err);
    } finally {
      setCheckingApplication(false);
    }
  };

  const handleApplyClick = () => {
    if (!user) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
      }
      router.push("/login");
      return;
    }

    if (hasApplied) {
      return;
    }

    document.getElementById("application-form")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
      }
      router.push("/login");
      return;
    }

    setApplying(true);
    setError("");

    try {
      await api.post('/applications', {
        jobId: job?._id,
        ...applicationForm,
      });

      setApplicationSuccess(true);
      setHasApplied(true);
      setApplicationForm({ coverLetter: "", resumeUrl: "" });

      setTimeout(() => {
        document.getElementById("success-message")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    } catch (err: any) {
      console.error("Error submitting application:", err);
      setError(
        err.response?.data?.message ||
          "Failed to submit application. Please try again."
      );
    } finally {
      setApplying(false);
    }
  };

  const handleShareJob = () => {
    if (typeof window !== 'undefined' && job?.slug) {
      const jobUrl = `${window.location.origin}/jobs/${job.slug}`;
      
      navigator.clipboard.writeText(jobUrl)
        .then(() => {
          setToast("Link copied to clipboard!");
          setTimeout(() => setToast(""), 3000);
        })
        .catch(() => {
          setToast("Failed to copy link");
          setTimeout(() => setToast(""), 3000);
        });
    }
  };

  const handleReportJob = () => {
    if (!user) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
      }
      router.push("/login");
      return;
    }
    setShowReportModal(true);
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

  // ✅ Helper function to get company ID from various possible field structures
  const getCompanyId = (): string | null => {
    if (!job) return null;
    
    // Check postedByCompany first (this is what company.service.ts sets)
    if (job.postedByCompany) {
      if (typeof job.postedByCompany === 'string') {
        return job.postedByCompany;
      }
      if (typeof job.postedByCompany === 'object' && job.postedByCompany._id) {
        return job.postedByCompany._id;
      }
    }
    
    // Fallback to companyId if it exists
    if (job.companyId) {
      return job.companyId;
    }
    
    return null;
  };

  // ✅ Helper to check if job was posted by a company
  const isCompanyPosted = (): boolean => {
    return !job?.postedBy && !!getCompanyId();
  };

  // ✅ Get company info if postedByCompany is populated
  const getCompanyInfo = () => {
    if (!job?.postedByCompany) return null;
    
    if (typeof job.postedByCompany === 'object') {
      return {
        _id: job.postedByCompany._id,
        name: job.postedByCompany.companyName,
        logo: job.postedByCompany.logo,
        slug: job.postedByCompany.slug,
      };
    }
    
    return null;
  };

  if (loading || authLoading || checkingApplication) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-yellow-50 to-white">
        <Loader2 className="animate-spin text-yellow-700 w-8 h-8" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-yellow-50 to-white px-4">
        <AlertCircle className="text-red-500 w-12 h-12 sm:w-16 sm:h-16 mb-4" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 text-center">Job Not Found</h2>
        <Link
          href="/jobs"
          className="text-amber-600 hover:text-amber-700 font-semibold text-sm sm:text-base"
        >
          ← Back to Jobs
        </Link>
      </div>
    );
  }

  const companyId = getCompanyId();
  const companyInfo = getCompanyInfo();

  return (
    <main className="bg-[#fffaf6] min-h-screen text-gray-800">
      {/* Report Job Modal */}
      <ReportJobModal
        jobId={job._id}
        jobTitle={job.title}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSuccess={() => {
          setToast("Report submitted successfully!");
          setTimeout(() => setToast(""), 3000);
        }}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: 100 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -50, x: 100 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 right-4 bg-green-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-2xl flex items-center gap-2 sm:gap-3 z-50 max-w-[calc(100%-2rem)] sm:max-w-sm"
          >
            <CheckCircle size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="font-semibold text-sm sm:text-base">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header - Responsive */}
      <section className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-8 sm:py-10 md:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-5">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-amber-100 hover:text-white mb-4 sm:mb-6 transition text-sm sm:text-base"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            Back to Jobs
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <span
                className={`px-2.5 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold border ${getJobTypeColor(
                  job.type
                )}`}
              >
                {job.type.replace("_", " ").toUpperCase()}
              </span>
              <span className="px-2.5 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold bg-purple-100 text-purple-700 border border-purple-300">
                {job.category}
              </span>
              <span className="text-amber-100 text-xs sm:text-sm">
                Posted {new Date(job.createdAt).toLocaleDateString()}
              </span>
              {hasApplied && (
                <span className="px-2.5 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold bg-green-100 text-green-700 border border-green-300 flex items-center gap-1">
                  <CheckCircle size={14} className="sm:w-4 sm:h-4" />
                  Applied
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 break-words">
              {job.title}
            </h1>

            <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 text-amber-100 text-sm sm:text-base">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <Building2 size={16} className="sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="font-semibold truncate">{job.company}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <MapPin size={16} className="sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">{job.location}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <DollarSign size={16} className="sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">{job.salary}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <Briefcase size={16} className="sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">{job.experienceLevel}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-5 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-md p-4 sm:p-6 md:p-8"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                <Star className="text-amber-500" size={20} />
                Job Description
              </h2>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line break-words">
                {job.description}
              </p>
            </motion.div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-md p-4 sm:p-6 md:p-8"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
                  Requirements
                </h2>
                <ul className="space-y-2 sm:space-y-3">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2 sm:gap-3">
                      <CheckCircle className="text-green-500 mt-0.5 sm:mt-1 flex-shrink-0" size={18} />
                      <span className="text-sm sm:text-base text-gray-600 break-words">{req}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-md p-4 sm:p-6 md:p-8"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
                  Responsibilities
                </h2>
                <ul className="space-y-2 sm:space-y-3">
                  {job.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-2 sm:gap-3">
                      <CheckCircle className="text-blue-500 mt-0.5 sm:mt-1 flex-shrink-0" size={18} />
                      <span className="text-sm sm:text-base text-gray-600 break-words">{resp}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Reviews Section */}
            <JobReviews jobId={job._id} />

            {/* Application Form */}
            {user && !hasApplied && !applicationSuccess && (
              <motion.div
                id="application-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-md p-4 sm:p-6 md:p-8"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                  Apply for this Position
                </h2>

                {error && (
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 sm:gap-3">
                    <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                    <p className="text-sm sm:text-base text-red-700 break-words">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmitApplication} className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cover Letter *
                    </label>
                    <textarea
                      value={applicationForm.coverLetter}
                      onChange={(e) =>
                        setApplicationForm({
                          ...applicationForm,
                          coverLetter: e.target.value,
                        })
                      }
                      required
                      rows={6}
                      placeholder="Tell us why you're a great fit for this role..."
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Resume URL *
                    </label>
                    <input
                      type="url"
                      value={applicationForm.resumeUrl}
                      onChange={(e) =>
                        setApplicationForm({
                          ...applicationForm,
                          resumeUrl: e.target.value,
                        })
                      }
                      required
                      placeholder="https://example.com/your-resume.pdf"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm sm:text-base"
                    />
                    <p className="mt-2 text-xs sm:text-sm text-gray-500">
                      Provide a link to your resume (Google Drive, Dropbox, etc.)
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={applying}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-4 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {applying ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Submitting Application...
                      </>
                    ) : (
                      <>Submit Application</>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Already Applied Message */}
            {user && hasApplied && !applicationSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 sm:p-8 text-center"
              >
                <div className="bg-blue-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <CheckCircle className="text-blue-600" size={24} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  Already Applied
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  You have already submitted an application for this position. The employer will review your application and contact you if selected.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link href="/applications" className="w-full sm:w-auto">
                    <button className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition text-sm sm:text-base">
                      View My Applications
                    </button>
                  </Link>
                  <Link href="/jobs" className="w-full sm:w-auto">
                    <button className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition text-sm sm:text-base">
                      Browse More Jobs
                    </button>
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Success Message */}
            {applicationSuccess && (
              <motion.div
                id="success-message"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border-2 border-green-200 rounded-xl p-6 sm:p-8 text-center"
              >
                <div className="bg-green-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  Application Submitted!
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  Your application has been successfully submitted. The employer
                  will review it and get back to you soon.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link href="/applications" className="w-full sm:w-auto">
                    <button className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition text-sm sm:text-base">
                      View My Applications
                    </button>
                  </Link>
                  <Link href="/jobs" className="w-full sm:w-auto">
                    <button className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition text-sm sm:text-base">
                      Browse More Jobs
                    </button>
                  </Link>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Responsive */}
          <div className="space-y-4 sm:space-y-6">
            {/* Quick Apply Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:sticky lg:top-6"
            >
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">
                Quick Actions
              </h3>

              {!user ? (
                <button
                  onClick={handleApplyClick}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 sm:py-3 rounded-lg shadow-lg transition-all mb-3 sm:mb-4 text-sm sm:text-base"
                >
                  Login to Apply
                </button>
              ) : hasApplied ? (
                <button
                  disabled
                  className="w-full bg-gray-400 text-white font-semibold py-2.5 sm:py-3 rounded-lg cursor-not-allowed mb-3 sm:mb-4 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <CheckCircle size={18} />
                  Already Applied
                </button>
              ) : (
                <button
                  onClick={handleApplyClick}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 sm:py-3 rounded-lg shadow-lg transition-all mb-3 sm:mb-4 text-sm sm:text-base"
                >
                  Apply Now
                </button>
              )}

              <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-gray-200">
                {/* Category Display */}
                <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
                  <Tag size={18} className="text-purple-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Category</p>
                    <p className="font-semibold text-xs sm:text-sm truncate">
                      {job.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
                  <Calendar size={18} className="text-amber-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Posted</p>
                    <p className="font-semibold text-xs sm:text-sm truncate">
                      {new Date(job.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* ✅ FIXED: Posted By section - handles both user and company posts */}
                <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
                  <User size={18} className="text-amber-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Posted By</p>
                    
                    {/* If posted by a user */}
                    {job.postedBy ? (
                      <UserProfileCard
                        userId={job.postedBy._id}
                        userName={`${job.postedBy.firstName} ${job.postedBy.lastName}`}
                      >
                        <p className="font-semibold text-xs sm:text-sm cursor-pointer hover:text-amber-600 transition truncate">
                          {job.postedBy.firstName} {job.postedBy.lastName}
                        </p>
                      </UserProfileCard>
                    ) : companyId ? (
                      /* If posted by a company - use the correct ID */
                      <CompanyProfileCard companyId={companyId}>
                        <div className="flex items-center gap-2 cursor-pointer group">
                          {(companyInfo?.logo || job.companyLogo) && (
                            <img 
                              src={companyInfo?.logo || job.companyLogo} 
                              alt={job.company} 
                              className="w-5 h-5 rounded-full border border-amber-200 object-cover" 
                            />
                          )}
                          <p className="font-semibold text-xs sm:text-sm truncate group-hover:text-amber-600 transition">
                            {companyInfo?.name || job.company}
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1 rounded ml-1 font-normal italic">
                              Verified
                            </span>
                          </p>
                        </div>
                      </CompanyProfileCard>
                    ) : (
                      /* Fallback: Just show company name without link */
                      <div className="flex items-center gap-2">
                        {job.companyLogo && (
                          <img 
                            src={job.companyLogo} 
                            alt={job.company} 
                            className="w-5 h-5 rounded-full border border-amber-200 object-cover" 
                          />
                        )}
                        <p className="font-semibold text-xs sm:text-sm truncate">
                          {job.company}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
                  <Clock size={18} className="text-amber-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-semibold text-xs sm:text-sm capitalize truncate">
                      {job.status}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Share Job */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-amber-50 rounded-xl p-4 sm:p-6 border border-amber-200"
            >
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3">
                Share this Job
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                Know someone who might be interested?
              </p>
              <button
                onClick={handleShareJob}
                className="w-full bg-white hover:bg-gray-50 text-amber-600 border border-amber-300 font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm sm:text-base mb-2"
              >
                <Share2 size={16} className="sm:w-4 sm:h-4" />
                Copy Link
              </button>

              {/* Report Job Button */}
              <button
                onClick={handleReportJob}
                className="w-full bg-white hover:bg-red-50 text-red-600 border border-red-300 font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Flag size={16} className="sm:w-4 sm:h-4" />
                Report Job
              </button>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Building2,
  FileText,
  Loader2,
  ArrowLeft,
  Save,
  X,
  Plus,
  Tag,
} from "lucide-react";
import { useAuth, api } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface JobFormData {
  title: string;
  description: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  status: string;
  experienceLevel: string;
  category: string; // ✅ NEW: Category field
  requirements: string[];
  responsibilities: string[];
}

export default function EditJobPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [jobId, setJobId] = useState("");

  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    company: "",
    location: "",
    salary: "",
    type: "full_time",
    status: "active",
    experienceLevel: "",
    category: "Technology", // ✅ NEW: Default category
    requirements: [],
    responsibilities: [],
  });

  const [newRequirement, setNewRequirement] = useState("");
  const [newResponsibility, setNewResponsibility] = useState("");

  // ✅ NEW: Categories array
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
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }

    if (isAuthenticated) {
      fetchJob();
    }
  }, [isAuthenticated, authLoading, slug]);

  const fetchJob = async () => {
    try {
      const res = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/jobs/slug/${slug}`);
      const job = res.data;

      setJobId(job._id);

      setFormData({
        title: job.title || "",
        description: job.description || "",
        company: job.company || "",
        location: job.location || "",
        salary: job.salary || "",
        type: job.type || "full_time",
        status: job.status || "active",
        experienceLevel: job.experienceLevel || "",
        category: job.category || "Technology", // ✅ NEW: Load category
        requirements: job.requirements || [],
        responsibilities: job.responsibilities || [],
      });
    } catch (err: any) {
      console.error("Error fetching job:", err);
      setError(err.response?.data?.message || "Failed to load job");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, newRequirement.trim()],
      });
      setNewRequirement("");
    }
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index),
    });
  };

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      setFormData({
        ...formData,
        responsibilities: [...formData.responsibilities, newResponsibility.trim()],
      });
      setNewResponsibility("");
    }
  };

  const removeResponsibility = (index: number) => {
    setFormData({
      ...formData,
      responsibilities: formData.responsibilities.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api.patch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${jobId}`, formData);
      setSuccess(true);
      setTimeout(() => {
        router.push("/jobs/my-jobs");
      }, 1500);
    } catch (err: any) {
      console.error("Error updating job:", err);
      setError(err.response?.data?.message || "Failed to update job");
    } finally {
      setSubmitting(false);
    }
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
      <div className="max-w-4xl mx-auto">
        {/* Header - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <Link
            href="../my-jobs"
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-semibold mb-4 text-sm sm:text-base"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            Back to My Jobs
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Edit Job Posting
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Update your job details and requirements
          </p>
        </motion.div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
          >
            <Save className="text-green-600" size={20} />
            <p className="text-green-700 font-semibold">
              Job updated successfully! Redirecting...
            </p>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
          >
            <X className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700">{error}</p>
          </motion.div>
        )}

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6"
        >
          {/* Basic Information */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Briefcase className="text-amber-500" size={20} />
              Basic Information
            </h2>

            {/* Job Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Senior Frontend Developer"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm sm:text-base"
              />
            </div>

            {/* Company & Location - 2 columns on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company *
                </label>
                <div className="relative">
                  <Building2
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    placeholder="Company name"
                    className="w-full pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location *
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Remote, New York"
                    className="w-full pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* ✅ NEW: Category Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Category *
              </label>
              <div className="relative">
                <Tag
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm sm:text-base appearance-none bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Job Type, Experience & Salary - 3 columns on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm sm:text-base"
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Experience Level *
                </label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm sm:text-base"
                >
                  <option value="Entry-level">Entry Level</option>
                  <option value="Mid-level">Mid Level</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Salary Range *
                </label>
                <div className="relative">
                  <DollarSign
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g., $80k - $120k"
                    className="w-full pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm sm:text-base"
              >
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="text-amber-500" size={20} />
              Requirements
            </h2>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="Add a requirement..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={addRequirement}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Plus size={18} />
                Add
              </button>
            </div>

            {formData.requirements.length > 0 && (
              <ul className="space-y-2">
                {formData.requirements.map((req, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition"
                  >
                    <span className="flex-1 text-sm sm:text-base text-gray-700 break-words">
                      {req}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeRequirement(idx)}
                      className="text-red-500 hover:text-red-700 transition opacity-70 group-hover:opacity-100 flex-shrink-0"
                    >
                      <X size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Responsibilities */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="text-amber-500" size={20} />
              Responsibilities
            </h2>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newResponsibility}
                onChange={(e) => setNewResponsibility(e.target.value)}
                placeholder="Add a responsibility..."
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addResponsibility())
                }
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={addResponsibility}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Plus size={18} />
                Add
              </button>
            </div>

            {formData.responsibilities.length > 0 && (
              <ul className="space-y-2">
                {formData.responsibilities.map((resp, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition"
                  >
                    <span className="flex-1 text-sm sm:text-base text-gray-700 break-words">
                      {resp}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeResponsibility(idx)}
                      className="text-red-500 hover:text-red-700 transition opacity-70 group-hover:opacity-100 flex-shrink-0"
                    >
                      <X size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 sm:flex-initial px-6 sm:px-8 py-3 sm:py-3.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white font-bold rounded-lg shadow-lg transition flex items-center justify-center gap-2 text-sm sm:text-base disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Update Job
                </>
              )}
            </button>
            <Link href="../my-jobs" className="flex-1 sm:flex-initial">
              <button
                type="button"
                className="w-full px-6 sm:px-8 py-3 sm:py-3.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition text-sm sm:text-base"
              >
                Cancel
              </button>
            </Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
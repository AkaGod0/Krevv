"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth, api, getToken } from "@/app/context/AuthContext";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Plus,
  X,
  Tag,
  Globe,
  Mail,
  Calendar,
  Save,
} from "lucide-react";

const jobTypes = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Internship" },
];

const experienceLevels = [
  { value: "Entry-level", label: "Entry Level" },
  { value: "Mid-level", label: "Mid Level" },
  { value: "Senior", label: "Senior" },
  { value: "Lead", label: "Lead" },
  { value: "Executive", label: "Executive" },
];

const categories = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Marketing",
  "Sales",
  "Design",
  "Engineering",
  "Customer Service",
  "Human Resources",
  "Operations",
  "Legal",
  "Other",
];

export default function CompanyEditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;
  
  const { user, loading: authLoading, logout } = useAuth();
  
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [jobNotFound, setJobNotFound] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    type: "full_time",
    category: "",
    salary: "",
    salaryMin: "",
    salaryMax: "",
    experienceLevel: "",
    applicationEmail: "",
    applicationUrl: "",
    deadline: "",
    requirements: [""],
    responsibilities: [""],
    tags: [""],
  });

  // Fetch existing job data
  useEffect(() => {
    if (authLoading) return;

    const token = getToken();
    if (!token) {
      router.push("/company/login");
      return;
    }

    if (!user?.companyName) {
      router.push("/company/login");
      return;
    }

    if (jobId) {
      fetchJobData();
    }
  }, [authLoading, user, jobId]);

  const fetchJobData = async () => {
    try {
      const response = await api.get(`/company/jobs/${jobId}`);
      const job = response.data.data;

      if (!job) {
        setJobNotFound(true);
        return;
      }

      // Format deadline for date input (YYYY-MM-DD)
      let formattedDeadline = "";
      if (job.deadline) {
        const deadlineDate = new Date(job.deadline);
        formattedDeadline = deadlineDate.toISOString().split("T")[0];
      }

      setFormData({
        title: job.title || "",
        description: job.description || "",
        location: job.location || "",
        type: job.type || "full_time",
        category: job.category || "",
        salary: job.salary || "",
        salaryMin: job.salaryMin?.toString() || "",
        salaryMax: job.salaryMax?.toString() || "",
        experienceLevel: job.experienceLevel || "",
        applicationEmail: job.applicationEmail || "",
        applicationUrl: job.applicationUrl || "",
        deadline: formattedDeadline,
        requirements: job.requirements?.length ? job.requirements : [""],
        responsibilities: job.responsibilities?.length ? job.responsibilities : [""],
        tags: job.tags?.length ? job.tags : [""],
      });
    } catch (err: any) {
      console.error("Error fetching job:", err);
      if (err.response?.status === 404) {
        setJobNotFound(true);
      } else if (err.response?.status === 401) {
        logout();
      } else {
        setError("Failed to load job data");
      }
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleArrayChange = (field: "requirements" | "responsibilities" | "tags", index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field: "requirements" | "responsibilities" | "tags") => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  const removeArrayItem = (field: "requirements" | "responsibilities" | "tags", index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray.length ? newArray : [""] });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Job title is required");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Job description is required");
      return false;
    }
    if (!formData.location.trim()) {
      setError("Location is required");
      return false;
    }
    if (!formData.category) {
      setError("Category is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setError("");

    try {
      // Build cleaned data - only include fields that have values
      const cleanedData: any = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        type: formData.type,
        category: formData.category,
        requirements: formData.requirements.filter((r) => r.trim()),
        responsibilities: formData.responsibilities.filter((r) => r.trim()),
        tags: formData.tags.filter((t) => t.trim()),
      };

      // Only add optional fields if they have values
      if (formData.salary?.trim()) cleanedData.salary = formData.salary;
      if (formData.salaryMin) cleanedData.salaryMin = Number(formData.salaryMin);
      if (formData.salaryMax) cleanedData.salaryMax = Number(formData.salaryMax);
      if (formData.experienceLevel) cleanedData.experienceLevel = formData.experienceLevel;
      if (formData.applicationEmail?.trim()) cleanedData.applicationEmail = formData.applicationEmail;
      if (formData.applicationUrl?.trim()) cleanedData.applicationUrl = formData.applicationUrl;
      if (formData.deadline) cleanedData.deadline = new Date(formData.deadline);

      const response = await api.put(`/company/jobs/${jobId}`, cleanedData);

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/company/jobs");
        }, 2000);
      }
    } catch (err: any) {
      console.error("Error updating job:", err);
      setError(err.response?.data?.message || "Failed to update job posting");
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-amber-500 mx-auto mb-4" size={40} />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  // Job not found
  if (jobNotFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-red-500" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-6">
            The job you're trying to edit doesn't exist or you don't have permission to edit it.
          </p>
          <Link
            href="/company/jobs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition"
          >
            <ArrowLeft size={20} />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-500" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Job Updated Successfully!</h2>
          <p className="text-gray-600 mb-4">Your changes have been saved.</p>
          <p className="text-sm text-gray-500">Redirecting to your jobs...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/company/jobs"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Jobs
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Edit Job</h1>
          <p className="text-gray-600 mt-1">Update the details of your job posting</p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2"
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase className="text-amber-500" size={20} />
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Senior Frontend Developer"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., Remote, New York, NY"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  >
                    {jobTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level
                  </label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Level</option>
                    {experienceLevels.map((level) => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Compensation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="text-green-500" size={20} />
              Compensation
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary Range (Display Text)
                </label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g., $80,000 - $120,000 per year"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Salary (Number)
                  </label>
                  <input
                    type="number"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleChange}
                    placeholder="80000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Salary (Number)
                  </label>
                  <input
                    type="number"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleChange}
                    placeholder="120000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="text-blue-500" size={20} />
              Requirements
            </h2>

            <div className="space-y-3">
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => handleArrayChange("requirements", index, e.target.value)}
                    placeholder={`Requirement ${index + 1}`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem("requirements", index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem("requirements")}
                className="flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
              >
                <Plus size={20} />
                Add Requirement
              </button>
            </div>
          </motion.div>

          {/* Responsibilities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="text-purple-500" size={20} />
              Responsibilities
            </h2>

            <div className="space-y-3">
              {formData.responsibilities.map((resp, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={resp}
                    onChange={(e) => handleArrayChange("responsibilities", index, e.target.value)}
                    placeholder={`Responsibility ${index + 1}`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem("responsibilities", index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem("responsibilities")}
                className="flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
              >
                <Plus size={20} />
                Add Responsibility
              </button>
            </div>
          </motion.div>

          {/* Application Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Mail className="text-amber-500" size={20} />
              Application Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Email
                </label>
                <input
                  type="email"
                  name="applicationEmail"
                  value={formData.applicationEmail}
                  onChange={handleChange}
                  placeholder="hr@company.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application URL (External)
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="url"
                    name="applicationUrl"
                    value={formData.applicationUrl}
                    onChange={handleChange}
                    placeholder="https://company.com/careers/apply"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Deadline
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Tag className="text-pink-500" size={20} />
              Tags (Optional)
            </h2>

            <div className="space-y-3">
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => handleArrayChange("tags", index, e.target.value)}
                    placeholder={`Tag ${index + 1} (e.g., React, Remote, Startup)`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem("tags", index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem("tags")}
                className="flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
              >
                <Plus size={20} />
                Add Tag
              </button>
            </div>
          </motion.div>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <Link
              href="/company/jobs"
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
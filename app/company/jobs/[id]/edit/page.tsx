"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  Archive,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

enum JobStatus {
  ACTIVE = "active",
  CLOSED = "closed",
  DRAFT = "draft",
}

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

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  JobStatus,
  {
    label: string;
    description: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
    icon: React.ReactNode;
  }
> = {
  [JobStatus.ACTIVE]: {
    label: "Active",
    description: "Visible to job seekers. Accepting applications.",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-500",
    icon: <Eye size={16} />,
  },
  [JobStatus.DRAFT]: {
    label: "Draft",
    description: "Hidden from job seekers. Not published yet.",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    dot: "bg-yellow-400",
    icon: <EyeOff size={16} />,
  },
  [JobStatus.CLOSED]: {
    label: "Closed",
    description: "No longer accepting applications. Hidden from listings.",
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-300",
    dot: "bg-gray-400",
    icon: <Archive size={16} />,
  },
};

// ─── Status Toggle Component ──────────────────────────────────────────────────

function StatusToggle({
  currentStatus,
  onChange,
  saving,
}: {
  currentStatus: JobStatus;
  onChange: (status: JobStatus) => void;
  saving: boolean;
}) {
  const statuses = [JobStatus.ACTIVE, JobStatus.DRAFT, JobStatus.CLOSED];
  const config = STATUS_CONFIG[currentStatus];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-dashed border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
        <ToggleRight className="text-amber-500" size={20} />
        Job Status
      </h2>
      <p className="text-sm text-gray-500 mb-5">
        Control the visibility and availability of this job posting.
      </p>

      {/* Current status banner */}
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 mb-5 ${config.bg} ${config.border}`}
      >
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${config.dot}`} />
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm ${config.text}`}>
            Currently: {config.label}
          </p>
          <p className={`text-xs mt-0.5 ${config.text} opacity-80`}>
            {config.description}
          </p>
        </div>
        <span className={config.text}>{config.icon}</span>
      </div>

      {/* Toggle buttons */}
      <div className="grid grid-cols-3 gap-2">
        {statuses.map((status) => {
          const cfg = STATUS_CONFIG[status];
          const isActive = currentStatus === status;
          return (
            <button
              key={status}
              type="button"
              disabled={saving || isActive}
              onClick={() => onChange(status)}
              className={`
                relative flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 font-semibold text-xs
                transition-all duration-150
                ${
                  isActive
                    ? `${cfg.bg} ${cfg.border} ${cfg.text} cursor-default shadow-inner`
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:shadow-sm"
                }
                disabled:cursor-not-allowed
              `}
            >
              {/* Active indicator dot */}
              {isActive && (
                <span
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${cfg.dot}`}
                />
              )}
              <span className={isActive ? cfg.text : "text-gray-400"}>
                {cfg.icon}
              </span>
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Helper note */}
      <p className="text-xs text-gray-400 mt-3 text-center">
        Click a status to switch — changes are saved when you click{" "}
        <strong>Save Changes</strong>.
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

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
    status: JobStatus.ACTIVE,
  });

  // ─── Fetch job ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (authLoading) return;
    const token = getToken();
    if (!token) { router.push("/company/login"); return; }
    if (!user?.companyName) { router.push("/company/login"); return; }
    if (jobId) fetchJobData();
  }, [authLoading, user, jobId]);

  const fetchJobData = async () => {
    try {
      const response = await api.get(`/company/jobs/${jobId}`);
      const job = response.data.data;

      if (!job) { setJobNotFound(true); return; }

      let formattedDeadline = "";
      if (job.deadline) {
        formattedDeadline = new Date(job.deadline).toISOString().split("T")[0];
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
        status: (job.status as JobStatus) || JobStatus.ACTIVE,
      });
    } catch (err: any) {
      console.error("Error fetching job:", err);
      if (err.response?.status === 404) setJobNotFound(true);
      else if (err.response?.status === 401) logout();
      else setError("Failed to load job data");
    } finally {
      setPageLoading(false);
    }
  };

  // ─── Form handlers ──────────────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleArrayChange = (
    field: "requirements" | "responsibilities",
    index: number,
    value: string
  ) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field: "requirements" | "responsibilities") => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  const removeArrayItem = (
    field: "requirements" | "responsibilities",
    index: number
  ) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray.length ? newArray : [""] });
  };

  const handleStatusChange = (status: JobStatus) => {
    setFormData((prev) => ({ ...prev, status }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) { setError("Job title is required"); return false; }
    if (!formData.description.trim()) { setError("Job description is required"); return false; }
    if (!formData.location.trim()) { setError("Location is required"); return false; }
    if (!formData.category) { setError("Category is required"); return false; }
    return true;
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setError("");

    try {
      const cleanedData: any = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        type: formData.type,
        category: formData.category,
        requirements: formData.requirements.filter((r) => r.trim()),
        responsibilities: formData.responsibilities.filter((r) => r.trim()),
        status: formData.status, // ✅ Include status in update
      };

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
        setTimeout(() => router.push("/company/jobs"), 2000);
      }
    } catch (err: any) {
      console.error("Error updating job:", err);
      setError(err.response?.data?.message || "Failed to update job posting");
    } finally {
      setSaving(false);
    }
  };

  // ─── States: loading / not found / success ───────────────────────────────────

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
          <Link href="/company/jobs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition">
            <ArrowLeft size={20} /> Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-500" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Job Updated Successfully!</h2>
          <p className="text-gray-600 mb-2">Your changes have been saved.</p>
          {/* Show what status it was saved as */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mt-2 mb-4 ${STATUS_CONFIG[formData.status].bg} ${STATUS_CONFIG[formData.status].text}`}>
            {STATUS_CONFIG[formData.status].icon}
            Status: {STATUS_CONFIG[formData.status].label}
          </div>
          <p className="text-sm text-gray-500">Redirecting to your jobs...</p>
        </motion.div>
      </div>
    );
  }

  // ─── Main render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <Link href="/company/jobs"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4">
            <ArrowLeft size={20} /> Back to Jobs
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Edit Job</h1>
              <p className="text-gray-600 mt-1">Update the details of your job posting</p>
            </div>
            {/* Header status badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-bold ${STATUS_CONFIG[formData.status].bg} ${STATUS_CONFIG[formData.status].text} ${STATUS_CONFIG[formData.status].border}`}>
              <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[formData.status].dot}`} />
              {STATUS_CONFIG[formData.status].label}
            </div>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle size={20} /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── STATUS TOGGLE ── placed prominently at the top */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <StatusToggle
              currentStatus={formData.status}
              onChange={handleStatusChange}
              saving={saving}
            />
          </motion.div>

          {/* ── Basic Information ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase className="text-amber-500" size={20} /> Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange}
                  placeholder="e.g., Senior Frontend Developer"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
                <textarea name="description" value={formData.description} onChange={handleChange}
                  rows={6} placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none text-gray-900" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" name="location" value={formData.location} onChange={handleChange}
                      placeholder="e.g., Remote, New York, NY"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900">
                    <option value="">Select Category</option>
                    {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                  <select name="type" value={formData.type} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900">
                    {jobTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                  <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900">
                    <option value="">Select Level</option>
                    {experienceLevels.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Compensation ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="text-green-500" size={20} /> Compensation
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range (Display Text)</label>
                <input type="text" name="salary" value={formData.salary} onChange={handleChange}
                  placeholder="e.g., $80,000 - $120,000 per year"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Salary (Number)</label>
                  <input type="number" name="salaryMin" value={formData.salaryMin} onChange={handleChange}
                    placeholder="80000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Salary (Number)</label>
                  <input type="number" name="salaryMax" value={formData.salaryMax} onChange={handleChange}
                    placeholder="120000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Requirements ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="text-blue-500" size={20} /> Requirements
            </h2>
            <div className="space-y-3">
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex gap-2">
                  <input type="text" value={req}
                    onChange={(e) => handleArrayChange("requirements", index, e.target.value)}
                    placeholder={`Requirement ${index + 1}`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900" />
                  <button type="button" onClick={() => removeArrayItem("requirements", index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                    <X size={20} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem("requirements")}
                className="flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium transition">
                <Plus size={20} /> Add Requirement
              </button>
            </div>
          </motion.div>

          {/* ── Responsibilities ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="text-purple-500" size={20} /> Responsibilities
            </h2>
            <div className="space-y-3">
              {formData.responsibilities.map((resp, index) => (
                <div key={index} className="flex gap-2">
                  <input type="text" value={resp}
                    onChange={(e) => handleArrayChange("responsibilities", index, e.target.value)}
                    placeholder={`Responsibility ${index + 1}`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900" />
                  <button type="button" onClick={() => removeArrayItem("responsibilities", index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                    <X size={20} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem("responsibilities")}
                className="flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium transition">
                <Plus size={20} /> Add Responsibility
              </button>
            </div>
          </motion.div>

          {/* ── Application Settings ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Mail className="text-amber-500" size={20} /> Application Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Application Email</label>
                <input type="email" name="applicationEmail" value={formData.applicationEmail} onChange={handleChange}
                  placeholder="hr@company.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Application URL (External)</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="url" name="applicationUrl" value={formData.applicationUrl} onChange={handleChange}
                    placeholder="https://company.com/careers/apply"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="date" name="deadline" value={formData.deadline} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Submit ── */}
          <div className="flex items-center justify-between gap-4 pb-8">
            <Link href="/company/jobs"
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition">
              Cancel
            </Link>

            {/* Status reminder */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              Saving as:
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold text-xs border ${STATUS_CONFIG[formData.status].bg} ${STATUS_CONFIG[formData.status].text} ${STATUS_CONFIG[formData.status].border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[formData.status].dot}`} />
                {STATUS_CONFIG[formData.status].label}
              </span>
            </div>

            <button type="submit" disabled={saving}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg">
              {saving ? (
                <><Loader2 className="animate-spin" size={20} /> Saving Changes...</>
              ) : (
                <><Save size={20} /> Save Changes</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { api, useAuth } from "@/app/context/AuthContext";
import {
  Sparkles,
  DollarSign,
  Calendar,
  Tag,
  FileText,
  Target,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Save,
} from "lucide-react";

const categories = [
  { id: "bug_fix", name: "Bug Fix", icon: "🐛" },
  { id: "feature_development", name: "Feature Development", icon: "⚡" },
  { id: "code_review", name: "Code Review", icon: "👀" },
  { id: "consulting", name: "Consulting", icon: "💼" },
  { id: "design", name: "Design", icon: "🎨" },
  { id: "other", name: "Other", icon: "📦" },
];

const statuses = [
  { id: "open", name: "Open", color: "bg-green-100 text-green-700" },
  { id: "in_progress", name: "In Progress", color: "bg-blue-100 text-blue-700" },
  { id: "completed", name: "Completed", color: "bg-purple-100 text-purple-700" },
  { id: "cancelled", name: "Cancelled", color: "bg-red-100 text-red-700" },
];

export default function EditServicePage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = use(params);
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    category: "",
    status: "open",
    deliveryTime: "",
    requiredSkills: [] as string[],
  });

  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      fetchService();
    }
  }, [authLoading, isAuthenticated, serviceId]);

  const fetchService = async () => {
    try {
      const res = await api.get(`/marketplace/services/${serviceId}`);
      const service = res.data;

      setFormData({
        title: service.title || "",
        description: service.description || "",
        budget: service.budget?.toString() || "",
        category: service.category || "",
        status: service.status || "open",
        deliveryTime: service.deliveryTime?.toString() || "",
        requiredSkills: service.requiredSkills || [],
      });
    } catch (err: any) {
      console.error("Error fetching service:", err);
      setError("Failed to load service");
      if (err.response?.status === 403 || err.response?.status === 404) {
        router.push("/jobs/my-jobs");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await api.put(`/marketplace/services/${serviceId}`, {
        ...formData,
        budget: Number(formData.budget),
      });

      setShowSuccess(true);
      setTimeout(() => {
        router.push("/jobs/my-jobs");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update service");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.requiredSkills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        requiredSkills: [...formData.requiredSkills, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter((s) => s !== skill),
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 py-12 px-4">
      {/* Success Modal */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Service Updated!</h3>
            <p className="text-gray-600">Redirecting to your listings...</p>
          </motion.div>
        </motion.div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-6 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-800 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Edit Service
              </h1>
              <p className="text-gray-600 mt-1">Update your marketplace service details</p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-2xl p-8 space-y-8 border border-slate-100"
        >
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Service Title */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Target size={18} className="text-blue-600" />
              Service Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Fix Authentication Bug in React App"
              className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-800 font-medium"
            />
          </div>

          {/* Category & Status */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Tag size={18} className="text-purple-600" />
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`p-3 rounded-xl border-2 transition-all text-left text-sm ${
                      formData.category === cat.id
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-xl mb-1">{cat.icon}</div>
                    <p className="font-semibold text-gray-800 text-xs">{cat.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-600" />
                Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {statuses.map((status) => (
                  <button
                    key={status.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: status.id })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.status === status.id
                        ? "border-blue-500 shadow-md " + status.color
                        : "border-slate-200 hover:border-blue-200 bg-white"
                    }`}
                  >
                    <p className="font-semibold text-xs">{status.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <FileText size={18} className="text-green-600" />
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your service requirements..."
              rows={6}
              className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none text-gray-800"
            />
          </div>

          {/* Budget & Deadline */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <DollarSign size={18} className="text-green-600" />
                Budget (USD)
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="500"
                className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-800 font-semibold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Calendar size={18} className="text-amber-600" />
                deliveryTime (Optional)
              </label>
              <input
                type="number"
                value={formData.deliveryTime}
                onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-800"
              />
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Sparkles size={18} className="text-purple-600" />
              Required Skills
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                placeholder="e.g., React, Node.js"
                className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-800"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg"
              >
                <Plus size={20} />
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-2 bg-blue-50 text-blue-700 rounded-xl font-semibold text-sm flex items-center gap-2 border border-blue-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-5 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold rounded-2xl transition-all text-lg shadow-2xl disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Saving Changes...
              </>
            ) : (
              <>
                <Save size={24} />
                Save Changes
              </>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
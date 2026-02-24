"use client";

import { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  AlertCircle,
  TrendingUp,
  Clock,
  Award,
} from "lucide-react";

const categories = [
  { id: "bug_fix", name: "Bug Fix", icon: "🐛", color: "from-red-400 to-pink-500" },
  { id: "feature_development", name: "Features", icon: "⚡", color: "from-blue-400 to-cyan-500" },
  { id: "code_review", name: "Code Review", icon: "👀", color: "from-purple-400 to-pink-500" },
  { id: "consulting", name: "Consulting", icon: "💼", color: "from-green-400 to-emerald-500" },
  { id: "design", name: "Design", icon: "🎨", color: "from-pink-400 to-rose-500" },
  { id: "other", name: "Other", icon: "📦", color: "from-gray-400 to-slate-500" },
];

const statuses = [
  { id: "open", name: "Open", color: "bg-green-50 text-green-700 border-green-200", icon: Clock },
  { id: "in_progress", name: "In Progress", color: "bg-blue-50 text-blue-700 border-blue-200", icon: TrendingUp },
  { id: "completed", name: "Completed", color: "bg-purple-50 text-purple-700 border-purple-200", icon: CheckCircle2 },
  { id: "cancelled", name: "Cancelled", color: "bg-red-50 text-red-700 border-red-200", icon: X },
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
        setTimeout(() => router.push("/company/jobs"), 2000);
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
        router.push("/company/jobs");
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
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 w-12 h-12 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading service...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 py-8 md:py-12 px-4">
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] p-10 max-w-md w-full text-center shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
              >
                <CheckCircle2 size={48} className="text-white" />
              </motion.div>
              <h3 className="text-3xl font-black text-gray-900 mb-3">Service Updated!</h3>
              <p className="text-gray-600 font-medium">Redirecting to your listings...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-6 font-semibold group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Listings
          </button>

          <div className="flex items-center gap-5 mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl"
            >
              <Sparkles size={40} className="text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Edit Service
              </h1>
              <p className="text-gray-600 font-medium">Update your marketplace service details</p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border-l-4 border-red-500 p-5 rounded-2xl flex items-start gap-3"
            >
              <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-800 mb-1">Error</h4>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Main Card */}
          <div className="bg-white rounded-[32px] shadow-2xl border-2 border-gray-100 p-8 space-y-8">
            {/* Service Title */}
            <div>
              <label className="block text-sm font-black text-gray-700 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Target size={18} className="text-blue-600" />
                Service Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Fix Authentication Bug in React App"
                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-gray-900 font-semibold placeholder:text-gray-400"
              />
            </div>

            {/* Category & Status Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Category */}
              <div>
                <label className="block text-sm font-black text-gray-700 mb-4 flex items-center gap-2 uppercase tracking-wider">
                  <Tag size={18} className="text-purple-600" />
                  Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <motion.button
                      key={cat.id}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={`p-4 rounded-2xl border-2 transition-all text-left ${
                        formData.category === cat.id
                          ? "border-blue-500 bg-blue-50 shadow-lg"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-3xl mb-2">{cat.icon}</div>
                      <p className="font-bold text-gray-900 text-sm">{cat.name}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-black text-gray-700 mb-4 flex items-center gap-2 uppercase tracking-wider">
                  <TrendingUp size={18} className="text-green-600" />
                  Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {statuses.map((status) => {
                    const Icon = status.icon;
                    return (
                      <motion.button
                        key={status.id}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFormData({ ...formData, status: status.id })}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          formData.status === status.id
                            ? "border-blue-500 shadow-lg " + status.color
                            : "border-gray-200 hover:border-blue-300 bg-white"
                        }`}
                      >
                        <Icon size={20} className="mb-2" />
                        <p className="font-bold text-sm">{status.name}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-black text-gray-700 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <FileText size={18} className="text-green-600" />
                Description
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your service requirements in detail..."
                rows={6}
                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none text-gray-900 font-medium placeholder:text-gray-400"
              />
            </div>

            {/* Budget & Deadline */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-black text-gray-700 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <DollarSign size={18} className="text-green-600" />
                  Budget (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-green-600">
                    $
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="500"
                    className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-gray-900 font-black text-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <Calendar size={18} className="text-amber-600" />
                  Deadline (Optional)
                </label>
                <input
                  type="number"
                  value={formData.deliveryTime}
                  onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-gray-900 font-semibold"
                />
              </div>
            </div>

            {/* Required Skills */}
            <div>
              <label className="block text-sm font-black text-gray-700 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Award size={18} className="text-purple-600" />
                Required Skills
              </label>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="e.g., React, Node.js, TypeScript"
                  className="flex-1 px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-gray-900 font-medium"
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addSkill}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-black rounded-2xl transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Plus size={20} />
                  Add
                </motion.button>
              </div>

              <div className="flex flex-wrap gap-3">
                {formData.requiredSkills.map((skill) => (
                  <motion.span
                    key={skill}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded-xl font-bold text-sm flex items-center gap-2 border-2 border-blue-200 shadow-md"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:bg-blue-100 rounded-full p-1 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </motion.span>
                ))}
                {formData.requiredSkills.length === 0 && (
                  <p className="text-gray-400 italic">No skills added yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={saving}
            whileHover={{ scale: saving ? 1 : 1.02 }}
            whileTap={{ scale: saving ? 1 : 0.98 }}
            className="w-full py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-black rounded-[28px] transition-all text-xl shadow-2xl hover:shadow-3xl disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={28} />
                Saving Changes...
              </>
            ) : (
              <>
                <Save size={28} />
                Save Changes
              </>
            )}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}
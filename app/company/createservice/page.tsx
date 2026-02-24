"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { api } from "@/app/context/AuthContext";
import { 
  ChevronLeft, 
  Send, 
  Target, 
  DollarSign, 
  Calendar, 
  Layers, 
  Code, 
  FileText,
  CheckCircle2,
  Loader2,
  X,
  AlertCircle,
  Lightbulb
} from "lucide-react";
import Link from "next/link";

export default function CreateServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    category: "development",
    deliveryTime: "",
    requiredSkills: [] as string[],
  });

  const [skillInput, setSkillInput] = useState("");

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!formData.requiredSkills.includes(skillInput.trim())) {
        setFormData({
          ...formData,
          requiredSkills: [...formData.requiredSkills, skillInput.trim()],
        });
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter(s => s !== skillToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ✅ Sending deliveryTime as a Number to match your backend requirement
      const response = await api.post("/marketplace/services", {
        ...formData,
        budget: Number(formData.budget),
        deliveryTime: Number(formData.deliveryTime), 
      });

      if (response.data) {
        router.push("/company/jobs");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/company/jobs" className="p-2 hover:bg-gray-100 rounded-full transition">
              <ChevronLeft size={20} className="text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Create New Service</h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full border">
            <Target size={14} /> Marketplace Listing
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-8">
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
                    <AlertCircle size={18} /> {error}
                  </div>
                )}

                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <FileText size={18} />
                    <h2 className="font-bold uppercase tracking-wider text-xs">Project Overview</h2>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service Title</label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g., Fix Bug in React Authentication"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Detailed Description</label>
                    <textarea 
                      required
                      rows={5}
                      placeholder="Describe the problem or task in detail..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </section>

                <hr className="border-gray-100" />

                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-green-600 mb-3">
                      <DollarSign size={18} />
                      <h2 className="font-bold uppercase tracking-wider text-xs">Compensation</h2>
                    </div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Budget (USD)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input 
                        required
                        type="number"
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none"
                        value={formData.budget}
                        onChange={(e) => setFormData({...formData, budget: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-orange-600 mb-3">
                      <Calendar size={18} />
                      <h2 className="font-bold uppercase tracking-wider text-xs">Timeline</h2>
                    </div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Delivery Time (Days)</label>
                    <input 
                      required
                      type="number"
                      placeholder="e.g., 5"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none"
                      value={formData.deliveryTime}
                      onChange={(e) => setFormData({...formData, deliveryTime: e.target.value})}
                    />
                  </div>
                </section>

                <hr className="border-gray-100" />

                <section className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-purple-600 mb-3">
                      <Layers size={18} />
                      <h2 className="font-bold uppercase tracking-wider text-xs">Categorization</h2>
                    </div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                    <select 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none appearance-none"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="consulting">CONSULTING</option>
                      <option value="design">Design</option>
                      <option value="feature_development">FEATURE DEVELOPMENT</option>
                      <option value="bug_fix">Bug Fix</option>
                      <option value="code_review">Code Review</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-3">
                      <Code size={18} />
                      <h2 className="font-bold uppercase tracking-wider text-xs">Requirements</h2>
                    </div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Required Skills (Press Enter)</label>
                    <input 
                      type="text"
                      placeholder="e.g., Next.js, Node.js, Tailwind"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none"
                      value={skillInput}
                      onKeyDown={handleAddSkill}
                      onChange={(e) => setSkillInput(e.target.value)}
                    />
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      <AnimatePresence>
                        {formData.requiredSkills.map(skill => (
                          <motion.span 
                            key={skill}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100"
                          >
                            {skill}
                            <button type="button" onClick={() => removeSkill(skill)} className="hover:text-blue-900">
                              <X size={14} />
                            </button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </section>

                <div className="pt-6">
                  <button 
                    disabled={loading}
                    type="submit"
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <Send size={20} />
                        Publish Service
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl">
              <div className="bg-amber-400/20 p-2 rounded-lg w-fit mb-4">
                <Lightbulb className="text-amber-400" size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">Pro Tips</h3>
              <ul className="space-y-4 text-sm text-gray-300">
                <li className="flex gap-3">
                  <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />
                  Be specific about the bug or feature.
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />
                  Set a realistic budget for quality work.
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-4">Preview</h4>
              <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-xs font-bold text-blue-600 uppercase mb-1">{formData.category || 'Category'}</p>
                <h5 className="font-bold text-gray-800 truncate">{formData.title || 'Service Title'}</h5>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{formData.description || 'No description...'}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-black">${formData.budget || '0'}</span>
                  <span className="text-[10px] text-gray-400">{formData.deliveryTime ? `${formData.deliveryTime} Days` : 'No timeline'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
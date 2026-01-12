"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import {
  Database,
  Globe,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  ExternalLink,
  Briefcase,
  BarChart3,
  Zap,
  Save,
  Trash2,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

/* ================= TYPES ================= */

interface ExternalJob {
  title: string;
  company: string;
  description: string;
  location: string;
  type: string;
  category: string;
  salary?: string;
  applyUrl: string;
  source: string;
  sourceId: string;
  companyLogo?: string;
  tags?: string[];
  publishedAt: string;
}

interface AggregationStats {
  totalExternalJobs: number;
  bySource: { source: string; count: number }[];
  byCategory: { category: string; count: number }[];
}

/* ================= HELPERS ================= */

const mapJobType = (type: string): string => {
  if (!type) return "full_time";
  const t = type.toLowerCase();
  if (t.includes("part")) return "part_time";
  if (t.includes("contract")) return "contract";
  if (t.includes("intern")) return "internship";
  return "full_time";
};

const cleanHtml = (html: string): string =>
  html?.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() || "";

const cleanText = (text: string): string =>
  text?.replace(/[^\w\s-]/g, "").trim() || "";

/* ================= GREENHOUSE CONFIG ================= */

const GREENHOUSE_COMPANIES = [
  { name: "Stripe", token: "stripe" },
  { name: "Airbnb", token: "airbnb" },
  { name: "Shopify", token: "shopify" },
  { name: "Coinbase", token: "coinbase" },
  { name: "Dropbox", token: "dropbox" },
];

const MAX_JOBS = 24;

/* ================= COMPONENT ================= */

export default function JobAggregatorPage() {
  const [stats, setStats] = useState<AggregationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchedJobs, setFetchedJobs] = useState<ExternalJob[]>([]);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [errorLog, setErrorLog] = useState<string[]>([]);

  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });

  useEffect(() => {
    fetchStats();
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "success", message: "" }), 4000);
  };

  const fetchStats = async () => {
    try {
      const token = Cookies.get("admin_token") || Cookies.get("token");
      const res = await fetch(`${API}/jobs/external/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats({
          totalExternalJobs: data.total || 0,
          bySource: data.bySource || [],
          byCategory: data.byCategory || [],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= GREENHOUSE FETCH ================= */

  const fetchFromGreenhouse = async (): Promise<ExternalJob[]> => {
    const allJobs: ExternalJob[] = [];

    // fetch jobs for all companies
    const companyPromises = GREENHOUSE_COMPANIES.map(async (company) => {
      try {
        const res = await fetch(
          `https://boards-api.greenhouse.io/v1/boards/${company.token}/jobs`
        );
        if (!res.ok) return [];
        const data = await res.json();
        return (data.jobs || []).map((job: any) => ({
          title: cleanText(job.title),
          company: company.name,
          description: cleanHtml(job.content),
          location: job.location?.name || "Remote",
          type: mapJobType(job.type),
          category: job.departments?.[0]?.name || "Other",
          applyUrl: job.absolute_url,
          source: "Greenhouse",
          sourceId: `greenhouse-${company.token}-${job.id}`,
          publishedAt: job.updated_at || new Date().toISOString(),
        }));
      } catch (err) {
        console.error(`Greenhouse error (${company.name})`, err);
        return [];
      }
    });

    const jobsByCompany = await Promise.all(companyPromises);

    // Flatten and shuffle jobs to mix across companies
    const flatJobs = jobsByCompany.flat();
    for (let i = flatJobs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [flatJobs[i], flatJobs[j]] = [flatJobs[j], flatJobs[i]];
    }

    // limit to MAX_JOBS
    return flatJobs.slice(0, MAX_JOBS);
  };

  /* ================= ACTIONS ================= */

  const handleFetch = async () => {
    setFetching(true);
    setFetchedJobs([]);
    setErrorLog([]);

    const jobs = await fetchFromGreenhouse();

    if (jobs.length) {
      setFetchedJobs(jobs);
      showToast("success", `Fetched ${jobs.length} jobs`);
    } else {
      showToast("error", "No jobs fetched");
    }

    setFetching(false);
  };

  const saveJobsToBackend = async () => {
    if (!fetchedJobs.length) return;

    setSaving(true);
    setSavedCount(0);
    setErrorLog([]);

    const token = Cookies.get("admin_token") || Cookies.get("token");
    let saved = 0;
    const errors: string[] = [];

    for (const job of fetchedJobs) {
      try {
        const res = await fetch(`${API}/jobs/external`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(job),
        });

        if (res.ok) {
          saved++;
          setSavedCount(saved);
        } else {
          const errData = await res.json().catch(() => ({ message: "Unknown error" }));
          errors.push(`${job.title}: ${errData.message || "Error saving job"}`);
        }
      } catch (e: any) {
        errors.push(`${job.title}: ${e.message}`);
      }
    }

    setErrorLog(errors);
    setSaving(false);
    showToast("success", `Saved ${saved} jobs`);
    setFetchedJobs([]);
    fetchStats();
  };

  const deleteAllJobs = async () => {
    if (!confirm("Are you sure you want to delete ALL external jobs? This cannot be undone.")) return;

    setDeleting(true);
    try {
      const token = Cookies.get("admin_token") || Cookies.get("token");
      const res = await fetch(`${API}/jobs/external/all`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        showToast("success", `Deleted ${data.deletedCount || 0} jobs`);
        fetchStats();
      } else {
        showToast("error", "Failed to delete jobs");
      }
    } catch (err) {
      showToast("error", "Failed to delete jobs");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-10 h-10 text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: 100 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -50, x: 100 }}
            className={`fixed top-4 right-4 ${toast.type === "success" ? "bg-green-500" : "bg-red-500"} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 max-w-md`}
          >
            {toast.type === "success" ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
            <span className="font-medium">{toast.message}</span>
            <button onClick={() => setToast({ ...toast, show: false })}><X size={20} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Globe size={32} />
              <h1 className="text-3xl font-bold">Job Aggregator</h1>
            </div>
            <p className="text-amber-100">Import remote jobs from multiple companies</p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button onClick={handleFetch} disabled={fetching} className="flex items-center gap-2 px-6 py-3 bg-white text-amber-600 font-semibold rounded-lg hover:bg-amber-50 transition disabled:opacity-50">
              {fetching ? <> <Loader2 className="animate-spin" size={20} /> Fetching... </> : <> <Zap size={20} /> Fetch Jobs </>}
            </button>

            {fetchedJobs.length > 0 && (
              <button onClick={saveJobsToBackend} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition disabled:opacity-50">
                {saving ? <> <Loader2 className="animate-spin" size={20} /> Saving {savedCount}/{fetchedJobs.length}... </> : <> <Save size={20} /> Save {fetchedJobs.length} Jobs </>}
              </button>
            )}

            {stats?.totalExternalJobs > 0 && (
              <button onClick={deleteAllJobs} disabled={deleting} className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition disabled:opacity-50">
                {deleting ? <> <Loader2 className="animate-spin" size={20} /> Deleting... </> : <> <Trash2 size={20} /> Delete All </>}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Error Log */}
      {errorLog.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-red-800 flex items-center gap-2">
              <AlertCircle size={20} /> Errors ({errorLog.length})
            </h3>
            <button onClick={() => setErrorLog([])} className="text-red-600 hover:text-red-800"><X size={20} /></button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {errorLog.map((err, i) => <p key={i} className="text-sm text-red-700">{err}</p>)}
          </div>
        </motion.div>
      )}


      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 rounded-full p-3">
              <Database className="text-amber-600" size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Saved External Jobs</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats?.totalExternalJobs?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 rounded-full p-3">
              <Globe className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Source</p>
              <p className="text-2xl font-bold text-gray-800">Green House</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 rounded-full p-3">
              <Briefcase className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Fetched (Unsaved)</p>
              <p className="text-3xl font-bold text-gray-800">
                {fetchedJobs.length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center gap-4">
            <div className="bg-green-100 rounded-full p-3">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Categories</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats?.byCategory?.length || 0}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Categories Breakdown */}
      {(stats?.byCategory?.length || 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 size={24} />
              Jobs by Category
            </h2>
          </div>
          
          <div className="p-6 max-h-[400px] overflow-y-auto">
            <div className="space-y-3">
              {stats?.byCategory?.map((cat, index) => {
                const maxCount = stats.byCategory[0]?.count || 1;
                const percentage = (cat.count / maxCount) * 100;
                
                return (
                  <div key={cat.category || index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">
                        {cat.category || "Other"}
                      </span>
                      <span className="text-gray-500">{cat.count}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Fetched Jobs Preview */}
      {fetchedJobs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle size={24} />
              Fetched Jobs Preview ({fetchedJobs.length})
            </h2>
            <button
              onClick={() => setFetchedJobs([])}
              className="text-white hover:text-green-100"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6 max-h-[500px] overflow-y-auto">
            <div className="space-y-3">
              {fetchedJobs.slice(0, 20).map((job, index) => (
                <div
                  key={job.sourceId}
                  className="p-4 bg-gray-50 rounded-lg flex justify-between items-start"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-gray-800 truncate">{job.title}</h3>
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700">
                        {job.source}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{job.company}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-xs font-medium rounded">
                        {job.category}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                        {job.location}
                      </span>
                      {job.salary && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs font-medium rounded">
                          {job.salary}
                        </span>
                      )}
                    </div>
                  </div>
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center gap-1 ml-4"
                  >
                    View <ExternalLink size={12} />
                  </a>
                </div>
              ))}
              {fetchedJobs.length > 20 && (
                <p className="text-center text-gray-500 py-4">
                  ... and {fetchedJobs.length - 20} more jobs
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 border border-amber-200 rounded-xl p-6"
      >
        <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
          <TrendingUp size={20} />
          How to Use
        </h3>
        <ol className="text-amber-700 space-y-2 text-sm list-decimal list-inside">
          <li>Click <strong>"Fetch Jobs"</strong> to get jobs from Remotive</li>
          <li>Review the fetched jobs in the preview section</li>
          <li>Click <strong>"Save Jobs"</strong> to import them to your database</li>
          <li>Duplicates will be automatically skipped</li>
          <li>Use <strong>"Delete All"</strong> to remove all external jobs if needed</li>
        </ol>
      </motion.div>
    </div>
  );
}
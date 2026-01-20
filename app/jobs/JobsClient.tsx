"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Search,
  Filter,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Tag,
  Globe,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface Job {
  _id: string;
  title: string;
  slug: string;
  description: string;
  company: string;
  location: string;
  state: string;
  category: string;
  salary: string;
  type: string;
  status: string;
  experienceLevel: string;
  createdAt: string;
  companyLogo?: string;
  isExternal?: boolean;
  externalSource?: string;
  externalApplyUrl?: string;
  tags?: string[];
  postedBy?: {
    firstName: string;
    lastName: string;
  };
}

export default function JobsClient() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    location: "",
    category: "",
    experienceLevel: "",
    source: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 12;

  // Dummy description - ONLY for external jobs
  const DUMMY_DESCRIPTION = "Join our team and be part of an innovative company that values creativity, collaboration, and growth. We offer competitive benefits and a dynamic work environment.";

  const categories = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing',
    'Sales', 'Design', 'Engineering', 'Customer Service', 'Human Resources',
    'Operations', 'Legal', 'Construction', 'Hospitality', 'Retail',
    'Transportation', 'Manufacturing', 'Agriculture', 'Real Estate', 'Other'
  ];

  useEffect(() => { fetchJobs(); }, []);
  useEffect(() => { filterJobs(); }, [jobs, searchTerm, filters]);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/jobs?status=active&limit=500`);
      const jobsData = res.data?.data || res.data || [];
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = Array.isArray(jobs) ? [...jobs] : [];

    if (searchTerm) {
      filtered = filtered.filter((job) =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filters.type) filtered = filtered.filter((job) => job.type === filters.type);
    if (filters.location) filtered = filtered.filter((job) => job.location?.toLowerCase().includes(filters.location.toLowerCase()));
    if (filters.category) filtered = filtered.filter((job) => job.category === filters.category);
    if (filters.experienceLevel) filtered = filtered.filter((job) => job.experienceLevel === filters.experienceLevel);
    if (filters.source === 'external') filtered = filtered.filter((job) => job.isExternal === true);
    else if (filters.source === 'user') filtered = filtered.filter((job) => !job.isExternal);

    setFilteredJobs(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ type: "", location: "", category: "", experienceLevel: "", source: "" });
    setSearchTerm("");
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

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      'Stripe': 'bg-purple-100 text-purple-700',
      'Airbnb': 'bg-pink-100 text-pink-700',
      'Shopify': 'bg-green-100 text-green-700',
      'Dropbox': 'bg-blue-100 text-blue-700',
    };
    return colors[source] || 'bg-gray-100 text-gray-700';
  };

  const getSalary = (salary: string) => {
    if (!salary || salary.trim() === "") {
      return "Competitive salary";
    }
    return salary;
  };

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = Array.isArray(filteredJobs) ? filteredJobs.slice(indexOfFirstJob, indexOfLastJob) : [];
  const totalPages = Math.ceil((filteredJobs?.length || 0) / jobsPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const externalCount = jobs.filter(j => j.isExternal).length;
  const userCount = jobs.filter(j => !j.isExternal).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-yellow-50 to-white">
        <Loader2 className="animate-spin text-yellow-700 w-8 h-8" />
      </div>
    );
  }

  return (
    <main className="bg-[#fffaf6] min-h-screen text-gray-800">
      <section className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl font-bold mb-4">Find Your Dream Job</h1>
            <p className="text-xl text-amber-100">Explore {jobs.length}+ opportunities from top companies worldwide</p>
            <div className="flex gap-4 mt-4 text-sm">
              <span className="px-3 py-1 bg-white/20 rounded-full">🏢 {userCount} direct postings</span>
              <span className="px-3 py-1 bg-white/20 rounded-full">🌐 {externalCount} aggregated jobs</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 -mt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search jobs, companies, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
              />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-all">
              <Filter size={20} />
              <span>Filters</span>
              {(filters.type || filters.location || filters.category || filters.experienceLevel || filters.source) && (
                <span className="ml-2 bg-white text-amber-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  {[filters.type, filters.location, filters.category, filters.experienceLevel, filters.source].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Job Type</label>
                  <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none">
                    <option value="">All Types</option>
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none">
                    <option value="">All Categories</option>
                    {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <input type="text" placeholder="e.g., Remote, New York" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Experience Level</label>
                  <select value={filters.experienceLevel} onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none">
                    <option value="">All Levels</option>
                    <option value="Entry-level">Entry Level</option>
                    <option value="Mid-level">Mid Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Source</label>
                  <select value={filters.source} onChange={(e) => setFilters({ ...filters, source: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none">
                    <option value="">All Sources</option>
                    <option value="user">Direct Postings</option>
                    <option value="external">Aggregated Jobs</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button onClick={clearFilters} className="flex items-center gap-2 px-4 py-2 text-amber-600 hover:text-amber-700 font-semibold transition">
                  <X size={18} /> Clear All Filters
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-5 mt-8">
        <p className="text-gray-600">
          Showing <span className="font-semibold">{filteredJobs.length}</span> jobs
          {(searchTerm || filters.type || filters.location || filters.category || filters.experienceLevel || filters.source) && " matching your criteria"}
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-5 mt-8 pb-20">
        {currentJobs.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <Briefcase size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No jobs found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
            <button onClick={clearFilters} className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition">Clear Filters</button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentJobs.map((job, idx) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all p-6 border border-gray-100 hover:border-amber-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getJobTypeColor(job.type)}`}>
                      {job.type?.replace("_", " ").toUpperCase()}
                    </span>
                    {job.isExternal && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getSourceColor(job.company)}`}>
                        <Globe size={10} />
                        {job.company}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-start gap-3 mb-3">
                  {job.companyLogo ? (
                    <img src={job.companyLogo} alt={job.company} className="w-12 h-12 rounded-lg object-cover bg-gray-100" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <Building2 className="text-white" size={20} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-[#3e2a1a] line-clamp-2">{job.title}</h3>
                    <p className="text-sm text-gray-600 font-medium">{job.company}</p>
                  </div>
                </div>

                {/* ✅ Description - DUMMY for external, REAL for user-posted */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {job.isExternal ? DUMMY_DESCRIPTION : (job.description || DUMMY_DESCRIPTION)}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <MapPin size={16} className="text-amber-500 flex-shrink-0" />
                    <span className="line-clamp-1">{job.location || job.state || "Remote"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Tag size={16} className="text-purple-500 flex-shrink-0" />
                    <span className="line-clamp-1">{job.category || "General"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <DollarSign size={16} className="text-green-500 flex-shrink-0" />
                    <span className="line-clamp-1">{getSalary(job.salary)}</span>
                  </div>
                </div>

                {job.isExternal ? (
                  <a href={job.externalApplyUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-lg shadow transition-all flex items-center justify-center gap-2">
                    Apply at {job.company}
                    <ExternalLink size={16} />
                  </a>
                ) : (
                  <Link href={`/jobs/${job.slug}`}>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-lg shadow transition-all">
                      View Details
                    </motion.button>
                  </Link>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
                  <Clock size={14} />
                  {job.isExternal ? (
                    <span>Via {job.company}</span>
                  ) : (
                    <span>Posted by {job.postedBy?.firstName || ""} {job.postedBy?.lastName || ""}  {job.company}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex justify-center items-center gap-2 mt-12">
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className={`p-2 rounded-lg transition ${currentPage === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-white text-amber-600 hover:bg-amber-50 shadow"}`}>
              <ChevronLeft size={20} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;
              return (
                <button key={pageNum} onClick={() => paginate(pageNum)} className={`px-4 py-2 rounded-lg font-semibold transition ${currentPage === pageNum ? "bg-amber-500 text-white shadow-lg" : "bg-white text-gray-700 hover:bg-amber-50 shadow"}`}>
                  {pageNum}
                </button>
              );
            })}
            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className={`p-2 rounded-lg transition ${currentPage === totalPages ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-white text-amber-600 hover:bg-amber-50 shadow"}`}>
              <ChevronRight size={20} />
            </button>
          </motion.div>
        )}
      </section>
    </main>
  );
}
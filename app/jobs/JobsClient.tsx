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
} from "lucide-react";
import Link from "next/link";

interface Job {
  _id: string;
  title: string;
  slug: string;
  description: string;
  company: string;
  location: string;
  category: string;
  salary: string;
  type: string;
  status: string;
  experienceLevel: string;
  createdAt: string;
  postedBy: {
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
    category: "", // ✅ NEW: Category filter
    experienceLevel: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 12;

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
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, filters]);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/jobs?status=active`
      );
      
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
      filtered = filtered.filter(
        (job) =>
          job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.type) {
      filtered = filtered.filter((job) => job.type === filters.type);
    }

    if (filters.location) {
      filtered = filtered.filter((job) =>
        job.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // ✅ NEW: Category filter
    if (filters.category) {
      filtered = filtered.filter((job) => job.category === filters.category);
    }

    if (filters.experienceLevel) {
      filtered = filtered.filter(
        (job) => job.experienceLevel === filters.experienceLevel
      );
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      location: "",
      category: "", // ✅ Reset category
      experienceLevel: "",
    });
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

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = Array.isArray(filteredJobs) 
    ? filteredJobs.slice(indexOfFirstJob, indexOfLastJob)
    : [];
  const totalPages = Math.ceil((filteredJobs?.length || 0) / jobsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-yellow-50 to-white">
        <Loader2 className="animate-spin text-yellow-700 w-8 h-8" />
      </div>
    );
  }

  return (
    <main className="bg-[#fffaf6] min-h-screen text-gray-800">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold mb-4">Find Your Dream Job</h1>
            <p className="text-xl text-amber-100">
              Explore {jobs.length}+ opportunities from top companies worldwide
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="max-w-7xl mx-auto px-5 -mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search jobs, companies, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-all"
            >
              <Filter size={20} />
              <span>Filters</span>
              {(filters.type || filters.location || filters.category || filters.experienceLevel) && (
                <span className="ml-2 bg-white text-amber-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  {[filters.type, filters.location, filters.category, filters.experienceLevel].filter(
                    Boolean
                  ).length}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) =>
                      setFilters({ ...filters, type: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  >
                    <option value="">All Types</option>
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                {/* ✅ NEW: Category Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      setFilters({ ...filters, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Remote, New York"
                    value={filters.location}
                    onChange={(e) =>
                      setFilters({ ...filters, location: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={filters.experienceLevel}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        experienceLevel: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  >
                    <option value="">All Levels</option>
                    <option value="Entry-level">Entry Level</option>
                    <option value="Mid-level">Mid Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-amber-600 hover:text-amber-700 font-semibold transition"
                >
                  <X size={18} />
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Results Count */}
      <section className="max-w-7xl mx-auto px-5 mt-8">
        <p className="text-gray-600">
          Showing <span className="font-semibold">{filteredJobs.length}</span>{" "}
          jobs
          {(searchTerm || filters.type || filters.location || filters.category || filters.experienceLevel) &&
            " matching your criteria"}
        </p>
      </section>

      {/* Jobs Grid */}
      <section className="max-w-7xl mx-auto px-5 mt-8 pb-20">
        {currentJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Briefcase size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No jobs found
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentJobs.map((job, idx) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all p-6 border border-gray-100 hover:border-amber-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getJobTypeColor(
                      job.type
                    )}`}
                  >
                    {job.type.replace("_", " ").toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <Link href={`/jobs/${job.slug}`}>
                  <h3 className="text-xl font-bold text-[#3e2a1a] mb-2 hover:text-amber-700 transition line-clamp-2">
                    {job.title}
                  </h3>
                </Link>

                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <Building2 size={16} />
                  <span className="text-sm font-medium">{job.company}</span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {job.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <MapPin size={16} className="text-amber-500" />
                    <span className="line-clamp-1">{job.location}</span>
                  </div>
                  {/* ✅ Display category */}
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Tag size={16} className="text-purple-500" />
                    <span className="line-clamp-1">{job.category}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <DollarSign size={16} className="text-green-500" />
                    <span>{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Briefcase size={16} className="text-blue-500" />
                    <span>{job.experienceLevel}</span>
                  </div>
                </div>

                <Link href={`/jobs/${job.slug}`}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-lg shadow transition-all"
                  >
                    View Details
                  </motion.button>
                </Link>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
                  <Clock size={14} />
                  <span>
                    Posted by {job.postedBy?.firstName} {job.postedBy?.lastName}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center items-center gap-2 mt-12"
          >
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-amber-600 hover:bg-amber-50 shadow"
              }`}
            >
              <ChevronLeft size={20} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => paginate(page)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  currentPage === page
                    ? "bg-amber-500 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-amber-50 shadow"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-amber-600 hover:bg-amber-50 shadow"
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </motion.div>
        )}
      </section>
    </main>
  );
}
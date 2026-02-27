"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Users,
  Eye,
  X,
  AlertTriangle,
  CheckCircle,
  Tag,
  Sparkles,
  TrendingUp,
  Filter,
  Package,
  ShoppingCart,
} from "lucide-react";
import { useAuth, api } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Job {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  status: string;
  experienceLevel: string;
  createdAt: string;
  applicationCount?: number
}

interface Service {
  _id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  status: string;
  ordersCount?: number; // Count of paid orders
  requiredSkills: string[];
  createdAt: string;
  deadline?: string;
}

type ListingType = "all" | "jobs" | "services";

export default function MyJobsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ListingType>("all");
  
  // Modal states
  const [deleteModal, setDeleteModal] = useState<{ 
    show: boolean; 
    item: Job | Service | null;
    type: "job" | "service" | null;
  }>({
    show: false,
    item: null,
    type: null,
  });
  const [errorModal, setErrorModal] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });
  const [successModal, setSuccessModal] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }

    if (isAuthenticated) {
      fetchMyJobs();
      fetchMyServices();
    }
  }, [isAuthenticated, authLoading, router]);

const fetchMyJobs = async () => {
  try {
    const res = await api.get("/jobs/user/my-jobs");
    const jobsData = res.data;
    
    // ✅ Fetch application count for each job
    const jobsWithCounts = await Promise.all(
      jobsData.map(async (job: Job) => {
        try {
          const appsRes = await api.get(`/applications/job/${job._id}`);
          const apps = appsRes.data.data || appsRes.data;
          return { ...job, applicationCount: apps.length };
        } catch (err) {
          return { ...job, applicationCount: 0 };
        }
      })
    );
    
    setJobs(jobsWithCounts);
  } catch (err) {
    console.error("Error fetching jobs:", err);
  } finally {
    setLoading(false);
  }
};

  const fetchMyServices = async () => {
    try {
      const res = await api.get("/marketplace/my-services");
      const servicesData = res.data;
      
      // Fetch orders count for each service
      const servicesWithOrders = await Promise.all(
        servicesData.map(async (service: Service) => {
          try {
            const ordersRes = await api.get(`/marketplace/services/${service._id}/orders`);
            const orders = ordersRes.data || [];
            // Count only paid orders (paid, in_progress, delivered, completed)
            const paidOrders = orders.filter((o: any) => 
              ["paid", "in_progress", "delivered", "completed"].includes(o.status)
            );
            return { ...service, ordersCount: paidOrders.length };
          } catch (err) {
            return { ...service, ordersCount: 0 };
          }
        })
      );
      
      setServices(servicesWithOrders);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  const handleDeleteClick = (item: Job | Service, type: "job" | "service") => {
    setDeleteModal({ show: true, item, type });
  };

  const confirmDelete = async () => {
    if (!deleteModal.item || !deleteModal.type) return;

    setDeleting(true);
    try {
      const endpoint = deleteModal.type === "job" 
        ? `/jobs/${deleteModal.item._id}`
        : `/marketplace/services/${deleteModal.item._id}`;
      
      await api.delete(endpoint);
      
      if (deleteModal.type === "job") {
        setJobs(jobs.filter((job) => job._id !== deleteModal.item!._id));
      } else {
        setServices(services.filter((service) => service._id !== deleteModal.item!._id));
      }
      
      setDeleteModal({ show: false, item: null, type: null });
      setSuccessModal({
        show: true,
        message: `${deleteModal.type === "job" ? "Job" : "Service"} deleted successfully!`,
      });
    } catch (err) {
      console.error("Error deleting:", err);
      setDeleteModal({ show: false, item: null, type: null });
      setErrorModal({
        show: true,
        message: "Failed to delete. Please try again.",
      });
    } finally {
      setDeleting(false);
    }
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

  const getServiceCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      bug_fix: "bg-red-100 text-red-700 border-red-300",
      feature_development: "bg-blue-100 text-blue-700 border-blue-300",
      code_review: "bg-purple-100 text-purple-700 border-purple-300",
      consulting: "bg-green-100 text-green-700 border-green-300",
      design: "bg-pink-100 text-pink-700 border-pink-300",
      other: "bg-gray-100 text-gray-700 border-gray-300",
    };
    return colors[category] || colors.other;
  };

  const totalListings = jobs.length + services.length;
  const activeJobs = jobs.filter(j => j.status === "active").length;
  const activeServices = services.filter(s => s.status === "open").length;
  const totalOrders = services.reduce((sum, s) => sum + (s.ordersCount || 0), 0);

  const displayedJobs = activeTab === "services" ? [] : jobs;
  const displayedServices = activeTab === "jobs" ? [] : services;

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-amber-50 via-blue-50/30 to-slate-50">
        <Loader2 className="animate-spin text-amber-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-blue-50/30 to-slate-50 py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-2 bg-gradient-to-r from-amber-600 to-blue-600 bg-clip-text text-transparent">
                My Listings
              </h1>
              <p className="text-gray-600">Manage your job postings and marketplace services</p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/jobs/post-job" className="flex-1 sm:flex-initial">
                <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <Plus size={20} />
                  Post Job
                </button>
              </Link>
              <Link href="/marketplace/create-service" className="flex-1 sm:flex-initial">
                <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <Sparkles size={20} />
                  Create Service
                </button>
              </Link>
                 <Link href="/marketplace/payouts" className="flex-1 sm:flex-initial">
                <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <Sparkles size={20} />
                  View Payouts
                </button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-4 shadow-md border-l-4 border-gray-500"
            >
              <p className="text-gray-500 text-sm mb-1">Total Listings</p>
              <p className="text-3xl font-black text-gray-800">{totalListings}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-4 shadow-md border-l-4 border-amber-500"
            >
              <p className="text-gray-500 text-sm mb-1">Active Jobs</p>
              <p className="text-3xl font-black text-amber-600">{activeJobs}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500"
            >
              <p className="text-gray-500 text-sm mb-1">Open Services</p>
              <p className="text-3xl font-black text-blue-600">{activeServices}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500"
            >
              <p className="text-gray-500 text-sm mb-1">Total Orders</p>
              <p className="text-3xl font-black text-green-600">{totalOrders}</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Tab Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-3 mb-6 overflow-x-auto pb-2"
        >
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
              activeTab === "all"
                ? "bg-slate-900 text-white shadow-lg scale-105"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <Filter size={16} />
            All ({totalListings})
          </button>
          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
              activeTab === "jobs"
                ? "bg-slate-900 text-white shadow-lg scale-105"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <Briefcase size={16} />
            Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
              activeTab === "services"
                ? "bg-slate-900 text-white shadow-lg scale-105"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <Sparkles size={16} />
            Services ({services.length})
          </button>
        </motion.div>

        {/* Empty State */}
        {totalListings === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase size={40} className="text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Listings Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start by creating your first job posting or marketplace service to connect with talented professionals
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/jobs/post-job">
                <button className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition shadow-lg">
                  Post a Job
                </button>
              </Link>
              <Link href="/marketplace/create-service">
                <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition shadow-lg">
                  Create Service
                </button>
              </Link>
              <Link href="/marketplace/payouts">
                <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition shadow-lg">
                  View Payouts
                </button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Jobs List */}
            {displayedJobs.map((job, idx) => (
              <motion.div
                key={`job-${job._id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-transparent hover:border-amber-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded uppercase">
                            <Briefcase size={12} />
                            JOB
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getJobTypeColor(job.type)}`}
                          >
                            {job.type.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                        <Link href={`/jobs/${job.slug}`}>
                          <h3 className="text-xl font-bold text-gray-800 hover:text-amber-600 transition cursor-pointer mb-1">
                            {job.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building2 size={16} />
                          <span className="font-medium">{job.company}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={16} />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign size={16} />
                        {job.salary}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Tag size={16} />
                        {job.category}
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-green-600">
                          <Users size={16} />
                          {job.applicationCount || 0} applications
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={16} />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="mt-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          job.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {job.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-2 lg:min-w-[140px]">
                    <Link href={`/jobs/${job.slug}`} className="flex-1">
                      <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition text-sm flex items-center justify-center gap-1.5">
                        <Eye size={16} />
                        View
                      </button>
                    </Link>
                    <Link href={`/applications/job/${job._id}`} className="flex-1">
                    <button className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition text-sm flex items-center justify-center gap-1.5">
                      <Users size={16} />
                      {/* ✅ Show count on button */}
                      {job.applicationCount || 0}
                    </button>
                  </Link>
                    <Link href={`/jobs/edit/${job.slug}`} className="flex-1">
                      <button className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition text-sm flex items-center justify-center gap-1.5">
                        <Edit size={16} />
                        Edit
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(job, "job")}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition text-sm flex items-center justify-center gap-1.5"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Services List */}
            {displayedServices.map((service, idx) => (
              <motion.div
                key={`service-${service._id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (displayedJobs.length + idx) * 0.05 }}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-transparent hover:border-purple-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded uppercase">
                            <Sparkles size={12} />
                            MARKETPLACE
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getServiceCategoryColor(
                              service.category
                            )}`}
                          >
                            {service.category.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                        <Link href={`/marketplace/tasks/${service._id}`}>
                          <h3 className="text-xl font-bold text-gray-800 hover:text-purple-600 transition cursor-pointer mb-1">
                            {service.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 text-green-600 font-bold text-lg">
                          <DollarSign size={18} />
                          <span>{service.budget}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>

                    {service.requiredSkills && service.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {service.requiredSkills.slice(0, 4).map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {service.requiredSkills.length > 4 && (
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg">
                            +{service.requiredSkills.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <ShoppingCart size={16} />
                        {service.ordersCount || 0} paid orders
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={16} />
                        {new Date(service.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="mt-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          service.status === "open"
                            ? "bg-green-100 text-green-700"
                            : service.status === "in_progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {service.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-2 lg:min-w-[140px]">
                    <Link href={`/marketplace/tasks/${service._id}`} className="flex-1">
                      <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition text-sm flex items-center justify-center gap-1.5">
                        <Eye size={16} />
                        View
                      </button>
                    </Link>
                    <Link href={`/applications/job/${service._id}`} className="flex-1">
                      <button className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition text-sm flex items-center justify-center gap-1.5">
                        <Package size={16} />
                        {service.ordersCount || 0}
                      </button>
                    </Link>
                    <Link href={`/marketplace/edit-service/${service._id}`} className="flex-1">
                      <button className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition text-sm flex items-center justify-center gap-1.5">
                        <Edit size={16} />
                        Edit
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(service, "service")}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition text-sm flex items-center justify-center gap-1.5"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && deleteModal.item && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => !deleting && setDeleteModal({ show: false, item: null, type: null })}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-red-100 rounded-full p-4">
                  <AlertTriangle className="text-red-600" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Delete {deleteModal.type === "job" ? "Job" : "Service"}
                </h3>
              </div>

              <p className="text-gray-600 mb-8 leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-bold text-gray-800">"{deleteModal.item.title}"</span>? This
                action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, item: null, type: null })}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={20} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {successModal.show && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSuccessModal({ show: false, message: "" })}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-green-100 rounded-full p-4">
                  <CheckCircle className="text-green-600" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Success!</h3>
              </div>

              <p className="text-gray-600 mb-8">{successModal.message}</p>

              <button
                onClick={() => setSuccessModal({ show: false, message: "" })}
                className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition"
              >
                OK
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Error Modal */}
      <AnimatePresence>
        {errorModal.show && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setErrorModal({ show: false, message: "" })}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-red-100 rounded-full p-4">
                  <X className="text-red-600" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Error</h3>
              </div>

              <p className="text-gray-600 mb-8">{errorModal.message}</p>

              <button
                onClick={() => setErrorModal({ show: false, message: "" })}
                className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
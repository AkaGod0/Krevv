"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/app/context/AuthContext";
import {
  Building2,
  MapPin,
  Globe,
  Mail,
  Info,
  Briefcase,
  Users,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  Clock,
  ChevronRight,
  DollarSign,
  Calendar,
  Sparkles,
  Package,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Job {
  _id: string;
  title: string;
  slug?: string;
  location: string;
  type: string;
  salary: string;
  company?: string;
  category?: string;
  createdAt: string;
}

interface MarketplaceService {
  _id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  deliveryTime: number;
  status: string;
  images?: string[];
  createdAt: string;
}

export default function CompanyProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [services, setServices] = useState<MarketplaceService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"jobs" | "services">("jobs");

  useEffect(() => {
    const fetchCompanyAndJobs = async () => {
      try {
        setLoading(true);
        // 1. Fetch Company Profile
        const companyRes = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/company/${id}`);
        setCompany(companyRes.data);

        // 2. Fetch Jobs posted by this Company
        try {
          const jobsRes = await api.get(
            `${process.env.NEXT_PUBLIC_API_URL}/jobs/company/${id}/jobs`
          );
          setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
        } catch (jobErr) {
          console.error("Could not fetch company jobs:", jobErr);
          setJobs([]);
        }

        // ✅ 3. NEW: Fetch Marketplace Services posted by this Company
        try {
          const servicesRes = await api.get(
            `${process.env.NEXT_PUBLIC_API_URL}/marketplace/user/${id}/services`
          );
          setServices(Array.isArray(servicesRes.data) ? servicesRes.data : []);
        } catch (serviceErr) {
          console.error("Could not fetch company marketplace services:", serviceErr);
          setServices([]);
        }
      } catch (err: any) {
        console.error("Error fetching company:", err);
        setError(err.response?.data?.message || "Company not found");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCompanyAndJobs();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500" size={48} />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 size={40} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Company Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "Company not found"}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Header with Go Back button */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-amber-500 to-orange-600 relative">
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <button
            onClick={() => router.back()}
            className="relative z-10 flex items-center gap-2 px-4 py-2 bg-black/20 hover:bg-black/40 text-white font-bold rounded-lg transition-all border border-white/40 shadow-sm"
          >
            <ArrowLeft size={20} strokeWidth={3} />
            <span>Go Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div className="relative -mt-16 bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* Company Info Header */}
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-8">
            <div className="bg-white p-2 rounded-2xl shadow-lg border w-32 h-32 flex-shrink-0">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.companyName}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-amber-50 flex items-center justify-center rounded-xl">
                  <Building2 size={48} className="text-amber-500" />
                </div>
              )}
            </div>
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                {company.companyName}
                {company.isVerified !== false && (
                  <ShieldCheck className="text-blue-500" size={24} />
                )}
              </h1>
              <div className="flex flex-wrap gap-4 mt-2 text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin size={18} /> {company.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase size={18} /> {company.industry}
                </span>
                {company.website && (
                  <a
                    href={
                      company.website.startsWith("http")
                        ? company.website
                        : `https://${company.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-amber-600 hover:underline"
                  >
                    <Globe size={18} /> Website
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Info className="text-amber-500" /> About Company
                </h2>
                <div className="bg-amber-50/30 border border-amber-100 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {company.description || "No description provided."}
                  </p>
                </div>
              </section>

              {/* ✅ Jobs & Services Tabs Section */}
              <section>
                {/* Tab Navigation */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl font-bold">Company Listings</h2>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setActiveTab("jobs")}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                        activeTab === "jobs"
                          ? "bg-amber-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Briefcase size={16} />
                        Jobs ({jobs.length})
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab("services")}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                        activeTab === "services"
                          ? "bg-purple-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Sparkles size={16} />
                        Services ({services.length})
                      </span>
                    </button>
                  </div>
                </div>

                {/* Jobs Tab Content */}
                {activeTab === "jobs" && (
                  <div>
                    {jobs.length > 0 ? (
                      <div className="space-y-4">
                        {jobs.map((job) => (
                          <Link key={job._id} href={`/jobs/${job.slug || job._id}`}>
                            <div className="group p-5 border border-gray-100 rounded-xl hover:border-amber-300 hover:bg-amber-50/50 transition-all duration-300">
                              <div className="flex flex-col gap-3">
                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-amber-600 transition-colors">
                                  {job.title}
                                </h3>
                                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <MapPin size={14} /> {job.location}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <DollarSign size={14} /> {job.salary}
                                  </span>
                                  <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded">
                                    {job.type?.replace("_", " ").toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1 text-xs text-gray-400">
                                    <Clock size={12} />
                                    Posted {new Date(job.createdAt).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center text-amber-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                                    View Job <ChevronRight size={18} />
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <Briefcase size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">
                          No active job postings at the moment.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ✅ Services Tab Content */}
                {activeTab === "services" && (
                  <div>
                    {services.length > 0 ? (
                      <div className="space-y-4">
                        {services.map((service) => (
                          <Link
                            key={service._id}
                            href={`/marketplace/tasks/${service._id}`}
                          >
                            <div className="group p-5 border border-purple-100 rounded-xl hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-300">
                              <div className="flex flex-col gap-3">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors flex-1">
                                    {service.title}
                                  </h3>
                                  <span className="text-xl font-black text-purple-600 flex-shrink-0">
                                    ${service.budget}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {service.description}
                                </p>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex flex-wrap gap-2">
                                    <span className="text-xs font-semibold bg-purple-100 text-purple-600 px-2 py-1 rounded">
                                      {service.category?.replace("_", " ")}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                      <Clock size={12} />
                                      {service.deliveryTime} days delivery
                                    </span>
                                    <span
                                      className={`text-xs font-semibold px-2 py-1 rounded ${
                                        service.status === "active"
                                          ? "bg-green-100 text-green-600"
                                          : "bg-gray-100 text-gray-600"
                                      }`}
                                    >
                                      {service.status}
                                    </span>
                                  </div>
                                  <span className="flex items-center text-purple-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                                    View Service <ChevronRight size={18} />
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-purple-50 rounded-xl border border-dashed border-purple-200">
                        <Sparkles size={40} className="mx-auto text-purple-300 mb-3" />
                        <p className="text-gray-500">
                          This company hasn't posted any marketplace services yet.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Company Details</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3">
                    <Mail className="text-amber-500" size={16} />
                    <span className="text-gray-600 break-all">{company.email}</span>
                  </div>
                  {company.phone && (
                    <div className="flex items-center gap-3">
                      <Users className="text-amber-500" size={16} />
                      <span className="text-gray-600">{company.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
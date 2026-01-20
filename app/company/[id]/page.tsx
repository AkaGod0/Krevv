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
  Calendar
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

export default function CompanyProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={48} /></div>;
  if (error || !company) return <div className="h-screen flex items-center justify-center text-gray-600">{error || "Company not found"}</div>;

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
                <img src={company.logo} alt={company.companyName} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="w-full h-full bg-amber-50 flex items-center justify-center rounded-xl">
                  <Building2 size={48} className="text-amber-500" />
                </div>
              )}
            </div>
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                {company.companyName}
                {company.isVerified !== false && <ShieldCheck className="text-blue-500" size={24} />}
              </h1>
              <div className="flex flex-wrap gap-4 mt-2 text-gray-600">
                <span className="flex items-center gap-1"><MapPin size={18} /> {company.location}</span>
                <span className="flex items-center gap-1"><Briefcase size={18} /> {company.industry}</span>
                {company.website && (
                  <a
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
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

              {/* Jobs Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Briefcase className="text-amber-500" /> Open Positions
                  </h2>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-bold">
                    {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'}
                  </span>
                </div>

                {jobs.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <Link key={job._id} href={`/jobs/${job.slug || job._id}`}>
                        <div className="group p-5 border border-gray-100 rounded-xl hover:border-amber-300 hover:bg-amber-50/50 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-amber-600 transition-colors mb-2">
                              {job.title}
                            </h3>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin size={14} /> {job.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign size={14} /> {job.salary}
                              </span>
                              <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded">
                                {job.type?.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                              <Clock size={12} />
                              Posted {new Date(job.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center text-amber-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                            View Job <ChevronRight size={18} />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Briefcase size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No active job postings at the moment.</p>
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
                    <span className="text-gray-600">{company.email}</span>
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
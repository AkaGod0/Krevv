"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ArrowLeft,
  Loader2,
  Briefcase,
  Globe,
  Award,
  Clock,
  UserCheck,
  ChevronRight,
  DollarSign,
  Building2,
  Sparkles,
  Package,
  Star,
  TrendingUp,
} from "lucide-react";
import axios from "axios";
import Link from "next/link";

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

interface UserProfile {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  company?: string;
  position?: string;
  website?: string;
  bio?: string;
  profileImage?: string;
  skills?: string[];
  isActive?: boolean;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UserProfileWithJobsPage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [services, setServices] = useState<MarketplaceService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"jobs" | "services">("jobs");

  useEffect(() => {
    const fetchProfileAndJobs = async () => {
      try {
        setLoading(true);
        // Fetch User Profile
        const profileRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/${params.id}`
        );

        setProfile(profileRes.data);

        // Fetch Jobs posted by this User
        try {
          const jobsRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/jobs/user/${params.id}/jobs`
          );

          setJobs(jobsRes.data || []);
        } catch (jobErr) {
          console.log("Could not fetch user's jobs:", jobErr);
          setJobs([]);
        }

        // ✅ NEW: Fetch Marketplace Services posted by this User
        try {
          const servicesRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/marketplace/user/${params.id}/services`
          );

          setServices(servicesRes.data || []);
        } catch (serviceErr) {
          console.log("Could not fetch user's marketplace services:", serviceErr);
          setServices([]);
        }
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProfileAndJobs();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-red-600" size={32} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            Profile Not Found
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            {error || "This user profile doesn't exist"}
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ✅ Handle different name formats
  const displayName =
    profile.name ||
    (profile.firstName && profile.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : profile.firstName || profile.lastName || "User");

  const initials = displayName?.charAt(0)?.toUpperCase() || "U";

  const fullAddress = [
    profile.address,
    profile.city,
    profile.state,
    profile.zipCode,
    profile.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 sm:mb-6 transition text-sm sm:text-base"
        >
          <ArrowLeft size={20} />
          Back
        </motion.button>

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-white mb-4 sm:mb-6 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center">
                    <span className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold">
                      {initials}
                    </span>
                  </div>
                )}
              </div>
              {profile.isActive && (
                <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-4 border-white"></div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 break-words">
                {displayName}
              </h1>
              {profile.position && profile.company && (
                <p className="text-sm sm:text-base text-blue-100 flex items-center justify-center sm:justify-start gap-2 mb-3 flex-wrap">
                  <Briefcase size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="break-words">{profile.position} at {profile.company}</span>
                </p>
              )}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {profile.isVerified && (
                  <span className="px-3 py-1 bg-green-500/90 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
                    <UserCheck size={14} />
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                <User size={20} className="sm:w-6 sm:h-6 text-blue-600" />
                Contact Information
              </h2>

              <div className="space-y-3 sm:space-y-4">
                {/* Email */}
                {profile.email && (
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="text-blue-600" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">
                        Email Address
                      </p>
                      <p className="text-sm sm:text-base text-gray-800 font-semibold break-all">
                        {profile.email}
                      </p>
                    </div>
                  </div>
                )}

                {/* Phone */}
                {profile.phone && (
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="text-green-600" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">
                        Phone Number
                      </p>
                      <p className="text-sm sm:text-base text-gray-800 font-semibold">
                        {profile.phone}
                      </p>
                    </div>
                  </div>
                )}

                {/* Address */}
                {fullAddress && (
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-purple-600" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">
                        Address
                      </p>
                      <p className="text-sm sm:text-base text-gray-800 font-semibold break-words">
                        {fullAddress}
                      </p>
                    </div>
                  </div>
                )}

                {/* Website */}
                {profile.website && (
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Globe className="text-indigo-600" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">
                        Website
                      </p>
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm sm:text-base text-blue-600 hover:text-blue-700 font-semibold hover:underline break-all"
                      >
                        {profile.website}
                      </a>
                    </div>
                  </div>
                )}

                {/* Company & Position */}
                {(profile.company || profile.position) && (
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="text-orange-600" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">
                        Employment
                      </p>
                      <p className="text-sm sm:text-base text-gray-800 font-semibold break-words">
                        {profile.position}
                        {profile.position && profile.company && " at "}
                        {profile.company}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* ✅ Jobs & Services Tabs Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
            >
              {/* Tab Navigation */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  Listings
                </h2>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setActiveTab("jobs")}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      activeTab === "jobs"
                        ? "bg-blue-600 text-white shadow-md"
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
                    <div className="space-y-3 sm:space-y-4">
                      {jobs.map((job) => (
                        <Link key={job._id} href={`/jobs/${job.slug || job._id}`}>
                          <div className="group p-4 sm:p-5 border border-gray-100 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300">
                            <div className="flex flex-col gap-3">
                              <h3 className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors break-words">
                                {job.title}
                              </h3>
                              <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                                {job.company && (
                                  <span className="flex items-center gap-1">
                                    <Building2 size={14} className="flex-shrink-0" />
                                    <span className="break-words">{job.company}</span>
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <MapPin size={14} className="flex-shrink-0" />
                                  <span className="break-words">{job.location}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign size={14} className="flex-shrink-0" />
                                  <span className="break-words">{job.salary}</span>
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                {job.category && (
                                  <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    {job.category}
                                  </span>
                                )}
                                <span className="text-xs font-semibold bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                  {job.type?.replace("_", " ").toUpperCase()}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                                  <Clock size={12} />
                                  {new Date(job.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <Briefcase size={32} className="sm:w-10 sm:h-10 mx-auto text-gray-300 mb-3" />
                      <p className="text-sm sm:text-base text-gray-500">
                        This user hasn't posted any jobs yet.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ✅ Services Tab Content */}
              {activeTab === "services" && (
                <div>
                  {services.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {services.map((service) => (
                        <Link key={service._id} href={`/marketplace/tasks/${service._id}`}>
                          <div className="group p-4 sm:p-5 border border-purple-100 rounded-xl hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-300">
                            <div className="flex flex-col gap-3">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors break-words flex-1">
                                  {service.title}
                                </h3>
                                <span className="text-lg sm:text-xl font-black text-purple-600 flex-shrink-0">
                                  ${service.budget}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 break-words">
                                {service.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold bg-purple-100 text-purple-600 px-2 py-1 rounded">
                                  {service.category?.replace("_", " ")}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock size={12} />
                                  {service.deliveryTime} days delivery
                                </span>
                                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                  service.status === "active"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-gray-100 text-gray-600"
                                }`}>
                                  {service.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12 bg-purple-50 rounded-xl border border-dashed border-purple-200">
                      <Sparkles size={32} className="sm:w-10 sm:h-10 mx-auto text-purple-300 mb-3" />
                      <p className="text-sm sm:text-base text-gray-500">
                        This user hasn't posted any marketplace services yet.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-4 sm:space-y-6">
            {/* Account Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                <Clock size={20} className="sm:w-6 sm:h-6 text-blue-600" />
                Account Details
              </h2>

              <div className="space-y-3 sm:space-y-4">
                {/* Verification Status */}
                {profile.isVerified !== undefined && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium mb-2">
                      Verification
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          profile.isVerified ? "bg-blue-500" : "bg-gray-400"
                        }`}
                      ></div>
                      <span
                        className={`text-sm font-semibold ${
                          profile.isVerified ? "text-blue-600" : "text-gray-600"
                        }`}
                      >
                        {profile.isVerified ? "Verified" : "Not Verified"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Member Since */}
                {profile.createdAt && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium mb-2 flex items-center gap-1">
                      <Calendar size={14} />
                      Member Since
                    </p>
                    <p className="text-sm sm:text-base text-gray-800 font-semibold">
                      {new Date(profile.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}

                {/* Last Updated */}
                {profile.updatedAt && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium mb-2 flex items-center gap-1">
                      <Calendar size={14} />
                      Last Updated
                    </p>
                    <p className="text-sm sm:text-base text-gray-800 font-semibold">
                      {new Date(profile.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Skills Sidebar Section */}
            {profile.skills && profile.skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Award size={20} className="sm:w-6 sm:h-6 text-blue-600" />
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium shadow-sm text-xs sm:text-sm break-words"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Bio Section */}
        {profile.bio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 sm:mt-6 bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User size={20} className="sm:w-6 sm:h-6 text-blue-600" />
              About
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                {profile.bio}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
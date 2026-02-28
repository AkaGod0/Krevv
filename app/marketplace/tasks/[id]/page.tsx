"use client";
import { useEffect, useState } from "react";
import { api, useAuth } from "../../../context/AuthContext";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  DollarSign,
  MessageCircle,
  ShoppingCart,
  Shield,
  MapPin,
  FileText,
  ExternalLink,
  Building2,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ServiceDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [service, setService] = useState<any>(null);
  const [developerProfile, setDeveloperProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [providerType, setProviderType] = useState<"user" | "company">("user");

  useEffect(() => {
    fetchServiceDetails();
  }, [id, user]);

  const fetchServiceDetails = async () => {
    try {
      const res = await api.get(`/marketplace/services/${id}`);
      const serviceData = res.data;
      setService(serviceData);

      if (serviceData.clientId?._id) {
        const profileId = serviceData.clientId._id;
        const role = serviceData.clientId.role;

        try {
          let profilePath =
            role === "company" ? `/company/${profileId}` : `/users/${profileId}`;
          const profileRes = await api.get(profilePath, {
            validateStatus: (status) => status < 500,
          });

          if (profileRes.status === 200) {
            setDeveloperProfile(profileRes.data);
            setProviderType(role === "company" ? "company" : "user");
          } else {
            throw new Error("Profile not found");
          }
        } catch (err: any) {
          try {
            const fallbackPath =
              role === "company" ? `/users/${profileId}` : `/company/${profileId}`;
            const fallbackRes = await api.get(fallbackPath, {
              validateStatus: (status) => status < 500,
            });

            if (fallbackRes.status === 200) {
              setDeveloperProfile(fallbackRes.data);
              setProviderType(role === "company" ? "user" : "company");
            } else {
              setDeveloperProfile(serviceData.clientId);
              setProviderType(role === "company" ? "company" : "user");
            }
          } catch (fallbackErr) {
            setDeveloperProfile(serviceData.clientId);
            setProviderType(role === "company" ? "company" : "user");
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch service:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={40} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Service Not Found
          </h2>
          <Link href="/marketplace">
            <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors">
              Back to Marketplace
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const platformFee = service.budget * 0.05;
  const totalPrice = service.budget + platformFee;

  const profile = developerProfile || service.clientId;
  const displayName =
    profile?.companyName ||
    profile?.company ||
    (profile?.firstName
      ? `${profile.firstName} ${profile.lastName}`
      : "Expert Provider");
  const aboutText = profile?.description || profile?.bio;

  // ✅ Generate profile link based on provider type
  const profileId = profile?._id || service.clientId?._id;
  const profileLink =
    providerType === "company" ? `/company/${profileId}` : `/profile/${profileId}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-200 hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft
              size={20}
              className="mr-2 group-hover:-translate-x-1 transition-transform"
            />
            Back to Marketplace
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-xl relative overflow-hidden"
            >
              <h1 className="text-3xl font-black text-slate-900 mb-4 leading-tight">
                {service.title}
              </h1>
              <div className="prose max-w-none">
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  Description
                </h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {service.description}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-xl relative overflow-hidden"
            >
              <div className="prose max-w-none">
                <h3 className="text-lg font-bold text-slate-800 mb-3">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(service.requiredSkills)
                    ? service.requiredSkills
                    : service.requiredSkills?.split(",").map((s: string) => s.trim())
                  )
                    ?.filter(Boolean)
                    .map((skill: string, i: number) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-semibold hover:bg-blue-100 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                        {skill}
                      </span>
                    ))}
                </div>
              </div>
            </motion.div>

            {/* ✅ Updated: Clickable Provider Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-xl"
            >
              <h3 className="text-lg font-bold text-slate-800 mb-6">
                About the Provider
              </h3>

              {/* ✅ Clickable Provider Info */}
              <Link href={profileLink}>
                <div className="flex items-start gap-4 mb-6 p-4 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group border-2 border-transparent hover:border-blue-200">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold uppercase shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                    {displayName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                        {displayName}
                      </p>
                      <ExternalLink
                        size={18}
                        className="text-slate-400 group-hover:text-blue-600 transition-colors"
                      />
                    </div>
                    {providerType === "company" ? (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                          <Building2 size={12} />
                          COMPANY
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                          <User size={12} />
                          INDIVIDUAL
                        </span>
                      </div>
                    )}
                    {profile?.location && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin size={14} />
                        <span>{profile.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>

              {aboutText && (
                <div className="mt-4 mb-4">
                  <p className="text-slate-600 leading-relaxed">{aboutText}</p>
                </div>
              )}

              {/* ✅ View Full Profile Button */}
              <Link href={profileLink}>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all group">
                  <span>View Full Profile</span>
                  <ExternalLink
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </Link>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-4 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-slate-100"
              >
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600">Service Price</span>
                    <div className="flex items-center gap-1">
                      <DollarSign size={24} className="text-green-600" />
                      <span className="text-3xl font-black text-gray-900">
                        {service.budget}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Platform Fee (5%)</span>
                    <span className="font-bold">+${platformFee.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                    <span>Delivery Time</span>
                    <span className="font-bold">{service.deliveryTime} days</span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between">
                    <span className="font-bold text-gray-900">Total Price</span>
                    <span className="text-2xl font-black text-gray-900">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link href={`/marketplace/tasks/${id}/checkout`}>
                    <button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black rounded-2xl shadow-xl transition-all text-lg">
                      <ShoppingCart size={20} />
                      Buy Now
                    </button>
                  </Link>
                  <Link href={`/marketplace/chat/${id}`}>
                    <button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all">
                      <MessageCircle size={20} />
                      Chat with Provider
                    </button>
                  </Link>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Shield size={16} className="text-green-600" />
                    <span>Secure escrow payment</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
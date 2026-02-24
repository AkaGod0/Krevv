"use client";
import { useEffect, useState } from "react";
import { api, useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  Briefcase,
  DollarSign,
  Search,
  Clock,
  Sparkles,
  TrendingUp,
  Users,
  MessageCircle,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface Service {
  _id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  status: string;
  applicationsCount: number;
  deadline?: string;
  requiredSkills: string[];
  deliveryTime?: number;
  features?: string[];
  clientId: {
    _id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
  };
  clientType?: string;
  clientModel?: 'User' | 'Company';
}

export default function Marketplace() {
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 10;
  const { user } = useAuth();

  const categories = [
    { id: "all", name: "All Services", icon: Sparkles },
    { id: "bug_fix", name: "Bug Fixes", icon: Briefcase },
    { id: "feature_development", name: "Features", icon: TrendingUp },
    { id: "code_review", name: "Code Review", icon: Users },
    { id: "consulting", name: "Consulting", icon: Briefcase },
    { id: "design", name: "Design", icon: Sparkles },
    { id: "other", name: "Other", icon: Briefcase },
  ];

  useEffect(() => {
    fetchServices();
  }, [user]);

  const fetchServices = async () => {
    try {
      const res = await api.get("/marketplace/services");
      setServices(res.data);
    } catch (err) {
      console.error("Failed to fetch services:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      bug_fix: "bg-red-50 text-red-600 border-red-100",
      feature_development: "bg-blue-50 text-blue-600 border-blue-100",
      code_review: "bg-purple-50 text-purple-600 border-purple-100",
      consulting: "bg-green-50 text-green-600 border-green-100",
      design: "bg-pink-50 text-pink-600 border-pink-100",
      other: "bg-gray-50 text-gray-600 border-gray-100",
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Service Marketplace
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Browse professional developer services and pre-built solutions
            </p>
          </motion.div>

          <motion.div className="relative max-w-2xl mx-auto mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Category Filter */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? "bg-slate-900 text-white shadow-lg"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Icon size={16} />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 animate-pulse h-64"></div>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-bold text-slate-700">No services found</h3>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              {currentServices.map((service) => (
                <motion.div
                  key={service._id}
                  className="bg-white rounded-3xl border-2 border-slate-100 hover:border-blue-200 hover:shadow-xl shadow-lg overflow-hidden transition-all relative"
                >
                  <div className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getCategoryColor(service.category)}`}>
                        {service.category.replace("_", " ").toUpperCase()}
                      </span>
                      <div className="flex items-center text-green-600 font-bold text-xl">
                        <DollarSign size={20} />
                        <span>{service.budget}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
                      {service.title}
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                      {service.description}
                    </p>

                    {service.deliveryTime && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={14} />
                        <span className="font-semibold">{service.deliveryTime} days delivery</span>
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-slate-500 font-medium">Offered by</p>
                      <p className="text-sm font-bold text-slate-700">
                        {service.clientId?.companyName && service.clientId.companyName.trim() !== ""
                          ? service.clientId.companyName 
                          : service.clientId?.firstName 
                            ? `${service.clientId.firstName} ${service.clientId.lastName}` 
                            : "Expert Developer"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link href={`/marketplace/chat/${service._id}`}>
                        <button className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-all">
                          <MessageCircle size={14} />
                          Chat
                        </button>
                      </Link>
                      <Link href={`/marketplace/tasks/${service._id}`}>
                        <button className="flex items-center gap-1 px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-xl text-xs transition-all">
                          <ShoppingCart size={14} />
                          Buy Service
                        </button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-lg font-bold ${
                        currentPage === i + 1 ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, MapPin, Globe, Briefcase, ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { api } from "../app/context/AuthContext";

interface CompanyProfileCardProps {
  companyId: string;
  children: React.ReactNode;
}

export default function CompanyPostCard({ companyId, children }: CompanyProfileCardProps) {
  const [showCard, setShowCard] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // LOG EVERY RENDER


  useEffect(() => {
    // LOG EVERY TIME HOVER CHANGES


    if (showCard && !company && companyId) {
     
      setLoading(true);
      api.get(`/company/${companyId}`)
        .then((res) => {
         
          setCompany(res.data);
        })
        .catch((err) => console.error("❌ Request failed:", err))
        .finally(() => setLoading(false));
    } else if (showCard) {
      // THIS WILL TELL US WHY THE IF-STATEMENT FAILED
      console.log("🚫 Request blocked because:", {
        hasNoCompany: !company,
        hasId: !!companyId
      });
    }
  }, [showCard, companyId, company]);

  return (
    <div className="relative inline-block" onMouseEnter={() => setShowCard(true)} onMouseLeave={() => setShowCard(false)}>
      {children}
      <AnimatePresence>
        {showCard && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-0 mb-3 w-72 bg-white rounded-xl shadow-2xl border border-amber-100 z-[100] overflow-hidden"
          >
            {loading ? (
              <div className="p-6 flex justify-center"><Briefcase className="animate-bounce text-amber-500" /></div>
            ) : company ? (
              <div className="flex flex-col">
                <div className="h-16 bg-gradient-to-r from-amber-400 to-orange-500" />
                <div className="px-4 pb-4 -mt-8">
                  <div className="bg-white p-1 rounded-lg shadow-md w-16 h-16 mb-2 border border-gray-100">
                    {company.logo ? (
                      <img src={company.logo} alt={company.companyName} className="w-full h-full object-cover rounded-md" />
                    ) : (
                      <div className="w-full h-full bg-amber-50 flex items-center justify-center rounded-md">
                        <Building2 className="text-amber-500" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-1">
                    {company.companyName}
                    <ShieldCheck size={16} className="text-blue-500" />
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">{company.industry || "Technology & Services"}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <MapPin size={14} className="text-amber-500" />
                      {company.location || "Remote / Global"}
                    </div>
                    {company.website && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Globe size={14} className="text-amber-500" />
                        <span className="truncate">{company.website.replace(/^https?:\/\//, '')}</span>
                      </div>
                    )}
                  </div>

                  <Link href={`/company/${companyId}`} className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                    View Company Profile <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-4 text-xs text-gray-500">Company details unavailable</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
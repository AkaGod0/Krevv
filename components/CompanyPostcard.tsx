// components/CompanyProfileCard.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ExternalLink, Building } from "lucide-react";

export default function CompanyProfileCard({ companyId, companyName, children }: any) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-[100] bottom-full mb-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Building className="text-amber-600" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">{companyName}</h4>
                <p className="text-xs text-gray-500">Verified Employer</p>
              </div>
            </div>
            
            <Link href={`/companies/${companyId}`}>
              <button className="w-full bg-gray-900 text-white text-xs font-semibold py-2 rounded-md hover:bg-amber-600 transition-colors flex items-center justify-center gap-2">
                View Company Profile
                <ExternalLink size={14} />
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
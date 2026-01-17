"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/app/context/AuthContext";
import { Building2, MapPin, Globe, Mail, Info, Briefcase, Users, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CompanyProfilePage() {
  const { id } = useParams();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`${process.env.NEXT_PUBLIC_API_URL}/company/${id}`)
      .then(res => setCompany(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" /></div>;
  if (!company) return <div className="h-screen flex items-center justify-center">Company not found</div>;

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="h-48 md:h-64 bg-gradient-to-r from-amber-500 to-orange-600" />
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div className="relative -mt-16 bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-8">
            <div className="bg-white p-2 rounded-2xl shadow-lg border w-32 h-32 flex-shrink-0">
              {company.logo ? (
                <img src={company.logo} alt={company.companyName} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="w-full h-full bg-amber-50 flex items-center justify-center rounded-xl"><Building2 size={48} className="text-amber-500" /></div>
              )}
            </div>
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                {company.companyName}
                <ShieldCheck className="text-blue-500" size={24} />
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
            <div className="md:col-span-2 space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Info className="text-amber-500" /> About Company</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{company.description || "No description provided."}</p>
              </section>
            </div>
            
            <div className="space-y-6">
              <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                <h3 className="font-bold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4 text-sm">
                   <div className="flex items-center gap-3"><Mail className="text-amber-500" size={16} /> {company.email}</div>
                   {company.phone && <div className="flex items-center gap-3"><Users className="text-amber-500" size={16} /> {company.phone}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, ShieldCheck, ShieldAlert, Trash2, Ban, 
  Search, Loader2, CheckCircle, MapPin, Unlock, AlertTriangle, Globe
} from "lucide-react";
import { adminApi } from "../context/AdminContext";

export default function ManageCompanies() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  
  const [deleteModal, setDeleteModal] = useState<{show: boolean, id: string | null, name: string}>({
    show: false,
    id: null,
    name: ""
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      console.log("[ManageCompanies] Fetching companies...");
      const res = await adminApi.get("/admin/companies");
      console.log("[ManageCompanies] Companies fetched:", res.data);
      setCompanies(res.data.data || res.data || []);
    } catch (error: any) {
      console.error("[ManageCompanies] Error fetching companies:", error);
      setError(error.response?.data?.message || "Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (id: string, isCurrentlyBlocked: boolean) => {
    setProcessingId(id);
    setError("");
    const endpoint = isCurrentlyBlocked ? "unblock" : "block";
    
    try {
      console.log(`[ManageCompanies] ${endpoint} company:`, id);
      
      await adminApi.patch(`/admin/companies/${id}/${endpoint}`, {
        reason: isCurrentlyBlocked ? "" : "Administrative block contact support for details."
      });
      
      console.log(`[ManageCompanies] ✅ Company ${endpoint}ed successfully`);
      
      setCompanies(companies.map(c => 
        c._id === id ? { ...c, isBlocked: !isCurrentlyBlocked } : c
      ));
    } catch (error: any) {
      console.error(`[ManageCompanies] ❌ ${endpoint} failed:`, error);
      setError(error.response?.data?.message || `Failed to ${endpoint} company`);
    } finally {
      setProcessingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    setProcessingId(deleteModal.id);
    setError("");
    
    try {
      console.log("=== DELETE COMPANY REQUEST ===");
      console.log("Company ID:", deleteModal.id);
      console.log("Company Name:", deleteModal.name);
      console.log("API Base URL:", process.env.NEXT_PUBLIC_API_URL);
      console.log("Full endpoint URL:", `${process.env.NEXT_PUBLIC_API_URL}/admin/companies/${deleteModal.id}`);
      
      // Make DELETE request
      const response = await adminApi.delete(`/admin/companies/${deleteModal.id}`);
      
      console.log("=== DELETE SUCCESS ===");
      console.log("Response:", response.data);
      
      // Remove from local state
      setCompanies(companies.filter(c => c._id !== deleteModal.id));
      setDeleteModal({ show: false, id: null, name: "" });
      
    } catch (error: any) {
      console.error("=== DELETE FAILED ===");
      console.error("Full error object:", error);
      console.error("Response status:", error.response?.status);
      console.error("Response data:", error.response?.data);
      console.error("Response message:", error.response?.data?.message);
      console.error("=== REQUEST DETAILS ===");
      console.error("Request URL:", error.config?.url);
      console.error("Request Method:", error.config?.method);
      console.error("Base URL:", error.config?.baseURL);
      console.error("Full URL:", error.request?.responseURL || `${error.config?.baseURL}${error.config?.url}`);
      console.error("Headers:", error.config?.headers);
      console.error("Authorization:", error.config?.headers?.Authorization);
      
      // Show user-friendly error
      const errorMessage = error.response?.data?.message || 
                          error.response?.statusText || 
                          `Failed to delete company. Status: ${error.response?.status || 'Unknown'}`;
      setError(errorMessage);
      
      // Keep modal open if there's an error so user can see it
    } finally {
      setProcessingId(null);
    }
  };

  // Enhanced Filter: Searches Name, Email, State, Country, and Website
  const filtered = companies.filter(c => {
    const s = searchTerm.toLowerCase();
    return (
      c.companyName?.toLowerCase().includes(s) ||
      c.email?.toLowerCase().includes(s) ||
      c.state?.toLowerCase().includes(s) ||
      c.country?.toLowerCase().includes(s) ||
      c.website?.toLowerCase().includes(s)
    );
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} />
            <span className="font-medium">{error}</span>
          </div>
          <button 
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="text-red-500" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Delete Company?</h3>
                <p className="text-gray-500 mt-2">
                  Are you sure you want to delete <span className="font-semibold text-gray-800">"{deleteModal.name}"</span>? 
                  This will permanently remove all their job postings and data.
                </p>
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 p-4 flex gap-3">
                <button 
                  onClick={() => {
                    setDeleteModal({ show: false, id: null, name: "" });
                    setError("");
                  }}
                  disabled={processingId === deleteModal.id}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={processingId === deleteModal.id}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processingId === deleteModal.id ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Deleting...
                    </>
                  ) : (
                    "Delete Forever"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header with Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Company Management</h1>
          <p className="text-gray-500 text-sm">Review status, block, or remove business accounts</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search name, email, location, or website..."
            className="pl-10 pr-4 py-2 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b text-gray-400 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4">Website</th>
                <th className="px-6 py-4">Access Status</th>
                <th className="px-6 py-4">Headquarters & Country</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {filtered.map((company) => (
                <tr key={company._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 border overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {company.logo ? (
                          <img src={company.logo} alt="logo" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="text-blue-400" size={20} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 truncate">{company.companyName}</p>
                        <p className="text-xs text-gray-400 truncate">{company.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {company.emailVerified ? (
                      <span className="flex items-center gap-1.5 text-blue-600 font-bold text-[10px] bg-blue-50 px-2 py-1 rounded-md w-fit">
                        <ShieldCheck size={14} /> VERIFIED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-amber-600 font-bold text-[10px] bg-amber-50 px-2 py-1 rounded-md w-fit">
                        <ShieldAlert size={14} /> PENDING
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {company.website ? (
                      <a 
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-blue-500 hover:underline text-xs"
                      >
                        <Globe size={14} /> Website
                      </a>
                    ) : (
                      <span className="text-gray-300 italic text-xs">Not added</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase flex items-center gap-1 w-fit ${
                      company.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {company.isBlocked ? <Ban size={12}/> : <CheckCircle size={12}/>}
                      {company.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-gray-500">
                    <div className="flex items-center gap-1 italic text-xs">
                      <MapPin size={12} className="flex-shrink-0" /> 
                      <span className="truncate max-w-[150px]">
                        {company.headquarters || "N/A"}, {company.country || "N/A"}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleToggleBlock(company._id, !!company.isBlocked)}
                        disabled={processingId === company._id}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          company.isBlocked 
                          ? 'bg-red-600 text-white shadow-md' 
                          : 'hover:bg-red-50 text-red-500 border border-transparent hover:border-red-200'
                        }`}
                        title={company.isBlocked ? "Unblock" : "Block"}
                      >
                        {processingId === company._id ? (
                          <Loader2 className="animate-spin" size={18}/>
                        ) : company.isBlocked ? (
                          <Unlock size={18} />
                        ) : (
                          <Ban size={18} />
                        )}
                      </button>

                      <button 
                        onClick={() => setDeleteModal({ show: true, id: company._id, name: company.companyName })}
                        className="p-2 hover:bg-gray-100 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                        title="Delete Permanently"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-10 text-center text-gray-400">
              No companies found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
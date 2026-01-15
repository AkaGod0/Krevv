"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, ShieldCheck, ShieldAlert, Trash2, Ban, 
  Search, Loader2, CheckCircle, XCircle, MoreVertical,
  ExternalLink, Mail, MapPin, Globe, Unlock
} from "lucide-react";
import { adminApi } from "../context/AdminContext"; // Adjust path as needed

export default function ManageCompanies() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await adminApi.get("/admin/companies");
      // Added safety check for nested data
      setCompanies(res.data.data || res.data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (id: string, isCurrentlyBlocked: boolean) => {
    setProcessingId(id);
    // Use the specific block/unblock endpoints we created in the backend
    const endpoint = isCurrentlyBlocked ? "unblock" : "block";
    try {
      await adminApi.patch(`/admin/companies/${id}/${endpoint}`, {
        reason: isCurrentlyBlocked ? "" : "Administrative block"
      });
      
      setCompanies(companies.map(c => 
        c._id === id ? { ...c, isBlocked: !isCurrentlyBlocked } : c
      ));
    } catch (error) {
      console.error("Block/Unblock failed:", error);
      alert(`Failed to ${endpoint} company`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleVerify = async (id: string, currentStatus: boolean) => {
    setProcessingId(id);
    try {
      // General patch for email verification
      await adminApi.patch(`/admin/company/${id}`, { isEmailVerified: !currentStatus });
      setCompanies(companies.map(c => c._id === id ? { ...c, isEmailVerified: !currentStatus } : c));
    } catch (error) {
      alert("Failed to verify company");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this company? All their jobs will be removed permanently.")) return;
    setProcessingId(id);
    try {
      await adminApi.delete(`/admin/company/${id}`);
      setCompanies(companies.filter(c => c._id !== id));
    } catch (error) {
      alert("Delete failed");
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = companies.filter(c => 
    c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Company Management</h1>
          <p className="text-gray-500 text-sm">Verify, block, or remove business accounts</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search companies..."
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
                <th className="px-6 py-4">Access Status</th>
                <th className="px-6 py-4">Location</th>
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
                          <img src={company.logo} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="text-blue-400" size={20} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 truncate">{company.companyName || company.name}</p>
                        <p className="text-xs text-gray-400 truncate">{company.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {company.isEmailVerified ? (
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
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase flex items-center gap-1 w-fit ${
                      company.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {company.isBlocked ? <Ban size={12}/> : <CheckCircle size={12}/>}
                      {company.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-gray-500">
                    <div className="flex items-center gap-1 italic text-xs">
                      <MapPin size={12} /> {company.city || company.location || "N/A"}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleToggleVerify(company._id, company.isEmailVerified)}
                        disabled={processingId === company._id}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        title="Toggle Verification"
                      >
                        <CheckCircle size={18} />
                      </button>
                      
                      <button 
                        onClick={() => handleToggleBlock(company._id, !!company.isBlocked)}
                        disabled={processingId === company._id}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          company.isBlocked 
                          ? 'bg-red-600 text-white shadow-md' 
                          : 'hover:bg-red-50 text-red-500 border border-transparent hover:border-red-200'
                        }`}
                        title={company.isBlocked ? "Click to Unblock" : "Click to Block Login"}
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
                        onClick={() => handleDelete(company._id)}
                        disabled={processingId === company._id}
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
            <div className="p-12 text-center">
              <Building2 className="mx-auto text-gray-200 mb-4" size={48} />
              <p className="text-gray-400 font-medium">No companies matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, api } from "@/app/context/AuthContext";
import {
  Building2, Phone, Edit, Camera, Save, 
  Loader2, CheckCircle, AlertCircle, ChevronLeft, Linkedin, 
  Twitter, FileText, Link as LinkIcon, User, MapPin
} from "lucide-react";

const industries = ["Technology", "Healthcare", "Finance", "Education", "E-commerce", "Marketing", "Consulting", "Other"];

export default function CompanyProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, logout, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState<any>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [toast, setToast] = useState({ show: false, type: "success" as "success" | "error", message: "" });

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // If not authenticated or not a company, redirect
    if (!isAuthenticated || !user?.companyName) {
      router.push("/company/login");
      return;
    }

    fetchProfile();
  }, [authLoading, isAuthenticated, user]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "success", message: "" }), 3000);
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/company/profile");
      setCompany(res.data.data);
      setFormData(res.data.data);
      setLogoPreview(res.data.data.logo);
    } catch (err: any) {
      console.error("Fetch error:", err);
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base = reader.result as string;
        setLogoPreview(base);
        setFormData((prev: any) => ({ ...prev, logo: base }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    // WHITELISTING: Explicitly define only the fields the backend allows
    const dataToSend = {
      companyName: formData.companyName,
      phone: formData.phone,
      website: formData.website,
      industry: formData.industry,
      description: formData.description,
      city: formData.city,
      country: formData.country,
      address: formData.address,
      linkedIn: formData.linkedIn,
      twitter: formData.twitter,
      contactPersonName: formData.contactPersonName,
      contactPersonRole: formData.contactPersonRole,
      foundedYear: formData.foundedYear ? Number(formData.foundedYear) : undefined,
      logo: logoPreview, 
    };

    try {
      const res = await api.put("/company/profile", dataToSend);
      
      setCompany(res.data.data);
      setFormData(res.data.data);
      setIsEditing(false);
      showToast("success", "Profile updated successfully!");
      
      // Refresh user data in AuthContext
      await refreshUser();
    } catch (err: any) {
      console.error("Update Error:", err.response?.data);
      const backendMessage = err.response?.data?.message;
      const displayMsg = Array.isArray(backendMessage) ? backendMessage[0] : backendMessage;
      showToast("error", displayMsg || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Show loading while auth is checking
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-amber-500" size={40} />
      </div>
    );
  }

  // If not authenticated after loading, show loader (redirect will happen)
  if (!isAuthenticated || !user?.companyName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-amber-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-xl shadow-xl text-white flex items-center gap-2 ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
            {toast.type === "success" ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="bg-white border-b sticky top-0 z-30 px-4 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/company/dashboard" className="text-gray-400 hover:text-gray-600"><ChevronLeft/></Link>
            <h1 className="text-xl font-bold text-gray-800">Company Settings</h1>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button onClick={() => { setIsEditing(false); setFormData(company); setLogoPreview(company.logo); }} className="text-gray-500 font-medium">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 transition">
                  {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Save
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="bg-amber-500 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2"><Edit size={18}/> Edit Profile</button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl border-4 border-gray-50 overflow-hidden bg-gray-100 flex items-center justify-center">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Company Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={48} className="text-gray-300" />
                  )}
                </div>
                {isEditing && (
                  <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white">
                    <Camera size={24}/>
                  </button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleLogoChange} className="hidden" accept="image/*" />
              </div>
              <h2 className="mt-4 font-bold text-lg text-gray-800">{company?.companyName}</h2>
              <p className="text-sm text-gray-500">{company?.email}</p>
            </div>

            <nav className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {[
                { id: "basic", label: "General Info", icon: Building2 },
                { id: "details", label: "Company Details", icon: FileText },
                { id: "location", label: "Location", icon: MapPin },
                { id: "social", label: "Social Media", icon: LinkIcon },
                { id: "contact", label: "Contact Person", icon: User },
              ].map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-semibold transition ${activeTab === item.id ? "bg-amber-50 text-amber-600 border-r-4 border-amber-500" : "text-gray-500 hover:bg-gray-50"}`}>
                  <item.icon size={18}/> {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeTab === "basic" && (
                <>
                  <FormInput label="Company Name" value={formData.companyName || ""} isEditing={isEditing} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, companyName: e.target.value})} />
                  <FormInput label="Email" value={company?.email || ""} isEditing={false} />
                  <FormInput label="Phone Number" value={formData.phone || ""} isEditing={isEditing} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, phone: e.target.value})} />
                  <FormInput label="Website URL" value={formData.website || ""} isEditing={isEditing} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, website: e.target.value})} />
                </>
              )}

              {activeTab === "details" && (
                <div className="col-span-2 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">Industry</label>
                        <select disabled={!isEditing} value={formData.industry || ""} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, industry: e.target.value})} className="border p-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-50">
                            <option value="">Select Industry</option>
                            {industries.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                    </div>
                    <FormInput label="Founded Year" type="number" value={formData.foundedYear || ""} isEditing={isEditing} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, foundedYear: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Company Description</label>
                    <textarea rows={5} disabled={!isEditing} value={formData.description || ""} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, description: e.target.value})} className="border p-4 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-50 resize-none" placeholder="Describe your company..."/>
                  </div>
                </div>
              )}

              {activeTab === "location" && (
                <>
                  <FormInput label="City" value={formData.city || ""} isEditing={isEditing} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, city: e.target.value})} />
                  <FormInput label="Country" value={formData.country || ""} isEditing={isEditing} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, country: e.target.value})} />
                  <div className="col-span-2">
                    <FormInput label="Full Address" value={formData.address || ""} isEditing={isEditing} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, address: e.target.value})} />
                  </div>
                </>
              )}

              {activeTab === "social" && (
                <>
                  <FormInput label="LinkedIn" value={formData.linkedIn || ""} isEditing={isEditing} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, linkedIn: e.target.value})} icon={<Linkedin size={16}/>} />
                  <FormInput label="Twitter" value={formData.twitter || ""} isEditing={isEditing} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, twitter: e.target.value})} icon={<Twitter size={16}/>} />
                </>
              )}

              {activeTab === "contact" && (
                <>
                  <FormInput label="Contact Person" value={formData.contactPersonName || ""} isEditing={isEditing} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, contactPersonName: e.target.value})} />
                  <FormInput label="Position" value={formData.contactPersonRole || ""} isEditing={isEditing} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, contactPersonRole: e.target.value})} />
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FormInput({ label, isEditing, icon, ...props }: { 
  label: string; 
  isEditing: boolean; 
  icon?: React.ReactNode; 
  [key: string]: any 
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
        {icon} {label}
      </label>
      <input
        {...props}
        className={`border p-3 rounded-xl outline-none transition-all ${
          isEditing 
            ? "focus:ring-2 focus:ring-amber-500 border-gray-300" 
            : "bg-gray-50 border-transparent text-gray-500 cursor-not-allowed"
        }`}
        disabled={!isEditing}
      />
    </div>
  );
}
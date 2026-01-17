"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../app/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  User,
  LogOut,
  Briefcase,
  FileText,
  Home,
  ChevronDown,
  Phone,
  Info,
  Building2,
} from "lucide-react";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const getDisplayName = () => {
    if (!user) return "";
    // Priority: Company Name > First + Last Name > Default
    return user.companyName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
  };

  const getInitials = () => {
    if (user?.companyName) return user.companyName.charAt(0).toUpperCase();
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-amber-500 rounded-lg p-2"><Briefcase className="text-white" size={24} /></div>
            <span className="text-xl font-bold text-gray-800">Krevv</span>
          </Link>
        </div>
      </nav>
    );
  }

  // ✅ Check if the logged in entity is a company
  const isCompany = !!user?.companyName;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-amber-500 rounded-lg p-2"><Briefcase className="text-white" size={24} /></div>
            <span className="text-xl font-bold text-gray-800">Krevv</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-amber-600 font-medium transition flex items-center gap-2"><Home size={18} /> Home</Link>
            <Link href="/jobs" className="text-gray-700 hover:text-amber-600 font-medium transition flex items-center gap-2"><Briefcase size={18} /> Jobs</Link>
            <Link href="/post" className="text-gray-700 hover:text-amber-600 font-medium transition flex items-center gap-2"><FileText size={18} /> Posts</Link>
            <Link href="/about" className="text-gray-700 hover:text-amber-600 font-medium transition flex items-center gap-2"><Info size={18} /> About</Link>
            <Link href="/contact" className="text-gray-700 hover:text-amber-600 font-medium transition flex items-center gap-2"><Phone size={18} /> Contact</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-lg transition"
                >
                  <div className="bg-amber-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials()}
                  </div>
                  <span className="font-medium text-gray-800">{getDisplayName()}</span>
                  <ChevronDown size={16} className={userMenuOpen ? "rotate-180" : ""} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b">
                        <p className="text-sm font-semibold text-gray-800">{getDisplayName()}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>

                      {/* ✅ LINK: Company Profile or User Profile */}
                      <Link
                        href={isCompany ? "/company/dashboard" : "/profile"}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-amber-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        {isCompany ? <Building2 size={16} /> : <User size={16} />}
                        {isCompany ? "Company Dashboard" : "My Profile"}
                      </Link>

                      {/* ✅ LINK: My Jobs */}
                      <Link
                        href={isCompany ? "/company/jobs" : "/jobs/my-jobs"}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-amber-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Briefcase size={16} />
                        My Jobs
                      </Link>

                      {/* ✅ Only show Applications for non-companies */}
                      {!isCompany && (
                        <Link href="/applications" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-amber-50" onClick={() => setUserMenuOpen(false)}>
                          <FileText size={16} /> My Applications
                        </Link>
                      )}

                      <button onClick={() => { logout(); setUserMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-left">
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/company/login" className="text-sm font-medium text-gray-600">Company Login</Link>
                <Link href="/login" className="px-4 py-2 text-amber-600 font-semibold">Log In</Link>
                <Link href="/signup" className="px-6 py-2 bg-amber-500 text-white font-semibold rounded-lg shadow">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
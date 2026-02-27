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
  LayoutGrid,
  MessageCircle, 
} from "lucide-react";
import { useNotifications } from "../app/hooks/useNotifications"; 

export default function Navbar() {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  //  Get unread message count
  const { unreadCount } = useNotifications(user?._id);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setMobileMenuOpen(false);
      setUserMenuOpen(false);
    };
    
    if (mobileMenuOpen || userMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [mobileMenuOpen, userMenuOpen]);

  const handleMarketplaceClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push("/login?redirect=/marketplace");
    }
  };

  const getDisplayName = () => {
    if (!user) return "";
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-amber-500 rounded-lg p-2">
              <Briefcase className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-gray-800">Krevv</span>
          </Link>
        </div>
      </nav>
    );
  }

  const isCompany = !!user?.companyName;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-amber-500 rounded-lg p-2">
              <Briefcase className="text-white" size={20} />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-800">Krevv</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-amber-600 font-medium transition flex items-center gap-2">
              <Home size={18} /> Home
            </Link>
            
            <Link 
              href="/marketplace" 
              onClick={handleMarketplaceClick}
              className="text-gray-700 hover:text-amber-600 font-medium transition flex items-center gap-2"
            >
              <LayoutGrid size={18} /> Marketplace
            </Link>

            <Link href="/jobs" className="text-gray-700 hover:text-amber-600 font-medium transition flex items-center gap-2">
              <Briefcase size={18} /> Jobs
            </Link>

    

            <Link href="/post" className="text-gray-700 hover:text-amber-600 font-medium transition flex items-center gap-2">
              <FileText size={18} /> Posts
            </Link>
            
            <Link href="/about" className="text-gray-700 hover:text-amber-600 font-medium transition flex items-center gap-2">
              <Info size={18} /> About
            </Link>
            
            <Link href="/contact" className="text-gray-700 hover:text-amber-600 font-medium transition flex items-center gap-2">
              <Phone size={18} /> Contact
            </Link>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-lg transition"
                >
                  <div className="bg-amber-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials()}
                  </div>
                  <span className="font-medium text-gray-800 max-w-[150px] truncate">
                    {getDisplayName()}
                  </span>
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} 
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-4 py-3 border-b">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {getDisplayName()}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>

                      <Link
                        href={isCompany ? "/company/dashboard" : "/profile"}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-amber-50 transition"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        {isCompany ? <Building2 size={16} /> : <User size={16} />}
                        {isCompany ? "Company Dashboard" : "My Profile"}
                      </Link>

                      <Link
                        href={isCompany ? "/company/jobs" : "/jobs/my-jobs"}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-amber-50 transition"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Briefcase size={16} />
                        My Jobs
                      </Link>

                      {/* ✅ Chat Link in Dropdown Menu */}
                      <Link
                        href="/marketplace/chat/chat-list"
                        className="relative flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-amber-50 transition"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <MessageCircle size={16} /> 
                        My Chats
                        {unreadCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                            {unreadCount}
                          </span>
                        )}
                      </Link>

                      {!isCompany && (
                        <Link
                          href="/applications"
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-amber-50 transition"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <FileText size={16} /> My Applications
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-left transition"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  href="/company/login" 
                  className="text-sm font-medium text-gray-600 hover:text-amber-600 transition"
                >
                  Company Login
                </Link>
                <Link 
                  href="/login" 
                  className="px-4 py-2 text-amber-600 font-semibold hover:text-amber-700 transition"
                >
                  Log In
                </Link>
                <Link 
                  href="/signup" 
                  className="px-4 sm:px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-200 bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-4 space-y-3">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-amber-50 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home size={20} />
                <span className="font-medium">Home</span>
              </Link>

              <Link
                href="/marketplace"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-amber-50 rounded-lg transition"
                onClick={(e) => {
                  handleMarketplaceClick(e);
                  setMobileMenuOpen(false);
                }}
              >
                <LayoutGrid size={20} />
                <span className="font-medium">Marketplace</span>
              </Link>

              <Link
                href="/jobs"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-amber-50 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Briefcase size={20} />
                <span className="font-medium">Jobs</span>
              </Link>

              {/* ✅ Chat Link with Badge - Mobile */}
              {user && (
                <Link
                  href="/marketplace/chat/chat-list"
                  className="relative flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-amber-50 rounded-lg transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MessageCircle size={20} />
                  <span className="font-medium">Chats</span>
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </Link>
              )}

              <Link
                href="/post"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-amber-50 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FileText size={20} />
                <span className="font-medium">Posts</span>
              </Link>

              <Link
                href="/about"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-amber-50 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Info size={20} />
                <span className="font-medium">About</span>
              </Link>

              <Link
                href="/contact"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-amber-50 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Phone size={20} />
                <span className="font-medium">Contact</span>
              </Link>

              {/* Mobile User Section */}
              {user ? (
                <>
                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <div className="flex items-center gap-3 px-4 py-2 mb-3">
                      <div className="bg-amber-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-semibold">
                        {getInitials()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {getDisplayName()}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>

                    <Link
                      href={isCompany ? "/company/dashboard" : "/profile"}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-amber-50 rounded-lg transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {isCompany ? <Building2 size={20} /> : <User size={20} />}
                      <span className="font-medium">
                        {isCompany ? "Company Dashboard" : "My Profile"}
                      </span>
                    </Link>

                    <Link
                      href={isCompany ? "/company/jobs" : "/jobs/my-jobs"}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-amber-50 rounded-lg transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Briefcase size={20} />
                      <span className="font-medium">My Jobs</span>
                    </Link>

                    {!isCompany && (
                      <Link
                        href="/applications"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-amber-50 rounded-lg transition"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FileText size={20} />
                        <span className="font-medium">My Applications</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition text-left"
                    >
                      <LogOut size={20} />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="pt-3 mt-3 border-t border-gray-200 space-y-3">
                  <Link
                    href="/company/login"
                    className="block px-4 py-3 text-center text-gray-700 hover:bg-amber-50 rounded-lg font-medium transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Company Login
                  </Link>
                  <Link
                    href="/login"
                    className="block px-4 py-3 text-center text-amber-600 hover:bg-amber-50 rounded-lg font-semibold transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="block px-4 py-3 text-center bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
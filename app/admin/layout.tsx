"use client";

import Link from "next/link";
import { LogOut, Menu, X, Shield, LayoutDashboard, Users, Briefcase, UserCog, Settings, Podcast, MagnetIcon, Magnet, CreativeCommons } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdmin } from "./context/AdminContext"; // ✅ Correct

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { admin, logout, loading } = useAdmin();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated (except on login page)
    if (!loading && !admin && !pathname.includes("/admin/login")) {
      router.push("/admin/login");
    }
  }, [admin, loading, pathname, router]);

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't show navbar on login page
  const isLoginPage = pathname === "/admin/login";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {admin && !isLoginPage && (
        <nav className="bg-gray-950 shadow-md border-b border-gray-800 sticky top-0 z-50">
          <div className="container mx-auto flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-2">
                <Shield size={24} />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-400 to-blue-400 text-transparent bg-clip-text">
                Admin Dashboard
              </h1>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6 text-lg">
              <Link 
                href="/admin" 
                className={`hover:text-pink-400 transition flex items-center gap-2 ${pathname === '/admin' ? 'text-pink-400' : ''}`}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <Link 
                href="/admin/users" 
                className={`hover:text-blue-400 transition flex items-center gap-2 ${pathname === '/admin/users' ? 'text-blue-400' : ''}`}
              >
                <Users size={18} />
                Users
              </Link>
              <Link 
                href="/admin/create" 
                className={`hover:text-blue-400 transition flex items-center gap-2 ${pathname === '/admin/users' ? 'text-blue-400' : ''}`}
              >
                <Podcast size={18} />
                Create
              </Link>
             <Link 
                href="/admin/manage" 
                className={`hover:text-blue-400 transition flex items-center gap-2 ${pathname === '/admin/users' ? 'text-blue-400' : ''}`}
              >
                <MagnetIcon size={18} />
                Manage
              </Link>

              <Link 
                href="/admin/jobs" 
                className={`hover:text-green-400 transition flex items-center gap-2 ${pathname === '/admin/jobs' ? 'text-green-400' : ''}`}
              >
                <Briefcase size={18} />
                Jobs
              </Link>
              <Link 
                href="/admin/profile" 
                className={`hover:text-purple-400 transition flex items-center gap-2 ${pathname === '/admin/profile' ? 'text-purple-400' : ''}`}
              >
                <UserCog size={18} />
                Profile
              </Link>
              <Link 
                href="/admin/jobagree" 
                className={`hover:text-yellow-400 transition flex items-center gap-2 ${pathname === '/admin/maintenance' ? 'text-yellow-400' : ''}`}
              >
                <Settings size={18} />
             Fetchjobs
              </Link>
              
              {/* Admin Info */}
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-lg">
                <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-xs">
                  {admin.profileImage ? (
                    <img
                      src={admin.profileImage}
                      alt={admin.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="font-bold">
                      {admin.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-sm">
                  {admin.firstName && admin.lastName
                    ? `${admin.firstName} ${admin.lastName}`
                    : admin.username}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-300"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle Menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Dropdown */}
          {isOpen && (
            <div className="md:hidden bg-gray-950 border-t border-gray-800">
              <div className="flex flex-col items-start px-6 py-4 space-y-3 text-gray-200 text-lg">
                {/* Admin Info Mobile */}
                <div className="flex items-center gap-3 w-full pb-3 border-b border-gray-800">
                  <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center">
                    {admin.profileImage ? (
                      <img
                        src={admin.profileImage}
                        alt={admin.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="font-bold">
                        {admin.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {admin.firstName && admin.lastName
                        ? `${admin.firstName} ${admin.lastName}`
                        : admin.username}
                    </p>
                    <p className="text-xs text-gray-400">Administrator</p>
                  </div>
                </div>

                <Link href="/admin" className="w-full hover:text-pink-400 flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
                <Link href="/admin/users" className="w-full hover:text-blue-400 flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <Users size={18} /> Users
                </Link>
                 <Link href="/admin/create" className="w-full hover:text-blue-400 flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <CreativeCommons size={18} /> Create
                </Link>
                 <Link href="/admin/manage" className="w-full hover:text-blue-400 flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <Magnet size={18} /> Manage
                </Link>
                <Link href="/admin/jobs" className="w-full hover:text-green-400 flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <Briefcase size={18} /> Jobs
                </Link>
                <Link href="/admin/profile" className="w-full hover:text-purple-400 flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <UserCog size={18} /> Profile
                </Link>
                <Link href="/admin/jobagree" className="w-full hover:text-yellow-400 flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <Settings size={18} /> Fetchjobs
                </Link>
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg w-full justify-center mt-2"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </div>
          )}
        </nav>
      )}

      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
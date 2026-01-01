"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, LogIn, AlertCircle, XCircle, Info, X, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState<"blocked" | "unverified" | "invalid" | null>(null);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setErrorType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrorType(null);
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      
      // Check if there's a redirect URL
      const redirectUrl = sessionStorage.getItem("redirectAfterLogin");
      if (redirectUrl) {
        sessionStorage.removeItem("redirectAfterLogin");
        router.push(redirectUrl);
      } else {
        router.push("/jobs");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Invalid email or password";
      setError(errorMessage);

      // ✅ Handle different error types WITHOUT console.error for expected errors
      if (errorMessage.toLowerCase().includes("blocked")) {
        setErrorType("blocked");
        
        // Extract block reason from error message
        const reasonMatch = errorMessage.match(/Reason: (.+?)(?:\. Please contact|\.| $)/);
        const reason = reasonMatch ? reasonMatch[1].trim() : "No reason provided";
        setBlockReason(reason);
        
        // Show blocked modal - no console.error needed
        setShowBlockedModal(true);
        
      } else if (errorMessage.toLowerCase().includes("verify") || errorMessage.toLowerCase().includes("verification")) {
        setErrorType("unverified");
        // Email not verified - expected behavior, no console.error
        
      } else {
        setErrorType("invalid");
        // Only log actual unexpected errors
        console.error("Login failed:", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Resend verification email with modal
  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendError("");
    setResendSuccess(false);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend email");
      }

      setResendSuccess(true);
      // Auto-close modal after 3 seconds
      setTimeout(() => {
        setShowResendModal(false);
        setResendSuccess(false);
      }, 3000);
    } catch (err: any) {
      setResendError(err.message || "Failed to resend email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-amber-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <LogIn className="text-amber-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Log in to continue your job search
          </p>
        </div>

        {/* Error Messages */}
        <AnimatePresence>
          {error && !showBlockedModal && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              {/* EMAIL NOT VERIFIED ERROR */}
              {errorType === "unverified" && (
                <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={24} />
                    <div className="flex-1">
                      <p className="font-semibold text-blue-800 mb-1">Email Not Verified</p>
                      <p className="text-blue-700 text-sm mb-3">{error}</p>
                      <button
                        onClick={() => setShowResendModal(true)}
                        className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                      >
                        Resend Verification Email
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* INVALID CREDENTIALS ERROR */}
              {errorType === "invalid" && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                      <p className="text-red-700 text-sm">{error}</p>
                      <p className="text-red-600 text-xs mt-1">
                        Please check your email and password and try again.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-amber-600 hover:text-amber-700 font-semibold"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Logging in...
              </>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        {/* Signup Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-amber-600 hover:text-amber-700 font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>  
      </motion.div>

      {/* ✅ BLOCKED USER MODAL */}
      <AnimatePresence>
        {showBlockedModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBlockedModal(false)}
              className="fixed inset-0 bg-black/60 z-50"
            />

            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 sm:p-6 md:p-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setShowBlockedModal(false)}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-full"
                    aria-label="Close modal"
                  >
                    <X size={20} className="sm:w-6 sm:h-6" />
                  </button>

                  <div className="bg-red-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <XCircle className="text-red-600" size={32} />
                  </div>

                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3 text-center px-4">
                    Account Blocked
                  </h2>

                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                    <p className="text-xs sm:text-sm text-red-800 mb-2">
                      <strong>Your account has been blocked and you cannot login.</strong>
                    </p>
                    <div className="bg-white rounded p-2 sm:p-3 mt-2 sm:mt-3">
                      <p className="text-xs text-gray-600 mb-1">Block Reason:</p>
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 break-words">
                        {blockReason}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="bg-amber-100 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-amber-600 font-bold text-xs sm:text-sm">1</span>
                      </div>
                      <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                        Review the block reason above carefully
                      </p>
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="bg-amber-100 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-amber-600 font-bold text-xs sm:text-sm">2</span>
                      </div>
                      <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                        Contact our support team to appeal this decision
                      </p>
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="bg-amber-100 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-amber-600 font-bold text-xs sm:text-sm">3</span>
                      </div>
                      <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                        Wait for admin review and response
                      </p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                    <p className="text-xs sm:text-sm text-yellow-800 leading-relaxed">
                      <strong>⚠️ Important:</strong> Creating new accounts to bypass this block may result in a permanent ban. Please contact support for assistance.
                    </p>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <Link href="/contact">
                      <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
                        <Mail size={18} className="sm:w-5 sm:h-5" />
                        Contact Support
                      </button>
                    </Link>

                    <button
                      onClick={() => setShowBlockedModal(false)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 sm:py-3 rounded-lg transition-all text-sm sm:text-base"
                    >
                      Close
                    </button>
                  </div>

                  <p className="text-center text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4 break-words px-2">
                    Email: <span className="font-semibold">{formData.email}</span>
                  </p>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ✅ RESEND VERIFICATION MODAL */}
      <AnimatePresence>
        {showResendModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResendModal(false)}
              className="fixed inset-0 bg-black/60 z-50"
            />

            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setShowResendModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                  >
                    <X size={24} />
                  </button>

                  {!resendSuccess ? (
                    <>
                      <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <Mail className="text-blue-600" size={32} />
                      </div>

                      <h2 className="text-2xl font-bold text-gray-800 mb-3 text-center">
                        Resend Verification Email
                      </h2>

                      <p className="text-gray-600 text-center mb-6">
                        We'll send a new verification link to:
                        <br />
                        <span className="font-semibold text-gray-800">{formData.email}</span>
                      </p>

                      {resendError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-700 text-sm">{resendError}</p>
                        </div>
                      )}

                      <div className="space-y-3">
                        <button
                          onClick={handleResendVerification}
                          disabled={resendLoading}
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                          {resendLoading ? (
                            <>
                              <Loader2 className="animate-spin" size={20} />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail size={20} />
                              Send Verification Email
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => setShowResendModal(false)}
                          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-green-600" size={40} />
                      </div>

                      <h2 className="text-2xl font-bold text-gray-800 mb-3 text-center">
                        Email Sent! ✉️
                      </h2>

                      <p className="text-gray-600 text-center mb-6">
                        Verification email has been sent to <span className="font-semibold">{formData.email}</span>
                        <br />
                        <br />
                        Please check your inbox and spam folder.
                      </p>

                      <button
                        onClick={() => {
                          setShowResendModal(false);
                          setResendSuccess(false);
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-all"
                      >
                        Got it!
                      </button>
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
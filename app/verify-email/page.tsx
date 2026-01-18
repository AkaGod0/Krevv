"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const type = searchParams.get("type"); // ✅ Extracted type parameter

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!token || !type) { // ✅ Validate both token and type
      setStatus("error");
      setMessage("Invalid verification link. Missing required parameters.");
      return;
    }

    verifyEmail(token, type); // ✅ Pass both to the function
  }, [token, type]);

  // Auto-redirect countdown for success
 const getLoginPath = () => {
  return type === "company" ? "/company/login" : "/login";
};

// 2. Updated Auto-redirect countdown
useEffect(() => {
  if (status === "success" && countdown > 0) {
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }

  if (status === "success" && countdown === 0) {
    // Dynamically redirect based on type
    router.push(getLoginPath());
  }
}, [status, countdown, router, type]);

  const verifyEmail = async (verificationToken: string, accountType: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${verificationToken}&type=${accountType}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    // ✅ FIX: Check if response has content before parsing
    const text = await response.text(); 
    const data = text ? JSON.parse(text) : {}; 

    if (!response.ok) {
      throw new Error(data.message || "Verification failed");
    }

    setStatus("success");
    setMessage(data.message || "Email verified successfully!");
  } catch (err: any) {
    setStatus("error");
    setMessage(err.message || "Failed to verify email.");
  }
};

  const handleRetry = () => {
    if (token && type) { // ✅ Ensure both are present for retry
      setStatus("verifying");
      setMessage("");
      verifyEmail(token, type);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
      >
        <AnimatePresence mode="wait">
          {/* VERIFYING STATE */}
          {status === "verifying" && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="bg-amber-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="text-amber-600 animate-spin" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Verifying Your Email...
              </h2>
              <p className="text-gray-600 mb-4">
                Please wait while we verify your email address
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}

          {/* SUCCESS STATE */}
          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="text-green-600" size={40} />
              </motion.div>

              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Email Verified! 🎉
              </h2>

              <p className="text-gray-600 mb-6">
                {message}
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 text-sm">
                  <strong>✅ Your account is now active!</strong>
                  <br />
                  You can now login and start exploring job opportunities.
                </p>
              </div>

              {/* Countdown */}
              <div className="mb-6">
                <p className="text-sm text-gray-500">
                  Redirecting to login in{" "}
                  <span className="font-bold text-amber-600">{countdown}</span>{" "}
                  seconds...
                </p>
              </div>

             <Link href={getLoginPath()}>
  <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
    Go to {type === "company" ? "Company" : "User"} Login Now
    <ArrowRight size={20} />
  </button>
</Link>

              {/* Browse jobs link */}
              <Link href="/jobs">
                <button className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-all">
                  Browse Jobs First
                </button>
              </Link>
            </motion.div>
          )}

          {/* ERROR STATE */}
          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6"
              >
                <XCircle className="text-red-600" size={40} />
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Verification Failed
              </h2>

              <p className="text-gray-600 mb-6">
                {message}
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-sm">
                  <strong>Common reasons:</strong>
                </p>
                <ul className="text-left text-sm text-red-700 mt-2 space-y-1">
                  <li>• The verification link has expired (24 hours)</li>
                  <li>• The link was already used</li>
                  <li>• The link is invalid or corrupted</li>
                </ul>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                {token && type && (
                  <button
                    onClick={handleRetry}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={20} />
                    Try Again
                  </button>
                )}

                <Link href="/signup">
                  <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
                    <Mail size={20} />
                    Request New Verification Email
                  </button>
                </Link>

                <Link href="/login">
                  <button className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition-all">
                    Back to Login
                  </button>
                </Link>
              </div>

              {/* Help text */}
              <p className="text-sm text-gray-500 mt-6">
                Still having trouble?{" "}
                <Link href="/contact" className="text-amber-600 hover:underline">
                  Contact Support
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, Loader2, Inbox, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/company/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResendingEmail(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/company/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend email");
      }

      // Show success message
      alert("Password reset email sent! Please check your inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to resend email. Please try again.");
    } finally {
      setResendingEmail(false);
    }
  };

  // Success Screen - Check Your Email
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full"
        >
          {/* Icon */}
          <div className="bg-amber-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Inbox className="text-amber-600" size={40} />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-800 mb-3 text-center">
            Check Your Email! 📧
          </h2>

          {/* Email sent to */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-gray-700 text-center mb-2">
              We've sent a password reset link to:
            </p>
            <p className="text-amber-600 font-semibold text-center text-lg">
              {email}
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-600 font-bold text-sm">1</span>
              </div>
              <p className="text-gray-600">
                Open your email inbox and find our password reset email
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-amber-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-600 font-bold text-sm">2</span>
              </div>
              <p className="text-gray-600">
                Click the reset password link in the email
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-amber-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-600 font-bold text-sm">3</span>
              </div>
              <p className="text-gray-600">
                Create a new password and login to your account
              </p>
            </div>
          </div>

          {/* Important Info */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">
              <strong>⚠️ Important:</strong> The reset link will expire in 1 hour for security reasons.
            </p>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> Can't find the email? Check your spam or junk folder. The email should arrive within a few minutes.
            </p>
          </div>

          {/* Error message for resend */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-700 text-sm text-center">{error}</p>
            </motion.div>
          )}

          {/* Resend Email Button */}
          <button
            onClick={handleResendEmail}
            disabled={resendingEmail}
            className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mb-4"
          >
            {resendingEmail ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Sending...
              </>
            ) : (
              <>
                <Mail size={20} />
                Resend Reset Email
              </>
            )}
          </button>

          {/* Back to Login */}
          <Link href="/company/login">
            <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
              <ArrowLeft size={20} />
              Back to Login
            </button>
          </Link>

          {/* Wrong email */}
          <p className="text-center text-sm text-gray-500 mt-4">
            Wrong email?{" "}
            <button
              onClick={() => setSuccess(false)}
              className="text-amber-600 hover:underline font-semibold"
            >
              Try again
            </button>
          </p>
        </motion.div>
      </div>
    );
  }

  // Main Forgot Password Form
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
      >
        {/* Back Button */}
        <Link href="/company/login">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Login</span>
          </button>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-amber-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Mail className="text-amber-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Forgot Password?
          </h1>
          <p className="text-gray-600">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-700 text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
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
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                required
                placeholder="john@example.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
              />
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
                Sending Reset Link...
              </>
            ) : (
              <>
                <Mail size={20} />
                Send Reset Link
              </>
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>🔒 Security Note:</strong> For your security, the password reset link will only be valid for 1 hour.
          </p>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <Link
              href="/company/login"
              className="text-amber-600 hover:text-amber-700 font-semibold"
            >
              Login here
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/company/register"
              className="text-amber-600 hover:text-amber-700 font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
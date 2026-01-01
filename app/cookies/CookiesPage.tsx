"use client";

import { motion } from "framer-motion";

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 text-white p-6 sm:p-12">
      <motion.div
        className="max-w-4xl mx-auto bg-black/40 backdrop-blur-xl rounded-3xl p-6 sm:p-12 shadow-2xl border border-purple-700/40"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-300">
          Cookies Policy 🍪
        </h1>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
          Our website uses cookies to improve your experience. Cookies help us
          analyze traffic, remember user preferences, and enhance site
          performance. By continuing to browse, you consent to our use of
          cookies.
        </p>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
          We may use cookies for analytics, marketing, and essential site
          functionality. You can manage or disable cookies through your browser
          settings, but some features may not function properly without them.
        </p>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          For more details on the cookies we use, please contact our support
          team.
        </p>
      </motion.div>
    </main>
  );
}

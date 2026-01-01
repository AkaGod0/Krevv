"use client";

import { motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#fff8f2] via-[#ffe8cc] to-[#fffaf6] overflow-hidden relative px-5">
      {/* BACKGROUND ANIMATION */}
      <motion.div
        className="absolute inset-0 -z-10 opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <motion.div
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply blur-3xl opacity-60 animate-pulse"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "mirror",
          }}
        ></motion.div>
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply blur-3xl opacity-60 animate-pulse"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            repeatType: "mirror",
          }}
        ></motion.div>
      </motion.div>

      {/* HEADER */}
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-6xl font-extrabold text-center text-[#3e2a1a] mb-6"
      >
        Let’s <span className="text-yellow-700">Connect</span> ✨
      </motion.h1>

      {/* SUBTEXT */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="text-gray-600 text-lg text-center max-w-2xl leading-relaxed mb-12"
      >
        We’d love to hear from you! Whether you have questions, feedback, or just want to say
        hello — reach out anytime. We’ll respond faster than you can say “beautiful design”.
      </motion.p>

      {/* CONTACT INFO CARD */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="bg-white/70 backdrop-blur-xl shadow-xl rounded-2xl p-8 md:p-12 w-full max-w-md border border-[#f2d6a2]"
      >
        <div className="space-y-6 text-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="flex flex-col items-center gap-2"
          >
            <Mail className="text-pink-600 w-8 h-8" />
            <p className="text-lg font-semibold text-[#3e2a1a]">Hello@krevv.com</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="flex flex-col items-center gap-2"
          >
            <Mail className="text-yellow-700 w-8 h-8" />
            <p className="text-lg font-semibold text-[#3e2a1a]">partnerships@krevv.com</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-10 text-center text-sm text-gray-500"
        >
          We’re available Monday – Friday, 9 AM to 6 PM.
        </motion.div>
      </motion.div>
    </main>
  );
}

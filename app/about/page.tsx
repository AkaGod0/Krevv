"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fff8f2] via-[#ffeedd] to-[#fffaf6] text-[#3e2a1a] overflow-hidden">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center py-24 px-6">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-7xl font-extrabold tracking-tight mb-4"
        >
          About <span className="text-yellow-600">Krevv</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="max-w-4xl text-lg text-gray-600 leading-relaxed"
        >
          We're a professional job posting and career discovery platform designed to connect{" "}
          <strong className="text-yellow-700">verified employers</strong> with{" "}
          <strong className="text-yellow-700">qualified job seekers</strong> in a secure, transparent, and accountable environment.
          <br /><br />
          In an increasingly digital job market where fraudulent listings, impersonation, and data misuse have become widespread, 
          Krevv was established with a clear purpose: to restore <strong>trust, safety, and professionalism</strong> to online hiring.
          <br /><br />
          We operate with a strict policy-driven framework that prioritizes <strong>legitimacy, verification, data protection, and user safety</strong>, 
          making Krevv more than a job board — it is a <strong className="text-yellow-700">regulated hiring environment</strong>.
        </motion.p>
      </section>

      {/* Our Purpose Section */}
      <section className="max-w-5xl mx-auto py-24 px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-yellow-800 mb-6">
          Our Purpose
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          The modern workforce demands speed, flexibility, and accessibility. However, these benefits should not come at the cost of <strong>user safety or ethical hiring practices</strong>.
        </p>
        <p className="text-gray-700 leading-relaxed mb-4">
          Krevv exists to solve critical problems affecting both employers and job seekers:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
          <li>The rise of <strong>fake job postings and recruitment scams</strong></li>
          <li>Lack of accountability among anonymous employers</li>
          <li>Misuse of applicant data and personal information</li>
          <li>Poor transparency in hiring processes</li>
        </ul>
        <p className="text-gray-700 bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-600">
          By enforcing structured verification, content moderation, and legal compliance, Krevv creates a hiring ecosystem where{" "}
          <strong className="text-yellow-800">every opportunity is accountable</strong>.
        </p>
      </section>

      {/* What Krevv Does */}
      <section className="bg-[#fff3e4] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-yellow-800 mb-6">
            What Krevv Does
          </h2>
          <p className="text-gray-700 leading-relaxed mb-8">
            Krevv provides a centralized platform that enables:
          </p>

          {/* For Employers */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-yellow-700 mb-4">For Employers</h3>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Secure posting of job opportunities after verification</li>
              <li>Access to a diverse pool of qualified candidates</li>
              <li>Structured hiring workflows aligned with labor standards</li>
              <li>Increased trust and credibility through verified employer status</li>
            </ul>
          </div>

          {/* For Job Seekers */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-yellow-700 mb-4">For Job Seekers</h3>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Access to legitimate and actively moderated job listings</li>
              <li>Safe application processes with clear employer visibility</li>
              <li>Protection against scams and misleading opportunities</li>
              <li>Career discovery across multiple employment types</li>
            </ul>
          </div>

          <p className="text-gray-700 leading-relaxed mb-4">
            Krevv supports a wide range of roles, including:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="font-semibold text-yellow-700">Full-time & Part-time</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="font-semibold text-yellow-700">Remote & Hybrid</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="font-semibold text-yellow-700">Contract & Project-based</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="font-semibold text-yellow-700">Internship & Early-career</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Verification */}
      <section className="max-w-5xl mx-auto py-24 px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-yellow-800 mb-6">
          Trust, Verification & Platform Integrity
        </h2>
        <p className="text-gray-700 leading-relaxed mb-6 text-lg font-semibold">
          Trust is not optional on Krevv — it is foundational.
        </p>
        <p className="text-gray-700 leading-relaxed mb-4">
          To protect our community, we enforce:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
          <li><strong>Employer verification</strong> before job posting privileges are granted</li>
          <li>Manual and automated <strong>content moderation</strong></li>
          <li>Continuous monitoring for fraud, impersonation, and policy violations</li>
          <li>Mandatory compliance with employer posting and anti-scam policies</li>
        </ul>
        <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-600">
          <p className="text-gray-700 leading-relaxed mb-2">
            <strong className="text-red-800">Any employer or user found violating platform rules may face:</strong>
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Immediate job listing removal</li>
            <li>Account suspension or permanent termination</li>
            <li>Reporting to relevant regulatory or law-enforcement authorities where required</li>
          </ul>
        </div>
      </section>

      {/* Safety & Anti-Scam */}
      <section className="bg-[#fff3e4] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-yellow-800 mb-6">
            Commitment to Safety & Anti-Scam Protection
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Krevv maintains a <strong className="text-red-700">zero-tolerance policy</strong> toward:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>Job scams or deceptive listings</li>
            <li>Requests for fees, deposits, or financial information from job seekers</li>
            <li>Identity impersonation or misrepresentation</li>
            <li>Unauthorized data collection or use</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            We actively educate job seekers on safe application practices and provide clear reporting channels for suspicious activity. 
            Our compliance team investigates all reports promptly and decisively.
          </p>
        </div>
      </section>

      {/* Data Protection */}
      <section className="max-w-5xl mx-auto py-24 px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-yellow-800 mb-6">
          Data Protection & Privacy
        </h2>
        <p className="text-gray-700 leading-relaxed mb-6 text-lg font-semibold">
          Krevv treats user data as a protected asset.
        </p>
        <p className="text-gray-700 leading-relaxed mb-4">
          We comply with:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
          <li><strong>Nigeria Data Protection Regulation (NDPR)</strong></li>
          <li><strong>General Data Protection Regulation (GDPR)</strong></li>
          <li>Applicable global data protection and cybersecurity standards</li>
        </ul>
        <p className="text-gray-700 leading-relaxed mb-4">
          User data is:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
          <li>Collected only when necessary</li>
          <li>Stored securely using industry-standard safeguards</li>
          <li>Processed solely for legitimate platform purposes</li>
          <li>Retained in accordance with our <Link href="/data-retention" className="text-yellow-700 underline hover:text-yellow-800">Data Retention & Disclosure Notice</Link></li>
        </ul>
      </section>

      {/* Vision & Mission */}
      <section className="bg-[#fff3e4] py-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Vision */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-yellow-800 mb-6">
              Our Vision
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To become a <strong>trusted and authoritative destination for job opportunities</strong>, recognized for safety, professionalism, and accountability.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We envision a hiring ecosystem where:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
              <li>Employers act responsibly and transparently</li>
              <li>Job seekers apply with confidence</li>
              <li>Opportunities are legitimate, clear, and fairly represented</li>
              <li>Technology supports ethical hiring practices</li>
            </ul>
          </div>

          {/* Mission */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-yellow-800 mb-6">
              Our Mission
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To create a job platform where:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Every employer is accountable</li>
              <li>Every job listing is moderated</li>
              <li>Every user's data is protected</li>
              <li>Every opportunity is treated with integrity</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Who Krevv Is For */}
      <section className="max-w-5xl mx-auto py-24 px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-yellow-800 mb-6">
          Who Krevv Is For
        </h2>
        <p className="text-gray-700 leading-relaxed mb-6">
          Krevv is built for:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
          <li>Employers seeking qualified talent through a credible platform</li>
          <li>Job seekers who value safety and transparency</li>
          <li>Recruiters committed to ethical hiring</li>
          <li>Professionals at all career stages</li>
          <li>Organizations seeking compliant recruitment solutions</li>
        </ul>
      </section>

      {/* Continuous Improvement */}
      <section className="bg-[#fff3e4] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-yellow-800 mb-6">
            Continuous Improvement
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Krevv is committed to ongoing improvement through:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li><strong>Policy updates</strong> aligned with legal and market changes</li>
            <li><strong>Platform enhancements</strong> to improve usability and safety</li>
            <li><strong>Feedback</strong> from users, employers, and regulators</li>
            <li><strong>Adoption of best practices</strong> in recruitment technology</li>
          </ul>
        </div>
      </section>

      {/* Join Krevv Community */}
      <section className="max-w-5xl mx-auto py-24 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-yellow-800 mb-6">
          Join Krevv
        </h2>
        <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed mb-6">
          Whether you are hiring or searching for your next opportunity, Krevv provides a platform built on{" "}
          <strong>trust, verification, and accountability</strong>.
        </p>
        <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
          Krevv isn't just a job board. It's a regulated hiring environment where every opportunity matters and every user is protected.
        </p>
        <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8 font-semibold text-lg">
          Let's build the future of safe, transparent hiring — together.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/jobs"
            className="inline-block bg-yellow-700 text-white px-8 py-4 rounded-full font-semibold hover:bg-yellow-800 transition-all duration-300 shadow-lg hover:shadow-2xl"
          >
            Browse Jobs
          </Link>
          <Link
            href="/post"
            className="inline-block bg-white text-yellow-700 border-2 border-yellow-700 px-8 py-4 rounded-full font-semibold hover:bg-yellow-50 transition-all duration-300 shadow-lg hover:shadow-2xl"
          >
            Browse Posts
          </Link>
        </div>
      </section>
    </main>
  );
}
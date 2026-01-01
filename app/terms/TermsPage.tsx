"use client";

import { motion } from "framer-motion";
import { Shield, AlertTriangle, FileText, Scale, Users, Lock } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-blue-800 text-white py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-block p-4 bg-purple-600/20 rounded-full mb-4"
          >
            <FileText size={48} className="text-purple-400" />
          </motion.div>
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Terms of Use
          </h1>
          <p className="text-gray-300 text-lg">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Main Content Card */}
        <motion.div
          className="bg-black/50 backdrop-blur-xl rounded-3xl p-8 sm:p-12 shadow-2xl border border-purple-600/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Introduction */}
          <div className="mb-8 p-6 bg-purple-900/30 rounded-2xl border border-purple-500/30">
            <p className="text-gray-200 leading-relaxed">
              Welcome to <span className="font-bold text-purple-400">Krevv</span> ("Platform", "we", "our", or "us"). 
              By accessing or using <span className="font-semibold text-blue-400">krevv.com</span>, you agree to be legally bound by these Terms of Use. 
              If you do not agree, you must immediately discontinue use of the Platform.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {/* Section 1 */}
            <Section
              icon={<Shield className="text-green-400" size={24} />}
              number="1"
              title="Acceptance of Terms"
            >
              <p className="text-gray-300 mb-3">
                By using Krevv in any manner—including browsing job listings, submitting applications, or posting jobs—you confirm that:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>You are at least <span className="font-semibold text-purple-400">18 years old</span>, and</li>
                <li>You have the legal capacity to enter into a binding agreement.</li>
              </ul>
              <p className="text-gray-300 mt-3">
                These Terms apply to <span className="font-semibold">all users</span>, including job seekers, employers, recruiters, agents, and visitors.
              </p>
            </Section>

            {/* Section 2 */}
            <Section
              icon={<AlertTriangle className="text-yellow-400" size={24} />}
              number="2"
              title="Nature of the Platform"
            >
              <p className="text-gray-300 mb-3">
                Krevv is a <span className="font-semibold text-blue-400">job listing and job aggregation platform</span> only.
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Krevv <span className="font-semibold text-red-400">does not hire</span>, recruit, shortlist, or employ candidates.</li>
                <li>Krevv <span className="font-semibold text-red-400">does not guarantee employment</span>, interviews, or job offers.</li>
                <li>All hiring decisions are made <span className="font-semibold">solely by employers</span>.</li>
              </ul>
              <p className="text-gray-300 mt-3">
                Krevv is <span className="font-semibold text-red-400">not responsible</span> for the actions, decisions, communications, or offers made by employers or third parties.
              </p>
            </Section>

            {/* Section 3 */}
            <Section
              icon={<Users className="text-blue-400" size={24} />}
              number="3"
              title="User Responsibilities"
            >
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-purple-400 mb-2">3.1 Job Seekers</h4>
                  <p className="text-gray-300 mb-2">You agree that you will:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Provide accurate and truthful information in applications</li>
                    <li>Apply for jobs at your own discretion and risk</li>
                    <li>Never pay fees to apply for jobs advertised on Krevv</li>
                    <li>Independently verify employer legitimacy</li>
                  </ul>
                  <p className="text-red-400 font-semibold mt-3">
                    Krevv is NOT LIABLE for losses, damages, or disputes arising from job applications.
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-purple-400 mb-2">3.2 Employers & Recruiters</h4>
                  <p className="text-gray-300 mb-2">By posting a job on Krevv, you <span className="font-semibold">strictly agree</span> that:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>You are a legitimate employer or authorized hiring agent</li>
                    <li>All job information is <span className="font-semibold text-green-400">accurate, lawful, and non-misleading</span></li>
                    <li>You will not request <span className="font-semibold text-red-400">application fees</span>, deposits, or payments from candidates</li>
                    <li>You comply with all applicable labor, employment, and data protection laws</li>
                  </ul>
                  <p className="text-yellow-400 font-semibold mt-3">
                    Krevv reserves the absolute right to reject, edit, suspend, or delete any job listing and ban employers without notice for violations.
                  </p>
                </div>
              </div>
            </Section>

            {/* Section 4 */}
            <Section
              icon={<AlertTriangle className="text-red-400" size={24} />}
              number="4"
              title="Prohibited Content & Activities"
            >
              <p className="text-gray-300 mb-3">
                You are <span className="font-semibold text-red-400">strictly prohibited</span> from using Krevv to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Post fraudulent, deceptive, or scam job listings</li>
                <li>Request payment, bank details, OTPs, or sensitive personal data</li>
                <li>Post discriminatory content based on race, gender, religion, nationality, disability, or age</li>
                <li>Impersonate another person or organization</li>
                <li>Scrape, copy, or republish Krevv content without permission</li>
                <li>Introduce malware, bots, or automated scripts</li>
                <li>Use the Platform for illegal or unethical purposes</li>
              </ul>
              <p className="text-red-400 font-semibold mt-3">
                Violation may result in immediate termination, IP blocking, and legal action.
              </p>
            </Section>

            {/* Section 5 */}
            <Section
              icon={<FileText className="text-purple-400" size={24} />}
              number="5"
              title="Job Listing Accuracy & Liability Disclaimer"
            >
              <p className="text-gray-300 mb-3">
                Krevv does <span className="font-semibold text-red-400">not verify</span> the accuracy, legality, or completeness of every job listing.
              </p>
              <p className="text-gray-300 mb-2">You understand and agree that:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Job listings may be removed or changed at any time</li>
                <li>Employers may close roles without notice</li>
                <li>Krevv is <span className="font-semibold text-red-400">not liable</span> for expired, incorrect, or withdrawn job postings</li>
              </ul>
              <p className="text-yellow-400 font-semibold mt-3">
                All job interactions are strictly between users and employers.
              </p>
            </Section>

            {/* Section 6 */}
            <Section
              icon={<Users className="text-indigo-400" size={24} />}
              number="6"
              title="No Employment Relationship"
            >
              <p className="text-gray-300 mb-3">
                Use of Krevv does <span className="font-semibold text-red-400">not create</span>:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>An employment relationship</li>
                <li>A recruitment agency relationship</li>
                <li>A partnership or joint venture</li>
              </ul>
              <p className="text-purple-400 font-semibold mt-3">
                Krevv acts solely as an information platform.
              </p>
            </Section>

            {/* Section 7 */}
            <Section
              icon={<Lock className="text-pink-400" size={24} />}
              number="7"
              title="Intellectual Property"
            >
              <p className="text-gray-300 mb-3">
                All content on Krevv, including text, logos, design, code, and job formatting, is the property of Krevv or its licensors.
              </p>
              <p className="text-red-400 font-semibold">
                You may NOT copy, reproduce, modify, distribute, or exploit any content without written permission.
              </p>
            </Section>

            {/* Section 8 */}
            <Section
              icon={<FileText className="text-cyan-400" size={24} />}
              number="8"
              title="Third-Party Links"
            >
              <p className="text-gray-300 mb-2">
                Krevv may link to external websites or employer application pages.
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>We do not control third-party sites</li>
                <li>We are not responsible for their content, privacy policies, or actions</li>
                <li>Use of third-party sites is at your own risk</li>
              </ul>
            </Section>

            {/* Section 9 */}
            <Section
              icon={<Shield className="text-orange-400" size={24} />}
              number="9"
              title="Account Suspension & Termination"
            >
              <p className="text-gray-300 mb-2">Krevv reserves the right to:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Suspend or terminate access without notice</li>
                <li>Remove content that violates these Terms</li>
                <li>Cooperate with law enforcement when required</li>
              </ul>
              <p className="text-red-400 font-semibold mt-3">
                No refunds will be issued for terminated paid listings due to violations.
              </p>
            </Section>

            {/* Section 10 */}
            <Section
              icon={<AlertTriangle className="text-red-500" size={24} />}
              number="10"
              title="Limitation of Liability"
            >
              <p className="text-gray-300 mb-3">
                To the <span className="font-semibold">maximum extent permitted by law</span>, Krevv shall not be liable for:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Loss of income or job opportunities</li>
                <li>Fraud, scams, or misrepresentation by employers</li>
                <li>Data loss or system downtime</li>
                <li>Indirect, incidental, or consequential damages</li>
              </ul>
              <p className="text-red-400 font-bold text-lg mt-4">
                Use of Krevv is entirely at your own risk.
              </p>
            </Section>

            {/* Section 11 */}
            <Section
              icon={<Scale className="text-blue-400" size={24} />}
              number="11"
              title="Indemnification"
            >
              <p className="text-gray-300">
                You agree to indemnify and hold Krevv harmless from any claims, damages, losses, or expenses arising from:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mt-2">
                <li>Your use of the Platform</li>
                <li>Your violation of these Terms</li>
                <li>Your interaction with other users</li>
              </ul>
            </Section>

            {/* Section 12 */}
            <Section
              icon={<FileText className="text-yellow-400" size={24} />}
              number="12"
              title="Modifications to Terms"
            >
              <p className="text-gray-300">
                Krevv may update these Terms at any time without prior notice. Continued use of the Platform after updates constitutes acceptance of the revised Terms.
              </p>
            </Section>

            {/* Section 13 */}
            <Section
              icon={<Scale className="text-green-400" size={24} />}
              number="13"
              title="Governing Law"
            >
              <p className="text-gray-300">
                These Terms shall be governed and interpreted in accordance with the laws of your country, without regard to conflict of law principles.
              </p>
            </Section>

            {/* Section 14 */}
            <Section
              icon={<Users className="text-purple-400" size={24} />}
              number="14"
              title="Contact Information"
            >
              <p className="text-gray-300">
                For questions or legal concerns regarding these Terms, contact Krevv through the official{" "}
                <a href="/contact" className="text-blue-400 hover:text-blue-300 underline font-semibold">
                  Contact Us
                </a>{" "}
                page on krevv.com.
              </p>
            </Section>
          </div>

          {/* Footer Agreement */}
          <div className="mt-12 p-6 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl border border-purple-500/30">
            <p className="text-center text-gray-200 text-lg">
              By using our website, you acknowledge that you have read, understood, and agree to these Terms of Use.
            </p>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <a
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Back to Home
          </a>
        </motion.div>
      </motion.div>
    </main>
  );
}

// Section Component
function Section({
  icon,
  number,
  title,
  children,
}: {
  icon: React.ReactNode;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="border-l-4 border-purple-500 pl-6 py-4"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-900/30 rounded-lg">{icon}</div>
        <h3 className="text-2xl font-bold text-white">
          {number}. {title}
        </h3>
      </div>
      <div className="text-gray-300 leading-relaxed">{children}</div>
    </motion.div>
  );
}
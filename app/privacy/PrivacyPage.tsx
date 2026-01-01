"use client";

import { motion } from "framer-motion";
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  FileText, 
  Users, 
  Globe, 
  AlertTriangle,
  Cookie,
  Server,
  UserCheck,
  Mail
} from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-800 via-black to-blue-900 text-white py-12 px-4 sm:px-6 lg:px-8">
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
            <Lock size={48} className="text-purple-400" />
          </motion.div>
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400">
            Privacy Policy
          </h1>
          <p className="text-gray-300 text-lg">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Main Content Card */}
        <motion.div
          className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 sm:p-12 shadow-2xl border border-purple-700/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Introduction */}
          <div className="mb-8 p-6 bg-purple-900/30 rounded-2xl border border-purple-500/30">
            <p className="text-gray-200 leading-relaxed">
              <span className="font-bold text-purple-400">Krevv</span> ("we", "our", or "us") operates{" "}
              <span className="font-semibold text-blue-400">krevv.com</span>, a job posting and job listing platform. 
              This Privacy Policy explains how we collect, use, store, disclose, and protect personal data when you access or use our Platform.
            </p>
            <p className="text-yellow-400 font-semibold mt-4">
              By using Krevv, you expressly consent to the data practices described in this Privacy Policy. 
              If you do not agree, you must discontinue use of the Platform immediately.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {/* Section 1 */}
            <Section
              icon={<Eye className="text-blue-400" size={24} />}
              number="1"
              title="Scope of This Policy"
            >
              <p className="text-gray-300 mb-3">This Privacy Policy applies to:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Job seekers</li>
                <li>Employers and recruiters</li>
                <li>Website visitors</li>
                <li>Any user interacting with Krevv services</li>
              </ul>
              <p className="text-gray-300 mt-4 mb-2">It covers data collected through:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>The website</li>
                <li>Job applications</li>
                <li>Contact forms</li>
                <li>Email subscriptions</li>
                <li>Third-party integrations</li>
              </ul>
            </Section>

            {/* Section 2 */}
            <Section
              icon={<Database className="text-green-400" size={24} />}
              number="2"
              title="Information We Collect"
            >
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-purple-400 mb-2">2.1 Personal Information</h4>
                  <p className="text-gray-300 mb-2">We may collect personal data including but not limited to:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>Phone number</li>
                    <li>CVs, resumes, and cover letters (when submitted)</li>
                    <li>Employment history and qualifications (if provided)</li>
                    <li>Company details (for employers)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-purple-400 mb-2">2.2 Automatically Collected Information</h4>
                  <p className="text-gray-300 mb-2">When you use Krevv, we may automatically collect:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>IP address</li>
                    <li>Browser type and version</li>
                    <li>Device information</li>
                    <li>Pages visited and timestamps</li>
                    <li>Referral URLs</li>
                  </ul>
                  <p className="text-blue-400 font-semibold mt-3">
                    This data is collected for security, analytics, and performance optimization.
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-purple-400 mb-2">2.3 Cookies & Tracking Technologies</h4>
                  <p className="text-gray-300 mb-2">Krevv uses cookies and similar technologies to:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Improve site functionality</li>
                    <li>Analyze traffic and usage behavior</li>
                    <li>Remember user preferences</li>
                  </ul>
                  <p className="text-yellow-400 font-semibold mt-3">
                    You may disable cookies in your browser; however, some features may not function properly.
                  </p>
                </div>
              </div>
            </Section>

            {/* Section 3 */}
            <Section
              icon={<FileText className="text-purple-400" size={24} />}
              number="3"
              title="How We Use Your Information"
            >
              <p className="text-gray-300 mb-2">We use collected information strictly to:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Display and manage job listings</li>
                <li>Facilitate job applications</li>
                <li>Communicate with users</li>
                <li>Improve platform functionality</li>
                <li>Detect fraud, abuse, or violations</li>
                <li>Comply with legal obligations</li>
              </ul>
              <p className="text-green-400 font-bold text-lg mt-4">
                We do NOT sell personal data to third parties.
              </p>
            </Section>

            {/* Section 4 */}
            <Section
              icon={<Users className="text-orange-400" size={24} />}
              number="4"
              title="Job Applications & Employer Access"
            >
              <p className="text-gray-300 mb-3">When you apply for a job:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Your information is shared <span className="font-semibold text-yellow-400">directly with the employer</span></li>
                <li>Krevv does not control how employers process your data</li>
                <li>Employers are solely responsible for compliance with data protection laws</li>
              </ul>
              <p className="text-red-400 font-semibold mt-4">
                Krevv bears NO LIABILITY for employer misuse of applicant data.
              </p>
            </Section>

            {/* Section 5 */}
            <Section
              icon={<Shield className="text-blue-400" size={24} />}
              number="5"
              title="Data Sharing & Disclosure"
            >
              <p className="text-gray-300 mb-3">We may share data only in the following circumstances:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>With employers for job applications</li>
                <li>With service providers (hosting, analytics, email delivery)</li>
                <li>When required by law, regulation, or court order</li>
                <li>To protect Krevv's legal rights, users, or public safety</li>
              </ul>
              <p className="text-green-400 font-semibold mt-3">
                All service providers are contractually required to protect user data.
              </p>
            </Section>

            {/* Section 6 */}
            <Section
              icon={<Database className="text-cyan-400" size={24} />}
              number="6"
              title="Data Retention"
            >
              <p className="text-gray-300 mb-3">We retain personal data only for as long as necessary to:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Provide our services</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce our Terms of Use</li>
              </ul>
              <p className="text-yellow-400 font-semibold mt-3">
                We reserve the right to delete inactive or obsolete data without notice.
              </p>
            </Section>

            {/* Section 7 */}
            <Section
              icon={<Lock className="text-green-400" size={24} />}
              number="7"
              title="Data Security"
            >
              <p className="text-gray-300 mb-3">
                Krevv implements <span className="font-semibold text-green-400">reasonable technical and organizational safeguards</span>, including:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Secure servers</li>
                <li>Access control measures</li>
                <li>Encrypted connections (HTTPS)</li>
              </ul>
              <p className="text-red-400 font-semibold mt-4">
                However, no system is completely secure. You acknowledge that data transmission over the internet is at your own risk.
              </p>
            </Section>

            {/* Section 8 */}
            <Section
              icon={<UserCheck className="text-pink-400" size={24} />}
              number="8"
              title="User Rights"
            >
              <p className="text-gray-300 mb-3">Depending on applicable laws, you may have the right to:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Request access to your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Withdraw consent for data processing</li>
              </ul>
              <p className="text-yellow-400 font-semibold mt-3">
                Requests may be subject to identity verification and legal limitations.
              </p>
            </Section>

            {/* Section 9 */}
            <Section
              icon={<AlertTriangle className="text-red-400" size={24} />}
              number="9"
              title="Children's Privacy"
            >
              <p className="text-gray-300 mb-2">
                Krevv does not knowingly collect personal data from individuals under{" "}
                <span className="font-semibold text-red-400">18 years of age</span>.
              </p>
              <p className="text-red-400 font-semibold">
                If such data is discovered, it will be deleted immediately.
              </p>
            </Section>

            {/* Section 10 */}
            <Section
              icon={<Globe className="text-indigo-400" size={24} />}
              number="10"
              title="Third-Party Links"
            >
              <p className="text-gray-300 mb-3">
                Krevv may link to third-party websites or employer application pages.
              </p>
              <p className="text-gray-300 mb-2">We are <span className="font-semibold text-red-400">NOT responsible</span> for:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Their privacy practices</li>
                <li>Their data handling policies</li>
                <li>Their content or security</li>
              </ul>
              <p className="text-yellow-400 font-semibold mt-3">
                You access third-party sites at your own risk.
              </p>
            </Section>

            {/* Section 11 */}
            <Section
              icon={<Globe className="text-purple-400" size={24} />}
              number="11"
              title="International Data Transfers"
            >
              <p className="text-gray-300">
                By using Krevv, you consent to the transfer and processing of data in jurisdictions where our servers or service providers are located, 
                which may have different data protection laws than your country.
              </p>
            </Section>

            {/* Section 12 */}
            <Section
              icon={<AlertTriangle className="text-yellow-400" size={24} />}
              number="12"
              title="No Guarantees"
            >
              <p className="text-gray-300 mb-3">Krevv does <span className="font-semibold text-red-400">NOT guarantee</span>:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Confidentiality of data shared with employers</li>
                <li>Job placement or recruitment outcomes</li>
                <li>Continuous platform availability</li>
              </ul>
              <p className="text-red-400 font-bold text-lg mt-4">
                Use of the Platform is entirely at your discretion and risk.
              </p>
            </Section>

            {/* Section 13 */}
            <Section
              icon={<FileText className="text-cyan-400" size={24} />}
              number="13"
              title="Policy Updates"
            >
              <p className="text-gray-300 mb-3">
                We may update this Privacy Policy at any time.
              </p>
              <p className="text-yellow-400 font-semibold">
                Changes become effective immediately upon publication. Continued use of Krevv constitutes acceptance of the updated policy.
              </p>
            </Section>

            {/* Section 14 */}
            <Section
              icon={<Shield className="text-green-400" size={24} />}
              number="14"
              title="Governing Law"
            >
              <p className="text-gray-300">
                This Privacy Policy is governed by the laws of your country, without regard to conflict of law principles.
              </p>
            </Section>

            {/* Section 15 */}
            <Section
              icon={<Mail className="text-blue-400" size={24} />}
              number="15"
              title="Contact"
            >
              <p className="text-gray-300">
                For privacy-related inquiries, requests, or concerns, please contact Krevv via the official{" "}
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
              By using our website, you consent to this privacy policy and the terms described herein.
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
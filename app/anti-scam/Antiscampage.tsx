"use client";

import { motion } from "framer-motion";
import { 
  ShieldAlert, 
  AlertTriangle, 
  Ban, 
  Eye, 
  Users, 
  Lock,
  XCircle,
  Flag,
  Gavel,
  FileWarning,
  Search,
  CreditCard,
  Key,
  AlertOctagon,
  Phone,
  Mail,
  Scale
} from "lucide-react";

export default function AntiScamPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-red-900 via-black to-orange-900 text-white py-12 px-4 sm:px-6 lg:px-8">
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
            className="inline-block p-4 bg-red-600/20 rounded-full mb-4"
          >
            <ShieldAlert size={48} className="text-red-400" />
          </motion.div>
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400">
            Anti-Scam & Safety Policy
          </h1>
          <p className="text-gray-300 text-lg">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Main Content Card */}
        <motion.div
          className="bg-black/50 backdrop-blur-xl rounded-3xl p-8 sm:p-12 shadow-2xl border border-red-600/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Critical Warning Banner */}
          <div className="mb-8 p-6 bg-gradient-to-r from-red-900/50 to-orange-900/50 rounded-2xl border-2 border-red-500/50">
            <div className="flex items-start gap-4">
              <AlertOctagon className="text-red-400 flex-shrink-0 mt-1" size={32} />
              <div>
                <h2 className="text-2xl font-bold text-red-400 mb-2">CRITICAL SAFETY NOTICE</h2>
                <p className="text-gray-200 leading-relaxed mb-2">
                  <span className="font-bold text-red-400">Krevv</span> ("Platform", "we", "our", or "us") operates{" "}
                  <span className="font-semibold text-orange-400">krevv.com</span> as a job listing and job aggregation service. 
                  This Policy establishes <span className="font-bold text-yellow-400">mandatory safety rules</span>,{" "}
                  <span className="font-bold text-yellow-400">prohibited conduct</span>,{" "}
                  <span className="font-bold text-yellow-400">enforcement authority</span>, and{" "}
                  <span className="font-bold text-yellow-400">cooperation with law enforcement</span>.
                </p>
                <p className="text-red-300 font-bold text-lg">
                  By accessing or using Krevv, you ACKNOWLEDGE, ACCEPT, and AGREE to be bound by this Policy in full.
                </p>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {/* Section 1 */}
            <Section
              icon={<Ban className="text-red-500" size={24} />}
              number="1"
              title="Absolute Zero-Tolerance Enforcement"
            >
              <p className="text-gray-300 mb-3">
                Krevv maintains an <span className="font-bold text-red-400">ABSOLUTE ZERO-TOLERANCE POLICY</span> toward:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Fraud</li>
                <li>Scams</li>
                <li>Deceptive recruitment</li>
                <li>Financial exploitation</li>
                <li>Identity theft</li>
                <li>Impersonation</li>
                <li>Data harvesting</li>
              </ul>
              <div className="mt-4 p-4 bg-red-900/50 rounded-lg border border-red-500/50">
                <p className="text-red-300 font-bold text-lg">
                  Any confirmed or suspected violation results in IMMEDIATE ENFORCEMENT ACTION WITHOUT NOTICE, including permanent bans.
                </p>
              </div>
            </Section>

            {/* Section 2 */}
            <Section
              icon={<AlertTriangle className="text-orange-400" size={24} />}
              number="2"
              title="Strictly Prohibited Activities"
            >
              <p className="text-gray-300 mb-4">
                The following actions are <span className="font-bold text-red-400">CRIMINAL-RISK ACTIVITIES</span> and are strictly forbidden on Krevv:
              </p>

              <div className="space-y-4">
                {/* Financial Exploitation */}
                <div className="p-5 bg-red-900/30 rounded-lg border border-red-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <CreditCard className="text-red-400" size={24} />
                    <h4 className="text-xl font-bold text-red-400">2.1 Financial Exploitation</h4>
                  </div>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Charging application, registration, processing, training, interview, visa, or onboarding fees</li>
                    <li>Requesting deposits, transfers, crypto payments, gift cards, or vouchers</li>
                    <li>Redirecting users to paid external forms or services</li>
                  </ul>
                </div>

                {/* Data Exploitation */}
                <div className="p-5 bg-orange-900/30 rounded-lg border border-orange-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <Key className="text-orange-400" size={24} />
                    <h4 className="text-xl font-bold text-orange-400">2.2 Data Exploitation</h4>
                  </div>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Requesting bank details, BVN, NIN, SSN, ATM cards, OTPs, passwords, or PINs</li>
                    <li>Collecting sensitive personal data unrelated to legitimate hiring</li>
                    <li>Harvesting applicant data for resale or misuse</li>
                  </ul>
                </div>

                {/* Fraud & Deception */}
                <div className="p-5 bg-yellow-900/30 rounded-lg border border-yellow-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <FileWarning className="text-yellow-400" size={24} />
                    <h4 className="text-xl font-bold text-yellow-400">2.3 Fraud & Deception</h4>
                  </div>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Fake companies or impersonation of real organizations</li>
                    <li>False job titles, salaries, or locations</li>
                    <li>Guaranteed income or "no-skill" earning schemes</li>
                    <li>Crypto, forex, task-reward, or investment-based job listings</li>
                  </ul>
                </div>

                {/* Technical Abuse */}
                <div className="p-5 bg-purple-900/30 rounded-lg border border-purple-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="text-purple-400" size={24} />
                    <h4 className="text-xl font-bold text-purple-400">2.4 Technical Abuse</h4>
                  </div>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Phishing links or malware</li>
                    <li>Automated bots or scraping tools</li>
                    <li>Identity masking or proxy abuse</li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* Section 3 */}
            <Section
              icon={<Users className="text-blue-400" size={24} />}
              number="3"
              title="Mandatory Employer Conduct Rules"
            >
              <p className="text-gray-300 mb-3">All employers and recruiters <span className="font-bold text-blue-400">MUST</span>:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Be legally authorized to recruit</li>
                <li>Provide accurate, verifiable company details</li>
                <li>Use applicant data <span className="font-semibold text-green-400">solely for recruitment purposes</span></li>
                <li>Comply with all applicable labor, cybercrime, and data protection laws</li>
                <li>Never request payments or sensitive data at any stage</li>
              </ul>
              <p className="text-red-400 font-bold text-lg mt-4">
                Violation constitutes GROUNDS FOR PERMANENT REMOVAL and potential referral to authorities.
              </p>
            </Section>

            {/* Section 4 */}
            <Section
              icon={<AlertTriangle className="text-yellow-400" size={24} />}
              number="4"
              title="Job Seeker Safety Obligations"
            >
              <p className="text-gray-300 mb-3">Job seekers acknowledge and agree that:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Krevv does not vet every employer</li>
                <li>Applications are made <span className="font-semibold text-yellow-400">entirely at their own risk</span></li>
                <li>Krevv does not participate in interviews, payments, or hiring decisions</li>
              </ul>
              <p className="text-red-400 font-semibold mt-4">
                Failure to exercise caution does NOT create liability for Krevv.
              </p>
            </Section>

            {/* Section 5 */}
            <Section
              icon={<Eye className="text-cyan-400" size={24} />}
              number="5"
              title="Monitoring, Surveillance & Evidence Preservation"
            >
              <p className="text-gray-300 mb-3">Krevv reserves the right to:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Monitor platform activity</li>
                <li>Log IP addresses, timestamps, device data, and access patterns</li>
                <li>Retain records for investigative and legal purposes</li>
              </ul>
              <p className="text-cyan-400 font-semibold mt-4">
                All collected data may be preserved as DIGITAL EVIDENCE.
              </p>
            </Section>

            {/* Section 6 */}
            <Section
              icon={<Flag className="text-orange-400" size={24} />}
              number="6"
              title="Reporting & Whistleblowing"
            >
              <p className="text-gray-300 mb-3">Users must immediately report suspected scams via:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>The <span className="font-semibold text-orange-400">Report Job</span> feature</li>
                <li>The official <a href="/contact" className="text-orange-400 hover:text-orange-300 underline font-semibold">Contact Us</a> page</li>
              </ul>
              <p className="text-red-400 font-semibold mt-4">
                False or malicious reports may result in account suspension.
              </p>
            </Section>

            {/* Section 7 */}
            <Section
              icon={<XCircle className="text-red-500" size={24} />}
              number="7"
              title="Enforcement Actions"
            >
              <p className="text-gray-300 mb-3">
                Krevv may, at its <span className="font-semibold text-red-400">sole discretion and without notice</span>:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Remove job listings</li>
                <li>Suspend or permanently terminate accounts</li>
                <li>Block IP addresses or devices</li>
                <li>Blacklist individuals or organizations</li>
                <li>Deny future access permanently</li>
              </ul>
              <div className="mt-4 p-4 bg-red-900/50 rounded-lg border border-red-500/50">
                <p className="text-red-300 font-bold">
                  No refunds will be issued under any circumstance involving violations.
                </p>
              </div>
            </Section>

            {/* Section 8 */}
            <Section
              icon={<Gavel className="text-blue-400" size={24} />}
              number="8"
              title="Mandatory Cooperation With Authorities"
            >
              <p className="text-gray-300 mb-3">
                Krevv <span className="font-bold text-blue-400">FULLY COOPERATES</span> with:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Nigerian law enforcement agencies</li>
                <li>Cybercrime units</li>
                <li>Regulatory authorities</li>
                <li>Court orders and subpoenas</li>
              </ul>
              <div className="mt-4 p-4 bg-yellow-900/30 rounded-lg border border-yellow-500/30">
                <p className="text-yellow-300 font-bold">
                  We may disclose user data, logs, communications, and records WITHOUT USER CONSENT when legally required.
                </p>
              </div>
            </Section>

            {/* Section 9 */}
            <Section
              icon={<Lock className="text-purple-400" size={24} />}
              number="9"
              title="Limitation of Liability (Maximum Protection)"
            >
              <p className="text-gray-300 mb-3">To the fullest extent permitted by law:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Krevv is <span className="font-semibold text-red-400">NOT responsible</span> for user losses</li>
                <li>Krevv is <span className="font-semibold text-red-400">NOT liable</span> for employer misconduct</li>
                <li>Krevv does <span className="font-semibold text-red-400">NOT guarantee</span> job legitimacy</li>
                <li>Krevv bears <span className="font-semibold text-red-400">NO responsibility</span> for off-platform communications</li>
              </ul>
              <p className="text-red-400 font-bold text-xl mt-4">
                All interactions occur ENTIRELY AT THE USER'S OWN RISK.
              </p>
            </Section>

            {/* Section 10 */}
            <Section
              icon={<AlertTriangle className="text-orange-400" size={24} />}
              number="10"
              title="No Duty to Warn or Intervene"
            >
              <p className="text-gray-300 mb-3">
                Krevv is under <span className="font-bold text-red-400">NO OBLIGATION</span> to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Warn users of suspected scams</li>
                <li>Verify employers</li>
                <li>Monitor private communications</li>
              </ul>
              <p className="text-yellow-400 font-semibold mt-4">
                Failure to act does NOT constitute negligence or liability.
              </p>
            </Section>

            {/* Section 11 */}
            <Section
              icon={<Ban className="text-red-600" size={24} />}
              number="11"
              title="Lifetime Bans & Blacklisting"
            >
              <p className="text-gray-300 mb-3">Severe or repeated violations result in:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Permanent platform bans</li>
                <li>Internal blacklisting</li>
                <li>Denial of future services</li>
              </ul>
              <div className="mt-4 p-4 bg-red-900/50 rounded-lg border-2 border-red-500/50">
                <p className="text-red-300 font-bold text-lg">
                  Bans are FINAL and NON-APPEALABLE.
                </p>
              </div>
            </Section>

            {/* Section 12 */}
            <Section
              icon={<FileWarning className="text-yellow-400" size={24} />}
              number="12"
              title="Policy Supremacy"
            >
              <p className="text-gray-300 mb-2">
                This Policy overrides any conflicting statements, assurances, or communications.
              </p>
              <p className="text-yellow-400 font-bold text-lg">
                If a conflict exists, THIS POLICY SHALL PREVAIL.
              </p>
            </Section>

            {/* Section 13 */}
            <Section
              icon={<AlertTriangle className="text-orange-400" size={24} />}
              number="13"
              title="Amendments Without Notice"
            >
              <p className="text-gray-300 mb-2">
                Krevv may amend this Policy at any time.
              </p>
              <p className="text-orange-400 font-bold text-lg">
                Continued use of the Platform constitutes IRREVOCABLE ACCEPTANCE of all changes.
              </p>
            </Section>

            {/* Section 14 */}
            <Section
              icon={<Scale className="text-green-400" size={24} />}
              number="14"
              title="Governing Law & Jurisdiction"
            >
              <p className="text-gray-300 mb-2">
                This Policy shall be governed exclusively by the{" "}
                <span className="font-semibold text-green-400">laws of the Federal Republic of Nigeria</span>.
              </p>
              <p className="text-green-400 font-semibold">
                All disputes fall under the EXCLUSIVE JURISDICTION of Nigerian courts.
              </p>
            </Section>

            {/* Section 15 */}
            <Section
              icon={<Mail className="text-blue-400" size={24} />}
              number="15"
              title="Contact for Legal & Safety Matters"
            >
              <p className="text-gray-300">
                All scam, fraud, or safety concerns must be submitted through the official{" "}
                <a href="/contact" className="text-blue-400 hover:text-blue-300 underline font-semibold">
                  Contact Us
                </a>{" "}
                page on krevv.com.
              </p>
            </Section>
          </div>

          {/* Final Warning Banner */}
          <div className="mt-12 p-6 bg-gradient-to-r from-red-900/70 to-orange-900/70 rounded-2xl border-2 border-red-500/50">
            <div className="flex items-start gap-4">
              <ShieldAlert className="text-red-400 flex-shrink-0 mt-1" size={32} />
              <div>
                <h3 className="text-2xl font-bold text-red-400 mb-2">STAY SAFE ONLINE</h3>
                <p className="text-gray-200 leading-relaxed mb-3">
                  Krevv is committed to protecting job seekers from fraud and scams. However, users must exercise their own judgment and caution. 
                </p>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                    <span className="text-red-300">Never pay for job applications</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                    <span className="text-red-300">Never share banking details</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                    <span className="text-red-300">Verify employer legitimacy</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                    <span className="text-red-300">Report suspicious activity</span>
                  </div>
                </div>
              </div>
            </div>
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
            className="inline-block px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
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
      className="border-l-4 border-red-500 pl-6 py-4"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-red-900/30 rounded-lg">{icon}</div>
        <h3 className="text-2xl font-bold text-white">
          {number}. {title}
        </h3>
      </div>
      <div className="text-gray-300 leading-relaxed">{children}</div>
    </motion.div>
  );
}
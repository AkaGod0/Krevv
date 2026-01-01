"use client";

import { motion } from "framer-motion";
import { 
  Shield, 
  CheckCircle, 
  FileText, 
  Building2, 
  AlertTriangle, 
  Users, 
  Lock,
  Ban,
  Search,
  Mail,
  Phone,
  Globe,
  Award,
  Clock,
  XCircle
} from "lucide-react";

export default function EmployerVerificationPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 via-black to-teal-900 text-white py-12 px-4 sm:px-6 lg:px-8">
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
            className="inline-block p-4 bg-green-600/20 rounded-full mb-4"
          >
            <Shield size={48} className="text-green-400" />
          </motion.div>
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-teal-400 to-blue-400">
            Employer Verification Guidelines
          </h1>
          <p className="text-gray-300 text-lg">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Main Content Card */}
        <motion.div
          className="bg-black/50 backdrop-blur-xl rounded-3xl p-8 sm:p-12 shadow-2xl border border-green-600/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Introduction */}
          <div className="mb-8 p-6 bg-green-900/30 rounded-2xl border border-green-500/30">
            <p className="text-gray-200 leading-relaxed mb-3">
              <span className="font-bold text-green-400">Krevv</span> ("Platform", "we", "our", or "us") is committed to maintaining a{" "}
              <span className="font-semibold text-teal-400">safe and trustworthy job posting environment</span>. 
              These Employer Verification Guidelines outline the{" "}
              <span className="font-semibold text-yellow-400">mandatory requirements</span> and verification steps that all employers must meet 
              before they can post jobs on Krevv.
            </p>
            <p className="text-red-400 font-bold">
              Employers who fail verification or provide fraudulent information may have all listings removed, accounts suspended, and legal action taken.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {/* Section 1 */}
            <Section
              icon={<Shield className="text-blue-400" size={24} />}
              number="1"
              title="Purpose of Employer Verification"
            >
              <p className="text-gray-300 mb-3">The purpose of verification is to:</p>
              <ol className="list-decimal list-inside text-gray-300 space-y-2 ml-4">
                <li>Ensure that only <span className="font-semibold text-green-400">legitimate and lawfully operating businesses</span> post jobs.</li>
                <li>Protect job seekers from <span className="font-semibold text-red-400">scams, fraudulent job offers, or misleading postings</span>.</li>
                <li>Maintain Krevv's credibility as a professional job posting platform.</li>
                <li>Ensure compliance with <span className="font-semibold text-yellow-400">local labor laws, data protection regulations (NDPR, GDPR), and anti-fraud standards</span>.</li>
              </ol>
            </Section>

            {/* Section 2 */}
            <Section
              icon={<CheckCircle className="text-green-400" size={24} />}
              number="2"
              title="Eligibility Requirements"
            >
              <p className="text-gray-300 mb-3">
                To post jobs on Krevv, an employer must meet <span className="font-bold text-green-400">ALL of the following criteria</span>:
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-800/50 rounded-lg border border-green-500/30">
                  <h4 className="text-lg font-bold text-green-400 mb-2 flex items-center gap-2">
                    <Building2 size={20} />
                    1. Legal Registration
                  </h4>
                  <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                    <li>The employer must provide valid registration documents (e.g., CAC certificate in Nigeria).</li>
                    <li>Only legally registered businesses may post jobs.</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-800/50 rounded-lg border border-blue-500/30">
                  <h4 className="text-lg font-bold text-blue-400 mb-2 flex items-center gap-2">
                    <Award size={20} />
                    2. Active Business Operations
                  </h4>
                  <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                    <li>The business must be operational and verifiable.</li>
                    <li className="text-red-400">Virtual or shell companies without verifiable operations will be rejected.</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-800/50 rounded-lg border border-purple-500/30">
                  <h4 className="text-lg font-bold text-purple-400 mb-2 flex items-center gap-2">
                    <Users size={20} />
                    3. Authorized Recruiters or HR Representatives
                  </h4>
                  <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                    <li>Only verified HR personnel or authorized recruiters can post jobs.</li>
                    <li>Authorization proof may include company ID, email from official domain, or letter of authorization.</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-800/50 rounded-lg border border-cyan-500/30">
                  <h4 className="text-lg font-bold text-cyan-400 mb-2 flex items-center gap-2">
                    <Phone size={20} />
                    4. Company Contact Details
                  </h4>
                  <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                    <li>Employers must provide valid business email addresses, phone numbers, and office addresses.</li>
                    <li className="text-yellow-400">Generic email addresses (e.g., Gmail, Yahoo) may require additional verification.</li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* Section 3 */}
            <Section
              icon={<FileText className="text-purple-400" size={24} />}
              number="3"
              title="Required Verification Documents"
            >
              <p className="text-gray-300 mb-4">Employers must submit the following for verification:</p>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-green-900/30 border-b border-green-500/30">
                      <th className="text-left p-3 text-green-400 font-bold">Document / Proof</th>
                      <th className="text-left p-3 text-green-400 font-bold">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-gray-700/30 hover:bg-gray-800/30">
                      <td className="p-3">Company registration certificate</td>
                      <td className="p-3">Confirms legal existence</td>
                    </tr>
                    <tr className="border-b border-gray-700/30 hover:bg-gray-800/30">
                      <td className="p-3">Official government-issued ID of authorized recruiter/HR</td>
                      <td className="p-3">Confirms identity and authorization</td>
                    </tr>
                    <tr className="border-b border-gray-700/30 hover:bg-gray-800/30">
                      <td className="p-3">Proof of business address (utility bill, lease, or tax document)</td>
                      <td className="p-3">Confirms operational location</td>
                    </tr>
                    <tr className="border-b border-gray-700/30 hover:bg-gray-800/30">
                      <td className="p-3">Company domain email</td>
                      <td className="p-3">Confirms official business communication</td>
                    </tr>
                    <tr className="hover:bg-gray-800/30">
                      <td className="p-3"><em className="text-gray-400">Optional:</em> Company website link or social media presence</td>
                      <td className="p-3">Verifies online presence</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-4 bg-yellow-900/30 rounded-lg border border-yellow-500/30">
                <p className="text-yellow-300 font-semibold">
                  Krevv reserves the right to request additional documentation if necessary.
                </p>
              </div>
            </Section>

            {/* Section 4 */}
            <Section
              icon={<Search className="text-cyan-400" size={24} />}
              number="4"
              title="Verification Steps"
            >
              <div className="space-y-4">
                <StepCard
                  step="1"
                  title="Account Registration"
                  icon={<Users className="text-blue-400" size={20} />}
                >
                  <p className="text-gray-300">Employers create an account with accurate company information.</p>
                </StepCard>

                <StepCard
                  step="2"
                  title="Document Submission"
                  icon={<FileText className="text-purple-400" size={20} />}
                >
                  <p className="text-gray-300">Upload required verification documents via Krevv's secure portal.</p>
                </StepCard>

                <StepCard
                  step="3"
                  title="Verification Review"
                  icon={<Search className="text-cyan-400" size={20} />}
                >
                  <p className="text-gray-300 mb-2">Krevv's compliance team reviews submitted documents for authenticity. Verification may involve:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                    <li>Cross-checking CAC or government records</li>
                    <li>Validating company email and phone number</li>
                    <li>Checking online presence and social profiles</li>
                  </ul>
                </StepCard>

                <StepCard
                  step="4"
                  title="Approval or Rejection"
                  icon={<CheckCircle className="text-green-400" size={20} />}
                >
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    <li>If approved, the employer can post jobs.</li>
                    <li>If rejected, the employer is notified with reasons and may reapply with corrected documentation.</li>
                  </ul>
                </StepCard>
              </div>

              <div className="mt-4 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30 flex items-start gap-3">
                <Clock className="text-blue-400 flex-shrink-0 mt-1" size={20} />
                <p className="text-blue-300 font-semibold">
                  Verification may take 1–5 business days depending on document review requirements.
                </p>
              </div>
            </Section>

            {/* Section 5 */}
            <Section
              icon={<Award className="text-orange-400" size={24} />}
              number="5"
              title="Ongoing Compliance"
            >
              <p className="text-gray-300 mb-3">Verified employers must:</p>
              <ol className="list-decimal list-inside text-gray-300 space-y-2 ml-4">
                <li>Keep business information and contact details updated.</li>
                <li>Remove or update job postings once positions are filled.</li>
                <li>Abide by Krevv's <span className="font-semibold text-green-400">Employer Posting Policy</span> and <span className="font-semibold text-green-400">Anti-Scam & Safety Policy</span>.</li>
                <li>Respond to verification requests or compliance audits promptly.</li>
              </ol>
              <p className="text-red-400 font-semibold mt-4">
                Failure to comply may result in temporary or permanent suspension of posting privileges.
              </p>
            </Section>

            {/* Section 6 */}
            <Section
              icon={<AlertTriangle className="text-red-400" size={24} />}
              number="6"
              title="Red Flags for Non-Compliance"
            >
              <p className="text-gray-300 mb-3">
                Krevv monitors for signs of fraudulent or non-compliant employers, including:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Posting jobs with misleading titles, salaries, or locations</li>
                <li>Using personal email accounts instead of official company emails</li>
                <li>Frequent submission of unverifiable or forged documents</li>
                <li>Charging job seekers fees or deposits</li>
              </ul>
              <div className="mt-4 p-4 bg-red-900/30 rounded-lg border border-red-500/30">
                <p className="text-red-300 font-bold">
                  Accounts exhibiting these behaviors may be IMMEDIATELY SUSPENDED.
                </p>
              </div>
            </Section>

            {/* Section 7 */}
            <Section
              icon={<Building2 className="text-indigo-400" size={24} />}
              number="7"
              title="Special Cases"
            >
              <div className="space-y-3">
                <div className="p-4 bg-indigo-900/20 rounded-lg border border-indigo-500/30">
                  <h4 className="font-bold text-indigo-400 mb-2">Recruitment Agencies:</h4>
                  <p className="text-gray-300">Must provide authorization letters from clients and demonstrate legal recruitment operations.</p>
                </div>

                <div className="p-4 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                  <h4 className="font-bold text-cyan-400 mb-2">Remote or Global Companies:</h4>
                  <p className="text-gray-300">Must provide verifiable company registration in their jurisdiction and valid contact methods.</p>
                </div>

                <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
                  <h4 className="font-bold text-purple-400 mb-2">Startups & Small Businesses:</h4>
                  <p className="text-gray-300">May be required to provide additional proof of operations, such as business licenses, tax registration, or bank statements.</p>
                </div>
              </div>
            </Section>

            {/* Section 8 */}
            <Section
              icon={<Lock className="text-green-400" size={24} />}
              number="8"
              title="Data Privacy & Security"
            >
              <p className="text-gray-300 mb-3">All employer verification data is:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Collected and stored securely in compliance with <span className="font-semibold text-green-400">NDPR, GDPR, and internal security policies</span></li>
                <li>Used solely for verification and fraud prevention</li>
                <li>Not shared with third parties except for law enforcement or legal obligations</li>
              </ul>
            </Section>

            {/* Section 9 */}
            <Section
              icon={<Ban className="text-red-500" size={24} />}
              number="9"
              title="Legal Compliance & Enforcement"
            >
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Krevv reserves the right to <span className="font-semibold text-red-400">remove job listings</span>, <span className="font-semibold text-red-400">suspend accounts</span>, and <span className="font-semibold text-red-400">report fraudulent activity</span> to regulatory authorities or law enforcement.</li>
                <li>Employers may be <span className="font-semibold text-red-400">permanently banned</span> for repeated violations or submission of fraudulent documentation.</li>
                <li>Verification does <span className="font-semibold text-yellow-400">NOT exempt employers</span> from compliance with labor laws or Krevv policies.</li>
              </ul>
            </Section>

            {/* Section 10 */}
            <Section
              icon={<Mail className="text-blue-400" size={24} />}
              number="10"
              title="Contact for Verification Assistance"
            >
              <p className="text-gray-300">
                Employers with questions or needing assistance during verification can contact Krevv through the{" "}
                <a href="/contact" className="text-blue-400 hover:text-blue-300 underline font-semibold">
                  Contact Us page
                </a>{" "}
                or support email.
              </p>
            </Section>
          </div>

          {/* Footer Notice */}
          <div className="mt-12 p-6 bg-gradient-to-r from-green-900/50 to-teal-900/50 rounded-2xl border border-green-500/30">
            <div className="flex items-start gap-4">
              <Shield className="text-green-400 flex-shrink-0 mt-1" size={28} />
              <div>
                <h3 className="text-xl font-bold text-green-400 mb-2">Trust & Safety Commitment</h3>
                <p className="text-gray-200 leading-relaxed">
                  Krevv is dedicated to creating a secure job market where legitimate employers connect with qualified candidates. 
                  Our verification process protects job seekers while empowering authentic businesses to reach top talent.
                </p>
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
            className="inline-block px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
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
      className="border-l-4 border-green-500 pl-6 py-4"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-900/30 rounded-lg">{icon}</div>
        <h3 className="text-2xl font-bold text-white">
          {number}. {title}
        </h3>
      </div>
      <div className="text-gray-300 leading-relaxed">{children}</div>
    </motion.div>
  );
}

// Step Card Component
function StepCard({
  step,
  title,
  icon,
  children,
}: {
  step: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 p-4 bg-gray-800/30 rounded-lg border border-green-500/20">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 bg-green-600/30 rounded-full flex items-center justify-center border-2 border-green-500/50">
          <span className="text-xl font-bold text-green-400">{step}</span>
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <h4 className="text-lg font-bold text-white">{title}</h4>
        </div>
        {children}
      </div>
    </div>
  );
}
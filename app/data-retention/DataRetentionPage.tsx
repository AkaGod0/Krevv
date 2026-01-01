"use client";

import { motion } from "framer-motion";
import { 
  Database, 
  Shield, 
  Clock, 
  Eye, 
  Lock,
  Users,
  FileText,
  Gavel,
  AlertTriangle,
  Server,
  Mail,
  Search,
  UserCheck,
  Scale,
  Globe,
  Cookie
} from "lucide-react";

export default function DataRetentionPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-cyan-900 text-white py-12 px-4 sm:px-6 lg:px-8">
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
            className="inline-block p-4 bg-blue-600/20 rounded-full mb-4"
          >
            <Database size={48} className="text-blue-400" />
          </motion.div>
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
            Data Retention & Disclosure Notice
          </h1>
          <p className="text-gray-300 text-lg">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Main Content Card */}
        <motion.div
          className="bg-black/50 backdrop-blur-xl rounded-3xl p-8 sm:p-12 shadow-2xl border border-blue-600/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Introduction */}
          <div className="mb-8 p-6 bg-blue-900/30 rounded-2xl border border-blue-500/30">
            <p className="text-gray-200 leading-relaxed mb-3">
              <span className="font-bold text-blue-400">Krevv</span> ("Platform", "we", "our", or "us") operates{" "}
              <span className="font-semibold text-cyan-400">krevv.com</span>, a professional job posting and job aggregation platform. 
              Krevv is committed to <span className="font-semibold text-green-400">transparency, legal compliance, and user safety</span> regarding 
              the collection, storage, retention, and disclosure of personal and non-personal data.
            </p>
            <p className="text-gray-200 leading-relaxed">
              This enterprise-grade Data Retention & Disclosure Notice explains Krevv's{" "}
              <span className="font-semibold text-cyan-400">data handling practices</span>, retention schedules, disclosure policies, 
              user rights, and law-enforcement cooperation. By using Krevv, you acknowledge and accept all terms described herein.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {/* Section 1 */}
            <Section
              icon={<Eye className="text-cyan-400" size={24} />}
              number="1"
              title="Scope of This Notice"
            >
              <p className="text-gray-300 mb-3">
                This Notice applies to all data collected, processed, or stored on Krevv, including but not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><span className="font-semibold text-blue-400">Job seekers:</span> personal data, resumes, CVs, cover letters, application history</li>
                <li><span className="font-semibold text-green-400">Employers:</span> company profiles, HR contacts, job postings, applicant data</li>
                <li><span className="font-semibold text-purple-400">Visitors:</span> IP addresses, device/browser information, referral sources, cookies, analytics</li>
                <li><span className="font-semibold text-orange-400">Platform communications:</span> emails, messages, support tickets, forms</li>
                <li><span className="font-semibold text-cyan-400">Third-party integrations:</span> content or data provided via APIs or partner systems</li>
              </ul>
              <p className="text-yellow-400 font-semibold mt-4">
                This Notice applies to ALL USERS, whether registered or unregistered, and covers automated and manual processing of data.
              </p>
            </Section>

            {/* Section 2 */}
            <Section
              icon={<Shield className="text-green-400" size={24} />}
              number="2"
              title="Principles of Data Retention"
            >
              <p className="text-gray-300 mb-3">Krevv retains data based on the following principles:</p>
              <div className="space-y-3">
                <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                  <h4 className="font-bold text-green-400 mb-2">1. Purpose Limitation</h4>
                  <p className="text-gray-300">Data is retained only for legitimate business, legal, and security purposes.</p>
                </div>
                <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                  <h4 className="font-bold text-blue-400 mb-2">2. Minimum Necessary</h4>
                  <p className="text-gray-300">Only necessary data is collected and retained for each purpose.</p>
                </div>
                <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
                  <h4 className="font-bold text-purple-400 mb-2">3. Legal Compliance</h4>
                  <p className="text-gray-300">Retention aligns with Nigerian laws (NDPR, Cybercrime Act), international laws (GDPR, DMCA, CCPA), and labor regulations.</p>
                </div>
                <div className="p-4 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                  <h4 className="font-bold text-cyan-400 mb-2">4. Security Preservation</h4>
                  <p className="text-gray-300">Data is stored securely to prevent unauthorized access or disclosure.</p>
                </div>
                <div className="p-4 bg-orange-900/20 rounded-lg border border-orange-500/30">
                  <h4 className="font-bold text-orange-400 mb-2">5. Evidence Preservation</h4>
                  <p className="text-gray-300">Data may be retained to support investigations, disputes, or regulatory inquiries.</p>
                </div>
              </div>
            </Section>

            {/* Section 3 - Retention Schedule */}
            <Section
              icon={<Clock className="text-purple-400" size={24} />}
              number="3"
              title="Retention Schedules"
            >
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm sm:text-base">
                  <thead>
                    <tr className="bg-blue-900/30 border-b-2 border-blue-500/30">
                      <th className="text-left p-3 text-blue-400 font-bold">Data Type</th>
                      <th className="text-left p-3 text-blue-400 font-bold">Retention Period</th>
                      <th className="text-left p-3 text-blue-400 font-bold">Purpose / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <RetentionRow
                      dataType="Job seeker accounts & profiles"
                      period="3 years after last activity"
                      purpose="Maintains applicant history for future job opportunities and regulatory compliance"
                    />
                    <RetentionRow
                      dataType="Resumes, CVs, cover letters"
                      period="5 years"
                      purpose="Supports employment verification, auditing, and legal inquiries"
                    />
                    <RetentionRow
                      dataType="Employer accounts & profiles"
                      period="7 years"
                      purpose="Compliance with corporate and labor regulations"
                    />
                    <RetentionRow
                      dataType="Job postings"
                      period="5 years"
                      purpose="Recordkeeping and potential dispute resolution"
                    />
                    <RetentionRow
                      dataType="Application history (job submissions)"
                      period="5 years"
                      purpose="Legal compliance and auditability"
                    />
                    <RetentionRow
                      dataType="Activity logs (IP addresses, devices, timestamps)"
                      period="3 years"
                      purpose="Security monitoring, fraud detection, and law-enforcement requests"
                    />
                    <RetentionRow
                      dataType="Communication records (messages, support emails)"
                      period="3 years"
                      purpose="Dispute resolution and regulatory compliance"
                    />
                    <RetentionRow
                      dataType="Analytics & aggregated data"
                      period="5 years"
                      purpose="Platform improvement, anonymized reporting"
                    />
                    <RetentionRow
                      dataType="Cookies & tracking identifiers"
                      period="2 years"
                      purpose="Functional, performance, and preference tracking"
                    />
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-4 bg-yellow-900/30 rounded-lg border border-yellow-500/30">
                <p className="text-yellow-300 font-semibold">
                  Krevv reserves the right to retain specific data beyond these periods if required by law, ongoing disputes, or regulatory audits.
                </p>
              </div>
            </Section>

            {/* Section 4 */}
            <Section
              icon={<Share className="text-orange-400" size={24} />}
              number="4"
              title="Data Disclosure Policies"
            >
              <p className="text-gray-300 mb-4">Krevv may disclose data under the following circumstances:</p>

              <div className="space-y-4">
                <div className="p-5 bg-blue-900/30 rounded-lg border border-blue-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="text-blue-400" size={24} />
                    <h4 className="text-xl font-bold text-blue-400">4.1 Employers & Recruitment Agencies</h4>
                  </div>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Applicant data is shared <span className="font-semibold text-blue-400">only with employers applied to</span>.</li>
                    <li>Employers are responsible for processing applications in compliance with labor and data protection laws.</li>
                    <li className="text-red-400">Krevv disclaims liability for employer misuse of applicant data.</li>
                  </ul>
                </div>

                <div className="p-5 bg-purple-900/30 rounded-lg border border-purple-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <Server className="text-purple-400" size={24} />
                    <h4 className="text-xl font-bold text-purple-400">4.2 Service Providers & Vendors</h4>
                  </div>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Hosting, analytics, email delivery, security, and IT providers may process data.</li>
                    <li>All providers are contractually required to <span className="font-semibold text-green-400">protect personal data and limit processing to Krevv purposes only</span>.</li>
                  </ul>
                </div>

                <div className="p-5 bg-cyan-900/30 rounded-lg border border-cyan-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <Gavel className="text-cyan-400" size={24} />
                    <h4 className="text-xl font-bold text-cyan-400">4.3 Legal Compliance & Law Enforcement</h4>
                  </div>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Data may be disclosed <span className="font-semibold text-yellow-400">without user consent</span> to comply with Nigerian law, court orders, subpoenas, or regulatory inquiries.</li>
                    <li>This includes cooperation with NDPR authorities, cybercrime units, labor regulators, tax authorities, and international law enforcement.</li>
                    <li>Data may be preserved and shared as <span className="font-semibold text-cyan-400">digital evidence</span>.</li>
                  </ul>
                </div>

                <div className="p-5 bg-red-900/30 rounded-lg border border-red-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="text-red-400" size={24} />
                    <h4 className="text-xl font-bold text-red-400">4.4 Fraud, Security, and Scam Investigations</h4>
                  </div>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Suspected scams, fraudulent job postings, or policy violations may result in sharing logs, account activity, and user submissions with authorities or investigators.</li>
                    <li>Krevv maintains full discretion to protect platform integrity and users.</li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* Section 5 */}
            <Section
              icon={<Users className="text-orange-400" size={24} />}
              number="5"
              title="User Responsibilities"
            >
              <p className="text-gray-300 mb-3">All users must:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Provide <span className="font-semibold text-green-400">accurate, truthful, and lawful information</span></li>
                <li>Protect login credentials and personal accounts</li>
                <li>Report <span className="font-semibold text-red-400">suspected fraud, scams, or unauthorized access</span></li>
                <li>Verify employer legitimacy independently before applying</li>
              </ul>
              <p className="text-yellow-400 font-semibold mt-4">
                Employers must ensure compliance with labor and data protection laws and refrain from collecting unauthorized sensitive data from applicants.
              </p>
            </Section>

            {/* Section 6 */}
            <Section
              icon={<UserCheck className="text-green-400" size={24} />}
              number="6"
              title="User Rights"
            >
              <p className="text-gray-300 mb-3">Depending on applicable law, users may exercise the following rights:</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <RightCard number="1" title="Access" description="Request access to personal data held by Krevv" />
                <RightCard number="2" title="Correction" description="Request correction of inaccurate or incomplete data" />
                <RightCard number="3" title="Deletion" description="Request deletion of personal data, subject to legal retention obligations" />
                <RightCard number="4" title="Restriction" description="Request restriction of processing for specific purposes" />
                <RightCard number="5" title="Withdrawal of Consent" description="Revoke consent for specific processing activities" />
                <RightCard number="6" title="Data Portability" description="Obtain a copy of personal data in a structured, machine-readable format" />
                <RightCard number="7" title="Complaints" description="Submit complaints regarding data processing to Krevv or regulatory authorities" />
              </div>
              <div className="mt-4 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
                <p className="text-blue-300 font-semibold">
                  Verification procedures will apply to prevent unauthorized access or fraudulent requests.
                </p>
              </div>
            </Section>

            {/* Section 7 */}
            <Section
              icon={<Lock className="text-cyan-400" size={24} />}
              number="7"
              title="Security Measures"
            >
              <p className="text-gray-300 mb-3">
                Krevv employs <span className="font-semibold text-cyan-400">robust technical and organizational measures</span>, including:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>HTTPS encrypted connections for all data transmission</li>
                <li>Secure server storage with firewalls and intrusion detection</li>
                <li>Role-based access control and authentication for internal systems</li>
                <li>Regular monitoring and logging of suspicious activity</li>
                <li>Incident response plans and disaster recovery procedures</li>
              </ul>
              <p className="text-yellow-400 font-semibold mt-4">
                Users acknowledge that no system is completely secure and accept inherent risks of online data transmission.
              </p>
            </Section>

            {/* Section 8 */}
            <Section
              icon={<Database className="text-purple-400" size={24} />}
              number="8"
              title="Data Retention After Account Deletion"
            >
              <p className="text-gray-300 mb-3">Upon deletion or termination of accounts:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Krevv will <span className="font-semibold text-purple-400">minimize retained data</span> but may retain records for compliance, audits, disputes, and legal obligations.</li>
                <li>Retained data will be <span className="font-semibold text-green-400">stored securely</span> and processed solely for lawful purposes.</li>
              </ul>
            </Section>

            {/* Section 9 */}
            <Section
              icon={<Cookie className="text-orange-400" size={24} />}
              number="9"
              title="Automated Processing, Analytics & Cookies"
            >
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Krevv uses automated processing for analytics, performance monitoring, fraud detection, and platform improvement.</li>
                <li>Data collected via cookies or tracking identifiers may be anonymized or pseudonymized wherever possible.</li>
                <li>Users may disable cookies, but some platform features may not function.</li>
              </ul>
            </Section>

            {/* Section 10 */}
            <Section
              icon={<Globe className="text-indigo-400" size={24} />}
              number="10"
              title="Third-Party Links & Integrations"
            >
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Krevv may link to employer websites or external job boards.</li>
                <li>Krevv is <span className="font-semibold text-red-400">NOT responsible</span> for third-party data collection, retention, or security practices.</li>
                <li>Users access third-party websites at their own risk.</li>
              </ul>
            </Section>

            {/* Section 11 */}
            <Section
              icon={<Search className="text-cyan-400" size={24} />}
              number="11"
              title="Digital Evidence Preservation"
            >
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>All activity logs, IP addresses, communication records, and submissions may be preserved as <span className="font-semibold text-cyan-400">digital evidence</span> for legal or regulatory investigations.</li>
                <li>Users acknowledge that such data may be disclosed to authorities <span className="font-semibold text-yellow-400">without notice</span> when legally required.</li>
              </ul>
            </Section>

            {/* Section 12 */}
            <Section
              icon={<AlertTriangle className="text-red-400" size={24} />}
              number="12"
              title="Misuse & Enforcement"
            >
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Users engaging in fraud, abuse, unauthorized data collection, or violation of this Notice may have accounts <span className="font-semibold text-red-400">suspended or permanently terminated</span>.</li>
                <li>Krevv may pursue legal remedies in cases of serious violations or repeated infractions.</li>
                <li>False or malicious requests regarding data access or deletion may result in legal consequences.</li>
              </ul>
            </Section>

            {/* Section 13 */}
            <Section
              icon={<FileText className="text-yellow-400" size={24} />}
              number="13"
              title="Policy Updates"
            >
              <p className="text-gray-300 mb-2">
                Krevv may update this Notice at any time without prior notice.
              </p>
              <p className="text-yellow-400 font-bold">
                Continued use of the Platform constitutes IRREVOCABLE ACCEPTANCE of updates and revisions.
              </p>
            </Section>

            {/* Section 14 */}
            <Section
              icon={<Scale className="text-green-400" size={24} />}
              number="14"
              title="Governing Law & Jurisdiction"
            >
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>This Notice is governed by the <span className="font-semibold text-green-400">laws of the Federal Republic of Nigeria</span>.</li>
                <li>Krevv complies with international data protection standards, including <span className="font-semibold text-cyan-400">NDPR, GDPR, DMCA, and CCPA principles</span>.</li>
                <li>All disputes fall under the <span className="font-semibold text-green-400">exclusive jurisdiction of Nigerian courts</span>.</li>
              </ul>
            </Section>

            {/* Section 15 */}
            <Section
              icon={<Mail className="text-blue-400" size={24} />}
              number="15"
              title="Contact Information"
            >
              <p className="text-gray-300 mb-2">
                For inquiries, requests, or complaints regarding data retention, disclosure, or processing, contact Krevv via the official{" "}
                <a href="/contact" className="text-blue-400 hover:text-blue-300 underline font-semibold">
                  Contact Us page
                </a>.
              </p>
              <p className="text-yellow-400 font-semibold">
                All requests are subject to identity verification to prevent unauthorized access.
              </p>
            </Section>
          </div>

          {/* Footer Notice */}
          <div className="mt-12 p-6 bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-2xl border border-blue-500/30">
            <div className="flex items-start gap-4">
              <Shield className="text-blue-400 flex-shrink-0 mt-1" size={28} />
              <div>
                <h3 className="text-xl font-bold text-blue-400 mb-2">Data Protection Commitment</h3>
                <p className="text-gray-200 leading-relaxed">
                  Krevv is committed to responsible data handling that balances user privacy, platform security, legal compliance, 
                  and transparency. We implement enterprise-grade security measures while maintaining the flexibility to support 
                  legitimate investigations and regulatory requirements.
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
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
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
      className="border-l-4 border-blue-500 pl-6 py-4"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-900/30 rounded-lg">{icon}</div>
        <h3 className="text-2xl font-bold text-white">
          {number}. {title}
        </h3>
      </div>
      <div className="text-gray-300 leading-relaxed">{children}</div>
    </motion.div>
  );
}

// Retention Row Component
function RetentionRow({
  dataType,
  period,
  purpose,
}: {
  dataType: string;
  period: string;
  purpose: string;
}) {
  return (
    <tr className="border-b border-gray-700/30 hover:bg-gray-800/30 transition">
      <td className="p-3">{dataType}</td>
      <td className="p-3 text-cyan-400 font-semibold">{period}</td>
      <td className="p-3 text-gray-400">{purpose}</td>
    </tr>
  );
}

// Right Card Component
function RightCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-green-600/30 rounded-full flex items-center justify-center flex-shrink-0 border border-green-500/50">
          <span className="text-sm font-bold text-green-400">{number}</span>
        </div>
        <div>
          <h4 className="font-bold text-green-400 mb-1">{title}</h4>
          <p className="text-gray-300 text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}

// Share Icon Component (add this since it's used)
function Share({ className, size }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
    </svg>
  );
}
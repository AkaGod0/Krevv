"use client";

import { motion } from "framer-motion";
import { 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Users,
  Shield,
  Clock,
  FileText,
  Ban,
  Gavel,
  Mail,
  Building2,
  Eye,
  Scale,
  DollarSign
} from "lucide-react";

export default function EmployerPostingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-900 via-black to-teal-900 text-white py-12 px-4 sm:px-6 lg:px-8">
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
            className="inline-block p-4 bg-emerald-600/20 rounded-full mb-4"
          >
            <Briefcase size={48} className="text-emerald-400" />
          </motion.div>
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
            Employer Posting Policy
          </h1>
          <p className="text-gray-300 text-lg">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Main Content Card */}
        <motion.div
          className="bg-black/50 backdrop-blur-xl rounded-3xl p-8 sm:p-12 shadow-2xl border border-emerald-600/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Introduction */}
          <div className="mb-8 p-6 bg-emerald-900/30 rounded-2xl border border-emerald-500/30">
            <p className="text-gray-200 leading-relaxed mb-3">
              This Employer Posting Policy governs all job listings submitted to{" "}
              <span className="font-bold text-emerald-400">Krevv</span> ("Platform", "we", "our", or "us").
            </p>
            <p className="text-gray-200 leading-relaxed mb-3">
              By posting a job on <span className="font-semibold text-cyan-400">krevv.com</span>, you ("Employer", "Recruiter", "Agent", or "Company") 
              agree to fully comply with this Policy, the{" "}
              <a href="/terms" className="text-emerald-400 hover:text-emerald-300 underline">Terms of Use</a>, 
              and all applicable laws.
            </p>
            <p className="text-red-400 font-bold">
              Failure to comply may result in IMMEDIATE REMOVAL, PERMANENT BANS, and LEGAL ACTION.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {/* Section 1 */}
            <Section
              icon={<Building2 className="text-blue-400" size={24} />}
              number="1"
              title="Eligibility to Post Jobs"
            >
              <p className="text-gray-300 mb-3">Only the following entities may post jobs on Krevv:</p>
              <div className="space-y-3">
                <EligibilityCard
                  icon={<CheckCircle className="text-green-400" size={20} />}
                  title="Verified employers hiring for their own organization"
                />
                <EligibilityCard
                  icon={<CheckCircle className="text-green-400" size={20} />}
                  title="Authorized recruitment agencies acting on behalf of legitimate employers"
                />
                <EligibilityCard
                  icon={<CheckCircle className="text-green-400" size={20} />}
                  title="Companies with lawful business operations"
                />
              </div>
              <div className="mt-4 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
                <p className="text-blue-300 font-semibold mb-2">
                  You must have the <span className="text-blue-400">LEGAL AUTHORITY</span> to advertise the position.
                </p>
                <p className="text-gray-300 text-sm">
                  Krevv reserves the right to request <span className="font-semibold text-yellow-400">proof of identity, company registration, or authorization</span> at any time.
                </p>
              </div>
            </Section>

            {/* Section 2 */}
            <Section
              icon={<FileText className="text-green-400" size={24} />}
              number="2"
              title="Job Posting Requirements"
            >
              <p className="text-gray-300 mb-4">
                All job listings <span className="font-bold text-green-400">MUST be accurate, clear, and lawful</span>.
              </p>
              <p className="text-gray-300 mb-3">Each job post must include:</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <RequirementCard icon="✅" text="Genuine job title" />
                <RequirementCard icon="✅" text="Real hiring company name" />
                <RequirementCard icon="✅" text="Accurate job location (or clearly marked Remote)" />
                <RequirementCard icon="✅" text="Detailed job description and responsibilities" />
                <RequirementCard icon="✅" text="Employment type (Full-time, Part-time, Contract, etc.)" />
                <RequirementCard icon="✅" text="Application method and deadline (if applicable)" />
              </div>
              <div className="mt-4 p-4 bg-red-900/30 rounded-lg border border-red-500/30">
                <p className="text-red-300 font-bold">
                  Misleading or vague listings are STRICTLY PROHIBITED.
                </p>
              </div>
            </Section>

            {/* Section 3 */}
            <Section
              icon={<Ban className="text-red-500" size={24} />}
              number="3"
              title="Prohibited Job Listings"
            >
              <p className="text-gray-300 mb-4">
                The following job postings are <span className="font-bold text-red-400">NOT ALLOWED</span> on Krevv:
              </p>
              <div className="space-y-2">
                <ProhibitedItem text="Fake, fraudulent, or scam jobs" />
                <ProhibitedItem text="Jobs requiring application fees, registration fees, training fees, or deposits" />
                <ProhibitedItem text="Pyramid schemes, MLMs, or referral-based income schemes" />
                <ProhibitedItem text="Jobs involving illegal activities" />
                <ProhibitedItem text="Adult, explicit, or immoral content" />
                <ProhibitedItem text="Discriminatory jobs based on race, gender, religion, nationality, age, or disability" />
                <ProhibitedItem text="Jobs requesting bank details, OTPs, BVN, or sensitive personal data at application stage" />
                <ProhibitedItem text="Commission-only roles without clear disclosure" />
              </div>
              <div className="mt-4 p-4 bg-red-900/50 rounded-lg border-2 border-red-500/50">
                <p className="text-red-300 font-bold text-lg">
                  Any violation leads to IMMEDIATE REMOVAL WITHOUT NOTICE.
                </p>
              </div>
            </Section>

            {/* Section 4 */}
            <Section
              icon={<DollarSign className="text-yellow-400" size={24} />}
              number="4"
              title="No Fees to Job Seekers (Zero Tolerance)"
            >
              <p className="text-gray-300 mb-3">
                Employers <span className="font-bold text-red-400">MUST NOT</span>:
              </p>
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3 p-4 bg-red-900/30 rounded-lg border border-red-500/30">
                  <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-300">Charge candidates to apply</span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-red-900/30 rounded-lg border border-red-500/30">
                  <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-300">Request payment for interviews, job offers, visas, or equipment</span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-red-900/30 rounded-lg border border-red-500/30">
                  <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-300">Redirect applicants to paid forms or platforms</span>
                </div>
              </div>
              <div className="p-4 bg-yellow-900/30 rounded-lg border-2 border-yellow-500/50">
                <p className="text-yellow-300 font-bold text-lg">
                  Krevv enforces a ZERO-TOLERANCE POLICY on this rule.
                </p>
              </div>
            </Section>

            {/* Section 5 */}
            <Section
              icon={<Clock className="text-cyan-400" size={24} />}
              number="5"
              title="Accuracy & Updates"
            >
              <p className="text-gray-300 mb-3">Employers are responsible for:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Keeping job listings up to date</li>
                <li>Removing listings once positions are filled</li>
                <li>Ensuring job details remain accurate throughout the posting period</li>
              </ul>
              <p className="text-red-400 font-semibold mt-4">
                Krevv is NOT RESPONSIBLE for expired or outdated listings.
              </p>
            </Section>

            {/* Section 6 */}
            <Section
              icon={<Users className="text-purple-400" size={24} />}
              number="6"
              title="Employer Conduct"
            >
              <p className="text-gray-300 mb-3">Employers must:</p>
              <div className="space-y-3">
                <ConductCard
                  icon={<CheckCircle className="text-green-400" size={18} />}
                  text="Communicate professionally and lawfully with applicants"
                />
                <ConductCard
                  icon={<CheckCircle className="text-green-400" size={18} />}
                  text="Respect applicant privacy and data protection laws"
                />
                <ConductCard
                  icon={<CheckCircle className="text-green-400" size={18} />}
                  text="Use applicant data ONLY for recruitment purposes"
                />
              </div>
              <div className="mt-4 p-4 bg-red-900/30 rounded-lg border border-red-500/30">
                <p className="text-red-300 font-semibold">
                  Harassment, misleading communication, or abuse of applicants is prohibited.
                </p>
              </div>
            </Section>

            {/* Section 7 */}
            <Section
              icon={<Eye className="text-orange-400" size={24} />}
              number="7"
              title="Job Review & Moderation"
            >
              <p className="text-gray-300 mb-3">
                Krevv reserves the <span className="font-bold text-orange-400">absolute right</span> to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Review all job postings before or after publication</li>
                <li>Edit, suspend, or remove any listing</li>
                <li>Reject job posts without explanation</li>
                <li>Suspend or permanently ban employer accounts</li>
              </ul>
              <div className="mt-4 p-4 bg-orange-900/30 rounded-lg border border-orange-500/30">
                <p className="text-orange-300 font-bold">
                  No refunds will be issued for removed listings due to policy violations.
                </p>
              </div>
            </Section>

            {/* Section 8 */}
            <Section
              icon={<Clock className="text-blue-400" size={24} />}
              number="8"
              title="Job Posting Duration"
            >
              <p className="text-gray-300 mb-2">Unless stated otherwise:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Job listings may remain active for <span className="font-semibold text-blue-400">14–30 days</span></li>
                <li>Krevv may remove listings that exceed allowed durations or violate quality standards</li>
              </ul>
            </Section>

            {/* Section 9 */}
            <Section
              icon={<Shield className="text-indigo-400" size={24} />}
              number="9"
              title="Third-Party Application Links"
            >
              <p className="text-gray-300 mb-3">If you redirect applicants to an external website:</p>
              <div className="space-y-3">
                <div className="p-4 bg-indigo-900/20 rounded-lg border border-indigo-500/30">
                  <p className="text-gray-300">✓ The site must be <span className="font-semibold text-green-400">legitimate and secure</span></p>
                </div>
                <div className="p-4 bg-indigo-900/20 rounded-lg border border-indigo-500/30">
                  <p className="text-gray-300">✓ The application process must be <span className="font-semibold text-green-400">free</span></p>
                </div>
                <div className="p-4 bg-indigo-900/20 rounded-lg border border-indigo-500/30">
                  <p className="text-gray-300">✓ The destination must <span className="font-semibold text-green-400">match the job listing</span></p>
                </div>
              </div>
              <p className="text-yellow-400 font-semibold mt-4">
                Krevv is not liable for issues on third-party websites.
              </p>
            </Section>

            {/* Section 10 */}
            <Section
              icon={<FileText className="text-purple-400" size={24} />}
              number="10"
              title="Intellectual Property"
            >
              <p className="text-gray-300 mb-3">
                By submitting job content to Krevv, you grant Krevv a{" "}
                <span className="font-semibold text-purple-400">non-exclusive, royalty-free license</span> to publish, 
                distribute, and display the content for job advertising purposes.
              </p>
              <p className="text-gray-300 mb-2">You confirm that:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>You own or have rights to the submitted content</li>
                <li>The content does not infringe third-party rights</li>
              </ul>
            </Section>

            {/* Section 11 */}
            <Section
              icon={<Ban className="text-red-500" size={24} />}
              number="11"
              title="Suspension & Enforcement"
            >
              <p className="text-gray-300 mb-3">Krevv may take enforcement actions including:</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <EnforcementCard icon="🗑️" text="Job deletion" />
                <EnforcementCard icon="⛔" text="Account suspension or termination" />
                <EnforcementCard icon="🚫" text="IP blocking" />
                <EnforcementCard icon="🚨" text="Reporting to authorities where required" />
              </div>
              <div className="mt-4 p-4 bg-red-900/50 rounded-lg border-2 border-red-500/50">
                <p className="text-red-300 font-bold text-lg">
                  Repeated violations result in PERMANENT BANS.
                </p>
              </div>
            </Section>

            {/* Section 12 */}
            <Section
              icon={<AlertTriangle className="text-yellow-400" size={24} />}
              number="12"
              title="No Agency Relationship"
            >
              <p className="text-gray-300 mb-3">Posting a job on Krevv does <span className="font-semibold text-red-400">NOT</span> create:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>A recruitment partnership</li>
                <li>An agency or employment relationship</li>
              </ul>
              <p className="text-yellow-400 font-semibold mt-4">
                Krevv acts solely as a JOB LISTING PLATFORM.
              </p>
            </Section>

            {/* Section 13 */}
            <Section
              icon={<FileText className="text-cyan-400" size={24} />}
              number="13"
              title="Policy Changes"
            >
              <p className="text-gray-300 mb-2">
                Krevv may update this Employer Posting Policy at any time.
              </p>
              <p className="text-cyan-400 font-semibold">
                Continued use of the Platform after changes constitutes acceptance of the revised policy.
              </p>
            </Section>

            {/* Section 14 */}
            <Section
              icon={<Scale className="text-green-400" size={24} />}
              number="14"
              title="Governing Law"
            >
              <p className="text-gray-300">
                This Policy shall be governed by the{" "}
                <span className="font-semibold text-green-400">laws of the Federal Republic of Nigeria</span>.
              </p>
            </Section>

            {/* Section 15 */}
            <Section
              icon={<Mail className="text-blue-400" size={24} />}
              number="15"
              title="Contact"
            >
              <p className="text-gray-300">
                For employer-related questions or policy clarifications, contact Krevv through the official{" "}
                <a href="/contact" className="text-blue-400 hover:text-blue-300 underline font-semibold">
                  Contact Us
                </a>{" "}
                page on krevv.com.
              </p>
            </Section>
          </div>

          {/* Footer Summary */}
          <div className="mt-12 p-6 bg-gradient-to-r from-emerald-900/50 to-teal-900/50 rounded-2xl border border-emerald-500/30">
            <div className="flex items-start gap-4">
              <Briefcase className="text-emerald-400 flex-shrink-0 mt-1" size={28} />
              <div>
                <h3 className="text-xl font-bold text-emerald-400 mb-2">Employer Compliance Summary</h3>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-400 flex-shrink-0" size={16} />
                    <span className="text-gray-300">Post only legitimate jobs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-400 flex-shrink-0" size={16} />
                    <span className="text-gray-300">Never charge application fees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-400 flex-shrink-0" size={16} />
                    <span className="text-gray-300">Keep listings accurate and updated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-400 flex-shrink-0" size={16} />
                    <span className="text-gray-300">Respect applicant privacy</span>
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
            className="inline-block px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
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
      className="border-l-4 border-emerald-500 pl-6 py-4"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-emerald-900/30 rounded-lg">{icon}</div>
        <h3 className="text-2xl font-bold text-white">
          {number}. {title}
        </h3>
      </div>
      <div className="text-gray-300 leading-relaxed">{children}</div>
    </motion.div>
  );
}

// Eligibility Card Component
function EligibilityCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-green-900/20 rounded-lg border border-green-500/30">
      {icon}
      <span className="text-gray-300">{title}</span>
    </div>
  );
}

// Requirement Card Component
function RequirementCard({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-emerald-900/20 rounded-lg border border-emerald-500/30">
      <span className="text-xl">{icon}</span>
      <span className="text-gray-300 text-sm">{text}</span>
    </div>
  );
}

// Prohibited Item Component
function ProhibitedItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-red-900/20 rounded-lg border border-red-500/30">
      <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
      <span className="text-gray-300">{text}</span>
    </div>
  );
}

// Conduct Card Component
function ConductCard({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
      {icon}
      <span className="text-gray-300">{text}</span>
    </div>
  );
}

// Enforcement Card Component
function EnforcementCard({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-red-900/20 rounded-lg border border-red-500/30">
      <span className="text-xl">{icon}</span>
      <span className="text-gray-300">{text}</span>
    </div>
  );
}
"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
  Copyright, 
  CheckSquare, 
  Shield, 
  AlertTriangle,
  UserCheck,
  Clock,
  Lock,
  Scale,
  Award
} from "lucide-react";

export default function ContentLicensingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white py-12 px-4 sm:px-6 lg:px-8">
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
            <Copyright size={48} className="text-purple-400" />
          </motion.div>
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
            Content Licensing Clause
          </h1>
          <p className="text-gray-300 text-lg">
            User-Submitted Content Rights & Acknowledgments
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
              This clause defines the rights and responsibilities associated with content submitted to{" "}
              <span className="font-bold text-purple-400">Krevv</span>. 
              By using our platform, you agree to grant Krevv specific licenses to use, display, and promote your content 
              while maintaining compliance with all applicable policies and laws.
            </p>
          </div>

          {/* Content Licensing Sections */}
          <div className="space-y-8">
            {/* Section 1 */}
            <Section
              icon={<UserCheck className="text-green-400" size={24} />}
              number="1"
              title="User Ownership"
            >
              <p className="text-gray-300">
                By submitting, posting, or uploading any content on Krevv (<span className="font-semibold text-purple-400">"User Content"</span>), 
                including but not limited to job listings, company profiles, resumes, cover letters, images, logos, or text, you affirm that:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mt-3">
                <li>You <span className="font-semibold text-green-400">own the rights</span> to the content, <strong>OR</strong></li>
                <li>You have obtained <span className="font-semibold text-green-400">proper authorization</span> from the rights holder</li>
              </ul>
            </Section>

            {/* Section 2 */}
            <Section
              icon={<Award className="text-blue-400" size={24} />}
              number="2"
              title="License Grant"
            >
              <p className="text-gray-300 mb-3">
                By submitting User Content, you grant Krevv a{" "}
                <span className="font-semibold text-blue-400">worldwide, non-exclusive, royalty-free, sublicensable, and transferable license</span> to:
              </p>
              <div className="space-y-3">
                <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                  <p className="text-gray-300">
                    <span className="font-semibold text-blue-400">Display, distribute, publish, reproduce, modify, or store</span> your content 
                    on Krevv and associated platforms
                  </p>
                </div>
                <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
                  <p className="text-gray-300">
                    <span className="font-semibold text-purple-400">Promote</span> your content across Krevv's website, email communications, 
                    social media, or third-party partner platforms for legitimate business purposes
                  </p>
                </div>
                <div className="p-4 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                  <p className="text-gray-300">
                    <span className="font-semibold text-cyan-400">Use</span> your content for internal analytics, reporting, and platform improvements
                  </p>
                </div>
              </div>
            </Section>

            {/* Section 3 */}
            <Section
              icon={<Clock className="text-orange-400" size={24} />}
              number="3"
              title="Duration of License"
            >
              <p className="text-gray-300 mb-2">
                The license remains effective for as long as the content is hosted on Krevv, or until you request deletion.
              </p>
              <div className="mt-3 p-4 bg-orange-900/30 rounded-lg border border-orange-500/30">
                <p className="text-orange-300 font-semibold">
                  Note: Deletion is subject to Krevv's{" "}
                  <a href="/data-retention" className="text-orange-400 hover:text-orange-300 underline">
                    Data Retention & Disclosure Notice
                  </a>{" "}
                  and legal obligations.
                </p>
              </div>
            </Section>

            {/* Section 4 */}
            <Section
              icon={<Shield className="text-yellow-400" size={24} />}
              number="4"
              title="User Representations"
            >
              <p className="text-gray-300 mb-3">You represent and warrant that:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-3 ml-4">
                <li>
                  Your content does <span className="font-semibold text-green-400">NOT violate</span> copyright, trademark, 
                  or any intellectual property rights of third parties
                </li>
                <li>
                  Your content does <span className="font-semibold text-green-400">NOT include</span> defamatory, obscene, 
                  illegal, or harmful material
                </li>
                <li>
                  You will <span className="font-semibold text-yellow-400">NOT hold Krevv liable</span> for any disputes 
                  arising from the submission of your content
                </li>
              </ul>
            </Section>

            {/* Section 5 */}
            <Section
              icon={<Lock className="text-red-400" size={24} />}
              number="5"
              title="Krevv Rights"
            >
              <p className="text-gray-300 mb-3">
                Krevv reserves the <span className="font-bold text-red-400">absolute right</span> to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Remove, modify, or refuse to display any content</li>
                <li>Enforce platform policies without notice</li>
                <li>Suspend or terminate accounts for violations</li>
              </ul>
              <div className="mt-4 p-4 bg-red-900/30 rounded-lg border border-red-500/30">
                <p className="text-red-300 font-semibold">
                  This includes content that violates our{" "}
                  <a href="/anti-scam" className="text-red-400 hover:text-red-300 underline">Anti-Scam & Safety Policy</a>,{" "}
                  <a href="/dmca" className="text-red-400 hover:text-red-300 underline">DMCA / Copyright Policy</a>, and{" "}
                  <a href="/data-retention" className="text-red-400 hover:text-red-300 underline">Data Retention policies</a>.
                </p>
              </div>
            </Section>
          </div>

          {/* User Acknowledgment Section */}
          <div className="mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="border-t-4 border-pink-500 pt-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-pink-900/30 rounded-lg">
                  <CheckSquare className="text-pink-400" size={28} />
                </div>
                <h2 className="text-3xl font-bold text-white">
                  User Acknowledgment Requirement
                </h2>
              </div>

              <p className="text-gray-300 mb-6">
                All users must acknowledge and agree to the following terms when registering, posting jobs, or submitting content:
              </p>

              {/* Acknowledgment Box */}
              <div className="p-6 bg-gradient-to-r from-pink-900/40 to-purple-900/40 rounded-2xl border-2 border-pink-500/50">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 border-2 border-pink-400 rounded flex items-center justify-center">
                      <CheckSquare className="text-pink-400" size={18} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-pink-400 mb-3">
                      Required Acknowledgment Text
                    </h3>
                    <div className="space-y-3 text-gray-200">
                      <p>
                        I acknowledge and agree that all content I submit to Krevv, including job listings, resumes, 
                        company profiles, or any other material, complies with Krevv's:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><a href="/terms" className="text-pink-400 hover:text-pink-300 underline">Terms of Use</a></li>
                        <li><a href="/content-licensing" className="text-pink-400 hover:text-pink-300 underline">Content Licensing Clause</a></li>
                        <li><a href="/anti-scam" className="text-pink-400 hover:text-pink-300 underline">Anti-Scam & Safety Policy</a></li>
                        <li><a href="/dmca" className="text-pink-400 hover:text-pink-300 underline">DMCA / Copyright Policy</a></li>
                        <li><a href="/data-retention" className="text-pink-400 hover:text-pink-300 underline">Data Retention & Disclosure Notice</a></li>
                      </ul>
                      <p className="font-semibold text-pink-300 mt-4">
                        I grant Krevv the rights to use, display, reproduce, and promote my content as described in the Content Licensing Clause.
                      </p>
                      <p className="font-bold text-red-400 mt-4">
                        I understand that submitting false, fraudulent, or infringing content may result in immediate removal, 
                        account suspension, or permanent ban, and may be reported to law enforcement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Implementation Note */}
              <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-bold text-blue-400 mb-1">Implementation Note</h4>
                    <p className="text-gray-300 text-sm">
                      This acknowledgment must be presented as a mandatory checkbox on all registration, job posting, 
                      and content submission forms. Users cannot proceed without accepting these terms.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Summary Box */}
          <div className="mt-12 p-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl border border-purple-500/30">
            <div className="flex items-start gap-4">
              <FileText className="text-purple-400 flex-shrink-0 mt-1" size={28} />
              <div>
                <h3 className="text-xl font-bold text-purple-400 mb-2">Content Rights Summary</h3>
                <div className="space-y-2 text-gray-200">
                  <p>✅ You retain ownership of your content</p>
                  <p>✅ Krevv receives a license to display and promote your content</p>
                  <p>✅ You must ensure your content doesn't violate any laws or policies</p>
                  <p>✅ Krevv can remove content that violates policies</p>
                  <p>✅ You accept full responsibility for content you submit</p>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Links */}
          <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            <PolicyLink href="/terms" title="Terms of Use" icon={<FileText size={20} />} />
            <PolicyLink href="/privacy" title="Privacy Policy" icon={<Shield size={20} />} />
            <PolicyLink href="/anti-scam" title="Anti-Scam Policy" icon={<AlertTriangle size={20} />} />
            <PolicyLink href="/dmca" title="DMCA Policy" icon={<Copyright size={20} />} />
            <PolicyLink href="/data-retention" title="Data Retention" icon={<Clock size={20} />} />
            <PolicyLink href="/employer-verification" title="Employer Verification" icon={<UserCheck size={20} />} />
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
            className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
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

// Policy Link Component
function PolicyLink({
  href,
  title,
  icon,
}: {
  href: string;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-4 bg-purple-900/20 hover:bg-purple-900/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all group"
    >
      <div className="text-purple-400 group-hover:text-purple-300 transition">{icon}</div>
      <span className="text-gray-300 group-hover:text-white font-semibold transition">{title}</span>
    </a>
  );
}
"use client";

import { motion } from "framer-motion";
import { 
  Shield, 
  Copyright, 
  AlertTriangle, 
  FileText, 
  Scale, 
  Users, 
  Lock,
  Ban,
  CheckCircle,
  Mail,
  Gavel,
  Search,
  XCircle
} from "lucide-react";

export default function Dcmapage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-black to-purple-900 text-white py-12 px-4 sm:px-6 lg:px-8">
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
            className="inline-block p-4 bg-indigo-600/20 rounded-full mb-4"
          >
            <Copyright size={48} className="text-indigo-400" />
          </motion.div>
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            DMCA / Copyright Policy
          </h1>
          <p className="text-gray-300 text-lg">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Main Content Card */}
        <motion.div
          className="bg-black/50 backdrop-blur-xl rounded-3xl p-8 sm:p-12 shadow-2xl border border-indigo-600/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Introduction */}
          <div className="mb-8 p-6 bg-indigo-900/30 rounded-2xl border border-indigo-500/30">
            <p className="text-gray-200 leading-relaxed mb-3">
              <span className="font-bold text-indigo-400">Krevv</span> ("Platform", "we", "our", or "us") operates{" "}
              <span className="font-semibold text-blue-400">krevv.com</span>, a professional job posting and job aggregation website. 
              We respect the intellectual property rights of others and expect all users, employers, and job seekers to do the same.
            </p>
            <p className="text-gray-200 leading-relaxed">
              This DMCA / Copyright Policy describes how Krevv handles copyright claims, the responsibilities of users, takedown procedures, 
              counter-notices, repeat infringement measures, and cooperation with authorities. It is designed to protect both users and the Platform, 
              and to comply with applicable copyright laws internationally, including U.S. DMCA principles and Nigerian copyright regulations.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {/* Section 1 */}
            <Section
              icon={<FileText className="text-blue-400" size={24} />}
              number="1"
              title="Purpose of This Policy"
            >
              <p className="text-gray-300 mb-3">The purpose of this Policy is to:</p>
              <ol className="list-decimal list-inside text-gray-300 space-y-2 ml-4">
                <li>Provide clear procedures for reporting copyright infringement.</li>
                <li>Ensure the lawful use of content on Krevv.</li>
                <li>Limit platform liability for user-submitted content.</li>
                <li>Support law enforcement and legal compliance.</li>
              </ol>
              <p className="text-yellow-400 font-semibold mt-4">
                This Policy applies to ALL USERS, including job seekers, employers, recruiters, and any visitors who access or use Krevv.
              </p>
            </Section>

            {/* Section 2 */}
            <Section
              icon={<Copyright className="text-purple-400" size={24} />}
              number="2"
              title="Intellectual Property on Krevv"
            >
              <p className="text-gray-300 mb-3">
                All content on Krevv, whether created by users or the Platform, is protected by copyright, trademark, or other intellectual property laws. 
                This includes:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Job postings</li>
                <li>Company logos and graphics</li>
                <li>Text content, such as descriptions or blogs</li>
                <li>User-submitted resumes, CVs, or cover letters</li>
                <li>Images, videos, and multimedia uploaded by employers or users</li>
              </ul>
              <p className="text-indigo-400 font-bold text-lg mt-4">
                Users acknowledge that they are responsible for ensuring they have the necessary rights or permission to upload or post content on Krevv.
              </p>
            </Section>

            {/* Section 3 */}
            <Section
              icon={<CheckCircle className="text-green-400" size={24} />}
              number="3"
              title="Ownership and Authorization"
            >
              <p className="text-gray-300 mb-3">By submitting content to Krevv, you certify and warrant that:</p>
              <ol className="list-decimal list-inside text-gray-300 space-y-2 ml-4">
                <li>You <span className="font-semibold text-green-400">own the copyright</span> to the content, <strong>OR</strong></li>
                <li>You have obtained <span className="font-semibold text-green-400">explicit permission or license</span> from the copyright holder to post or publish the content, and</li>
                <li>Posting the content does not violate any third-party rights, including intellectual property, trademark, or moral rights.</li>
              </ol>
              <p className="text-red-400 font-semibold mt-4">
                Users are fully responsible for all consequences arising from unauthorized posting or reproduction of copyrighted material.
              </p>
            </Section>

            {/* Section 4 */}
            <Section
              icon={<Ban className="text-red-400" size={24} />}
              number="4"
              title="Prohibited Conduct"
            >
              <p className="text-gray-300 mb-3">
                To maintain a safe, legal, and professional environment, the following actions are{" "}
                <span className="font-semibold text-red-400">strictly prohibited</span>:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Posting copyrighted material without permission</li>
                <li>Republishing job listings, images, logos, or text from other websites without authorization</li>
                <li>Using trademarks, company branding, or images deceptively</li>
                <li>Scraping or bulk copying Krevv content or third-party content</li>
                <li>Uploading pirated material or content infringing intellectual property rights</li>
              </ul>
              <div className="mt-4 p-4 bg-red-900/30 rounded-lg border border-red-500/30">
                <p className="text-red-300 font-semibold mb-2">Violation of these rules may result in:</p>
                <ul className="list-disc list-inside text-red-300 space-y-1 ml-4">
                  <li>Immediate removal of the content</li>
                  <li>Permanent suspension or termination of user accounts</li>
                  <li>IP blocking or denial of future access</li>
                  <li>Referral to law enforcement or legal action</li>
                </ul>
              </div>
            </Section>

            {/* Section 5 */}
            <Section
              icon={<Mail className="text-cyan-400" size={24} />}
              number="5"
              title="How to File a DMCA Takedown Notice"
            >
              <p className="text-gray-300 mb-3">
                If you believe your copyrighted work has been infringed on Krevv, you may submit a DMCA takedown notice. 
                To be valid, your notice must include:
              </p>
              <ol className="list-decimal list-inside text-gray-300 space-y-2 ml-4">
                <li><span className="font-semibold text-cyan-400">Identification of the copyrighted work</span> claimed to have been infringed.</li>
                <li><span className="font-semibold text-cyan-400">Identification of the infringing content</span> and its exact URL(s) on Krevv.</li>
                <li>Your <span className="font-semibold">full legal name, address, phone number, and email address</span>.</li>
                <li>A <span className="font-semibold text-yellow-400">statement of good faith</span> that you believe the use of the content is unauthorized.</li>
                <li>A statement, under penalty of perjury, that the information provided is accurate and that you are the copyright owner or authorized agent.</li>
                <li>Your <span className="font-semibold text-green-400">physical or electronic signature</span>.</li>
              </ol>
              <div className="mt-4 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
                <p className="text-blue-300 font-semibold">
                  Submit DMCA notices through the official{" "}
                  <a href="/contact" className="text-cyan-400 hover:text-cyan-300 underline">Contact Us</a> page 
                  or via email to Krevv's designated copyright agent.
                </p>
                <p className="text-red-400 font-semibold mt-2">
                  Incomplete or non-compliant notices will not be processed.
                </p>
              </div>
            </Section>

            {/* Section 6 */}
            <Section
              icon={<XCircle className="text-orange-400" size={24} />}
              number="6"
              title="Krevv's Takedown Procedure"
            >
              <p className="text-gray-300 mb-3">Upon receipt of a valid DMCA notice, Krevv may:</p>
              <ol className="list-decimal list-inside text-gray-300 space-y-2 ml-4">
                <li>Remove or disable access to the allegedly infringing content.</li>
                <li>Notify the user who posted the content.</li>
                <li>Preserve all relevant logs, IP addresses, and evidence for legal purposes.</li>
                <li>Retain records of the takedown for compliance and audit purposes.</li>
              </ol>
              <p className="text-yellow-400 font-semibold mt-4">
                Krevv acts promptly but makes no guarantees about timing or results.
              </p>
            </Section>

            {/* Section 7 */}
            <Section
              icon={<Scale className="text-purple-400" size={24} />}
              number="7"
              title="Counter-Notification Procedure"
            >
              <p className="text-gray-300 mb-3">
                If content is removed in error, the user who posted the content may submit a counter-notification. 
                The counter-notice must include:
              </p>
              <ol className="list-decimal list-inside text-gray-300 space-y-2 ml-4">
                <li>Identification of the removed content and its location before removal.</li>
                <li>A statement under penalty of perjury that the removal was a mistake or misidentification.</li>
                <li>Your full name, address, and phone number.</li>
                <li>Consent to the jurisdiction of a competent court and agreement to accept service of process.</li>
                <li>Your physical or electronic signature.</li>
              </ol>
              <p className="text-green-400 font-semibold mt-4">
                Once a valid counter-notice is received, Krevv may restore the content within 10–14 business days 
                unless the original complainant provides legal notice to the contrary.
              </p>
            </Section>

            {/* Section 8 */}
            <Section
              icon={<Ban className="text-red-500" size={24} />}
              number="8"
              title="Repeat Infringer Policy"
            >
              <p className="text-gray-300 mb-3">
                Krevv enforces a <span className="font-bold text-red-400">strict repeat infringer policy</span> in compliance with international copyright laws:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Users who repeatedly post infringing content will have accounts permanently terminated.</li>
                <li>Repeat infringers may be IP-blocked and blacklisted from creating new accounts.</li>
                <li>Krevv may take further legal action if warranted.</li>
              </ul>
              <p className="text-yellow-400 font-semibold mt-4">
                This policy protects both copyright holders and the integrity of the Platform.
              </p>
            </Section>

            {/* Section 9 */}
            <Section
              icon={<Shield className="text-indigo-400" size={24} />}
              number="9"
              title="Platform Liability Limitation"
            >
              <p className="text-gray-300 mb-3">
                Krevv operates as a <span className="font-semibold text-indigo-400">content hosting platform</span> and{" "}
                <span className="font-semibold text-red-400">does not verify ownership or accuracy</span> of user-submitted content prior to posting.
              </p>
              <p className="text-gray-300 mb-2">Users agree that:</p>
              <ol className="list-decimal list-inside text-gray-300 space-y-2 ml-4">
                <li>Krevv is <span className="font-semibold text-red-400">NOT responsible</span> for infringement by other users.</li>
                <li>Krevv is <span className="font-semibold text-red-400">NOT liable</span> for damages resulting from removal or posting of content.</li>
                <li>Users post content <span className="font-semibold text-yellow-400">at their own risk</span>.</li>
              </ol>
            </Section>

            {/* Section 10 */}
            <Section
              icon={<Gavel className="text-blue-400" size={24} />}
              number="10"
              title="Cooperation With Law Enforcement"
            >
              <p className="text-gray-300 mb-3">
                Krevv fully cooperates with law enforcement agencies, courts, and regulatory authorities in Nigeria and internationally.
              </p>
              <p className="text-gray-300 mb-2">We may:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Provide logs, IP addresses, account information, and content submissions.</li>
                <li>Preserve digital evidence for investigations.</li>
                <li>Disclose user information <span className="font-semibold text-yellow-400">without notice</span> when legally required.</li>
              </ul>
              <p className="text-red-400 font-semibold mt-4">
                By using Krevv, users consent to such disclosures.
              </p>
            </Section>

            {/* Section 11 */}
            <Section
              icon={<AlertTriangle className="text-yellow-400" size={24} />}
              number="11"
              title="Misrepresentation and Abuse"
            >
              <p className="text-gray-300 mb-3">
                Submitting false, misleading, or fraudulent DMCA notices or counter-notifications is prohibited.
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Users found abusing the DMCA process may have accounts terminated.</li>
                <li>Krevv reserves the right to pursue legal remedies for misuse of the DMCA process.</li>
              </ul>
            </Section>

            {/* Section 12 */}
            <Section
              icon={<FileText className="text-cyan-400" size={24} />}
              number="12"
              title="Updates to This Policy"
            >
              <p className="text-gray-300 mb-2">
                Krevv may update this Policy at any time, and changes become effective immediately upon publication.
              </p>
              <p className="text-yellow-400 font-semibold">
                Continued use of Krevv constitutes acceptance of the updated Policy.
              </p>
            </Section>

            {/* Section 13 */}
            <Section
              icon={<Scale className="text-green-400" size={24} />}
              number="13"
              title="Governing Law"
            >
              <p className="text-gray-300 mb-2">
                This Policy is governed by the{" "}
                <span className="font-semibold text-green-400">laws of the Federal Republic of Nigeria</span>, 
                while observing relevant international copyright frameworks, including the DMCA (U.S.) and Berne Convention principles.
              </p>
              <p className="text-yellow-400 font-semibold mt-2">
                All disputes fall under the exclusive jurisdiction of Nigerian courts.
              </p>
            </Section>

            {/* Section 14 */}
            <Section
              icon={<Mail className="text-blue-400" size={24} />}
              number="14"
              title="Contact for Copyright Complaints"
            >
              <p className="text-gray-300 mb-2">
                All copyright-related complaints, DMCA notices, and counter-notifications must be submitted through the official{" "}
                <a href="/contact" className="text-blue-400 hover:text-blue-300 underline font-semibold">
                  Contact Us
                </a>{" "}
                page on krevv.com.
              </p>
              <p className="text-indigo-400 font-semibold">
                Krevv designates its copyright agent as the primary contact for all such notices.
              </p>
            </Section>
          </div>

          {/* Footer Notice */}
          <div className="mt-12 p-6 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-2xl border border-indigo-500/30">
            <div className="flex items-start gap-4">
              <Copyright className="text-indigo-400 flex-shrink-0 mt-1" size={24} />
              <p className="text-gray-200 leading-relaxed">
                Krevv respects intellectual property rights and takes copyright infringement seriously. 
                We encourage all users to respect the creative work of others and to only post content they have the legal right to use.
              </p>
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
            className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
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
      className="border-l-4 border-indigo-500 pl-6 py-4"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-900/30 rounded-lg">{icon}</div>
        <h3 className="text-2xl font-bold text-white">
          {number}. {title}
        </h3>
      </div>
      <div className="text-gray-300 leading-relaxed">{children}</div>
    </motion.div>
  );
}
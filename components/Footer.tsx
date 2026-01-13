import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-purple-900 via-black to-blue-900 text-white py-12 mt-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Krevv
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Your trusted marketplace for jobs, freelancing and and remote opportunities. Connecting employers with qualified & skilled professionals.
            </p>
            <p className="text-gray-400 text-xs">
              © {new Date().getFullYear()} Krevv. All rights reserved.
            </p>
          </div>

          {/* Legal Policies */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-purple-400">Legal Policies</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="text-gray-300 hover:text-pink-400 transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="text-purple-400">→</span> Terms of Use
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-300 hover:text-pink-400 transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="text-purple-400">→</span> Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/dcma"
                  className="text-gray-300 hover:text-pink-400 transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="text-purple-400">→</span> DMCA / Copyright Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/data-retention"
                  className="text-gray-300 hover:text-pink-400 transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="text-purple-400">→</span> Data Retention & Disclosure
                </Link>
              </li>
              <li>
                <Link
                  href="/content-licensing"
                  className="text-gray-300 hover:text-pink-400 transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="text-purple-400">→</span> Content Licensing
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Compliance */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-emerald-400">Safety & Compliance</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/anti-scam"
                  className="text-gray-300 hover:text-pink-400 transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="text-emerald-400">→</span> Anti-Scam & Safety Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/employer-verification"
                  className="text-gray-300 hover:text-pink-400 transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="text-emerald-400">→</span> Employer Verification
                </Link>
              </li>
              <li>
                <Link
                  href="/employer-posting"
                  className="text-gray-300 hover:text-pink-400 transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="text-emerald-400">→</span> Employer Posting Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-gray-300 hover:text-pink-400 transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="text-emerald-400">→</span> Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-400">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-pink-400 transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="text-blue-400">→</span> About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-300 hover:text-pink-400 transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="text-blue-400">→</span> FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-pink-400 transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="text-blue-400">→</span> Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs"
                  className="text-gray-300 hover:text-pink-400 transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="text-blue-400">→</span> Browse Jobs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-6"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <div className="flex gap-4">
            <Link
              href="/terms"
              className="hover:text-pink-400 transition-colors duration-300"
            >
              Terms
            </Link>
            <span>•</span>
            <Link
              href="/privacy"
              className="hover:text-pink-400 transition-colors duration-300"
            >
              Privacy
            </Link>
            <span>•</span>
            <Link
              href="/faq"
              className="hover:text-pink-400 transition-colors duration-300"
            >
              FAQ
            </Link>
            <span>•</span>
            <Link
              href="/contact"
              className="hover:text-pink-400 transition-colors duration-300"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

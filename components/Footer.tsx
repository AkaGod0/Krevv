import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-purple-900 via-black to-blue-900 text-white py-6 mt-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
        {/* Copyright */}
        <p className="text-sm sm:text-base text-gray-200">
          © {new Date().getFullYear()} krevv. All rights reserved.
        </p>

        {/* Links */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm sm:text-base">
          <Link
            href="/terms"
            className="hover:text-pink-400 transition-colors duration-300"
          >
            Terms & Conditions
          </Link>
          <Link
            href="/cookies"
            className="hover:text-pink-400 transition-colors duration-300"
          >
            Cookies
          </Link>
          <Link
            href="/privacy"
            className="hover:text-pink-400 transition-colors duration-300"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}

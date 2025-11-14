"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="/" className="text-xl font-bold text-gray-800">
          Krevv
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 text-gray-600 font-medium">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/post">Posts</a>
          <a href="/contact">Contact</a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="flex flex-col items-start px-6 py-4 space-y-3 text-gray-700 font-medium">
            <a href="/" className="w-full hover:text-purple-600" onClick={() => setIsOpen(false)}>
              Home
            </a>
            <a href="/about" className="w-full hover:text-purple-600" onClick={() => setIsOpen(false)}>
              About
            </a>
            <a href="/post" className="w-full hover:text-purple-600" onClick={() => setIsOpen(false)}>
              Posts
            </a>
            <a href="/contact" className="w-full hover:text-purple-600" onClick={() => setIsOpen(false)}>
              Contact
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

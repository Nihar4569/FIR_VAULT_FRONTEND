import React, { useState } from "react";

const Navbar = () => {
  // State to toggle mobile menu visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Function to toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-blue-500 p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-white text-2xl font-bold">
          <a href="/">FIR Vault</a>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex space-x-6 text-white">
          <li>
            <a href="/" className="hover:text-gray-300">
              Home
            </a>
          </li>
          <li>
            <a href="/about" className="hover:text-gray-300">
              About
            </a>
          </li>
          <li>
            <a href="/services" className="hover:text-gray-300">
              Services
            </a>
          </li>
          <li>
            <a href="/contact" className="hover:text-gray-300">
              Contact
            </a>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button className="lg:hidden text-white" onClick={toggleMobileMenu}>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <ul className="lg:hidden text-white bg-blue-500 p-4 space-y-4">
          <li>
            <a href="/" className="block hover:text-gray-300">
              Home
            </a>
          </li>
          <li>
            <a href="/about" className="block hover:text-gray-300">
              About
            </a>
          </li>
          <li>
            <a href="/services" className="block hover:text-gray-300">
              Services
            </a>
          </li>
          <li>
            <a href="/contact" className="block hover:text-gray-300">
              Contact
            </a>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;

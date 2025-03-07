// 📌 src/components/Navbar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white shadow-lg py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo or App Name */}
        <h1 className="text-2xl font-bold">Time Table Scheduler</h1>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex space-x-6">
          <Link to="/dashboard" className="hover:text-gray-300 transition duration-300">
            Dashboard
          </Link>
          <Link to="/superadmin" className="hover:text-gray-300 transition duration-300">
            Super Admin
          </Link>
          <Link to="/adminpanel" className="hover:text-gray-300 transition duration-300">
            Admin Panel
          </Link>
        </div>

        {/* Authentication Links (Desktop) */}
        <div className="hidden md:flex space-x-4">
          <Link
            to="/"
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition duration-300"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition duration-300"
          >
            Sign Up
          </Link>
        </div>

        {/* Hamburger Button for Mobile */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4">
          <div className="flex flex-col space-y-2">
            <Link
              to="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-2 hover:bg-blue-500 transition duration-300"
            >
              Dashboard
            </Link>
            <Link
              to="/superadmin"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-2 hover:bg-blue-500 transition duration-300"
            >
              Super Admin
            </Link>
            <Link
              to="/adminpanel"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-2 hover:bg-blue-500 transition duration-300"
            >
              Admin Panel
            </Link>
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-200 transition duration-300"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition duration-300"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

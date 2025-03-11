// 📌 src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      const storedName = localStorage.getItem("username");
      setUserName(storedName || "Scholar");
    } else {
      setIsAuthenticated(false);
    }
  }, [navigate]);

  const handleSignOut = () => {
    // Clear user info from localStorage and redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    localStorage.removeItem("department");
    localStorage.removeItem("level");
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <nav className="bg-[#2b2c31] backdrop-blur-sm text-white shadow-lg py-4 px-6">
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

        {/* Authentication / User Info Links (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <span className="font-semibold">Welcome, {userName}!</span>
              <button
                onClick={handleSignOut}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition duration-300"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
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
            {isAuthenticated ? (
              <>
                <div className="px-4 py-2 font-semibold">Welcome, {userName}!</div>
                <button
                  onClick={() => { setMenuOpen(false); handleSignOut(); }} 
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition duration-300"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

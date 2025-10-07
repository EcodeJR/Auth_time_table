// 📌 src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      const storedName = localStorage.getItem("name");
      const storedRole = localStorage.getItem("role");
      setUserName(storedName || "Scholar");
      setUserRole(storedRole || "");
    } else {
      setIsAuthenticated(false);
      setUserRole("");
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

  // Show navbar on all pages, including landing page

  return (
    <nav className="bg-white backdrop-blur-sm text-accent-800 shadow-lg py-4 px-6 border-b border-primary-100">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo or App Name */}
        <Link to="/" className="flex items-center">
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
          <span className="ml-2 text-2xl font-bold text-accent-800">EduSchedule</span>
        </Link>

        {/* Navigation Links (Desktop) - Role-based */}
        <div className="hidden md:flex space-x-6">
          {userRole === 'hod' && (
            <Link to="/hod-dashboard" className="hover:text-primary-600 transition duration-300 font-medium">
              HOD Dashboard
            </Link>
          )}
          {userRole === 'course_rep' && (
            <Link to="/course-rep-dashboard" className="hover:text-primary-600 transition duration-300 font-medium">
              Course Rep Dashboard
            </Link>
          )}
          {isAuthenticated && (
            <Link to="/account-management" className="hover:text-primary-600 transition duration-300 font-medium">
              Account
            </Link>
          )}
          {userRole === 'student' && (
            <Link to="/student-feedback" className="hover:text-primary-600 transition duration-300 font-medium">
              Feedback
            </Link>
          )}
        </div>

        {/* Authentication / User Info Links (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <span className="font-semibold text-accent-700">
                Welcome, {userName}!
                {userRole === 'student' && ' (Student)'}
                {userRole === 'hod' && ' (HOD)'}
                {userRole === 'course_rep' && ' (Course Rep)'}
              </span>
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
                to="/login"
                className="text-accent-600 hover:text-primary-600 px-4 py-2 rounded-lg font-semibold transition duration-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition duration-300"
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
        <div className="md:hidden mt-4 bg-white border-t border-primary-100">
          <div className="flex flex-col space-y-2 py-4">
            {userRole === 'hod' && (
              <Link
                to="/hod-dashboard"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2 hover:bg-primary-50 transition duration-300 font-medium"
              >
                HOD Dashboard
              </Link>
            )}
            {userRole === 'course_rep' && (
              <Link
                to="/course-rep-dashboard"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2 hover:bg-primary-50 transition duration-300 font-medium"
              >
                Course Rep Dashboard
              </Link>
            )}
          {isAuthenticated && (
            <Link
              to="/account-management"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-2 hover:bg-primary-50 transition duration-300 font-medium"
            >
              Account Management
            </Link>
          )}
          {userRole === 'student' && (
            <Link
              to="/student-feedback"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-2 hover:bg-primary-50 transition duration-300 font-medium"
            >
              Student Feedback
            </Link>
          )}
            {isAuthenticated ? (
              <>
                <div className="px-4 py-2 font-semibold text-accent-700 border-t border-primary-100 mt-2 pt-2">
                  Welcome, {userName}!
                  {userRole === 'student' && ' (Student)'}
                  {userRole === 'hod' && ' (HOD)'}
                  {userRole === 'course_rep' && ' (Course Rep)'}
                </div>
                <button
                  onClick={() => { setMenuOpen(false); handleSignOut(); }} 
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition duration-300 mx-4"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2 text-accent-600 hover:bg-primary-50 rounded-lg font-semibold transition duration-300 mx-4"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition duration-300 mx-4"
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

import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { apiConfig, createApiRequest } from '../config/api';
import { exportTimetableToPDFClean } from '../utils/pdfExport';
import { AuthContext } from '../context/AuthContext';

// Simple SVG Icons
const CalendarIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UserGroupIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const AcademicCapIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);

const ChartBarIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

const MagnifyingGlassIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const LandingPage = () => {
  const { user } = useContext(AuthContext);
  const [searchData, setSearchData] = useState({
    faculty: '',
    department: '',
    level: '',
    semester: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    setShowResults(false);
    
    try {
      // Map department values to match backend expectations
      const departmentMapping = {
        'computer-science': 'computer science',
        'electrical': 'electrical engineering',
        'mechanical': 'mechanical engineering',
        'civil': 'civil engineering'
      };
      
      const mappedDepartment = departmentMapping[searchData.department] || searchData.department;
      
      const response = await axios(createApiRequest(apiConfig.endpoints.timetable.getPublic, {
        params: {
          department: mappedDepartment.toLowerCase(),
          level: searchData.level,
          semester: searchData.semester
        }
      }));
      
      setSearchResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching timetables:', error);
      alert('Error searching timetables. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleExportToPDF = (timetable) => {
    try {
      const filename = `${timetable.department}_Level_${timetable.level}_${timetable.semester}_Semester.pdf`;
      const success = exportTimetableToPDFClean(timetable, filename);
      
      if (success) {
        alert('Timetable exported to PDF successfully!');
      } else {
        alert('Error exporting timetable to PDF. Please try again.');
      }
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Error exporting timetable to PDF. Please try again.');
    }
  };

  const features = [
    {
      icon: <CalendarIcon />,
      title: "Automated Scheduling",
      description: "AI-powered timetable generation that eliminates conflicts and optimizes resource allocation."
    },
    {
      icon: <UserGroupIcon />,
      title: "Role-Based Access",
      description: "HOD manages departments, Course Reps handle level-specific timetables, Students view schedules."
    },
    {
      icon: <ChartBarIcon />,
      title: "Real-time Analytics",
      description: "Comprehensive dashboard with statistics, usage analytics, and performance metrics."
    },
    {
      icon: <ShieldCheckIcon />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with role-based permissions and data protection."
    }
  ];

  const steps = [
    {
      step: "01",
      title: "HOD Management",
      description: "Head of Department creates courses, manages venues, and generates timetables for their department."
    },
    {
      step: "02", 
      title: "Course Rep Assignment",
      description: "HOD assigns Course Representatives to specific levels and shares timetables with them."
    },
    {
      step: "03",
      title: "Student Access",
      description: "Students can search and view their timetables by faculty, department, and level."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-accent-900 mb-6">
              Smart Timetable
              <span className="text-primary-600 block">Management System</span>
            </h1>
            <p className="text-xl text-accent-600 mb-8 max-w-3xl mx-auto">
              Streamline your academic scheduling with our intelligent timetable generator. 
              Manage courses, venues, and schedules effortlessly with role-based access control.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user.token ? (
                // User is logged in - show role-appropriate button
                <>
                  {user.role === 'hod' && (
                    <Link 
                      to="/hod-dashboard" 
                      className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors inline-flex items-center"
                    >
                      Go to HOD Dashboard
                      <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </Link>
                  )}
                  {user.role === 'course_rep' && (
                    <Link 
                      to="/course-rep-dashboard" 
                      className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors inline-flex items-center"
                    >
                      Go to Course Rep Dashboard
                      <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </Link>
                  )}
                  {user.role === 'student' && (
                    <div className="text-center">
                      <p className="text-accent-700 mb-4">Welcome back, {user.name}! You can search for timetables below.</p>
                      <Link 
                        to="/account-management" 
                        className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors inline-flex items-center"
                      >
                        Manage Account
                        <ArrowRightIcon className="w-5 h-5 ml-2" />
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                // User is not logged in - show login button
                <Link 
                  to="/login" 
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors inline-flex items-center"
                >
                  Get Started
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* Timetable Search Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-accent-900 mb-4">Find Your Timetable</h2>
            <p className="text-lg text-accent-600">Search for your schedule by faculty, department, level, and semester</p>
          </div>
          
          <div className="bg-primary-50 rounded-2xl p-8 shadow-lg">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-accent-700 mb-2">Faculty</label>
                  <select 
                    value={searchData.faculty}
                    onChange={(e) => setSearchData({...searchData, faculty: e.target.value})}
                    className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Faculty</option>
                    <option value="engineering">Engineering</option>
                    <option value="science">Science</option>
                    <option value="arts">Arts</option>
                    <option value="business">Business</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-700 mb-2">Department</label>
                  <select 
                    value={searchData.department}
                    onChange={(e) => setSearchData({...searchData, department: e.target.value})}
                    className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Department</option>
                    <option value="computer-science">Computer Science</option>
                    <option value="electrical">Electrical Engineering</option>
                    <option value="mechanical">Mechanical Engineering</option>
                    <option value="civil">Civil Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-700 mb-2">Level</label>
                  <select 
                    value={searchData.level}
                    onChange={(e) => setSearchData({...searchData, level: e.target.value})}
                    className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Level</option>
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                    <option value="500">500 Level</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-700 mb-2">Semester</label>
                  <select 
                    value={searchData.semester}
                    onChange={(e) => setSearchData({...searchData, semester: e.target.value})}
                    className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Semester</option>
                    <option value="first">First Semester</option>
                    <option value="second">Second Semester</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
                disabled={searchLoading}
              >
                {searchLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                    Search Timetable
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Search Results */}
          {showResults && (
            <div className="mt-8 bg-white rounded-2xl p-8 shadow-lg border border-primary-100">
              <h3 className="text-2xl font-bold text-accent-800 mb-6">Search Results</h3>
              
              {searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-accent-600 text-lg">No published timetables found for your search criteria.</p>
                  <p className="text-accent-500 mt-2">Please check with your department or try different search parameters.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {searchResults.map((timetable) => (
                    <div key={timetable._id} className="border border-accent-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-accent-800">
                            {timetable.department} - Level {timetable.level} - {timetable.semester.charAt(0).toUpperCase() + timetable.semester.slice(1)} Semester
                          </h4>
                          <p className="text-accent-600">
                            Created by: {timetable.createdBy?.name}
                          </p>
                          <p className="text-sm text-accent-500">
                            {timetable.courses.length} courses scheduled
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleExportToPDF(timetable)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center text-sm"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export PDF
                          </button>
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                            Published
                          </div>
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-separate border-spacing-0 rounded-lg shadow-sm bg-primary-50 text-sm">
                          <thead>
                            <tr className="bg-primary-600 text-white rounded-t-lg">
                              <th className="p-3 font-bold text-center rounded-tl-lg">Time</th>
                              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, i) => (
                                <th
                                  key={day}
                                  className={`p-3 font-bold text-center ${i === 4 ? 'rounded-tr-lg' : ''}`}
                                >
                                  {day}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {['8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM', '2:00 PM - 4:00 PM'].map((timeSlot, timeIndex) => (
                              <tr key={timeSlot} className={timeIndex % 2 === 0 ? 'bg-white' : 'bg-primary-50'}>
                                <td className="p-3 font-semibold text-accent-800 border-r border-primary-200">
                                  {timeSlot}
                                </td>
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                                  const courses = timetable.courses.filter(course => 
                                    course.day === day && course.time === timeSlot
                                  );
                                  return (
                                    <td key={day} className="p-3 border-r border-primary-200 min-w-[150px]">
                                      {courses.length === 0 ? (
                                        <span className="text-accent-400 italic text-xs">Free</span>
                                      ) : (
                                        courses.map((course, index) => (
                                          <div
                                            key={index}
                                            className="mb-1 last:mb-0 p-2 rounded bg-white shadow-sm border border-primary-200"
                                          >
                                            <p className="font-semibold text-accent-800 text-xs">
                                              {course.courseName}
                                            </p>
                                            <p className="text-xs text-accent-600">
                                              {course.courseCode}
                                            </p>
                                            <p className="text-xs text-primary-600 font-medium">
                                              {course.venue}
                                            </p>
                                          </div>
                                        ))
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-accent-900 mb-4">Why Choose EduSchedule?</h2>
            <p className="text-lg text-accent-600 max-w-2xl mx-auto">
              Our platform combines intelligent automation with user-friendly design to revolutionize academic scheduling.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-primary-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-accent-900 mb-3">{feature.title}</h3>
                <p className="text-accent-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-accent-900 mb-4">How It Works</h2>
            <p className="text-lg text-accent-600">Simple steps to manage your academic schedules</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-accent-900 mb-4">{step.title}</h3>
                <p className="text-accent-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Scheduling?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of educational institutions already using EduSchedule to streamline their academic operations.
          </p>
          <Link 
            to="/login" 
            className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-3 rounded-lg text-lg font-semibold transition-colors inline-flex items-center mx-auto"
          >
            Get Started Today
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-accent-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <AcademicCapIcon className="w-8 h-8 text-primary-400" />
                <span className="ml-2 text-xl font-bold">EduSchedule</span>
              </div>
              <p className="text-accent-300">
                Intelligent timetable management for modern educational institutions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-accent-300">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Demo</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-accent-300">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-accent-300">
                <li><a href="#" className="hover:text-primary-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-accent-800 mt-8 pt-8 text-center text-accent-400">
            <p>&copy; 2024 EduSchedule. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiConfig, createApiRequest } from '../config/api';
import FeedbackAnalytics from '../components/FeedbackAnalytics';

// Simple SVG Icons
const CalendarIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CourseRepDashboard = () => {
  const [sharedTimetables, setSharedTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [activeSection, setActiveSection] = useState('timetables');
  const [stats, setStats] = useState({
    reviewStats: {
      sharedTimetables: 0,
      publishedTimetables: 0,
      timetablesReviewedToday: 0,
      timetablesPublishedThisWeek: 0
    },
    departmentInsights: {
      totalStudents: 0
    },
    feedbackStats: {
      totalFeedback: 0,
      averageRating: 0,
      pendingResponses: 0
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [timetablesRes, statsRes] = await Promise.all([
        axios(createApiRequest(apiConfig.endpoints.timetable.getShared, {
          headers: { Authorization: token }
        })),
        axios(createApiRequest(apiConfig.endpoints.admin.courseRepDashboardStats, {
          headers: { Authorization: token }
        }))
      ]);
      
      setSharedTimetables(timetablesRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTimetable = (timetable) => {
    setSelectedTimetable(timetable);
    setShowTimetableModal(true);
  };

  const handlePublishTimetable = async (timetableId) => {
    try {
      const token = localStorage.getItem("token");
      await axios(createApiRequest(apiConfig.endpoints.timetable.publish, {
        method: 'POST',
        data: { timetableId },
        headers: { Authorization: token }
      }));
      
      alert("Timetable published successfully! Students can now view it on the landing page.");
      fetchSharedTimetables();
    } catch (error) {
      console.error("Error publishing timetable:", error);
      alert("Error publishing timetable. Please try again.");
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-accent-600 text-lg">Loading shared timetables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-4 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-accent-800 mb-2">Course Representative Dashboard</h1>
          <p className="text-sm sm:text-base lg:text-lg text-accent-600">View timetables shared with you by your HOD</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 bg-accent-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveSection('timetables')}
              className={`flex-1 py-2 sm:py-3 px-3 sm:px-6 rounded-md font-semibold transition-colors text-sm sm:text-base ${
                activeSection === 'timetables'
                  ? 'bg-primary-600 text-white'
                  : 'text-accent-600 hover:text-primary-600'
              }`}
            >
              <span className="hidden sm:inline">Timetable Review</span>
              <span className="sm:hidden">Timetables</span>
            </button>
            <button
              onClick={() => setActiveSection('feedback')}
              className={`flex-1 py-2 sm:py-3 px-3 sm:px-6 rounded-md font-semibold transition-colors text-sm sm:text-base ${
                activeSection === 'feedback'
                  ? 'bg-primary-600 text-white'
                  : 'text-accent-600 hover:text-primary-600'
              }`}
            >
              <span className="hidden sm:inline">Feedback Analytics</span>
              <span className="sm:hidden">Feedback</span>
            </button>
          </div>
        </div>

        {/* Enhanced Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Review Performance */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs sm:text-sm font-medium">Review Performance</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.reviewStats?.publishedTimetables || 0}</p>
                <p className="text-blue-200 text-xs mt-1">
                  Published this week: {stats.reviewStats?.timetablesPublishedThisWeek || 0}
                </p>
              </div>
              <CheckIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200" />
            </div>
          </div>

          {/* Pending Reviews */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs sm:text-sm font-medium">Pending Reviews</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.reviewStats?.sharedTimetables || 0}</p>
                <p className="text-orange-200 text-xs mt-1">
                  Reviewed today: {stats.reviewStats?.timetablesReviewedToday || 0}
                </p>
              </div>
              <EyeIcon className="w-6 h-6 sm:w-8 sm:h-8 text-orange-200" />
            </div>
          </div>

          {/* Department Insights */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs sm:text-sm font-medium">Department</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.departmentInsights?.totalStudents || 0}</p>
                <p className="text-green-200 text-xs mt-1">Total Students</p>
              </div>
              <GlobeIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-200" />
            </div>
          </div>

          {/* Student Feedback */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs sm:text-sm font-medium">Student Feedback</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.feedbackStats?.totalFeedback || 0}</p>
                <p className="text-purple-200 text-xs mt-1">
                  Avg Rating: {stats.feedbackStats?.averageRating || 0}/5
                </p>
              </div>
              <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Timetable Review Section */}
        {activeSection === 'timetables' && (
          <div className="bg-white rounded-xl shadow-lg border border-primary-100 p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-accent-800 mb-4 sm:mb-6">Shared Timetables</h2>
          
          {sharedTimetables.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <CalendarIcon />
              <p className="text-accent-600 text-base sm:text-lg mt-4">No timetables shared with you yet.</p>
              <p className="text-accent-500 mt-2 text-sm sm:text-base">Your HOD will share timetables for your level.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sharedTimetables.map((timetable) => (
                <div key={timetable._id} className="border border-accent-200 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4">
                    <div className="mb-2 sm:mb-0">
                      <h3 className="font-bold text-accent-800 text-sm sm:text-base">
                        {timetable.department} - Level {timetable.level}
                      </h3>
                      <p className="text-xs sm:text-sm text-accent-600">
                        Shared by: {timetable.createdBy?.name}
                      </p>
                    </div>
                    <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-center ${
                      timetable.status === 'shared' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {timetable.status.charAt(0).toUpperCase() + timetable.status.slice(1)}
                    </div>
                  </div>
                  
                  <div className="mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm text-accent-600">
                      <span className="font-medium">{timetable.courses.length}</span> courses scheduled
                    </p>
                    <p className="text-xs text-accent-500">
                      Updated: {new Date(timetable.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => handleViewTimetable(timetable)}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center text-sm"
                    >
                      <EyeIcon />
                      <span className="ml-2">View Timetable</span>
                    </button>
                    
                    {timetable.status === 'shared' && (
                      <button
                        onClick={() => handlePublishTimetable(timetable._id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center text-sm"
                      >
                        <GlobeIcon />
                        <span className="ml-2">Publish for Students</span>
                      </button>
                    )}
                    
                    {timetable.status === 'published' && (
                      <div className="w-full bg-green-100 text-green-800 py-2 rounded-lg font-semibold flex items-center justify-center text-sm">
                        <CheckIcon />
                        <span className="ml-2">Published & Live</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        )}

        {/* Timetable Modal */}
        {showTimetableModal && selectedTimetable && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-primary-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-accent-800">
                    {selectedTimetable.department} - Level {selectedTimetable.level} Timetable
                  </h3>
                  <button
                    onClick={() => setShowTimetableModal(false)}
                    className="text-accent-500 hover:text-accent-700 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-auto max-h-[70vh]">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-0 rounded-xl shadow-lg bg-white text-sm">
                    <thead>
                      <tr className="bg-primary-600 text-white rounded-t-xl">
                        <th className="p-4 font-bold text-lg rounded-tl-xl">Time</th>
                        {days.map((day, i) => (
                          <th
                            key={day}
                            className={`p-4 font-bold text-lg text-center ${i === days.length - 1 ? 'rounded-tr-xl' : ''}`}
                          >
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {['8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM', '2:00 PM - 4:00 PM'].map((timeSlot, timeIndex) => (
                        <tr key={timeSlot} className={timeIndex % 2 === 0 ? 'bg-primary-50' : 'bg-white'}>
                          <td className="p-4 font-semibold text-accent-800 border-r border-primary-200">
                            {timeSlot}
                          </td>
                          {days.map((day) => {
                            const courses = selectedTimetable.courses.filter(course => 
                              course.day === day && course.time === timeSlot
                            );
                            return (
                              <td key={day} className="p-4 border-r border-primary-200 min-w-[200px]">
                                {courses.length === 0 ? (
                                  <span className="text-accent-400 italic">Free</span>
                                ) : (
                                  courses.map((course, index) => (
                                    <div
                                      key={index}
                                      className="mb-2 last:mb-0 p-3 rounded-lg bg-white shadow-sm border border-primary-200"
                                    >
                                      <p className="font-semibold text-accent-800 text-sm">
                                        {course.courseName}
                                      </p>
                                      <p className="text-xs text-accent-600">
                                        {course.courseCode}
                                      </p>
                                      <p className="text-xs text-primary-600 font-medium">
                                        {course.venue}
                                      </p>
                                      {course.instructor && (
                                        <p className="text-xs text-accent-500">
                                          Instructor: {course.instructor}
                                        </p>
                                      )}
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
            </div>
          </div>
        )}

        {/* Feedback Analytics Section */}
        {activeSection === 'feedback' && (
          <div className="bg-white rounded-xl shadow-lg border border-primary-100 p-6">
            <h2 className="text-2xl font-bold text-accent-800 mb-6">Feedback Analytics</h2>
            <FeedbackAnalytics userRole="course_rep" />
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseRepDashboard;

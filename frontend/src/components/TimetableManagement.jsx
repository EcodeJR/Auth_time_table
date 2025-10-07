import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiConfig, createApiRequest } from '../config/api';
import { exportTimetableToPDFClean } from '../utils/pdfExport';

// Simple SVG Icons
const ShareIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const BookOpenIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const TimetableManagement = () => {
  const [timetables, setTimetables] = useState([]);
  const [courseReps, setCourseReps] = useState([]);
  const [venues, setVenues] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timetables');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAddVenueModal, setShowAddVenueModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [selectedCourseReps, setSelectedCourseReps] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCourseSemester, setSelectedCourseSemester] = useState('');
  
  // Form states
  const [newVenue, setNewVenue] = useState({ name: '', capacity: '', location: '' });
  const [newCourse, setNewCourse] = useState({ code: '', name: '', level: '', semester: '', instructor: '', classSize: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const department = localStorage.getItem("department");
      
      const [timetablesRes, courseRepsRes, venuesRes, coursesRes] = await Promise.all([
        axios(createApiRequest(apiConfig.endpoints.timetable.getByDept(department), {
          headers: { Authorization: token }
        })),
        axios(createApiRequest(apiConfig.endpoints.timetable.getCourseReps(department), {
          headers: { Authorization: token }
        })),
        axios(createApiRequest(apiConfig.endpoints.timetable.getVenues(department), {
          headers: { Authorization: token }
        })),
        axios(createApiRequest(apiConfig.endpoints.timetable.getCourses(department), {
          headers: { Authorization: token }
        }))
      ]);
      
      setTimetables(timetablesRes.data);
      setCourseReps(courseRepsRes.data);
      setVenues(venuesRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVenue = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const department = localStorage.getItem("department");
      
      await axios(createApiRequest(apiConfig.endpoints.timetable.addVenue, {
        method: 'POST',
        data: { ...newVenue, department },
        headers: { Authorization: token }
      }));
      
      alert("Venue added successfully!");
      setNewVenue({ name: '', capacity: '', location: '' });
      setShowAddVenueModal(false);
      fetchData();
    } catch (error) {
      console.error("Error adding venue:", error);
      alert("Error adding venue. Please try again.");
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const department = localStorage.getItem("department");
      
      const response = await axios(createApiRequest(apiConfig.endpoints.timetable.addCourse, {
        method: 'POST',
        data: { ...newCourse, department },
        headers: { Authorization: token }
      }));
      
      let message = "Course added successfully!";
      if (response.data.updateNotification) {
        message += `\n\n⚠️ ${response.data.updateNotification.message}`;
      }
      
      alert(message);
      setNewCourse({ code: '', name: '', level: '', semester: '', instructor: '', classSize: '' });
      setShowAddCourseModal(false);
      fetchData();
    } catch (error) {
      console.error("Error adding course:", error);
      alert(`Error adding course: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleGenerateTimetable = async () => {
    try {
      const token = localStorage.getItem("token");
      const department = localStorage.getItem("department");
      
      if (!selectedSemester) {
        alert("Please select a semester");
        return;
      }
      
      const response = await axios(createApiRequest(apiConfig.endpoints.timetable.generate, {
        method: 'POST',
        data: { 
          department, 
          level: selectedLevel || undefined,
          semester: selectedSemester
        },
        headers: { Authorization: token }
      }));
      
      alert(`Timetable generated successfully!\n\nSummary:\n- Total Courses: ${response.data.summary.totalCourses}\n- Scheduled: ${response.data.summary.scheduledCourses}\n- Unscheduled: ${response.data.summary.unscheduledCourses}\n- Levels: ${response.data.summary.levels.join(', ')}\n- Semester: ${response.data.summary.semester}\n- Timetables Generated: ${response.data.summary.timetablesGenerated}`);
      
      setShowGenerateModal(false);
      setSelectedLevel('');
      setSelectedSemester('');
      fetchData();
    } catch (error) {
      console.error("Error generating timetable:", error);
      alert(`Error generating timetable: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleShareTimetable = (timetable) => {
    setSelectedTimetable(timetable);
    setSelectedCourseReps(timetable.sharedWith || []);
    setShowShareModal(true);
  };

  const handleShareSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios(createApiRequest(apiConfig.endpoints.timetable.share, {
        method: 'POST',
        data: {
          timetableId: selectedTimetable._id,
          courseRepIds: selectedCourseReps
        },
        headers: { Authorization: token }
      }));
      
      alert("Timetable shared successfully!");
      setShowShareModal(false);
      fetchData();
    } catch (error) {
      console.error("Error sharing timetable:", error);
      alert("Error sharing timetable. Please try again.");
    }
  };

  const handleViewTimetable = async (timetableId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios(createApiRequest(apiConfig.endpoints.timetable.view(timetableId), {
        headers: { Authorization: token }
      }));
      
      setSelectedTimetable(response.data);
      setShowTimetableModal(true);
    } catch (error) {
      console.error("Error fetching timetable:", error);
      alert("Error fetching timetable. Please try again.");
    }
  };

  const handleDeleteTimetable = async (timetableId) => {
    if (!confirm("Are you sure you want to delete this timetable? This action cannot be undone.")) {
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      await axios(createApiRequest(apiConfig.endpoints.timetable.delete(timetableId), {
        method: 'DELETE',
        headers: { Authorization: token }
      }));
      
      alert("Timetable deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("Error deleting timetable:", error);
      alert(`Error deleting timetable: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleRegenerateTimetable = async (timetableId) => {
    if (!confirm("Are you sure you want to regenerate this timetable? The current timetable will be deleted and a new one will be created.")) {
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios(createApiRequest(apiConfig.endpoints.timetable.regenerate(timetableId), {
        method: 'POST',
        headers: { Authorization: token }
      }));
      
      alert(`Timetable regenerated successfully!\n\nSummary:\n- Total Courses: ${response.data.summary.totalCourses}\n- Scheduled: ${response.data.summary.scheduledCourses}\n- Unscheduled: ${response.data.summary.unscheduledCourses}\n- Levels: ${response.data.summary.levels.join(', ')}\n- Semester: ${response.data.summary.semester}\n- Timetables Generated: ${response.data.summary.timetablesGenerated}`);
      fetchData();
    } catch (error) {
      console.error("Error regenerating timetable:", error);
      alert(`Error regenerating timetable: ${error.response?.data?.message || error.message}`);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg border border-primary-100 p-6">
        <div className="flex space-x-1 bg-primary-50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('timetables')}
            className={`flex-1 py-3 px-6 rounded-md font-semibold transition-colors flex items-center justify-center ${
              activeTab === 'timetables'
                ? 'bg-primary-600 text-white'
                : 'text-accent-600 hover:text-primary-600'
            }`}
          >
            <CalendarIcon />
            <span className="ml-2">Timetables</span>
          </button>
          <button
            onClick={() => setActiveTab('venues')}
            className={`flex-1 py-3 px-6 rounded-md font-semibold transition-colors flex items-center justify-center ${
              activeTab === 'venues'
                ? 'bg-primary-600 text-white'
                : 'text-accent-600 hover:text-primary-600'
            }`}
          >
            <BuildingIcon />
            <span className="ml-2">Venues</span>
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex-1 py-3 px-6 rounded-md font-semibold transition-colors flex items-center justify-center ${
              activeTab === 'courses'
                ? 'bg-primary-600 text-white'
                : 'text-accent-600 hover:text-primary-600'
            }`}
          >
            <BookOpenIcon />
            <span className="ml-2">Courses</span>
          </button>
        </div>
      </div>

      {/* Timetables Tab */}
      {activeTab === 'timetables' && (
        <div className="bg-white rounded-xl shadow-lg border border-primary-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-accent-800">Timetable Management</h2>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
            >
              <CalendarIcon />
              <span className="ml-2">Generate Timetable</span>
            </button>
          </div>
          
          {timetables.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-accent-600 text-lg">No timetables found for your department.</p>
              <p className="text-accent-500 mt-2">Add venues and courses first, then generate timetables.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {timetables.map((timetable) => (
                <div key={timetable._id} className="border border-accent-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-accent-800">
                        {timetable.department} - Level {timetable.level} - {timetable.semester.charAt(0).toUpperCase() + timetable.semester.slice(1)} Semester
                      </h3>
                      <p className="text-sm text-accent-600">
                        Status: <span className={`font-medium ${
                          timetable.status === 'draft' ? 'text-yellow-600' :
                          timetable.status === 'shared' ? 'text-blue-600' :
                          'text-green-600'
                        }`}>
                          {timetable.status.charAt(0).toUpperCase() + timetable.status.slice(1)}
                        </span>
                      </p>
                      <p className="text-sm text-accent-500">
                        Courses: {timetable.courses.length}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      {/* View Timetable Button - Always available */}
                      <button
                        onClick={() => handleViewTimetable(timetable._id)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg font-semibold transition-colors flex items-center text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="ml-1">View</span>
                      </button>

                      {/* Export PDF Button - Always available */}
                      <button
                        onClick={() => handleExportToPDF(timetable)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-semibold transition-colors flex items-center text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="ml-1">Export PDF</span>
                      </button>

                      {/* Draft Status Actions */}
                      {timetable.status === 'draft' && (
                        <>
                          <button
                            onClick={() => handleRegenerateTimetable(timetable._id)}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg font-semibold transition-colors flex items-center text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="ml-1">Regenerate</span>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteTimetable(timetable._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-semibold transition-colors flex items-center text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="ml-1">Delete</span>
                          </button>
                          
                          <button
                            onClick={() => handleShareTimetable(timetable)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-semibold transition-colors flex items-center text-sm"
                          >
                            <ShareIcon />
                            <span className="ml-1">Share</span>
                          </button>
                        </>
                      )}
                      
                      {/* Shared Status */}
                      {timetable.status === 'shared' && (
                        <div className="flex items-center text-blue-600">
                          <ShareIcon />
                          <span className="ml-2 text-sm font-medium">Shared with Course Reps</span>
                        </div>
                      )}
                      
                      {/* Published Status */}
                      {timetable.status === 'published' && (
                        <div className="flex items-center text-green-600">
                          <CalendarIcon />
                          <span className="ml-2 text-sm font-medium">Published & Live</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Venues Tab */}
      {activeTab === 'venues' && (
        <div className="bg-white rounded-xl shadow-lg border border-primary-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-accent-800">Venue Management</h2>
            <button
              onClick={() => setShowAddVenueModal(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
            >
              <PlusIcon />
              <span className="ml-2">Add Venue</span>
            </button>
          </div>
          
          {venues.length === 0 ? (
            <div className="text-center py-12">
              <BuildingIcon />
              <p className="text-accent-600 text-lg mt-4">No venues found for your department.</p>
              <p className="text-accent-500 mt-2">Add venues to start creating timetables.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {venues.map((venue) => (
                <div key={venue._id} className="border border-accent-200 rounded-lg p-4">
                  <h3 className="font-semibold text-accent-800">{venue.name}</h3>
                  <p className="text-sm text-accent-600">Capacity: {venue.capacity}</p>
                  <p className="text-sm text-accent-500">Location: {venue.location}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="bg-white rounded-xl shadow-lg border border-primary-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-accent-800">Course Management</h2>
            <button
              onClick={() => setShowAddCourseModal(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
            >
              <PlusIcon />
              <span className="ml-2">Add Course</span>
            </button>
          </div>
          
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpenIcon />
              <p className="text-accent-600 text-lg mt-4">No courses found for your department.</p>
              <p className="text-accent-500 mt-2">Add courses to start creating timetables.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 rounded-lg shadow-sm bg-primary-50 text-sm">
                <thead>
                  <tr className="bg-primary-600 text-white rounded-t-lg">
                    <th className="p-3 font-bold text-left rounded-tl-lg">Code</th>
                    <th className="p-3 font-bold text-left">Name</th>
                    <th className="p-3 font-bold text-left">Level</th>
                    <th className="p-3 font-bold text-left">Semester</th>
                    <th className="p-3 font-bold text-left">Instructor</th>
                    <th className="p-3 font-bold text-left rounded-tr-lg">Class Size</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, index) => (
                    <tr key={course._id} className={index % 2 === 0 ? 'bg-white' : 'bg-primary-50'}>
                      <td className="p-3 font-semibold text-accent-800">{course.code}</td>
                      <td className="p-3 text-accent-600">{course.name}</td>
                      <td className="p-3 text-accent-600">{course.level}</td>
                      <td className="p-3 text-accent-600">{course.semester.charAt(0).toUpperCase() + course.semester.slice(1)}</td>
                      <td className="p-3 text-accent-600">{course.instructor}</td>
                      <td className="p-3 text-accent-600">{course.classSize}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Generate Timetable Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-accent-800 mb-6">Generate Timetable</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-accent-700 mb-2">Semester *</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select Semester</option>
                <option value="first">First Semester</option>
                <option value="second">Second Semester</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-accent-700 mb-2">Level (Optional)</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Levels</option>
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="500">500 Level</option>
              </select>
              <p className="text-sm text-accent-500 mt-2">
                Leave empty to generate for all levels in the selected semester
              </p>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button
                onClick={handleGenerateTimetable}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Generate Timetable
              </button>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 bg-accent-300 hover:bg-accent-400 text-accent-800 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Venue Modal */}
      {showAddVenueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-accent-800 mb-6">Add New Venue</h3>
            
            <form onSubmit={handleAddVenue} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-accent-700 mb-2">Venue Name</label>
                <input
                  type="text"
                  value={newVenue.name}
                  onChange={(e) => setNewVenue({...newVenue, name: e.target.value})}
                  className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-accent-700 mb-2">Capacity</label>
                <input
                  type="number"
                  value={newVenue.capacity}
                  onChange={(e) => setNewVenue({...newVenue, capacity: e.target.value})}
                  className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-accent-700 mb-2">Location</label>
                <input
                  type="text"
                  value={newVenue.location}
                  onChange={(e) => setNewVenue({...newVenue, location: e.target.value})}
                  className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Add Venue
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddVenueModal(false)}
                  className="flex-1 bg-accent-300 hover:bg-accent-400 text-accent-800 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-accent-800 mb-6">Add New Course</h3>
            
            <form onSubmit={handleAddCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-accent-700 mb-2">Course Code</label>
                <input
                  type="text"
                  value={newCourse.code}
                  onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                  className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., CSC 101"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-accent-700 mb-2">Course Name</label>
                <input
                  type="text"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                  className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Introduction to Computer Science"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-accent-700 mb-2">Level</label>
                <select
                  value={newCourse.level}
                  onChange={(e) => setNewCourse({...newCourse, level: e.target.value})}
                  className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
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
                  value={newCourse.semester}
                  onChange={(e) => setNewCourse({...newCourse, semester: e.target.value})}
                  className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select Semester</option>
                  <option value="first">First Semester</option>
                  <option value="second">Second Semester</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-accent-700 mb-2">Instructor</label>
                <input
                  type="text"
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})}
                  className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Dr. John Smith"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-accent-700 mb-2">Class Size</label>
                <input
                  type="number"
                  value={newCourse.classSize}
                  onChange={(e) => setNewCourse({...newCourse, classSize: e.target.value})}
                  className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 50"
                  required
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Add Course
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="flex-1 bg-accent-300 hover:bg-accent-400 text-accent-800 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-accent-800 mb-6">
              Share Timetable with Course Reps
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-accent-600 mb-3">
                Select Course Representatives to review and publish this timetable:
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Course Representatives will be able to review and publish this timetable for students to view.
                </p>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {courseReps.map((courseRep) => (
                  <label key={courseRep._id} className="flex items-center p-2 hover:bg-primary-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCourseReps.includes(courseRep._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCourseReps([...selectedCourseReps, courseRep._id]);
                        } else {
                          setSelectedCourseReps(selectedCourseReps.filter(id => id !== courseRep._id));
                        }
                      }}
                      className="mr-3 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <p className="font-medium text-accent-800">{courseRep.name}</p>
                      <p className="text-sm text-accent-600">{courseRep.email}</p>
                      <p className="text-xs text-accent-500">Level {courseRep.level}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button
                onClick={handleShareSubmit}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Send for Review
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 bg-accent-300 hover:bg-accent-400 text-accent-800 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timetable View Modal */}
      {showTimetableModal && selectedTimetable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-accent-800">
                Timetable Preview - {selectedTimetable.department} - Level {selectedTimetable.level} - {selectedTimetable.semester.charAt(0).toUpperCase() + selectedTimetable.semester.slice(1)} Semester
              </h3>
              <button
                onClick={() => setShowTimetableModal(false)}
                className="text-accent-500 hover:text-accent-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center space-x-4 text-sm text-accent-600">
                <span className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${
                    selectedTimetable.status === 'draft' ? 'bg-yellow-500' :
                    selectedTimetable.status === 'shared' ? 'bg-blue-500' :
                    'bg-green-500'
                  }`}></span>
                  Status: <span className="font-medium ml-1">{selectedTimetable.status.charAt(0).toUpperCase() + selectedTimetable.status.slice(1)}</span>
                </span>
                <span>Courses: {selectedTimetable.courses.length}</span>
                <span>Created: {new Date(selectedTimetable.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {selectedTimetable.courses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-accent-600 text-lg">No courses scheduled in this timetable.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-accent-200">
                  <thead>
                    <tr className="bg-primary-50">
                      <th className="border border-accent-200 px-4 py-3 text-left font-semibold text-accent-800">Course Code</th>
                      <th className="border border-accent-200 px-4 py-3 text-left font-semibold text-accent-800">Course Name</th>
                      <th className="border border-accent-200 px-4 py-3 text-left font-semibold text-accent-800">Day</th>
                      <th className="border border-accent-200 px-4 py-3 text-left font-semibold text-accent-800">Time</th>
                      <th className="border border-accent-200 px-4 py-3 text-left font-semibold text-accent-800">Venue</th>
                      <th className="border border-accent-200 px-4 py-3 text-left font-semibold text-accent-800">Instructor</th>
                      <th className="border border-accent-200 px-4 py-3 text-left font-semibold text-accent-800">Class Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTimetable.courses.map((course, index) => (
                      <tr key={index} className="hover:bg-primary-25">
                        <td className="border border-accent-200 px-4 py-3 font-medium text-accent-800">{course.courseCode}</td>
                        <td className="border border-accent-200 px-4 py-3 text-accent-700">{course.courseName}</td>
                        <td className="border border-accent-200 px-4 py-3 text-accent-700">{course.day}</td>
                        <td className="border border-accent-200 px-4 py-3 text-accent-700">{course.time}</td>
                        <td className="border border-accent-200 px-4 py-3 text-accent-700">{course.venue}</td>
                        <td className="border border-accent-200 px-4 py-3 text-accent-700">{course.instructor}</td>
                        <td className="border border-accent-200 px-4 py-3 text-accent-700">{course.classSize}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-accent-200">
              <button
                onClick={() => handleExportToPDF(selectedTimetable)}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </button>
              <button
                onClick={() => setShowTimetableModal(false)}
                className="px-6 py-2 bg-accent-300 hover:bg-accent-400 text-accent-800 rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableManagement;

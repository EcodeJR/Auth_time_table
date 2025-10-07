import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiConfig, createApiRequest } from '../config/api';
import TimetableManagement from '../components/TimetableManagement';
import FeedbackAnalytics from '../components/FeedbackAnalytics';

// Simple SVG Icons
const UsersIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ChartBarIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const HODDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalCourseReps: 0,
    totalHODs: 0,
    unverifiedCourseReps: 0,
    departments: 0
  });
  const [unverifiedCourseReps, setUnverifiedCourseReps] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    level: '',
    role: 'student'
  });

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (userRole !== "hod") {
      navigate("/");
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [statsRes, courseRepsRes, allUsersRes] = await Promise.all([
        axios(createApiRequest(apiConfig.endpoints.admin.stats, {
          headers: { Authorization: token }
        })),
        axios(createApiRequest(apiConfig.endpoints.admin.unverified, {
          headers: { Authorization: token }
        })),
        axios(createApiRequest(apiConfig.endpoints.admin.allUsers, {
          headers: { Authorization: token }
        }))
      ]);
      
      setStats(statsRes.data);
      setUnverifiedCourseReps(courseRepsRes.data);
      setAllUsers(allUsersRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCourseRep = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios(createApiRequest(apiConfig.endpoints.admin.verify(id), {
        method: 'POST',
        headers: { Authorization: token }
      }));
      setUnverifiedCourseReps(unverifiedCourseReps.filter(rep => rep._id !== id));
      setStats(prev => ({ ...prev, unverifiedCourseReps: prev.unverifiedCourseReps - 1 }));
    } catch (error) {
      console.error("Error verifying course rep:", error);
    }
  };

  const handleDeclineCourseRep = async (id) => {
    if (!window.confirm('Are you sure you want to decline this course representative? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      await axios(createApiRequest(apiConfig.endpoints.admin.decline(id), {
        method: 'DELETE',
        headers: { Authorization: token }
      }));
      setUnverifiedCourseReps(unverifiedCourseReps.filter(rep => rep._id !== id));
      setStats(prev => ({ ...prev, unverifiedCourseReps: prev.unverifiedCourseReps - 1 }));
      alert("Course representative registration declined and removed");
    } catch (error) {
      console.error("Error declining course rep:", error);
      alert("Error declining course representative. Please try again.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      await axios(createApiRequest(apiConfig.endpoints.admin.deleteUser(userId), {
        method: 'DELETE',
        headers: { Authorization: token }
      }));
      setAllUsers(allUsers.filter(user => user._id !== userId));
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
      alert("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user. Please try again.");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios(createApiRequest(apiConfig.endpoints.admin.createUser, {
        method: 'POST',
        data: newUser,
        headers: { Authorization: token }
      }));
      alert("User created successfully!");
      setNewUser({ name: '', email: '', password: '', department: '', level: '', role: 'student' });
      setShowCreateUser(false);
      fetchData();
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error creating user. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-accent-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-accent-800 mb-2">HOD Dashboard</h1>
          <p className="text-accent-600 text-lg">Manage your department and oversee academic operations</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-lg border border-primary-100">
            <button
              onClick={() => setActiveSection('overview')}
              className={`flex-1 py-3 px-6 rounded-md font-semibold transition-colors ${
                activeSection === 'overview'
                  ? 'bg-primary-600 text-white'
                  : 'text-accent-600 hover:text-primary-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSection('timetables')}
              className={`flex-1 py-3 px-6 rounded-md font-semibold transition-colors ${
                activeSection === 'timetables'
                  ? 'bg-primary-600 text-white'
                  : 'text-accent-600 hover:text-primary-600'
              }`}
            >
              Timetable Management
            </button>
            <button
              onClick={() => setActiveSection('users')}
              className={`flex-1 py-3 px-6 rounded-md font-semibold transition-colors ${
                activeSection === 'users'
                  ? 'bg-primary-600 text-white'
                  : 'text-accent-600 hover:text-primary-600'
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveSection('feedback')}
              className={`flex-1 py-3 px-6 rounded-md font-semibold transition-colors ${
                activeSection === 'feedback'
                  ? 'bg-primary-600 text-white'
                  : 'text-accent-600 hover:text-primary-600'
              }`}
            >
              Feedback Analytics
            </button>
          </div>
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-primary-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-accent-600 text-sm font-medium">Total Users</p>
                    <p className="text-3xl font-bold text-accent-800">{stats.totalUsers}</p>
                  </div>
                  <div className="text-primary-600">
                    <UsersIcon />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-primary-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-accent-600 text-sm font-medium">Students</p>
                    <p className="text-3xl font-bold text-accent-800">{stats.totalStudents}</p>
                  </div>
                  <div className="text-primary-600">
                    <UsersIcon />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-primary-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-accent-600 text-sm font-medium">Course Reps</p>
                    <p className="text-3xl font-bold text-accent-800">{stats.totalCourseReps}</p>
                    {stats.unverifiedCourseReps > 0 && (
                      <p className="text-sm text-yellow-600 font-medium">
                        {stats.unverifiedCourseReps} pending approval
                      </p>
                    )}
                  </div>
                  <div className="text-primary-600 relative">
                    <ChartBarIcon />
                    {stats.unverifiedCourseReps > 0 && (
                      <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {stats.unverifiedCourseReps}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-primary-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-accent-600 text-sm font-medium">Departments</p>
                    <p className="text-3xl font-bold text-accent-800">{stats.departments}</p>
                  </div>
                  <div className="text-primary-600">
                    <CalendarIcon />
                  </div>
                </div>
              </div>
            </div>


            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <button
                onClick={() => setActiveSection('users')}
                className="bg-primary-600 hover:bg-primary-700 text-white p-6 rounded-xl shadow-lg transition-colors flex items-center justify-center"
              >
                <PlusIcon />
                <span className="ml-2 font-semibold">Manage Users</span>
              </button>
              
              <button
                onClick={() => setActiveSection('timetables')}
                className="bg-accent-600 hover:bg-accent-700 text-white p-6 rounded-xl shadow-lg transition-colors flex items-center justify-center"
              >
                <CalendarIcon />
                <span className="ml-2 font-semibold">Manage Timetables</span>
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl shadow-lg transition-colors flex items-center justify-center"
              >
                <ChartBarIcon />
                <span className="ml-2 font-semibold">View Timetables</span>
              </button>
            </div>

            {/* Unverified Course Reps */}
            {unverifiedCourseReps.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                      <UsersIcon />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-accent-800">Pending Course Representative Approvals</h2>
                      <p className="text-accent-600">{unverifiedCourseReps.length} course representative(s) waiting for approval</p>
                    </div>
                  </div>
                  <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                    Action Required
                  </div>
                </div>
                
                <div className="space-y-4">
                  {unverifiedCourseReps.map((rep) => (
                    <div key={rep._id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-accent-800">{rep.name}</h3>
                          <p className="text-sm text-accent-600">{rep.email}</p>
                          <p className="text-sm text-accent-500">Level {rep.level} • {rep.department}</p>
                          <p className="text-xs text-yellow-700 mt-1">Registered: {new Date(rep.createdAt).toLocaleDateString()}</p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleVerifyCourseRep(rep._id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </button>
                          <button
                            onClick={() => handleDeclineCourseRep(rep._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Timetable Management Section */}
        {activeSection === 'timetables' && (
          <TimetableManagement />
        )}

        {/* User Management Section */}
        {activeSection === 'users' && (
          <div className="bg-white rounded-xl shadow-lg border border-primary-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-accent-800">User Management</h2>
              <button
                onClick={() => setShowCreateUser(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
              >
                <PlusIcon />
                <span className="ml-2">Create User</span>
              </button>
            </div>
            
            {allUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-accent-600 text-lg">No users found in your department.</p>
                <p className="text-accent-500 mt-2">Create new users using the button above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 rounded-lg shadow-sm bg-primary-50 text-sm">
                  <thead>
                    <tr className="bg-primary-600 text-white rounded-t-lg">
                      <th className="p-4 font-bold text-left rounded-tl-lg">Name</th>
                      <th className="p-4 font-bold text-left">Email</th>
                      <th className="p-4 font-bold text-left">Role</th>
                      <th className="p-4 font-bold text-left">Level</th>
                      <th className="p-4 font-bold text-left">Status</th>
                      <th className="p-4 font-bold text-center rounded-tr-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user, index) => (
                      <tr key={user._id} className={index % 2 === 0 ? 'bg-white' : 'bg-primary-50'}>
                        <td className="p-4 font-semibold text-accent-800">{user.name}</td>
                        <td className="p-4 text-accent-600">{user.email}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'hod' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'course_rep' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role === 'hod' ? 'HOD' : 
                             user.role === 'course_rep' ? 'Course Rep' : 'Student'}
                          </span>
                        </td>
                        <td className="p-4 text-accent-600">{user.level || 'N/A'}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.verified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {user._id !== localStorage.getItem('userId') && (
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Feedback Analytics Section */}
        {activeSection === 'feedback' && (
          <div className="bg-white rounded-xl shadow-lg border border-primary-100 p-6">
            <h2 className="text-2xl font-bold text-accent-800 mb-6">Feedback Analytics</h2>
            <FeedbackAnalytics userRole="hod" />
          </div>
        )}

        {/* Create User Modal */}
        {showCreateUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-accent-800 mb-6">Create New User</h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-accent-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-accent-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-accent-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-accent-700 mb-2">Department</label>
                  <input
                    type="text"
                    value={newUser.department}
                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                    className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-accent-700 mb-2">Level</label>
                  <select
                    value={newUser.level}
                    onChange={(e) => setNewUser({...newUser, level: e.target.value})}
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
                  <label className="block text-sm font-medium text-accent-700 mb-2">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="student">Student</option>
                    <option value="course_rep">Course Representative</option>
                  </select>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    Create User
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateUser(false)}
                    className="flex-1 bg-accent-300 hover:bg-accent-400 text-accent-800 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HODDashboard;

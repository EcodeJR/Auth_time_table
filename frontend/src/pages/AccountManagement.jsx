import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiConfig, createApiRequest } from '../config/api';
import { AuthContext } from '../context/AuthContext';

// Simple SVG Icons
const UserIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const AccountManagement = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Profile Management State
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    email: user.email || '',
    department: user.department || '',
    level: user.role !== 'hod' ? (user.level || '') : ''
  });
  
  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // UI State
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user.token) {
      navigate('/login');
    }
  }, [user.token, navigate]);

  // Handle profile updates
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Prepare data to send - exclude level for HODs
      const dataToSend = {
        name: profileData.name,
        email: profileData.email,
        department: profileData.department
      };
      
      // Only include level for students and course reps
      if (user.role !== 'hod') {
        dataToSend.level = profileData.level;
      }

      const response = await axios.put(
        apiConfig.baseURL + '/api/auth/profile',
        dataToSend,
        createApiRequest()
      );

      if (response.data.success) {
        // Update local storage and context
        const updatedUser = {
          ...user,
          name: profileData.name,
          email: profileData.email,
          department: profileData.department
        };
        
        // Only include level for students and course reps
        if (user.role !== 'hod') {
          updatedUser.level = profileData.level;
        }
        
        // Update localStorage
        localStorage.setItem('name', profileData.name);
        localStorage.setItem('email', profileData.email);
        localStorage.setItem('department', profileData.department);
        
        // Only update level in localStorage for students and course reps
        if (user.role !== 'hod') {
          localStorage.setItem('level', profileData.level);
        }
        
        // Update context
        login(updatedUser);
        
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        apiConfig.baseURL + '/api/auth/change-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        createApiRequest()
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordForm(false);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to change password. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.delete(
        apiConfig.baseURL + '/api/auth/account',
        createApiRequest()
      );

      if (response.data.success) {
        // Clear local storage and redirect to login
        localStorage.clear();
        navigate('/login');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to delete account. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user.token) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-accent-800 mb-4">Account Management</h1>
          <p className="text-xl text-accent-600">
            Manage your profile, security settings, and account preferences
          </p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-primary-100">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-accent-500 hover:text-accent-700 hover:border-accent-300'
                }`}
              >
                <div className="flex items-center">
                  <UserIcon className="w-5 h-5 mr-2" />
                  Profile Information
                </div>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'security'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-accent-500 hover:text-accent-700 hover:border-accent-300'
                }`}
              >
                <div className="flex items-center">
                  <LockIcon className="w-5 h-5 mr-2" />
                  Security & Password
                </div>
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'account'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-accent-500 hover:text-accent-700 hover:border-accent-300'
                }`}
              >
                <div className="flex items-center">
                  <ShieldCheckIcon className="w-5 h-5 mr-2" />
                  Account Settings
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-semibold text-accent-800 mb-6">Profile Information</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-accent-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-accent-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-accent-700 mb-2">
                        Department
                      </label>
                      <select
                        value={profileData.department}
                        onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Department</option>
                        <option value="computer science">Computer Science</option>
                        <option value="electrical engineering">Electrical Engineering</option>
                        <option value="mechanical engineering">Mechanical Engineering</option>
                        <option value="civil engineering">Civil Engineering</option>
                      </select>
                    </div>
                    
                    {/* Level field only for students and course reps */}
                    {user.role !== 'hod' && (
                      <div>
                        <label className="block text-sm font-medium text-accent-700 mb-2">
                          Level
                        </label>
                        <select
                          value={profileData.level}
                          onChange={(e) => setProfileData({...profileData, level: e.target.value})}
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security & Password Tab */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-2xl font-semibold text-accent-800 mb-6">Security & Password</h2>
                
                {!showPasswordForm ? (
                  <div className="text-center py-8">
                    <LockIcon className="w-16 h-16 text-accent-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-accent-800 mb-2">Change Your Password</h3>
                    <p className="text-accent-600 mb-6">
                      Keep your account secure by regularly updating your password
                    </p>
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Change Password
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-accent-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-accent-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                        minLength={6}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-accent-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                        minLength={6}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                        }}
                        className="px-6 py-3 border border-primary-300 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Account Settings Tab */}
            {activeTab === 'account' && (
              <div>
                <h2 className="text-2xl font-semibold text-accent-800 mb-6">Account Settings</h2>
                
                <div className="space-y-6">
                  {/* Account Information */}
                  <div className="bg-accent-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-accent-800 mb-4">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-accent-600">Role:</span>
                        <p className="text-accent-800 capitalize">{user.role?.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-accent-600">Account Status:</span>
                        <p className="text-green-600 font-medium">Active</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-accent-600">Member Since:</span>
                        <p className="text-accent-800">{new Date().toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-accent-600">Last Login:</span>
                        <p className="text-accent-800">{new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-red-800 mb-4">Danger Zone</h3>
                    <p className="text-red-600 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Deleting...' : 'Delete Account'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountManagement;

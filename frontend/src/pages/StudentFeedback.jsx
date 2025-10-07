import React, { useState } from 'react';
import axios from 'axios';
import { apiConfig, createApiRequest } from '../config/api';
import StudentFeedbackHistory from '../components/StudentFeedbackHistory';

// Simple SVG Icons
const StarIcon = ({ filled = false }) => (
  <svg className={`w-6 h-6 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const StudentFeedback = () => {
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' or 'history'
  const [timetables, setTimetables] = useState([]);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Search criteria state
  const [searchCriteria, setSearchCriteria] = useState({
    department: '',
    level: '',
    semester: ''
  });

  // Available departments (you can expand this list)
  const departments = [
    'computer science',
    'mathematics',
    'physics',
    'chemistry',
    'biology',
    'electrical engineering',
    'mechanical engineering',
    'civil engineering'
  ];

  const levels = ['100', '200', '300', '400', '500'];
  const semesters = ['first', 'second'];

  // Feedback form state
  const [feedbackData, setFeedbackData] = useState({
    overallRating: 0,
    scheduleConvenience: 0,
    venueQuality: 0,
    courseDistribution: 0,
    timeSlotDistribution: 0,
    comments: '',
    issues: [],
    suggestions: '',
    isAnonymous: false
  });

  const [currentIssue, setCurrentIssue] = useState({
    type: '',
    description: ''
  });

  // Search for timetables based on criteria
  const searchTimetables = async () => {
    if (!searchCriteria.department || !searchCriteria.level || !searchCriteria.semester) {
      setMessage({ type: 'error', text: 'Please select department, level, and semester' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await axios(createApiRequest(
        `${apiConfig.endpoints.feedback.searchTimetables}?department=${searchCriteria.department}&level=${searchCriteria.level}&semester=${searchCriteria.semester}`,
        {
          headers: { Authorization: token }
        }
      ));
      setTimetables(response.data);
      
      if (response.data.length === 0) {
        setMessage({ type: 'error', text: 'No published timetables found for the selected criteria' });
      }
    } catch (error) {
      console.error('Error searching timetables:', error);
      setMessage({ type: 'error', text: 'Failed to search timetables' });
    } finally {
      setLoading(false);
    }
  };

  // Handle search criteria change
  const handleSearchChange = (field, value) => {
    setSearchCriteria(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTimetableSelect = (timetable) => {
    setSelectedTimetable(timetable);
    setShowFeedbackForm(true);
    // Reset form
    setFeedbackData({
      overallRating: 0,
      scheduleConvenience: 0,
      venueQuality: 0,
      courseDistribution: 0,
      timeSlotDistribution: 0,
      comments: '',
      issues: [],
      suggestions: '',
      isAnonymous: false
    });
  };

  const handleRatingChange = (category, rating) => {
    setFeedbackData(prev => ({
      ...prev,
      [category]: rating
    }));
  };

  const handleAddIssue = () => {
    if (currentIssue.type && currentIssue.description) {
      setFeedbackData(prev => ({
        ...prev,
        issues: [...prev.issues, { ...currentIssue }]
      }));
      setCurrentIssue({ type: '', description: '' });
    }
  };

  const handleRemoveIssue = (index) => {
    setFeedbackData(prev => ({
      ...prev,
      issues: prev.issues.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitFeedback = async () => {
    // Validation
    if (feedbackData.overallRating === 0) {
      setMessage({ type: 'error', text: 'Please provide an overall rating' });
      return;
    }
    
    if (feedbackData.scheduleConvenience === 0) {
      setMessage({ type: 'error', text: 'Please provide a schedule convenience rating' });
      return;
    }
    
    if (feedbackData.venueQuality === 0) {
      setMessage({ type: 'error', text: 'Please provide a venue quality rating' });
      return;
    }
    
    if (feedbackData.courseDistribution === 0) {
      setMessage({ type: 'error', text: 'Please provide a course distribution rating' });
      return;
    }
    
    if (feedbackData.timeSlotDistribution === 0) {
      setMessage({ type: 'error', text: 'Please provide a time slot distribution rating' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(
        apiConfig.baseURL + apiConfig.endpoints.feedback.submit,
        {
          timetableId: selectedTimetable._id,
          ...feedbackData
        },
        createApiRequest()
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Feedback submitted successfully!' });
        setShowFeedbackForm(false);
        setSelectedTimetable(null);
        // Refresh the search results if we have search criteria
        if (searchCriteria.department && searchCriteria.level && searchCriteria.semester) {
          searchTimetables();
        }
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to submit feedback' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, label }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-accent-700 mb-2">{label}</label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="focus:outline-none"
          >
            <StarIcon filled={star <= rating} />
          </button>
        ))}
        <span className="ml-2 text-sm text-accent-600">{rating}/5</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-accent-600">Loading timetables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-accent-800 mb-4">Student Feedback</h1>
          <p className="text-xl text-accent-600 mb-6">
            Help improve timetables by sharing your feedback
          </p>
          
          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-lg shadow-lg p-1">
              <button
                onClick={() => setActiveTab('submit')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'submit'
                    ? 'bg-primary-600 text-white'
                    : 'text-accent-600 hover:text-accent-800'
                }`}
              >
                Submit Feedback
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'bg-primary-600 text-white'
                    : 'text-accent-600 hover:text-accent-800'
                }`}
              >
                My Feedback History
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'submit' && (
          <>
            {/* Search Form */}
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-accent-800 mb-6">Search for Timetables</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Department Selection */}
              <div>
                <label className="block text-sm font-medium text-accent-700 mb-2">
                  Department
                </label>
                <select
                  value={searchCriteria.department}
                  onChange={(e) => handleSearchChange('department', e.target.value)}
                  className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept.charAt(0).toUpperCase() + dept.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level Selection */}
              <div>
                <label className="block text-sm font-medium text-accent-700 mb-2">
                  Level
                </label>
                <select
                  value={searchCriteria.level}
                  onChange={(e) => handleSearchChange('level', e.target.value)}
                  className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select Level</option>
                  {levels.map(level => (
                    <option key={level} value={level}>
                      {level} Level
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester Selection */}
              <div>
                <label className="block text-sm font-medium text-accent-700 mb-2">
                  Semester
                </label>
                <select
                  value={searchCriteria.semester}
                  onChange={(e) => handleSearchChange('semester', e.target.value)}
                  className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select Semester</option>
                  {semesters.map(semester => (
                    <option key={semester} value={semester}>
                      {semester.charAt(0).toUpperCase() + semester.slice(1)} Semester
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={searchTimetables}
              disabled={loading || !searchCriteria.department || !searchCriteria.level || !searchCriteria.semester}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search Timetables'}
            </button>
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

        {/* Timetables List */}
        {timetables.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-accent-800 mb-6">
              Found {timetables.length} Timetable(s) for {searchCriteria.department.charAt(0).toUpperCase() + searchCriteria.department.slice(1)} - Level {searchCriteria.level} - {searchCriteria.semester.charAt(0).toUpperCase() + searchCriteria.semester.slice(1)} Semester
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {timetables.map((timetable) => (
                <div key={timetable._id} className="border border-primary-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-accent-800">
                      Level {timetable.level} - {timetable.semester.charAt(0).toUpperCase() + timetable.semester.slice(1)} Semester
                    </h3>
                    {timetable.feedbackProvided && (
                      <div className="flex items-center text-green-600">
                        <CheckIcon className="w-4 h-4 mr-1" />
                        <span className="text-sm">Feedback Given</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-accent-600 mb-4">
                    <p>Department: {timetable.department}</p>
                    <p>Courses: {timetable.courses?.length || 0}</p>
                    <p>Created: {new Date(timetable.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  <button
                    onClick={() => handleTimetableSelect(timetable)}
                    disabled={timetable.feedbackProvided}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                      timetable.feedbackProvided
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}
                  >
                    {timetable.feedbackProvided ? 'Feedback Already Given' : 'Provide Feedback'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Form Modal */}
        {showFeedbackForm && selectedTimetable && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-accent-800">
                    Feedback for Level {selectedTimetable.level} - {selectedTimetable.semester.charAt(0).toUpperCase() + selectedTimetable.semester.slice(1)} Semester
                  </h2>
                  <button
                    onClick={() => setShowFeedbackForm(false)}
                    className="text-accent-400 hover:text-accent-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Rating Section */}
                  <div className="bg-accent-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-accent-800 mb-4">Rate the Timetable</h3>
                    
                    <StarRating
                      rating={feedbackData.overallRating}
                      onRatingChange={(rating) => handleRatingChange('overallRating', rating)}
                      label="Overall Rating *"
                    />
                    
                    <StarRating
                      rating={feedbackData.scheduleConvenience}
                      onRatingChange={(rating) => handleRatingChange('scheduleConvenience', rating)}
                      label="Schedule Convenience"
                    />
                    
                    <StarRating
                      rating={feedbackData.venueQuality}
                      onRatingChange={(rating) => handleRatingChange('venueQuality', rating)}
                      label="Venue Quality"
                    />
                    
                    <StarRating
                      rating={feedbackData.courseDistribution}
                      onRatingChange={(rating) => handleRatingChange('courseDistribution', rating)}
                      label="Course Distribution"
                    />
                    
                    <StarRating
                      rating={feedbackData.timeSlotDistribution}
                      onRatingChange={(rating) => handleRatingChange('timeSlotDistribution', rating)}
                      label="Time Slot Distribution"
                    />
                  </div>

                  {/* Comments Section */}
                  <div>
                    <label className="block text-sm font-medium text-accent-700 mb-2">
                      Additional Comments
                    </label>
                    <textarea
                      value={feedbackData.comments}
                      onChange={(e) => setFeedbackData(prev => ({ ...prev, comments: e.target.value }))}
                      className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={4}
                      placeholder="Share your thoughts about the timetable..."
                      maxLength={500}
                    />
                    <p className="text-sm text-accent-500 mt-1">{feedbackData.comments.length}/500 characters</p>
                  </div>

                  {/* Issues Section */}
                  <div>
                    <label className="block text-sm font-medium text-accent-700 mb-2">
                      Report Issues (Optional)
                    </label>
                    
                    <div className="space-y-3">
                      {feedbackData.issues.map((issue, index) => (
                        <div key={index} className="flex items-center justify-between bg-red-50 p-3 rounded-lg">
                          <div>
                            <span className="font-medium text-red-800 capitalize">
                              {issue.type.replace('_', ' ')}:
                            </span>
                            <span className="text-red-700 ml-2">{issue.description}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveIssue(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      
                      <div className="flex space-x-3">
                        <select
                          value={currentIssue.type}
                          onChange={(e) => setCurrentIssue(prev => ({ ...prev, type: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Select Issue Type</option>
                          <option value="schedule_conflict">Schedule Conflict</option>
                          <option value="venue_issue">Venue Issue</option>
                          <option value="time_slot">Time Slot Problem</option>
                          <option value="course_load">Course Load</option>
                          <option value="other">Other</option>
                        </select>
                        
                        <input
                          type="text"
                          value={currentIssue.description}
                          onChange={(e) => setCurrentIssue(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe the issue..."
                          className="flex-2 px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          maxLength={200}
                        />
                        
                        <button
                          onClick={handleAddIssue}
                          disabled={!currentIssue.type || !currentIssue.description}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Suggestions Section */}
                  <div>
                    <label className="block text-sm font-medium text-accent-700 mb-2">
                      Suggestions for Improvement
                    </label>
                    <textarea
                      value={feedbackData.suggestions}
                      onChange={(e) => setFeedbackData(prev => ({ ...prev, suggestions: e.target.value }))}
                      className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={3}
                      placeholder="How can we improve this timetable?"
                      maxLength={300}
                    />
                    <p className="text-sm text-accent-500 mt-1">{feedbackData.suggestions.length}/300 characters</p>
                  </div>

                  {/* Anonymous Option */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={feedbackData.isAnonymous}
                      onChange={(e) => setFeedbackData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-primary-300 rounded"
                    />
                    <label htmlFor="anonymous" className="ml-2 block text-sm text-accent-700">
                      Submit feedback anonymously
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setShowFeedbackForm(false)}
                      className="px-6 py-3 border border-primary-300 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={submitting || feedbackData.overallRating === 0}
                      className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
          </>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="max-w-6xl mx-auto">
            <StudentFeedbackHistory />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentFeedback;

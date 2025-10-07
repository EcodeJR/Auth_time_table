import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiConfig, createApiRequest } from '../config/api';

// Simple SVG Icons
const StarIcon = ({ filled = false, size = "w-4 h-4" }) => (
  <svg className={`${size} ${filled ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const MessageIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const StudentFeedbackHistory = () => {
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeedbackHistory();
  }, []);

  const fetchFeedbackHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios(createApiRequest(
        apiConfig.endpoints.feedback.getStudentHistory,
        { headers: { Authorization: token } }
      ));
      setFeedbackHistory(response.data);
    } catch (error) {
      console.error('Error fetching feedback history:', error);
      setError('Failed to load feedback history');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon key={star} filled={star <= rating} />
        ))}
        <span className="text-sm text-accent-600 ml-1">{rating}/5</span>
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'addressed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'reviewed':
        return 'Under Review';
      case 'addressed':
        return 'Addressed';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-red-600">
          <MessageIcon className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-accent-800">My Feedback History</h2>
        <button
          onClick={fetchFeedbackHistory}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {feedbackHistory.length === 0 ? (
        <div className="text-center text-accent-600 py-8">
          <MessageIcon className="w-12 h-12 mx-auto mb-4 text-accent-400" />
          <p>No feedback submitted yet</p>
          <p className="text-sm mt-2">Submit your first feedback to see it here!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {feedbackHistory.map((feedback) => (
            <div key={feedback._id} className="border border-primary-200 rounded-lg p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-accent-800">
                      Level {feedback.level} - {feedback.semester.charAt(0).toUpperCase() + feedback.semester.slice(1)} Semester
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                      {getStatusLabel(feedback.status)}
                    </span>
                  </div>
                  <p className="text-sm text-accent-600">
                    Submitted on {new Date(feedback.createdAt).toLocaleDateString()} at {new Date(feedback.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-accent-600 mb-1">Overall Rating</div>
                  {renderStars(feedback.overallRating)}
                </div>
              </div>

              {/* Ratings Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-xs text-accent-600 mb-1">Schedule</p>
                  {renderStars(feedback.scheduleConvenience)}
                </div>
                <div className="text-center">
                  <p className="text-xs text-accent-600 mb-1">Venue</p>
                  {renderStars(feedback.venueQuality)}
                </div>
                <div className="text-center">
                  <p className="text-xs text-accent-600 mb-1">Course Dist.</p>
                  {renderStars(feedback.courseDistribution)}
                </div>
                <div className="text-center">
                  <p className="text-xs text-accent-600 mb-1">Time Slots</p>
                  {renderStars(feedback.timeSlotDistribution)}
                </div>
                <div className="text-center">
                  <p className="text-xs text-accent-600 mb-1">Overall</p>
                  {renderStars(feedback.overallRating)}
                </div>
              </div>

              {/* Comments */}
              {feedback.comments && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-accent-700 mb-2">Your Comments:</h4>
                  <p className="text-accent-600 bg-accent-50 p-3 rounded-lg">{feedback.comments}</p>
                </div>
              )}

              {/* Issues */}
              {feedback.issues && feedback.issues.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-accent-700 mb-2">Issues Reported:</h4>
                  <div className="space-y-2">
                    {feedback.issues.map((issue, index) => (
                      <div key={index} className="bg-red-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-red-800 capitalize">{issue.type.replace('_', ' ')}</p>
                        <p className="text-sm text-red-700">{issue.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {feedback.suggestions && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-accent-700 mb-2">Your Suggestions:</h4>
                  <p className="text-accent-600 bg-accent-50 p-3 rounded-lg">{feedback.suggestions}</p>
                </div>
              )}

              {/* Response from HOD/Course Rep */}
              {feedback.response && feedback.response.message && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-green-800 mb-1">Response from Administration</h4>
                      <p className="text-sm text-green-700 mb-2">{feedback.response.message}</p>
                      <p className="text-xs text-green-600">
                        Responded on {new Date(feedback.response.respondedAt).toLocaleDateString()} at {new Date(feedback.response.respondedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Anonymous indicator */}
              {feedback.isAnonymous && (
                <div className="mt-2 text-xs text-accent-500 italic">
                  Submitted anonymously
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentFeedbackHistory;

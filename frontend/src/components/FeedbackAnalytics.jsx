import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiConfig, createApiRequest } from '../config/api';

// Simple SVG Icons
const StarIcon = ({ filled = false, size = 'w-4 h-4' }) => (
  <svg className={`${size} ${filled ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const MessageIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const FeedbackAnalytics = ({ userRole }) => {
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [timetableFeedback, setTimetableFeedback] = useState(null);
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [respondingTo, setRespondingTo] = useState(null);

  useEffect(() => {
    fetchFeedbackStats();
  }, []);

  const fetchFeedbackStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios(createApiRequest(apiConfig.endpoints.feedback.getStats, {
        headers: { Authorization: token }
      }));
      setFeedbackStats(response.data);
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetableFeedback = async (timetableId) => {
    try {
      console.log('🔍 Fetching timetable feedback for ID:', timetableId);
      console.log('🔍 API endpoint:', apiConfig.endpoints.feedback.getTimetableFeedback(timetableId));
      
      const response = await axios(createApiRequest(
        apiConfig.endpoints.feedback.getTimetableFeedback(timetableId)
      ));
      
      console.log('✅ Timetable feedback response:', response.data);
      setTimetableFeedback(response.data);
      setShowTimetableModal(true);
    } catch (error) {
      console.error('❌ Error fetching timetable feedback:', error);
      console.error('❌ Error response:', error.response?.data);
    }
  };

  const handleRespondToFeedback = async (feedbackId) => {
    if (!responseMessage.trim()) return;

    try {
      await axios.post(
        apiConfig.baseURL + apiConfig.endpoints.feedback.respond(feedbackId),
        { message: responseMessage },
        createApiRequest()
      );
      
      setResponseMessage('');
      setRespondingTo(null);
      fetchFeedbackStats(); // Refresh stats
      fetchTimetableFeedback(selectedTimetable._id); // Refresh timetable feedback
    } catch (error) {
      console.error('Error responding to feedback:', error);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon key={star} filled={star <= rating} size="w-4 h-4" />
        ))}
        <span className="text-sm text-accent-600 ml-1">{rating}/5</span>
      </div>
    );
  };

  const getIssueTypeLabel = (type) => {
    const labels = {
      schedule_conflict: 'Schedule Conflict',
      venue_issue: 'Venue Issue',
      time_slot: 'Time Slot Problem',
      course_load: 'Course Load',
      other: 'Other'
    };
    return labels[type] || type;
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

  if (!feedbackStats) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-accent-600">
          <MessageIcon className="w-12 h-12 mx-auto mb-4 text-accent-400" />
          <p>No feedback data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Feedback Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs sm:text-sm font-medium">Total Feedback</p>
              <p className="text-2xl sm:text-3xl font-bold">{feedbackStats.overview?.totalFeedback || 0}</p>
            </div>
            <MessageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs sm:text-sm font-medium">Average Rating</p>
              <p className="text-2xl sm:text-3xl font-bold">{feedbackStats.overview?.averageOverallRating || 0}</p>
            </div>
            <StarIcon filled={true} size="w-6 h-6 sm:w-8 sm:h-8" className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs sm:text-sm font-medium">Pending Responses</p>
              <p className="text-2xl sm:text-3xl font-bold">{feedbackStats.overview?.pendingResponses || 0}</p>
            </div>
            <AlertTriangleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs sm:text-sm font-medium">Top Issues</p>
              <p className="text-2xl sm:text-3xl font-bold">{feedbackStats.insights?.topIssues?.length || 0}</p>
            </div>
            <TrendingUpIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Feedback Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Feedback by Level */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-accent-800 mb-3 sm:mb-4">Feedback by Level</h3>
          {feedbackStats.breakdown?.feedbackByLevel && feedbackStats.breakdown.feedbackByLevel.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {feedbackStats.breakdown.feedbackByLevel.map((item) => (
                <div key={item._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 bg-accent-50 rounded-lg">
                  <div className="mb-2 sm:mb-0">
                    <span className="font-medium text-accent-800 text-sm sm:text-base">Level {item._id}</span>
                    <p className="text-xs sm:text-sm text-accent-600">{item.count} feedback entries</p>
                  </div>
                  <div className="text-left sm:text-right">
                    {renderStars(Math.round(item.avgRating))}
                    <p className="text-xs sm:text-sm text-accent-600">Avg: {item.avgRating.toFixed(1)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-accent-600 text-center py-4 text-sm sm:text-base">No feedback by level data available</p>
          )}
        </div>

        {/* Top Issues */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-accent-800 mb-3 sm:mb-4">Top Issues Reported</h3>
          {feedbackStats.insights?.topIssues && feedbackStats.insights.topIssues.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {feedbackStats.insights.topIssues.map((issue, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 bg-red-50 rounded-lg">
                  <div className="mb-2 sm:mb-0">
                    <span className="font-medium text-red-800 capitalize text-sm sm:text-base">
                      {getIssueTypeLabel(issue._id)}
                    </span>
                    <p className="text-xs sm:text-sm text-red-600">{issue.count} reports</p>
                  </div>
                  <div className="text-red-600 font-bold text-base sm:text-lg">
                    {issue.count}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-accent-600 text-center py-4 text-sm sm:text-base">No issues reported</p>
          )}
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-accent-800 mb-3 sm:mb-4">Recent Feedback</h3>
        {feedbackStats.recentFeedback && feedbackStats.recentFeedback.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {feedbackStats.recentFeedback.map((feedback) => (
              <div key={feedback._id} className="border border-primary-200 rounded-lg p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 sm:mb-3">
                  <div className="flex-1 mb-2 sm:mb-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
                      <span className="font-medium text-accent-800 text-sm sm:text-base">
                        {feedback.isAnonymous ? 'Anonymous Student' : feedback.studentId?.name || 'Student'}
                      </span>
                      {!feedback.isAnonymous && (
                        <span className="text-xs sm:text-sm text-accent-600">
                          ({feedback.department?.charAt(0).toUpperCase() + feedback.department?.slice(1)} - Level {feedback.level})
                        </span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-accent-600 mb-2">
                      <span className="font-medium">Timetable:</span> Level {feedback.level} - {feedback.semester.charAt(0).toUpperCase() + feedback.semester.slice(1)} Semester
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mb-2">
                      {renderStars(feedback.overallRating)}
                      <span className="text-xs sm:text-sm text-accent-600">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {feedback.comments && (
                      <p className="text-accent-700 text-xs sm:text-sm mb-2">{feedback.comments}</p>
                    )}
                    {feedback.issues && feedback.issues.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs sm:text-sm font-medium text-red-700 mb-1">Issues:</p>
                        <div className="flex flex-wrap gap-1">
                          {feedback.issues.map((issue, index) => (
                            <span key={index} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                              {getIssueTypeLabel(issue.type)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fetchTimetableFeedback(feedback.timetableId._id || feedback.timetableId)}
                    className="px-2 sm:px-3 py-1 bg-primary-600 text-white text-xs sm:text-sm rounded hover:bg-primary-700 transition-colors self-start sm:self-center"
                  >
                    View Details
                  </button>
                </div>
                
                {feedback.response && (
                  <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-green-50 rounded-lg">
                    <p className="text-xs sm:text-sm font-medium text-green-800 mb-1">Response:</p>
                    <p className="text-xs sm:text-sm text-green-700">{feedback.response.message}</p>
                    <p className="text-xs text-green-600 mt-1">
                      Responded on {new Date(feedback.response.respondedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-accent-600 text-center py-8">No recent feedback available</p>
        )}
      </div>

      {/* Timetable Feedback Modal */}
      {showTimetableModal && timetableFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-accent-800">
                  Feedback for Level {timetableFeedback.timetable.level} - {timetableFeedback.timetable.semester.charAt(0).toUpperCase() + timetableFeedback.timetable.semester.slice(1)} Semester
                </h2>
                <button
                  onClick={() => setShowTimetableModal(false)}
                  className="text-accent-400 hover:text-accent-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Average Ratings */}
              <div className="bg-accent-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-accent-800 mb-3">Average Ratings</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-accent-600 mb-1">Overall</p>
                    {renderStars(Math.round(timetableFeedback.averageRatings.overallRating))}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-accent-600 mb-1">Schedule</p>
                    {renderStars(Math.round(timetableFeedback.averageRatings.scheduleConvenience))}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-accent-600 mb-1">Venue</p>
                    {renderStars(Math.round(timetableFeedback.averageRatings.venueQuality))}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-accent-600 mb-1">Course Dist.</p>
                    {renderStars(Math.round(timetableFeedback.averageRatings.courseDistribution))}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-accent-600 mb-1">Time Slots</p>
                    {renderStars(Math.round(timetableFeedback.averageRatings.timeSlotDistribution))}
                  </div>
                </div>
              </div>

              {/* Individual Feedback */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-accent-800">Individual Feedback ({timetableFeedback.totalFeedback})</h3>
                {timetableFeedback.feedback.map((feedback) => (
                  <div key={feedback._id} className="border border-primary-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-accent-800">
                            {feedback.isAnonymous ? 'Anonymous Student' : feedback.studentId?.name || 'Student'}
                          </span>
                          {!feedback.isAnonymous && feedback.studentId && (
                            <span className="text-sm text-accent-600">
                              ({feedback.studentId.department?.charAt(0).toUpperCase() + feedback.studentId.department?.slice(1)} - Level {feedback.studentId.level})
                            </span>
                          )}
                          <span className="text-sm text-accent-600">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                          <div className="text-center">
                            <p className="text-xs text-accent-600">Overall</p>
                            {renderStars(feedback.overallRating)}
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-accent-600">Schedule</p>
                            {renderStars(feedback.scheduleConvenience)}
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-accent-600">Venue</p>
                            {renderStars(feedback.venueQuality)}
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-accent-600">Courses</p>
                            {renderStars(feedback.courseDistribution)}
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-accent-600">Time Slots</p>
                            {renderStars(feedback.timeSlotDistribution)}
                          </div>
                        </div>
                        {feedback.comments && (
                          <p className="text-accent-700 text-sm mb-2">{feedback.comments}</p>
                        )}
                        {feedback.suggestions && (
                          <div className="mb-2">
                            <p className="text-sm font-medium text-blue-700 mb-1">Suggestions:</p>
                            <p className="text-sm text-blue-600">{feedback.suggestions}</p>
                          </div>
                        )}
                        {feedback.issues && feedback.issues.length > 0 && (
                          <div className="mb-2">
                            <p className="text-sm font-medium text-red-700 mb-1">Issues:</p>
                            <div className="space-y-1">
                              {feedback.issues.map((issue, index) => (
                                <div key={index} className="p-2 bg-red-50 rounded text-sm">
                                  <span className="font-medium text-red-800 capitalize">
                                    {getIssueTypeLabel(issue.type)}:
                                  </span>
                                  <span className="text-red-700 ml-2">{issue.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Response Section */}
                    {feedback.response ? (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-800 mb-1">Response:</p>
                        <p className="text-sm text-green-700">{feedback.response.message}</p>
                        <p className="text-xs text-green-600 mt-1">
                          Responded on {new Date(feedback.response.respondedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3">
                        {respondingTo === feedback._id ? (
                          <div className="space-y-2">
                            <textarea
                              value={responseMessage}
                              onChange={(e) => setResponseMessage(e.target.value)}
                              placeholder="Type your response here..."
                              className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              rows={3}
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleRespondToFeedback(feedback._id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Send Response
                              </button>
                              <button
                                onClick={() => {
                                  setRespondingTo(null);
                                  setResponseMessage('');
                                }}
                                className="px-4 py-2 border border-primary-300 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRespondingTo(feedback._id)}
                            className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors"
                          >
                            Respond to Feedback
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackAnalytics;

import { normalizeDepartment } from '../utils/departmentUtils.js';
import Timetable from '../models/Timetable.js';
import User from '../models/User.js';
import Feedback from '../models/Feedback.js';

// Submit feedback for a timetable
export const submitFeedback = async (req, res) => {
  try {
    const {
      timetableId,
      overallRating,
      scheduleConvenience,
      venueQuality,
      courseDistribution,
      timeSlotDistribution,
      comments,
      issues,
      suggestions,
      isAnonymous
    } = req.body;

    const studentId = req.user.id;

    // Validate timetable exists and is published
    const timetable = await Timetable.findById(timetableId);
    if (!timetable) {
      return res.status(404).json({ error: 'Timetable not found' });
    }

    if (timetable.status !== 'published') {
      return res.status(400).json({ error: 'Can only provide feedback for published timetables' });
    }

    // Check if student has already provided feedback for this timetable
    const existingFeedback = await Feedback.findOne({
      timetableId,
      studentId
    });

    if (existingFeedback) {
      return res.status(400).json({ error: 'You have already provided feedback for this timetable' });
    }

    // Note: Students can now provide feedback on any published timetable they find through search
    // This allows for cross-department feedback and more flexible feedback collection

    // Create feedback using timetable's department and level (normalized)
    const normalizedDepartment = normalizeDepartment(timetable.department);
    
    if (!normalizedDepartment) {
      return res.status(400).json({ error: 'Invalid timetable department name' });
    }
    
    const feedback = new Feedback({
      timetableId,
      studentId,
      department: normalizedDepartment,  // Use normalized department
      level: timetable.level,            // Use timetable's level
      semester: timetable.semester,
      overallRating,
      scheduleConvenience,
      venueQuality,
      courseDistribution,
      timeSlotDistribution,
      comments,
      issues,
      suggestions,
      isAnonymous
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: feedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get feedback for a specific timetable (for HODs and Course Reps)
export const getTimetableFeedback = async (req, res) => {
  try {
    const { timetableId } = req.params;
    const userRole = req.user.role;
    const userDepartment = req.user.department;

    // Only HODs and Course Reps can view feedback
    if (!['hod', 'course_rep'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate timetable exists and belongs to user's department
    const timetable = await Timetable.findById(timetableId);
    if (!timetable) {
      return res.status(404).json({ error: 'Timetable not found' });
    }

    // Normalize both departments for comparison
    const normalizedTimetableDepartment = normalizeDepartment(timetable.department);
    const normalizedUserDepartment = normalizeDepartment(userDepartment);
    
    if (normalizedTimetableDepartment !== normalizedUserDepartment) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get feedback for this timetable
    const feedback = await Feedback.find({ timetableId })
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });

    // Calculate average ratings
    const averageRatings = {
      overallRating: 0,
      scheduleConvenience: 0,
      venueQuality: 0,
      courseDistribution: 0,
      timeSlotDistribution: 0
    };

    if (feedback.length > 0) {
      feedback.forEach(fb => {
        averageRatings.overallRating += fb.overallRating;
        averageRatings.scheduleConvenience += fb.scheduleConvenience;
        averageRatings.venueQuality += fb.venueQuality;
        averageRatings.courseDistribution += fb.courseDistribution;
        averageRatings.timeSlotDistribution += fb.timeSlotDistribution;
      });

      Object.keys(averageRatings).forEach(key => {
        averageRatings[key] = (averageRatings[key] / feedback.length).toFixed(2);
      });
    }

    res.json({
      timetable: {
        id: timetable._id,
        level: timetable.level,
        semester: timetable.semester,
        status: timetable.status
      },
      feedback,
      averageRatings,
      totalFeedback: feedback.length
    });
  } catch (error) {
    console.error('Error fetching timetable feedback:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get feedback statistics for department (for HODs and Course Reps)
export const getFeedbackStats = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userDepartment = req.user.department;

    // Only HODs and Course Reps can view feedback stats
    if (!['hod', 'course_rep'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Normalize department name using the utility function
    const normalizedDepartment = normalizeDepartment(userDepartment);
    
    if (!normalizedDepartment) {
      console.error('Invalid department name:', userDepartment);
      return res.status(400).json({ error: 'Invalid department name' });
    }

    // Get all feedback for the department
    const allFeedback = await Feedback.find({ department: normalizedDepartment })
      .populate('timetableId', 'level semester status')
      .populate('studentId', 'name department level')
      .sort({ createdAt: -1 });

    // Calculate department-wide statistics
    const totalFeedback = allFeedback.length;
    const averageOverallRating = totalFeedback > 0 
      ? (allFeedback.reduce((sum, fb) => sum + fb.overallRating, 0) / totalFeedback).toFixed(2)
      : 0;

    // Feedback by level
    const feedbackByLevel = await Feedback.aggregate([
      { $match: { department: normalizedDepartment } },
      { $group: {
          _id: '$level',
          count: { $sum: 1 },
          avgRating: { $avg: '$overallRating' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Feedback by semester
    const feedbackBySemester = await Feedback.aggregate([
      { $match: { department: normalizedDepartment } },
      { $group: {
          _id: '$semester',
          count: { $sum: 1 },
          avgRating: { $avg: '$overallRating' }
        }
      }
    ]);

    // Recent feedback (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentFeedback = await Feedback.countDocuments({
      department: normalizedDepartment,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Pending responses (unreviewed feedback)
    const pendingResponses = await Feedback.countDocuments({
      department: normalizedDepartment,
      status: 'submitted'
    });

    // Top issues
    const topIssues = await Feedback.aggregate([
      { $match: { department: normalizedDepartment } },
      { $unwind: '$issues' },
      { $group: {
          _id: '$issues.type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Rating distribution
    const ratingDistribution = await Feedback.aggregate([
      { $match: { department: normalizedDepartment } },
      { $group: {
          _id: '$overallRating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      overview: {
        totalFeedback,
        averageOverallRating,
        recentFeedback,
        pendingResponses
      },
      breakdown: {
        feedbackByLevel,
        feedbackBySemester,
        ratingDistribution
      },
      insights: {
        topIssues
      },
      recentFeedback: allFeedback.slice(0, 10) // Last 10 feedback entries
    });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({ error: error.message });
  }
};

// Respond to feedback (for HODs and Course Reps)
export const respondToFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only HODs and Course Reps can respond to feedback
    if (!['hod', 'course_rep'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Check if user belongs to the same department
    if (feedback.department !== req.user.department) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update feedback with response
    feedback.response = {
      message,
      respondedBy: userId,
      respondedAt: new Date()
    };
    feedback.status = 'reviewed';

    await feedback.save();

    res.json({
      success: true,
      message: 'Response added successfully',
      feedback
    });
  } catch (error) {
    console.error('Error responding to feedback:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get student's own feedback history
export const getStudentFeedbackHistory = async (req, res) => {
  try {
    const studentId = req.user.id;

    const feedbackHistory = await Feedback.find({ studentId })
      .populate('timetableId', 'level semester status')
      .sort({ createdAt: -1 });

    res.json(feedbackHistory);
  } catch (error) {
    console.error('Error fetching student feedback history:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get published timetables available for feedback (for students)
// Get timetables for feedback based on search criteria
export const searchTimetablesForFeedback = async (req, res) => {
  try {
    const { department, level, semester } = req.query;
    const studentId = req.user.id;

    // Validate required parameters
    if (!department || !level || !semester) {
      return res.status(400).json({ 
        error: 'Department, level, and semester are required' 
      });
    }

    // Get published timetables matching the search criteria
    const timetables = await Timetable.find({
      department: department.toLowerCase(),
      level: level,
      semester: semester.toLowerCase(),
      status: 'published'
    }).sort({ createdAt: -1 });

    // Check which timetables the student has already provided feedback for
    const timetableIds = timetables.map(t => t._id);
    const existingFeedback = await Feedback.find({
      studentId: studentId,
      timetableId: { $in: timetableIds }
    });

    const feedbackProvidedIds = existingFeedback.map(fb => fb.timetableId.toString());

    // Add feedback status to each timetable
    const timetablesWithStatus = timetables.map(timetable => ({
      ...timetable.toObject(),
      feedbackProvided: feedbackProvidedIds.includes(timetable._id.toString())
    }));

    res.json(timetablesWithStatus);
  } catch (error) {
    console.error('Error searching timetables for feedback:', error);
    res.status(500).json({ error: error.message });
  }
};

// Legacy function - kept for backward compatibility
export const getTimetablesForFeedback = async (req, res) => {
  try {
    const studentDepartment = req.user.department;
    const studentLevel = req.user.level;

    // Get published timetables for student's department and level
    const timetables = await Timetable.find({
      department: studentDepartment,
      level: studentLevel,
      status: 'published'
    }).sort({ createdAt: -1 });

    // Check which timetables the student has already provided feedback for
    const timetableIds = timetables.map(t => t._id);
    const existingFeedback = await Feedback.find({
      studentId: req.user.id,
      timetableId: { $in: timetableIds }
    });

    const feedbackProvidedIds = existingFeedback.map(fb => fb.timetableId.toString());

    // Add feedback status to each timetable
    const timetablesWithStatus = timetables.map(timetable => ({
      ...timetable.toObject(),
      feedbackProvided: feedbackProvidedIds.includes(timetable._id.toString())
    }));

    res.json(timetablesWithStatus);
  } catch (error) {
    console.error('Error fetching timetables for feedback:', error);
    res.status(500).json({ error: error.message });
  }
};

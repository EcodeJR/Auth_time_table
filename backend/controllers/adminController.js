import User from '../models/User.js';
import Timetable from '../models/Timetable.js';
import Course from '../models/Course.js';
import Venue from '../models/Venue.js';
import Feedback from '../models/Feedback.js';
import { normalizeDepartment } from '../utils/departmentUtils.js';
import bcrypt from 'bcryptjs';

export const getUnverifiedCourseReps = async (req, res) => {
  try {
    const courseReps = await User.find({ role: 'course_rep', verified: false });
    res.json(courseReps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyCourseRep = async (req, res) => {
  const { id } = req.params;
  try {
    const courseRep = await User.findById(id);
    if (!courseRep) return res.status(404).json({ message: "Course Representative not found" });
    courseRep.verified = true;
    await courseRep.save();
    res.json({ message: "Course Representative verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req, res) => {
  const { name, email, password, department, level, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Normalize department to lower-case
    const dept = department.trim().toLowerCase();
    
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      department: dept, 
      level, 
      role: role.toLowerCase(),
      verified: role === 'student' ? true : false,
      createdBy: req.user.id
    });
    
    await user.save();
    res.status(201).json({ 
      message: 'User created successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsersByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const users = await User.find({ department: department.toLowerCase() });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // Only HODs can view all users
    if (req.user.role !== 'hod') {
      return res.status(403).json({ message: "Only HODs can view all users" });
    }

    const hod = await User.findById(req.user.id);
    const users = await User.find({ department: hod.department }).select('-password');
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Only HODs can delete users
    if (req.user.role !== 'hod') {
      return res.status(403).json({ message: "Only HODs can delete users" });
    }

    const hod = await User.findById(req.user.id);
    const userToDelete = await User.findById(userId);
    
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    // HOD can only delete users from their own department
    if (userToDelete.department !== hod.department) {
      return res.status(403).json({ message: "You can only delete users from your department" });
    }

    // Prevent HOD from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const declineCourseRep = async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Only HODs can decline course reps
    if (req.user.role !== 'hod') {
      return res.status(403).json({ message: "Only HODs can decline course representatives" });
    }

    const hod = await User.findById(req.user.id);
    const courseRep = await User.findById(userId);
    
    if (!courseRep) {
      return res.status(404).json({ message: "Course representative not found" });
    }

    // Verify course rep belongs to HOD's department
    if (courseRep.department !== hod.department) {
      return res.status(403).json({ message: "You can only manage course representatives from your department" });
    }

    // Delete the declined course rep
    await User.findByIdAndDelete(userId);
    res.json({ message: "Course representative registration declined and removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCourseReps = await User.countDocuments({ role: 'course_rep' });
    const totalHODs = await User.countDocuments({ role: 'hod' });
    const unverifiedCourseReps = await User.countDocuments({ role: 'course_rep', verified: false });
    
    const departments = await User.distinct('department');
    
    res.json({
      totalUsers,
      totalStudents,
      totalCourseReps,
      totalHODs,
      unverifiedCourseReps,
      departments: departments.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Enhanced HOD Dashboard Stats
export const getHODDashboardStats = async (req, res) => {
  try {
    const hodDepartment = req.user.department;
    const userId = req.user.id;
    
    // If HOD doesn't have a department, return empty stats
    if (!hodDepartment) {
      return res.json({
        basicStats: {
          totalUsers: 0,
          totalStudents: 0,
          totalCourseReps: 0,
          unverifiedCourseReps: 0
        },
        timetableStats: {
          totalTimetables: 0,
          publishedTimetables: 0,
          draftTimetables: 0,
          timetablesByLevel: [],
          timetablesBySemester: [],
          recentTimetables: 0
        },
        courseStats: {
          totalCourses: 0,
          coursesByLevel: [],
          coursesBySemester: []
        },
        venueStats: {
          totalVenues: 0,
          venueUtilization: []
        },
        activityStats: {
          newRegistrations: 0,
          activeUsers: 0,
          departmentStats: []
        },
        feedbackStats: {
          totalFeedback: 0,
          averageRating: 0,
          feedbackByLevel: [],
          pendingResponses: 0,
          recentFeedback: [],
          topIssues: []
        }
      });
    }

    // Basic user stats
    const totalUsers = await User.countDocuments({ department: hodDepartment });
    const totalStudents = await User.countDocuments({ department: hodDepartment, role: 'student' });
    const totalCourseReps = await User.countDocuments({ department: hodDepartment, role: 'course_rep' });
    const unverifiedCourseReps = await User.countDocuments({ 
      department: hodDepartment, 
      role: 'course_rep', 
      verified: false 
    });

    // Timetable stats
    const totalTimetables = await Timetable.countDocuments({ department: hodDepartment });
    const publishedTimetables = await Timetable.countDocuments({ 
      department: hodDepartment, 
      status: 'published' 
    });
    const draftTimetables = await Timetable.countDocuments({ 
      department: hodDepartment, 
      status: 'draft' 
    });

    // Timetables by level
    const timetablesByLevel = await Timetable.aggregate([
      { $match: { department: hodDepartment } },
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Timetables by semester
    const timetablesBySemester = await Timetable.aggregate([
      { $match: { department: hodDepartment } },
      { $group: { _id: '$semester', count: { $sum: 1 } } }
    ]);

    // Recent timetable activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentTimetables = await Timetable.countDocuments({
      department: hodDepartment,
      createdAt: { $gte: sevenDaysAgo }
    });

    // Course stats
    const totalCourses = await Course.countDocuments({ department: hodDepartment });
    const coursesByLevel = await Course.aggregate([
      { $match: { department: hodDepartment } },
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const coursesBySemester = await Course.aggregate([
      { $match: { department: hodDepartment } },
      { $group: { _id: '$semester', count: { $sum: 1 } } }
    ]);

    // Venue stats
    const totalVenues = await Venue.countDocuments({ department: hodDepartment });
    const venueUtilization = await Venue.aggregate([
      { $match: { department: hodDepartment } },
      { $lookup: {
          from: 'timetables',
          localField: 'name',
          foreignField: 'courses.venue',
          as: 'usage'
        }
      },
      { $project: {
          name: 1,
          capacity: 1,
          usageCount: { $size: '$usage' }
        }
      }
    ]);

    // User activity stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newRegistrations = await User.countDocuments({
      department: hodDepartment,
      createdAt: { $gte: thirtyDaysAgo }
    });

    const activeUsers = await User.countDocuments({
      department: hodDepartment,
      lastLogin: { $gte: sevenDaysAgo }
    });

    // Department distribution
    const departmentStats = await User.aggregate([
      { $match: { department: hodDepartment } },
      { $group: { 
          _id: '$level', 
          count: { $sum: 1 },
          students: { $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] } },
          courseReps: { $sum: { $cond: [{ $eq: ['$role', 'course_rep'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Normalize department name using the utility function
    const normalizedHodDepartment = normalizeDepartment(hodDepartment);
    
    if (!normalizedHodDepartment) {
      return res.status(400).json({ error: 'Invalid department name' });
    }

    // Feedback statistics
    const totalFeedback = await Feedback.countDocuments({ department: normalizedHodDepartment });
    const averageFeedbackRating = totalFeedback > 0 
      ? await Feedback.aggregate([
          { $match: { department: normalizedHodDepartment } },
          { $group: { _id: null, avgRating: { $avg: '$overallRating' } } }
        ])
      : [{ avgRating: 0 }];

    const feedbackByLevel = await Feedback.aggregate([
      { $match: { department: normalizedHodDepartment } },
      { $group: {
          _id: '$level',
          count: { $sum: 1 },
          avgRating: { $avg: '$overallRating' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const pendingFeedbackResponses = await Feedback.countDocuments({
      department: normalizedHodDepartment,
      status: 'submitted'
    });

    const recentFeedback = await Feedback.find({ department: normalizedHodDepartment })
      .populate('timetableId', 'level semester')
      .populate('studentId', 'name department level')
      .sort({ createdAt: -1 })
      .limit(5);

    const topIssues = await Feedback.aggregate([
      { $match: { department: normalizedHodDepartment } },
      { $unwind: '$issues' },
      { $group: {
          _id: '$issues.type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      basicStats: {
        totalUsers,
        totalStudents,
        totalCourseReps,
        unverifiedCourseReps
      },
      timetableStats: {
        totalTimetables,
        publishedTimetables,
        draftTimetables,
        timetablesByLevel,
        timetablesBySemester,
        recentTimetables
      },
      courseStats: {
        totalCourses,
        coursesByLevel,
        coursesBySemester
      },
      venueStats: {
        totalVenues,
        venueUtilization
      },
      activityStats: {
        newRegistrations,
        activeUsers,
        departmentStats
      },
      feedbackStats: {
        totalFeedback,
        averageRating: averageFeedbackRating[0]?.avgRating?.toFixed(2) || 0,
        feedbackByLevel,
        pendingResponses: pendingFeedbackResponses,
        recentFeedback,
        topIssues
      }
    });
  } catch (error) {
    console.error('Error fetching HOD dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
};

// Enhanced Course Rep Dashboard Stats
export const getCourseRepDashboardStats = async (req, res) => {
  try {
    const courseRepDepartment = req.user.department;
    const userId = req.user.id;

    // Timetable review stats
    const sharedTimetables = await Timetable.countDocuments({
      department: courseRepDepartment,
      status: 'shared'
    });

    const publishedTimetables = await Timetable.countDocuments({
      department: courseRepDepartment,
      status: 'published'
    });

    // Timetables reviewed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timetablesReviewedToday = await Timetable.countDocuments({
      department: courseRepDepartment,
      status: 'published',
      updatedAt: { $gte: today }
    });

    // Timetables published this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const timetablesPublishedThisWeek = await Timetable.countDocuments({
      department: courseRepDepartment,
      status: 'published',
      updatedAt: { $gte: weekAgo }
    });

    // Department insights
    const totalStudents = await User.countDocuments({ 
      department: courseRepDepartment, 
      role: 'student' 
    });

    const studentsByLevel = await User.aggregate([
      { $match: { department: courseRepDepartment, role: 'student' } },
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const courseCoverage = await Course.aggregate([
      { $match: { department: courseRepDepartment } },
      { $group: { 
          _id: { level: '$level', semester: '$semester' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.level': 1, '_id.semester': 1 } }
    ]);

    // Venue usage for department
    const venueUsage = await Venue.aggregate([
      { $match: { department: courseRepDepartment } },
      { $lookup: {
          from: 'timetables',
          localField: 'name',
          foreignField: 'courses.venue',
          as: 'usage'
        }
      },
      { $project: {
          name: 1,
          capacity: 1,
          usageCount: { $size: '$usage' }
        }
      }
    ]);

    // Recent activity
    const recentSharedTimetables = await Timetable.find({
      department: courseRepDepartment,
      status: 'shared'
    }).sort({ createdAt: -1 }).limit(5);

    // Normalize department name using the utility function
    const normalizedCourseRepDepartment = normalizeDepartment(courseRepDepartment);
    
    if (!normalizedCourseRepDepartment) {
      return res.status(400).json({ error: 'Invalid department name' });
    }

    // Feedback statistics for Course Rep
    const totalFeedback = await Feedback.countDocuments({ department: normalizedCourseRepDepartment });
    const averageFeedbackRating = totalFeedback > 0 
      ? await Feedback.aggregate([
          { $match: { department: normalizedCourseRepDepartment } },
          { $group: { _id: null, avgRating: { $avg: '$overallRating' } } }
        ])
      : [{ avgRating: 0 }];

    const feedbackByTimetable = await Feedback.aggregate([
      { $match: { department: normalizedCourseRepDepartment } },
      { $lookup: {
          from: 'timetables',
          localField: 'timetableId',
          foreignField: '_id',
          as: 'timetable'
        }
      },
      { $unwind: '$timetable' },
      { $group: {
          _id: { level: '$timetable.level', semester: '$timetable.semester' },
          count: { $sum: 1 },
          avgRating: { $avg: '$overallRating' }
        }
      },
      { $sort: { '_id.level': 1, '_id.semester': 1 } }
    ]);

    const pendingFeedbackResponses = await Feedback.countDocuments({
      department: normalizedCourseRepDepartment,
      status: 'submitted'
    });

    const recentFeedback = await Feedback.find({ department: normalizedCourseRepDepartment })
      .populate('timetableId', 'level semester')
      .populate('studentId', 'name department level')
      .sort({ createdAt: -1 })
      .limit(5);

    const topIssues = await Feedback.aggregate([
      { $match: { department: normalizedCourseRepDepartment } },
      { $unwind: '$issues' },
      { $group: {
          _id: '$issues.type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      reviewStats: {
        sharedTimetables,
        publishedTimetables,
        timetablesReviewedToday,
        timetablesPublishedThisWeek
      },
      departmentInsights: {
        totalStudents,
        studentsByLevel,
        courseCoverage,
        venueUsage
      },
      recentActivity: {
        recentSharedTimetables
      },
      feedbackStats: {
        totalFeedback,
        averageRating: averageFeedbackRating[0]?.avgRating?.toFixed(2) || 0,
        feedbackByTimetable,
        pendingResponses: pendingFeedbackResponses,
        recentFeedback,
        topIssues
      }
    });
  } catch (error) {
    console.error('Error fetching Course Rep dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
};

import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  submitFeedback,
  getTimetableFeedback,
  getFeedbackStats,
  respondToFeedback,
  getStudentFeedbackHistory,
  getTimetablesForFeedback,
  searchTimetablesForFeedback
} from '../controllers/feedbackController.js';

const router = express.Router();

// All feedback routes require authentication
router.use(authMiddleware);

// Student routes
router.post('/submit', submitFeedback);
router.get('/student/history', getStudentFeedbackHistory);
router.get('/student/timetables', getTimetablesForFeedback);
router.get('/student/search', searchTimetablesForFeedback);

// HOD and Course Rep routes
router.get('/timetable/:timetableId', getTimetableFeedback);
router.get('/stats', getFeedbackStats);
router.post('/respond/:feedbackId', respondToFeedback);

export default router;

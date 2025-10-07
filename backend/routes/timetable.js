import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { 
  generateTimetable, 
  getTimetable, 
  shareTimetableWithCourseReps,
  getSharedTimetables,
  publishTimetable,
  getPublicTimetables,
  getCourseRepsForDepartment,
  addVenue,
  addCourse,
  getVenuesForDepartment,
  getCoursesForDepartment,
  getTimetableById,
  deleteTimetable,
  regenerateTimetable
} from '../controllers/timetableController.js';
const router = express.Router();

// Public route for timetable lookup (no auth required)
router.get('/public', getPublicTimetables);

// Protected routes (require authentication)
router.use(authMiddleware);

router.post('/generate', generateTimetable);
router.get('/getall/:department', getTimetable);
router.get('/course-reps/:department', getCourseRepsForDepartment);
router.post('/share', shareTimetableWithCourseReps);
router.get('/shared', getSharedTimetables);
router.post('/publish', publishTimetable);

// Venue and Course Management (HOD only)
router.post('/venues/add', addVenue);
router.post('/courses/add', addCourse);
router.get('/venues/:department', getVenuesForDepartment);
router.get('/courses/:department', getCoursesForDepartment);

// Timetable Management (HOD only)
router.get('/view/:timetableId', getTimetableById);
router.delete('/delete/:timetableId', deleteTimetable);
router.post('/regenerate/:timetableId', regenerateTimetable);

export default router;
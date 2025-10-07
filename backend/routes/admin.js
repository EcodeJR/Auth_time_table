import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { 
  verifyCourseRep, 
  getUnverifiedCourseReps, 
  createUser, 
  getUsersByDepartment, 
  getSystemStats,
  getAllUsers,
  deleteUser,
  declineCourseRep,
  getHODDashboardStats,
  getCourseRepDashboardStats
} from '../controllers/adminController.js';
const router = express.Router();

// All admin routes require authentication
router.use(authMiddleware);

router.get('/unverified', getUnverifiedCourseReps);
router.post('/verify/:id', verifyCourseRep);
router.delete('/decline/:userId', declineCourseRep);
router.post('/create-user', createUser);
router.get('/users/:department', getUsersByDepartment);
router.get('/all-users', getAllUsers);
router.delete('/user/:userId', deleteUser);
router.get('/stats', getSystemStats);

// Enhanced dashboard stats
router.get('/hod-dashboard-stats', getHODDashboardStats);
router.get('/course-rep-dashboard-stats', getCourseRepDashboardStats);

export default router;

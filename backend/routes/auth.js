// 📌 routes/auth.js
import express from 'express';
import { registerUser, loginUser, getdepartments, createFirstHOD, updateProfile, changePassword, deleteAccount } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/dept', getdepartments);
router.post('/create-first-hod', createFirstHOD);

// Protected routes (require authentication)
router.put('/profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);
router.delete('/account', authMiddleware, deleteAccount);

export default router;
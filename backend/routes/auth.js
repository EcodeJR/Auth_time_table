// 📌 routes/auth.js
import express from 'express';
import { registerAdmin, loginAdmin, getdepartments } from '../controllers/authController.js';
const router = express.Router();
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/dept', getdepartments);
export default router;
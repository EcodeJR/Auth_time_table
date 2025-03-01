// 📌 routes/courses.js
import express from 'express';
import { addCourse, scheduleCourses } from '../controllers/courseController.js';
const router = express.Router();
router.post('/add', addCourse);
router.post('/schedule', scheduleCourses);
export default router;
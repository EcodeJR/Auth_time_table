import express from 'express';
import { generateTimetable, getTimetable } from '../controllers/timetableController.js';
const router = express.Router();

router.post('/generate', generateTimetable);
router.get('/:department', getTimetable);

export default router;
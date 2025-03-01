import express from 'express';
import { generateTimetable, getTimetable } from '../controllers/timetableController.js';
const router = express.Router();

router.post('/generate', generateTimetable);
router.get('/:department/:level', getTimetable);

export default router;

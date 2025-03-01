import { Timetable } from '../models/Timetable.js';
import { Course } from '../models/Course.js';
import { Venue } from '../models/Venue.js';
import { generateSchedule } from '../utils/scheduler.js';

export const generateTimetable = async (req, res) => {
  const { department, level } = req.body;
  try {
    const courses = await Course.find({ department, level });
    const venues = await Venue.find({ department });
    const timetable = await generateSchedule(courses, venues);
    await Timetable.create({ department, level, courses: timetable });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTimetable = async (req, res) => {
  const { department, level } = req.params;
  try {
    const timetable = await Timetable.findOne({ department, level });
    if (!timetable) return res.status(404).json({ message: "Timetable not found" });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

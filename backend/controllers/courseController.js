// 📌 controllers/courseController.js
import Course from '../models/Course.js';
import Venue from '../models/Venue.js';
import Timetable from '../models/Timetable.js';
import { generateSchedule } from '../utils/scheduler.js';

export const addCourse = async (req, res) => {
  const { name, code, department, level } = req.body;

  if (!name || !code || !department || !level) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  try {
    const course = new Course({ name, code, department, level });
    await course.save();
    res.status(201).json({ message: "Course added successfully", course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const scheduleCourses = async (req, res) => {
  try {
    const { department, level } = req.body;
    const courses = await Course.find({ department, level });
    const venues = await Venue.find({ department });
    const timetable = await generateSchedule(courses, venues);
    await Timetable.create({ department, level, courses: timetable });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error)
  }
};
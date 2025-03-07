// 📌 controllers/courseController.js
import Course from '../models/Course.js';
import Venue from '../models/Venue.js';
import Timetable from '../models/Timetable.js';
import { generateSchedule } from '../utils/scheduler.js';

export const addCourse = async (req, res) => {
  try {
    console.log("Received request body:", req.body); // Debugging log

    const { name, code, department, level } = req.body;

    if (!name || !code || !department || !level) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingCourse = await Course.findOne({ code, department, level });
    if (existingCourse) {
      return res.status(400).json({ message: "Course already exists" });
    }

    const course = new Course({ name, code, department, level });
    await course.save();

    try {
      await generateSchedule([course]); // Ensure it's an array
      res.status(201).json({ message: "Course added & timetable updated!", course });
    } catch (e) {
      console.error("Timetable update error:", e);
      res.status(201).json({ message: "Course added but timetable not updated!", course });
    }
  } catch (error) {
    console.error("Server error:", error);
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
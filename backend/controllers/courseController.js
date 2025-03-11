// 📌 controllers/courseController.js
import Course from '../models/Course.js';
import Venue from '../models/Venue.js';
import Timetable from '../models/Timetable.js';
import { generateSchedule } from '../utils/scheduler.js';

export const addCourse = async (req, res) => {
  try {
    const { name, code, department, level } = req.body;

    if (!name || !code || !department || !level) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Normalize department to lower-case
    const dept = department.trim().toLowerCase();

    const existingCourse = await Course.findOne({ code, department: dept, level });
    if (existingCourse) {
      return res.status(400).json({ message: "Course already exists" });
    }

    // Create the course with the normalized department
    const course = new Course({ name, code, department: dept, level });
    await course.save();

    try {
      await generateSchedule([course]); // Ensure it's an array
      res.status(201).json({ message: "Course added & timetable updated!", course });
    } catch (e) {
      res.status(201).json({ message: "Course added but timetable not updated!", course });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const scheduleCourses = async (req, res) => {
  try {
    const { department, level } = req.body;
    // Normalize department to lower-case
    const dept = department.trim().toLowerCase();

    const courses = await Course.find({ department: dept, level });
    const venues = await Venue.find({ department: dept });
    const timetable = await generateSchedule(courses, venues);
    await Timetable.create({ department: dept, level, courses: timetable });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

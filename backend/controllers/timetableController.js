import Timetable from '../models/Timetable.js';
import Course from '../models/Course.js';
import Venue from '../models/Venue.js';
import { generateSchedule } from '../utils/scheduler.js';

export const generateTimetable = async (req, res) => {
  const { department } = req.body; // No level, generate for all
  try {
    const courses = await Course.find({ department });
    const venues = await Venue.find({ department });
    
    if (!courses.length) return res.status(400).json({ message: "No courses found for this department" });

    const timetable = await generateSchedule(courses, venues);
    
    // Save timetable for all levels
    await Promise.all(
      timetable.map(async (entry) => {
        await Timetable.create({ department, level: entry.level, courses: [entry] });
      })
    );

    res.json(timetable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getTimetable = async (req, res) => {
  const { department } = req.params;
  try {
      const timetables = await Timetable.find({ department }); // Fetch all levels in the department
      if (!timetables.length) return res.status(404).json({ message: "No timetables found" });
      res.json(timetables);
  } catch (error) {
      res.status(500).json({ error: error.message });
      console.log(error)
  }
};


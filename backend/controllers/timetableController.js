import Timetable from '../models/Timetable.js';
import Course from '../models/Course.js';
import Venue from '../models/Venue.js';
import User from '../models/User.js';
import { generateSchedule } from '../utils/scheduler.js';

export const generateTimetable = async (req, res) => {
  const { department, level, semester } = req.body;
  
  try {
    // Only HODs can generate timetables
    if (req.user.role !== 'hod') {
      return res.status(403).json({ message: "Only HODs can generate timetables" });
    }

    // Verify HOD belongs to the department they're generating for
    const hod = await User.findById(req.user.id);
    if (hod.department !== department.toLowerCase()) {
      return res.status(403).json({ message: "You can only generate timetables for your own department" });
    }

    // Validate semester
    if (!semester || !['first', 'second'].includes(semester.toLowerCase())) {
      return res.status(400).json({ message: "Semester must be 'first' or 'second'" });
    }

    // Get courses for the specific level and semester
    const courseQuery = { 
      department: department.toLowerCase(),
      semester: semester.toLowerCase()
    };
    if (level) {
      courseQuery.level = level;
    }
    
    const courses = await Course.find(courseQuery);
    const venues = await Venue.find({ department: department.toLowerCase() });
    
    if (!courses.length) {
      return res.status(400).json({ 
        message: level 
          ? `No courses found for ${department} - Level ${level} - ${semester.charAt(0).toUpperCase() + semester.slice(1)} Semester` 
          : `No courses found for ${department} - ${semester.charAt(0).toUpperCase() + semester.slice(1)} Semester` 
      });
    }

    if (!venues.length) {
      return res.status(400).json({ message: "No venues found for this department. Please add venues first." });
    }

    // Check if timetable already exists for this level and semester
    const existingTimetable = await Timetable.findOne({
      department: department.toLowerCase(),
      level: level || courses[0].level,
      semester: semester.toLowerCase()
    });

    if (existingTimetable) {
      return res.status(400).json({ 
        message: `Timetable already exists for Level ${level || courses[0].level} - ${semester.charAt(0).toUpperCase() + semester.slice(1)} Semester. Please update the existing timetable instead.` 
      });
    }

    console.log('Generating timetable with:', { courses: courses.length, venues: venues.length, semester });
    const timetable = await generateSchedule(courses, venues, semester);
    console.log('Generated timetable entries:', timetable.length);
    
    // Save timetable entries to database
    const savedTimetables = [];
    let totalScheduledCourses = 0;
    
    for (const entry of timetable) {
      const savedEntry = await Timetable.create({
        ...entry,
        createdBy: req.user.id
      });
      savedTimetables.push(savedEntry);
      totalScheduledCourses += entry.courses.length; // Count courses in each timetable
    }

    res.json({ 
      message: `Timetable generated successfully for Level ${level || 'All Levels'} - ${semester.charAt(0).toUpperCase() + semester.slice(1)} Semester`,
      timetable: savedTimetables,
      summary: {
        totalCourses: courses.length,
        scheduledCourses: totalScheduledCourses,
        unscheduledCourses: courses.length - totalScheduledCourses,
        levels: [...new Set(savedTimetables.map(t => t.level))],
        semester: semester.charAt(0).toUpperCase() + semester.slice(1),
        timetablesGenerated: savedTimetables.length
      },
      nextStep: "Review the generated timetable and share with course representatives"
    });
  } catch (error) {
    console.error('Error generating timetable:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getTimetable = async (req, res) => {
  const { department } = req.params;
  try {
    const timetables = await Timetable.find({ department: department.toLowerCase() });
    res.json(timetables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const shareTimetableWithCourseReps = async (req, res) => {
  const { timetableId, courseRepIds } = req.body;
  try {
    // Only HODs can share timetables
    if (req.user.role !== 'hod') {
      return res.status(403).json({ message: "Only HODs can share timetables with course representatives" });
    }

    const timetable = await Timetable.findById(timetableId);
    if (!timetable) return res.status(404).json({ message: "Timetable not found" });

    // Verify the user is the creator (HOD)
    if (timetable.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the creator can share timetables" });
    }

    // Verify course reps belong to the same department
    const courseReps = await User.find({ 
      _id: { $in: courseRepIds }, 
      role: 'course_rep',
      department: timetable.department,
      verified: true
    });

    if (courseReps.length !== courseRepIds.length) {
      return res.status(400).json({ message: "Some course representatives are invalid or not verified" });
    }

    // Update timetable status and sharedWith
    timetable.status = 'shared';
    timetable.sharedWith = courseRepIds;
    timetable.updatedAt = new Date();
    await timetable.save();

    res.json({ 
      message: "Timetable shared successfully with course representatives", 
      timetable,
      sharedWith: courseReps.map(rep => ({ id: rep._id, name: rep.name, email: rep.email }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSharedTimetables = async (req, res) => {
  try {
    const userId = req.user.id;
    const timetables = await Timetable.find({ 
      sharedWith: userId,
      status: { $in: ['shared', 'published'] }
    }).populate('createdBy', 'name email');
    
    res.json(timetables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const publishTimetable = async (req, res) => {
  const { timetableId } = req.body;
  try {
    const timetable = await Timetable.findById(timetableId);
    if (!timetable) return res.status(404).json({ message: "Timetable not found" });

    // Only course reps can publish timetables (after HOD shares with them)
    if (req.user.role !== 'course_rep') {
      return res.status(403).json({ message: "Only course representatives can publish timetables" });
    }

    // Verify the course rep has access to this timetable
    if (!timetable.sharedWith.includes(req.user.id)) {
      return res.status(403).json({ message: "You don't have access to this timetable" });
    }

    // Verify course rep belongs to the same department
    const courseRep = await User.findById(req.user.id);
    if (courseRep.department !== timetable.department) {
      return res.status(403).json({ message: "You can only publish timetables for your department" });
    }

    // Only shared timetables can be published
    if (timetable.status !== 'shared') {
      return res.status(400).json({ message: "Only shared timetables can be published" });
    }

    timetable.status = 'published';
    timetable.updatedAt = new Date();
    await timetable.save();

    res.json({ 
      message: "Timetable published successfully and is now visible to students", 
      timetable 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCourseRepsForDepartment = async (req, res) => {
  const { department } = req.params;
  try {
    // Only HODs can get course reps
    if (req.user.role !== 'hod') {
      return res.status(403).json({ message: "Only HODs can view course representatives" });
    }

    // Verify HOD belongs to the department
    const hod = await User.findById(req.user.id);
    if (hod.department !== department.toLowerCase()) {
      return res.status(403).json({ message: "You can only view course representatives from your department" });
    }

    const courseReps = await User.find({ 
      role: 'course_rep', 
      department: department.toLowerCase(),
      verified: true
    }).select('name email level');

    res.json(courseReps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPublicTimetables = async (req, res) => {
  const { faculty, department, level, semester } = req.query;
  try {
    const query = { status: 'published' };
    
    if (department) query.department = department.toLowerCase();
    if (level) query.level = level;
    if (semester) query.semester = semester.toLowerCase();
    
    console.log('Public timetable search query:', query);
    const timetables = await Timetable.find(query).populate('createdBy', 'name');
    console.log(`Found ${timetables.length} published timetables`);
    res.json(timetables);
  } catch (error) {
    console.error('Error fetching public timetables:', error);
    res.status(500).json({ error: error.message });
  }
};

export const addVenue = async (req, res) => {
  const { name, capacity, location, department } = req.body;
  
  try {
    // Only HODs can add venues
    if (req.user.role !== 'hod') {
      return res.status(403).json({ message: "Only HODs can add venues" });
    }

    // Verify HOD belongs to the department
    const hod = await User.findById(req.user.id);
    if (hod.department !== department.toLowerCase()) {
      return res.status(403).json({ message: "You can only add venues for your department" });
    }

    // Check if venue already exists
    const existingVenue = await Venue.findOne({ 
      name: name.trim(), 
      department: department.toLowerCase() 
    });
    
    if (existingVenue) {
      return res.status(400).json({ message: "Venue with this name already exists in your department" });
    }

    const venue = new Venue({
      name: name.trim(),
      capacity: parseInt(capacity),
      location: location.trim(),
      department: department.toLowerCase()
    });

    await venue.save();
    res.status(201).json({ 
      message: "Venue added successfully",
      venue: { id: venue._id, name: venue.name, capacity: venue.capacity, location: venue.location }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addCourse = async (req, res) => {
  const { code, name, level, semester, instructor, classSize, department } = req.body;
  
  try {
    // Only HODs can add courses
    if (req.user.role !== 'hod') {
      return res.status(403).json({ message: "Only HODs can add courses" });
    }

    // Verify HOD belongs to the department
    const hod = await User.findById(req.user.id);
    if (hod.department !== department.toLowerCase()) {
      return res.status(403).json({ message: "You can only add courses for your department" });
    }

    // Validate semester
    if (!semester || !['first', 'second'].includes(semester.toLowerCase())) {
      return res.status(400).json({ message: "Semester must be 'first' or 'second'" });
    }

    // Check if course already exists
    const existingCourse = await Course.findOne({ 
      code: code.trim().toUpperCase(), 
      department: department.toLowerCase(),
      level: level,
      semester: semester.toLowerCase()
    });
    
    if (existingCourse) {
      return res.status(400).json({ 
        message: `Course ${code.trim().toUpperCase()} already exists for Level ${level} - ${semester.charAt(0).toUpperCase() + semester.slice(1)} Semester in your department` 
      });
    }

    const course = new Course({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      level: level,
      semester: semester.toLowerCase(),
      instructor: instructor.trim(),
      classSize: parseInt(classSize),
      department: department.toLowerCase()
    });

    await course.save();

    // Check if timetable exists for this level and semester
    const existingTimetable = await Timetable.findOne({
      department: department.toLowerCase(),
      level: level,
      semester: semester.toLowerCase()
    });

    let updateNotification = null;
    if (existingTimetable) {
      updateNotification = {
        message: `A timetable already exists for Level ${level} - ${semester.charAt(0).toUpperCase() + semester.slice(1)} Semester. You may need to update the timetable to include this new course.`,
        timetableId: existingTimetable._id,
        action: "update_timetable"
      };
    }

    res.status(201).json({ 
      message: "Course added successfully",
      course: { 
        id: course._id, 
        code: course.code, 
        name: course.name, 
        level: course.level,
        semester: course.semester,
        instructor: course.instructor,
        classSize: course.classSize
      },
      updateNotification
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getVenuesForDepartment = async (req, res) => {
  const { department } = req.params;
  
  try {
    // Only HODs can view venues
    if (req.user.role !== 'hod') {
      return res.status(403).json({ message: "Only HODs can view venues" });
    }

    // Verify HOD belongs to the department
    const hod = await User.findById(req.user.id);
    if (hod.department !== department.toLowerCase()) {
      return res.status(403).json({ message: "You can only view venues from your department" });
    }

    const venues = await Venue.find({ department: department.toLowerCase() });
    res.json(venues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTimetable = async (req, res) => {
  const { timetableId } = req.params;
  
  try {
    // Only HODs can delete timetables
    if (req.user.role !== 'hod') {
      return res.status(403).json({ message: "Only HODs can delete timetables" });
    }

    // Find the timetable
    const timetable = await Timetable.findById(timetableId);
    if (!timetable) {
      return res.status(404).json({ message: "Timetable not found" });
    }

    // Verify HOD belongs to the department
    const hod = await User.findById(req.user.id);
    if (hod.department !== timetable.department) {
      return res.status(403).json({ message: "You can only delete timetables from your department" });
    }

    // Only allow deletion of draft timetables
    if (timetable.status !== 'draft') {
      return res.status(400).json({ message: "Only draft timetables can be deleted" });
    }

    await Timetable.findByIdAndDelete(timetableId);
    res.json({ message: "Timetable deleted successfully" });
  } catch (error) {
    console.error('Error deleting timetable:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getTimetableById = async (req, res) => {
  const { timetableId } = req.params;
  
  try {
    // Only HODs can view timetables
    if (req.user.role !== 'hod') {
      return res.status(403).json({ message: "Only HODs can view timetables" });
    }

    const timetable = await Timetable.findById(timetableId).populate('createdBy', 'name');
    if (!timetable) {
      return res.status(404).json({ message: "Timetable not found" });
    }

    // Verify HOD belongs to the department
    const hod = await User.findById(req.user.id);
    if (hod.department !== timetable.department) {
      return res.status(403).json({ message: "You can only view timetables from your department" });
    }

    res.json(timetable);
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getCoursesForDepartment = async (req, res) => {
  const { department } = req.params;
  const { semester } = req.query;
  
  try {
    // Only HODs can view courses
    if (req.user.role !== 'hod') {
      return res.status(403).json({ message: "Only HODs can view courses" });
    }

    // Verify HOD belongs to the department
    const hod = await User.findById(req.user.id);
    if (hod.department !== department.toLowerCase()) {
      return res.status(403).json({ message: "You can only view courses from your department" });
    }

    const query = { department: department.toLowerCase() };
    if (semester && ['first', 'second'].includes(semester.toLowerCase())) {
      query.semester = semester.toLowerCase();
    }

    const courses = await Course.find(query).sort({ level: 1, semester: 1, code: 1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const regenerateTimetable = async (req, res) => {
  const { timetableId } = req.params;
  
  try {
    // Only HODs can regenerate timetables
    if (req.user.role !== 'hod') {
      return res.status(403).json({ message: "Only HODs can regenerate timetables" });
    }

    // Find the existing timetable
    const existingTimetable = await Timetable.findById(timetableId);
    if (!existingTimetable) {
      return res.status(404).json({ message: "Timetable not found" });
    }

    // Verify HOD belongs to the department
    const hod = await User.findById(req.user.id);
    if (hod.department !== existingTimetable.department) {
      return res.status(403).json({ message: "You can only regenerate timetables from your department" });
    }

    // Only allow regeneration of draft timetables
    if (existingTimetable.status !== 'draft') {
      return res.status(400).json({ message: "Only draft timetables can be regenerated" });
    }

    // Get courses and venues for regeneration
    const courses = await Course.find({ 
      department: existingTimetable.department.toLowerCase(),
      level: existingTimetable.level,
      semester: existingTimetable.semester.toLowerCase()
    });
    
    const venues = await Venue.find({ department: existingTimetable.department.toLowerCase() });
    
    if (!courses.length) {
      return res.status(400).json({ 
        message: `No courses found for Level ${existingTimetable.level} - ${existingTimetable.semester.charAt(0).toUpperCase() + existingTimetable.semester.slice(1)} Semester` 
      });
    }

    if (!venues.length) {
      return res.status(400).json({ message: "No venues found for this department. Please add venues first." });
    }

    // Delete the existing timetable
    await Timetable.findByIdAndDelete(timetableId);

    // Generate new timetable
    console.log('Regenerating timetable with:', { courses: courses.length, venues: venues.length, semester: existingTimetable.semester });
    const timetable = await generateSchedule(courses, venues, existingTimetable.semester);
    console.log('Generated timetable entries:', timetable.length);
    
    // Save new timetable entries to database
    const savedTimetables = [];
    let totalScheduledCourses = 0;
    
    for (const entry of timetable) {
      const savedEntry = await Timetable.create({
        ...entry,
        createdBy: req.user.id
      });
      savedTimetables.push(savedEntry);
      totalScheduledCourses += entry.courses.length; // Count courses in each timetable
    }

    res.json({ 
      message: `Timetable regenerated successfully for Level ${existingTimetable.level} - ${existingTimetable.semester.charAt(0).toUpperCase() + existingTimetable.semester.slice(1)} Semester`,
      timetable: savedTimetables,
      summary: {
        totalCourses: courses.length,
        scheduledCourses: totalScheduledCourses,
        unscheduledCourses: courses.length - totalScheduledCourses,
        levels: [...new Set(savedTimetables.map(t => t.level))],
        semester: existingTimetable.semester.charAt(0).toUpperCase() + existingTimetable.semester.slice(1),
        timetablesGenerated: savedTimetables.length
      },
      nextStep: "Review the regenerated timetable and share with course representatives"
    });
  } catch (error) {
    console.error('Error regenerating timetable:', error);
    res.status(500).json({ error: error.message });
  }
};


// 📌 utils/scheduler.js
import Venue from '../models/Venue.js';
import Timetable from '../models/Timetable.js';

// Helper function to shuffle an array (Fisher-Yates)
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Helper function to check for conflicts
const hasConflict = (venue, day, time, existingBookings) => {
  return existingBookings.some(booking => 
    booking.venue === venue && booking.day === day && booking.time === time
  );
};

// Helper function to get available venues for a specific slot
const getAvailableVenues = (venues, day, time, existingBookings) => {
  return venues.filter(venue => 
    !hasConflict(venue.name, day, time, existingBookings)
  );
};

export const generateSchedule = async (courses, venues, semester) => {
  console.log('Scheduler called with:', { coursesCount: courses.length, venuesCount: venues.length, semester });
  
  if (!courses.length || !venues.length) {
    console.log('No courses or venues provided');
    return [];
  }

  const department = courses[0].department;
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM', 
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM'
  ];
  
  try {
    // Get existing timetable entries for this department and semester to avoid conflicts
    const existingEntries = await Timetable.find({ 
      department: department.toLowerCase(),
      semester: semester.toLowerCase()
    });
    console.log('Found existing entries:', existingEntries.length);
    
    const existingBookings = [];
    
    existingEntries.forEach(entry => {
      entry.courses.forEach(course => {
        existingBookings.push({
          venue: course.venue,
          day: course.day,
          time: course.time,
          courseCode: course.courseCode,
          level: entry.level
        });
      });
    });

    // Group courses by level for better organization
    const coursesByLevel = {};
    courses.forEach(course => {
      if (!coursesByLevel[course.level]) {
        coursesByLevel[course.level] = [];
      }
      coursesByLevel[course.level].push(course);
    });

    let allTimetables = [];
    let scheduledCourses = new Set();
    let levelDayCount = {}; // Track courses per day per level

    // Process each level separately
    for (const [level, levelCourses] of Object.entries(coursesByLevel)) {
      console.log(`Processing level ${level} with ${levelCourses.length} courses`);
      
      // Initialize day count for this level
      if (!levelDayCount[level]) {
        levelDayCount[level] = {};
        days.forEach(day => {
          levelDayCount[level][day] = 0;
        });
      }

      // Shuffle courses for this level to randomize scheduling
      const shuffledCourses = shuffleArray(levelCourses);
      const levelCoursesInfo = []; // Store all courses for this level

      for (const course of shuffledCourses) {
        if (scheduledCourses.has(course.code)) {
          continue; // Skip if already scheduled
        }

        let courseScheduled = false;
        
        // Try to schedule the course
        for (const day of shuffleArray(days)) {
          // Limit courses per day per level (max 3)
          if (levelDayCount[level][day] >= 3) continue;

          for (const time of shuffleArray(timeSlots)) {
            // Get available venues for this slot
            const availableVenues = getAvailableVenues(venues, day, time, existingBookings);
            
            if (availableVenues.length > 0) {
              // Select a random available venue
              const selectedVenue = shuffleArray(availableVenues)[0];
              
              // Create course info
              const courseInfo = {
                courseCode: course.code,
                courseName: course.name,
                venue: selectedVenue.name,
                day,
                time,
                instructor: course.instructor || 'TBA',
                classSize: course.classSize || 50
              };

              // Add to existing bookings to prevent future conflicts
              existingBookings.push({
                venue: selectedVenue.name,
                day,
                time,
                courseCode: course.code,
                level: level
              });

              // Add course info to level courses
              levelCoursesInfo.push(courseInfo);
              scheduledCourses.add(course.code);
              levelDayCount[level][day]++;
              courseScheduled = true;
              break;
            }
          }
          
          if (courseScheduled) break;
        }

        // If course couldn't be scheduled, log it
        if (!courseScheduled) {
          console.warn(`Could not schedule course: ${course.name} (${course.code}) for ${semester} semester`);
        }
      }

      // Create a single timetable entry for this level containing all scheduled courses
      if (levelCoursesInfo.length > 0) {
        const timetableEntry = {
          department: department.toLowerCase(),
          level: level,
          semester: semester.toLowerCase(),
          courses: levelCoursesInfo, // All courses for this level
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        allTimetables.push(timetableEntry);
        console.log(`Created timetable for Level ${level} with ${levelCoursesInfo.length} courses`);
      }
    }

    console.log(`Generated ${allTimetables.length} timetable(s) with ${scheduledCourses.size} total scheduled courses out of ${courses.length} total`);
    return allTimetables;
  } catch (error) {
    console.error('Error in generateSchedule:', error);
    throw error;
  }
};

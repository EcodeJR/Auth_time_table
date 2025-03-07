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

export const generateSchedule = async (courses) => {
  // Assuming all courses are for the same department
  const department = courses.length ? courses[0].department : "";
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM'
  ];
  
  let timetable = [];
  let scheduledCourses = new Set(); // Ensure each course is scheduled only once
  let levelDayCount = {}; // Track number of courses per level for each day

  console.log("Courses received for scheduling:", courses);

  // Fetch venues for the department and shuffle them to randomize initial order
  let venues = await Venue.find({ department });
  if (!venues.length) {
    console.error("❌ No venues found in the department.");
    return [];
  }
  
  // Query existing timetable entries for this department
  const existingEntries = await Timetable.find({ department });
  // Build mapping: { venueName: [ { day, time }, ... ] }
  const venueBookings = {};
  existingEntries.forEach(entry => {
    const vName = entry.venue;
    if (!venueBookings[vName]) {
      venueBookings[vName] = [];
    }
    // Assuming each entry in Timetable has one course with day and time
    entry.courses.forEach(course => {
      venueBookings[vName].push({ day: course.day, time: course.time });
    });
  });

  // Ensure each venue has a bookedSlots array, updated from DB
  venues.forEach(v => {
    if (!Array.isArray(v.bookedSlots)) {
      v.bookedSlots = [];
    }
    if (venueBookings[v.name]) {
      v.bookedSlots = venueBookings[v.name];
    }
  });

  console.log("Available venues with current bookings:", venues.map(v => ({ name: v.name, bookedSlots: v.bookedSlots })));

  // For each course, schedule only one slot
  for (let course of courses) {
    if (scheduledCourses.has(course.code)) {
      console.log(`🚨 Skipping ${course.name} - Already scheduled.`);
      continue;
    }

    // Initialize daily count for this level if not already set
    if (!levelDayCount[course.level]) {
      levelDayCount[course.level] = {};
      days.forEach(day => {
        levelDayCount[course.level][day] = 0;
      });
    }

    // Shuffle days and timeSlots to randomize scheduling order
    const shuffledDays = shuffleArray(days);
    const shuffledTimeSlots = shuffleArray(timeSlots);

    let courseScheduled = false;
    for (let day of shuffledDays) {
      // Enforce maximum 3 courses per day for this level
      if (levelDayCount[course.level][day] >= 3) continue;

      for (let time of shuffledTimeSlots) {
        const slotKey = `${day}-${time}`;
        // Randomize venues for each attempt by shuffling the venues array
        const shuffledVenues = shuffleArray(venues);
        // Find a venue that is not booked at this day/time slot
        let venue = shuffledVenues.find(v => {
          const slots = Array.isArray(v.bookedSlots) ? v.bookedSlots : [];
          return slots.every(slot => slot.day !== day || slot.time !== time);
        });

        if (venue) {
          // Update venue's booked slots and persist in DB
          venue.bookedSlots.push({ day, time });
          await venue.save();
          console.log(`✅ Venue updated: ${venue.name} booked for ${course.name} on ${day} at ${time}`);

          // Build course info as a plain object with full details
          const courseInfo = {
            courseCode: course.code,
            courseName: course.name,
            venue: venue.name,
            day,
            time
          };

          // Create a new timetable entry with full course details
          let newEntry = new Timetable({
            department: course.department,
            level: course.level,
            courses: [courseInfo] // Store full course details here
          });

          await newEntry.save();
          console.log("📅 New timetable entry created:", newEntry.toObject());

          timetable.push(newEntry);
          scheduledCourses.add(course.code);
          levelDayCount[course.level][day]++; // Increment count for this level on the day
          courseScheduled = true;
          break; // Slot found, move to next course
        }
      }
      if (courseScheduled) break; // Exit day loop if course is scheduled
    }
  }

  console.log(`✅ Scheduling complete. Total entries: ${timetable.length}`);
  return timetable;
};

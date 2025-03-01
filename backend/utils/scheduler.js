// 📌 utils/scheduler.js
export const generateSchedule = async (courses, venues) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = ['8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '1:00 PM - 3:00 PM', '3:00 PM - 5:00 PM'];
    let timetable = [];
    let dayCourseCount = {};
    for (let course of courses) {
      for (let day of days) {
        if (!dayCourseCount[day]) dayCourseCount[day] = 0;
        if (dayCourseCount[day] >= 4) continue;
        for (let time of timeSlots) {
          let venue = venues.find(v => !v.bookedSlots.some(slot => slot.day === day && slot.time === time));
          if (venue) {
            venue.bookedSlots.push({ day, time });
            await venue.save();
            timetable.push({ courseCode: course.code, courseName: course.name, venue: venue.name, day, time });
            dayCourseCount[day]++;
            break;
          }
        }
        if (dayCourseCount[day] >= 4) break;
      }
    }
    return timetable;
  };
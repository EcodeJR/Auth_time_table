// 📌 models/Timetable.js
const TimetableSchema = new mongoose.Schema({
  department: String,
  level: String,
  courses: [{
    courseCode: String,
    courseName: String,
    venue: String,
    day: String,
    time: String
  }]
});
export const Timetable = mongoose.model('Timetable', TimetableSchema);
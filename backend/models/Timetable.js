// 📌 models/Timetable.js
import mongoose from 'mongoose';

const Timetable = new mongoose.Schema({
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
export default mongoose.model('Timetable', Timetable);
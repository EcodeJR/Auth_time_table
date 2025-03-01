// 📌 models/Course.js
const CourseSchema = new mongoose.Schema({
  name: String,
  code: { type: String, unique: true },
  department: String,
  level: String
});
export const Course = mongoose.model('Course', CourseSchema);
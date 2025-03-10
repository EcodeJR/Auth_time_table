// 📌 models/Course.js
import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  department: { type: String, required: true },
  level: { type: String, required: true }
});

// Create a compound index to ensure uniqueness only on the combination of code, department, and level
CourseSchema.index({ code: 1, department: 1, level: 1 }, { unique: true });

export default mongoose.model('Course', CourseSchema);

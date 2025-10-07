// 📌 models/Course.js
import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  department: { type: String, required: true },
  level: { type: String, required: true },
  semester: { 
    type: String, 
    required: true,
    enum: ['first', 'second'],
    lowercase: true
  },
  instructor: { type: String, default: 'TBA' },
  classSize: { type: Number, default: 50 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create a compound index to ensure uniqueness on code, department, level, and semester
CourseSchema.index({ code: 1, department: 1, level: 1, semester: 1 }, { unique: true });

export default mongoose.model('Course', CourseSchema);

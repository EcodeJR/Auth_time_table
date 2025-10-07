// 📌 models/Timetable.js
import mongoose from 'mongoose';

const Timetable = new mongoose.Schema({
  department: String,
  level: String,
  semester: { 
    type: String, 
    required: true,
    enum: ['first', 'second'],
    lowercase: true
  },
  courses: [{
    courseCode: String,
    courseName: String,
    venue: String,
    day: String,
    time: String,
    instructor: String,
    classSize: Number
  }],
  status: { 
    type: String, 
    enum: ['draft', 'shared', 'published'], 
    default: 'draft' 
  },
  sharedWith: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }], // Course Reps who can access this timetable
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create compound index for department, level, and semester uniqueness
Timetable.index({ department: 1, level: 1, semester: 1 }, { unique: true });

export default mongoose.model('Timetable', Timetable);
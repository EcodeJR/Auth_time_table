// 📌 models/Course.js
import mongoose from 'mongoose';

const Course = new mongoose.Schema({
  name: String,
  code: { type: String, unique: true },
  department: String,
  level: String
});
export default mongoose.model('Course', Course);
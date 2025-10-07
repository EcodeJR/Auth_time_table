// 📌 models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['hod', 'course_rep', 'student']},
  department: String,
  level: String,
  verified: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who created this user
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('User', UserSchema);
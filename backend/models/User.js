// 📌 models/User.js
import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
  department: String,
  level: String,
  verified: { type: Boolean, default: false }
});
export const User = mongoose.model('User', UserSchema);
// 📌 models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['superadmin', 'admin', 'user']},
  department: String,
  level: String,
  verified: { type: Boolean, default: false }
});
export default mongoose.model('User', UserSchema);
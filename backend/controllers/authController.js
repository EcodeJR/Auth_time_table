// 📌 controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
export const registerAdmin = async (req, res) => {
  const { name, email, password, department, level } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const existingAdmins = await User.find({ department, level, role: 'admin' });
    if (existingAdmins.length >= 2) {
      return res.status(400).json({ message: 'Only 2 admins allowed per level' });
    }
    const user = new User({ name, email, password: hashedPassword, department, level });
    await user.save();
    res.status(201).json({ message: 'User registered, pending verification' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  if (!user.verified) {
    return res.status(403).json({ message: 'Admin not verified yet' });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user });
};
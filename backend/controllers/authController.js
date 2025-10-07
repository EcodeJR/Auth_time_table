// 📌 controllers/authController.js
import { normalizeDepartment } from '../utils/departmentUtils.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';


export const registerUser = async (req, res) => {
  const { name, email, password, department, level, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    // For students, no verification needed
    // For course_reps, they need verification
    const verified = role === 'student' ? true : false;
    
    // Normalize department to lower-case
    const dept = department.trim().toLowerCase();
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      department: dept, 
      level, 
      role: role.toLowerCase(),
      verified 
    });
    await user.save();
    
    res.status(201).json({ 
      message: role === 'student' ? 'Student registered successfully' : 'User registered, pending verification',
      department: user.department,
      level: user.level,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  
  // Check verification for course_reps
  if (user.role === "course_rep" && !user.verified) {
    return res.status(403).json({ message: 'Course Representative not verified yet' });
  }
  
  const token = jwt.sign({ 
    id: user._id, 
    role: user.role, 
    name: user.name, 
    department: user.department 
  }, process.env.JWT_SECRET, { expiresIn: '1d' });

  res.json({
    user,
    token,
    role: user.role,
    department: user.department,
    level: user.level,
    name: user.name
  });
};

export const createFirstHOD = async (req, res) => {
  const { name, email, password, department } = req.body;
  
  try {
    // Check if any HOD already exists
    const existingHOD = await User.findOne({ role: 'hod' });
    if (existingHOD) {
      return res.status(400).json({ message: 'HOD account already exists. Use admin panel to create additional HODs.' });
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Normalize department to lower-case
    const dept = department.trim().toLowerCase();
    
    const hod = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      department: dept, 
      role: 'hod',
      verified: true // HOD accounts are automatically verified
    });
    
    await hod.save();
    
    res.status(201).json({ 
      message: 'First HOD account created successfully',
      user: { 
        id: hod._id, 
        name: hod.name, 
        email: hod.email, 
        role: hod.role,
        department: hod.department
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getdepartments = async (req, res) => {
  try {
    // Use an aggregation pipeline to normalize and group departments
    const departmentsAgg = await User.aggregate([
      { 
        $match: { 
          department: { $exists: true, $ne: null } 
        } 
      },
      {
        $project: {
          department: { $trim: { input: { $toLower: "$department" } } }
        }
      },
      {
        $group: {
          _id: "$department"
        }
      },
      {
        $project: {
          _id: 0,
          department: "$_id"
        }
      }
    ]);

    // Map to get an array of department names
    const departments = departmentsAgg.map(item => item.department);
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, department, level } = req.body;
    const userId = req.user.id;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already taken by another user' });
      }
    }

    // Update user profile
    const updateData = {
      name: name || req.user.name,
      email: email ? email.toLowerCase() : req.user.email,
      department: department ? department.toLowerCase() : req.user.department,
      updatedAt: new Date()
    };
    
    // Only update level if provided (for students and course reps)
    if (level !== undefined) {
      updateData.level = level;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: error.message });
  }
};

// Change user password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete user account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete user account
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: error.message });
  }
};


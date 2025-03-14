// 📌 controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';


export const registerAdmin = async (req, res) => {
  const { name, email, password, department, level, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const existingAdmins = await User.find({ department, level, role: role.toLowerCase() });
    if (existingAdmins.length >= 2) {
      return res.status(400).json({ message: 'Only 2 admins allowed per level' });
    }
    // Normalize department to lower-case
    const dept = department.trim().toLowerCase();
    const user = new User({ name, email, password: hashedPassword, department: dept, level, role });
    await user.save();
    res.status(201).json({ 
      message: 'User registered, pending verification',
      department: user.department,
      level: user.level
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    // console.log(error)
  }
};

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });  // Changed from UserSchema.findOne to User.findOne
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  if (user.role === "admin" && !user.verified) {
    return res.status(403).json({ message: 'Admin not verified yet' });
  }
  
  const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1d' });

  res.json({
    user,
    token,
    role: user.role,
    department: user.department,  // Send department
    level: user.level,             // Send level
    username: user.name // // Send name
  });
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


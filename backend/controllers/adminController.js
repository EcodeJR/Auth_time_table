import { User } from '../models/User.js';

export const getUnverifiedAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin', verified: false });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const admin = await User.findById(id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    admin.verified = true;
    await admin.save();
    res.json({ message: "Admin verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 index.js (Main Server Setup)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import venueRoutes from './routes/venues.js';
import timetableRoutes from './routes/timetable.js';
import adminRoutes from './routes/admin.js';
import connectDB from './config/db.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ Parse URL-encoded data

// Connect to Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
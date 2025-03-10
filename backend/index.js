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
// app.use(cors());
// Using CORS middleware to allow requests from specific origins
const allowedOrigins = [
    'http://localhost:5173',
    'https://auth-time.vercel.app',
    'https://vercel.com/ecodejrs-projects/auth-time/CAm7c7ZDC2heYPfQcpyx2YWfvRxb'
  ];
  // app.use((req, res, next) => {
  //   res.header('Access-Control-Allow-Origin', allowedOrigins); // Allow all origins
  //   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  //   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  //   next();
  // });
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin, like mobile apps or Postman
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`Blocked by CORS: ${origin}`); // Log blocked origins
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));
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
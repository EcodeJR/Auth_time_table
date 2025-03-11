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

// Define allowed origins (make sure they exactly match your deployed frontends)
const allowedOrigins = [
  'http://localhost:5173',
  'https://auth-time.vercel.app',
  'https://vercel.com/ecodejrs-projects/auth-time/CAm7c7ZDC2heYPfQcpyx2YWfvRxb'
];

app.use(cors({
  origin: (origin, callback) => {
    // console.log("Request Origin:", origin);
    // Allow requests with no origin (e.g. mobile apps, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browser support
}));

// Global OPTIONS handler for preflight requests
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  // Set the Access-Control-Allow-Origin header to the request origin if it's allowed
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.sendStatus(200);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/admin', adminRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// At the end of your backend/index.js file, add:

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// For Vercel serverless deployment
export default app;
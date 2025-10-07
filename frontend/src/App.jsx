// 📌 App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import HODDashboard from './pages/HODDashboard';
import CourseRepDashboard from './pages/CourseRepDashboard';
import AccountManagement from './pages/AccountManagement';
import StudentFeedback from './pages/StudentFeedback';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/hod-dashboard' element={<PrivateRoute><HODDashboard /></PrivateRoute>} />
          <Route path='/course-rep-dashboard' element={<PrivateRoute><CourseRepDashboard /></PrivateRoute>} />
          <Route path='/account-management' element={<PrivateRoute><AccountManagement /></PrivateRoute>} />
          <Route path='/student-feedback' element={<PrivateRoute><StudentFeedback /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

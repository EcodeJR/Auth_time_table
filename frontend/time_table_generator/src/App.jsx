// 📌 App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SuperAdmin from './pages/SuperAdmin';
import AdminPanel from './pages/AdminPanel';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/dashboard' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path='/superadmin' element={<PrivateRoute><SuperAdmin /></PrivateRoute>} />
        <Route path='/adminpanel' element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

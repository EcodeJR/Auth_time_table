// 📌 components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav>
      <Link to='/dashboard'>Dashboard</Link>
      <Link to='/superadmin'>Super Admin</Link>
      <Link to='/adminpanel'>Admin Panel</Link>
      <Link to='/'>Login</Link>
      <Link to='/register'>Sign up</Link>
    </nav>
  );
};

export default Navbar;
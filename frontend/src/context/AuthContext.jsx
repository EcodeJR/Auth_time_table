import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize with data from localStorage if available
  const [user, setUser] = useState({
    token: localStorage.getItem("token") || null,
    name: localStorage.getItem("name") || "",
    role: localStorage.getItem("role") || "",
    department: localStorage.getItem("department") || "",
    level: localStorage.getItem("level") || "",
  });

  const login = (userData) => {
    setUser(userData);
    // Update localStorage too if needed
    localStorage.setItem("token", userData.token);
    localStorage.setItem("name", userData.name);
    localStorage.setItem("role", userData.role);
    localStorage.setItem("department", userData.department);
    localStorage.setItem("level", userData.level);
  };

  const logout = () => {
    setUser({
      token: null,
      name: "",
      role: "",
      department: "",
      level: "",
    });
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

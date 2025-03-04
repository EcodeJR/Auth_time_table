// 📌 src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);
      navigate("/");
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">Register</h2>
        <input className="border p-2 w-full mb-3" type="text" name="name" placeholder="Name" onChange={handleChange} />
        <input className="border p-2 w-full mb-3" type="email" name="email" placeholder="Email" onChange={handleChange} />
        <input className="border p-2 w-full mb-3" type="password" name="password" placeholder="Password" onChange={handleChange} />
        <button className="bg-blue-500 text-white p-2 w-full" type="submit">Register</button>
      </form>
    </div>
  );
}
export default Register;
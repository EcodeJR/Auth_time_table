// 📌 src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    department: "", 
    level: "" 
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(""); // Clear previous errors
    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);
      navigate("/");
    } catch (error) {
      console.error("Registration failed", error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">Register</h2>
        <input 
          className="border p-2 w-full mb-3" 
          type="text" 
          name="name" 
          placeholder="Name" 
          onChange={handleChange} 
          required 
        />
        <input 
          className="border p-2 w-full mb-3" 
          type="email" 
          name="email" 
          placeholder="Email" 
          onChange={handleChange} 
          required 
        />
        <input 
          className="border p-2 w-full mb-3" 
          type="password" 
          name="password" 
          placeholder="Password" 
          onChange={handleChange} 
          required 
        />
        <input 
          className="border p-2 w-full mb-3" 
          type="text" 
          name="department" 
          placeholder="Department" 
          onChange={handleChange} 
          required 
        />
        <input 
          className="border p-2 w-full mb-3" 
          type="text" 
          name="level" 
          placeholder="Level" 
          onChange={handleChange} 
          required 
        />
        <button
          className="bg-blue-500 text-white p-2 w-full rounded"
          type="submit"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
        {errorMessage && (
          <p className="mt-4 text-red-500 text-center">{errorMessage}</p>
        )}
      </form>
    </div>
  );
}

export default Register;

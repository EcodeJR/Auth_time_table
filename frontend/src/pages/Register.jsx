// 📌 src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { apiConfig, createApiRequest } from "../config/api";

function Register() {
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    department: "", 
    level: "",
    role: "student"
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
    setErrorMessage("");
    try {
      // Determine role based on selection
      const registrationData = { 
        ...formData, 
        role: formData.role === 'course_rep' ? 'course_rep' : 'student'
      };
      
      await axios(createApiRequest(apiConfig.endpoints.auth.register, {
        method: 'POST',
        data: registrationData
      }));
      
      if (formData.role === 'course_rep') {
        alert("Course Representative registration submitted successfully! Please wait for HOD approval before you can access the system.");
      } else {
        alert("Student registration successful! You can now log in to view timetables.");
      }
      
      navigate("/login");
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex justify-center items-center py-12 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-primary-100">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-accent-800 mb-2">Join EduSchedule</h1>
          <p className="text-accent-600">Create your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-accent-700 mb-2">Account Type</label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-accent-300 rounded-lg cursor-pointer hover:bg-primary-50 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={formData.role === 'student'}
                  onChange={handleChange}
                  className="mr-3 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <div className="font-medium text-accent-800">Student</div>
                  <div className="text-sm text-accent-600">View timetables and course schedules</div>
                </div>
              </label>
              
              <label className="flex items-center p-3 border border-accent-300 rounded-lg cursor-pointer hover:bg-primary-50 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="course_rep"
                  checked={formData.role === 'course_rep'}
                  onChange={handleChange}
                  className="mr-3 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <div className="font-medium text-accent-800">Course Representative</div>
                  <div className="text-sm text-accent-600">Review and publish timetables (requires HOD approval)</div>
                </div>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-accent-700 mb-2">Full Name</label>
            <input 
              className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors" 
              type="text" 
              name="name" 
              placeholder="Enter your full name" 
              value={formData.name}
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-accent-700 mb-2">Email Address</label>
            <input 
              className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors" 
              type="email" 
              name="email" 
              placeholder="Enter your email" 
              value={formData.email}
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-accent-700 mb-2">Password</label>
            <input 
              className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors" 
              type="password" 
              name="password" 
              placeholder="Create a password" 
              value={formData.password}
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-accent-700 mb-2">Department</label>
            <select
              className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="">Select your department</option>
              <option value="computer science">Computer Science</option>
              <option value="mathematics">Mathematics</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="biology">Biology</option>
              <option value="electrical engineering">Electrical Engineering</option>
              <option value="mechanical engineering">Mechanical Engineering</option>
              <option value="civil engineering">Civil Engineering</option>
              <option value="chemical engineering">Chemical Engineering</option>
              <option value="petroleum engineering">Petroleum Engineering</option>
              <option value="agricultural engineering">Agricultural Engineering</option>
              <option value="biomedical engineering">Biomedical Engineering</option>
              <option value="computer engineering">Computer Engineering</option>
              <option value="software engineering">Software Engineering</option>
              <option value="information technology">Information Technology</option>
              <option value="cybersecurity">Cybersecurity</option>
              <option value="data science">Data Science</option>
              <option value="artificial intelligence">Artificial Intelligence</option>
              <option value="business administration">Business Administration</option>
              <option value="accounting">Accounting</option>
              <option value="economics">Economics</option>
              <option value="finance">Finance</option>
              <option value="marketing">Marketing</option>
              <option value="human resources">Human Resources</option>
              <option value="psychology">Psychology</option>
              <option value="sociology">Sociology</option>
              <option value="political science">Political Science</option>
              <option value="international relations">International Relations</option>
              <option value="law">Law</option>
              <option value="medicine">Medicine</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="nursing">Nursing</option>
              <option value="dentistry">Dentistry</option>
              <option value="veterinary medicine">Veterinary Medicine</option>
              <option value="architecture">Architecture</option>
              <option value="urban planning">Urban Planning</option>
              <option value="fine arts">Fine Arts</option>
              <option value="graphic design">Graphic Design</option>
              <option value="music">Music</option>
              <option value="theater">Theater</option>
              <option value="journalism">Journalism</option>
              <option value="mass communication">Mass Communication</option>
              <option value="education">Education</option>
              <option value="linguistics">Linguistics</option>
              <option value="literature">Literature</option>
              <option value="history">History</option>
              <option value="philosophy">Philosophy</option>
              <option value="geography">Geography</option>
              <option value="environmental science">Environmental Science</option>
              <option value="geology">Geology</option>
              <option value="astronomy">Astronomy</option>
              <option value="statistics">Statistics</option>
              <option value="actuarial science">Actuarial Science</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-accent-700 mb-2">Level</label>
            <select
              className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              name="level"
              value={formData.level}
              onChange={handleChange}
              required
            >
              <option value="">Select your level</option>
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
              <option value="400">400 Level</option>
              <option value="500">500 Level</option>
            </select>
          </div>

          {formData.role === 'course_rep' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-sm text-yellow-800 font-medium">Course Representative Registration</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your registration will be submitted for HOD approval. You will receive access to the system only after approval.
                  </p>
                </div>
              </div>
            </div>
          )}

          {formData.role === 'student' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Student Account:</strong> You will have immediate access to view timetables and course schedules.
              </p>
            </div>
          )}

          <button
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        
        {errorMessage && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-center">{errorMessage}</p>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <p className="text-accent-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;

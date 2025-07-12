import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminPanel() {
  const navigate = useNavigate();
  const [course, setCourse] = useState("");
  const [department, setDepartment] = useState("");
  const [code, setCode] = useState("");
  const [level, setLevel] = useState("");
  const [venueName, setVenueName] = useState(""); // ✅ Venue state
  const [venueCapacity, setVenueCapacity] = useState(""); // ✅ Venue capacity state
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (userRole !== "superadmin" && userRole !== "admin") {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const requestData = { name: course, code, department, level };
    console.log("Sending request data:", requestData); // Debugging
  
    try {
      const response = await axios.post("https://time-table-backend.vercel.app/api/courses/add", requestData);
      console.log("Response from server:", response.data);
      alert("Course added successfully! Timetable will be generated automatically.");
  
      setCourse("");
      setCode("");
      setDepartment("");
      setLevel("");
    } catch (error) {
      console.error("Error adding course:", error.response?.data || error.message);
      alert("Error adding course. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleVenueSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("https://time-table-backend.vercel.app/api/venues/add", {
        name: venueName,
        department,
        capacity: venueCapacity,
      });
      alert("Venue added successfully!");
      setVenueName("");
      setVenueCapacity("");
    } catch (error) {
      console.error("Error adding venue", error);
      alert("Error adding venue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-[#22223b] to-[#2b2c31] py-10 px-2">
      <div className="w-full max-w-2xl bg-[#23242a] rounded-2xl shadow-2xl p-8 mx-auto relative">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#23242a]/80 z-20 rounded-2xl">
            <span className="relative flex h-16 w-16">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fff37b] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-16 w-16 bg-[#fff37b] opacity-90"></span>
            </span>
            <span className="mt-4 text-[#fff37b] text-lg font-semibold">Processing...</span>
          </div>
        )}

        <h1 className="text-3xl font-extrabold mb-8 text-center tracking-tight text-[#fff37b] drop-shadow-lg">Admin Panel</h1>

        {/* Venue Form */}
        <div className="mb-10 bg-[#292a33] rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-6 text-[#fff37b]">Add Lecture Venue</h2>
          <form className="space-y-5" onSubmit={handleVenueSubmit}>
            <div>
              <input
                type="text"
                placeholder="Venue Name"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#393a3f] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fff37b] transition-all"
                required
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="number"
                placeholder="Capacity"
                value={venueCapacity}
                onChange={(e) => setVenueCapacity(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#393a3f] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fff37b] transition-all"
                required
              />
              <input
                type="text"
                placeholder="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#393a3f] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fff37b] transition-all"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-green-400 to-green-600 text-white font-bold shadow-lg hover:from-green-500 hover:to-green-700 transition-all disabled:opacity-60"
              disabled={loading}
            >
              Add Venue
            </button>
          </form>
        </div>

        {/* Course Form */}
        <div className="bg-[#292a33] rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-6 text-[#fff37b]">Add Course</h2>
          <form className="space-y-5" onSubmit={handleCourseSubmit}>
            <input
              type="text"
              placeholder="Course Name"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#393a3f] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fff37b] transition-all"
              required
            />
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Course Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#393a3f] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fff37b] transition-all"
                required
              />
              <input
                type="text"
                placeholder="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#393a3f] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fff37b] transition-all"
                required
              />
              <input
                type="text"
                placeholder="Level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#393a3f] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fff37b] transition-all"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold shadow-lg hover:from-blue-500 hover:to-blue-700 transition-all disabled:opacity-60"
              disabled={loading}
            >
              Add Course
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;

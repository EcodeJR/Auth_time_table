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
    <div className="p-6 bg-[#2b2c31] text-white">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      {/* ✅ Venue Form */}
      <h2 className="text-xl font-semibold mt-6">Add Lecture Venues</h2>
      <form className="space-y-4" onSubmit={handleVenueSubmit}>
        <input type="text" placeholder="Venue Name" value={venueName} onChange={(e) => setVenueName(e.target.value)} className="p-2 outline-none w-full bg-[#474a4f]" required />
        <input type="number" placeholder="Capacity" value={venueCapacity} onChange={(e) => setVenueCapacity(e.target.value)} className="p-2 outline-none w-full bg-[#474a4f]" required />
        <input type="text" placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} className="p-2 outline-none w-full bg-[#474a4f]" required />
        <button type="submit" className="bg-green-500 outline-none text-white p-2 w-full" disabled={loading}>
          {loading ? "Adding Venue..." : "Add Venue"}
        </button>
      </form>

      {/* ✅ Course Form */}
      <h2 className="text-xl font-semibold mt-4">Add Course</h2>
      <form className="space-y-4" onSubmit={handleCourseSubmit}>
        <input type="text" placeholder="Course Name" value={course} onChange={(e) => setCourse(e.target.value)} className="p-2 outline-none w-full bg-[#474a4f]" required />
        <input type="text" placeholder="Course Code" value={code} onChange={(e) => setCode(e.target.value)} className="p-2 outline-none w-full bg-[#474a4f]" required />
        <input type="text" placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} className="p-2 outline-none w-full bg-[#474a4f]" required />
        <input type="text" placeholder="Level" value={level} onChange={(e) => setLevel(e.target.value)} className="p-2 outline-none w-full bg-[#474a4f]" required />
        <button type="submit" className="bg-blue-500 outline-none text-white p-2 w-full" disabled={loading}>
          {loading ? "Adding Course..." : "Add Course"}
        </button>
      </form>
    </div>
  );
}

export default AdminPanel;

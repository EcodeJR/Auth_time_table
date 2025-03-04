import React, { useState } from "react";
import axios from "axios";

function AdminPanel() {
    const [course, setCourse] = useState("");
    const [department, setDepartment] = useState("");
    const [code, setCode] = useState("");  // ✅ Added for course code
    const [level, setLevel] = useState(""); // ✅ Admin must input level
    

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await axios.post("http://localhost:5000/api/courses/add", { name: course, code, department, level });

      alert("Course added successfully! Timetable will be generated automatically.");
    } catch (error) {
      console.error("Error adding course", error);
      alert("Error adding course. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
  <input type="text" placeholder="Course Name" value={course} onChange={(e) => setCourse(e.target.value)} className="border p-2 w-full" />
  <input type="text" placeholder="Course Code" value={code} onChange={(e) => setCode(e.target.value)} className="border p-2 w-full" />
  <input type="text" placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} className="border p-2 w-full" />
  <input type="text" placeholder="Level" value={level} onChange={(e) => setLevel(e.target.value)} className="border p-2 w-full" />
  <button type="submit" className="bg-blue-500 text-white p-2 w-full">Add Course</button>
</form>

    </div>
  );
}

export default AdminPanel;

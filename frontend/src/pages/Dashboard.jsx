// 📌 src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [timetable, setTimetable] = useState([]);
  const [department, setDepartment] = useState(""); // Start empty
  const [loading, setLoading] = useState(false); // Loading state
  const [departments, setDepartments] = useState([]); // Start empty

  // We'll define these days to map columns
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  useEffect(() => {
    // Clear previous timetable data when department changes
    setTimetable([]);
    
    // Only fetch if a department has been selected
    if (!department) return;

    const fetchTimetable = async () => {
      setLoading(true); // Set loading to true before fetching data
      try {
        const response = await axios.get(`https://time-table-backend.vercel.app/api/timetable/getall/${department}`);
        setTimetable(response.data || []);
      } catch (error) {
        console.error("Error fetching timetable", error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };
    fetchTimetable();
  }, [department]);

  useEffect(() => {
    const getDepartments = async () => {
      try {
        const response = await axios.get("https://time-table-backend.vercel.app/api/auth/dept");
        setDepartments(response.data || []);
      } catch (error) {
        console.error("Error fetching departments", error);
      }
    };
    getDepartments();
  }, []);

  // Group the timetable data by level → { level: { Monday: [], Tuesday: [], ... }, ... }
  const groupedData = {};

  timetable.forEach((entry) => {
    const { level, courses } = entry;
    if (!groupedData[level]) {
      // Initialize structure for each day
      groupedData[level] = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: []
      };
    }

    // Distribute courses by day
    courses.forEach((course) => {
      if (course.day && groupedData[level][course.day]) {
        groupedData[level][course.day].push(course);
      }
    });
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Timetable Dashboard</h1>

      {/* Department Selector */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Department:</label>
        <select
          className="border p-1"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">-- Select Department --</option>
          {/* 
          <option value="Computer Science">Computer Science</option>
          <option value="Software Engineering">Software Engineering</option>
          <option value="Information Technology">Information Technology</option> */}
          {departments.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
          {/* Add more departments as needed */}
        </select>
      </div>

      {/* If department is empty, prompt user to select one */}
      {!department && (
        <p className="text-gray-600">Please select a department to view its timetable.</p>
      )}

      {/* Loading animation */}
      {loading && (
        <div className="text-center flex items-center justify-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-dashed border-black rounded-full" role="status"></div>
          <span className="visually-hidden mx-2">Loading...</span>
        </div>
      )}

      {/* If a department is selected but no data returned, show message */}
      {department && !loading && timetable.length === 0 && (
        <p className="text-gray-600">No timetable data for {department}</p>
      )}

      {/* Responsive Table Container */}
      {department && !loading && timetable.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">Level</th>
                {days.map((day) => (
                  <th key={day} className="border p-2 text-center">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(groupedData).length === 0 && (
                <tr>
                  <td className="p-4 text-center" colSpan={days.length + 1}>
                    No timetable data
                  </td>
                </tr>
              )}
              {Object.keys(groupedData).map((level) => (
                <tr key={level}>
                  {/* LEVEL Cell */}
                  <td className="border p-2 font-bold text-center">{level}</td>
                  {/* DAY Cells */}
                  {days.map((day) => {
                    const courses = groupedData[level][day];
                    return (
                      <td key={day} className="border p-2 align-top">
                        {courses.length === 0 ? (
                          <span className="text-gray-400">No Course</span>
                        ) : (
                          // Display each course's details
                          courses.map((courseItem, index) => (
                            <div key={index} className="mb-2 p-2 bg-blue-50 rounded">
                              <p className="font-semibold">
                                {courseItem.courseName} ({courseItem.courseCode})
                              </p>
                              <p>{courseItem.venue}</p>
                              <p className="text-sm">{courseItem.time}</p>
                            </div>
                          ))
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

// 📌 src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";


// Helper function to capitalize each word in a string
const capitalizeWords = (str) =>
  str.replace(/\b\w/g, (char) => char.toUpperCase());
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
        // Convert department to lowercase before using in the API call
        const departmentLowerCase = department.toLowerCase();
        const response = await axios.get(`https://time-table-backend.vercel.app/api/timetable/getall/${departmentLowerCase}`);
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
        // Assuming response.data is an array of department names in lowercase
        const capitalized = response.data.map((dept) => capitalizeWords(dept));
        setDepartments(capitalized || []);
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
    <div className="min-h-screen w-full flex justify-center items-start bg-gradient-to-br from-[#22223b] to-[#2b2c31] py-8 px-2">
      <div className="w-full max-w-6xl bg-[#23242a] rounded-2xl shadow-2xl p-8 mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-center tracking-tight text-[#fff37b] drop-shadow-lg">Timetable Dashboard</h1>

        {/* Department Selector */}
        <div className="mb-8 flex flex-col md:flex-row items-center gap-4 md:gap-8 bg-[#292a33] rounded-xl shadow p-6">
          <label className="font-semibold text-lg text-[#fff37b]">Department:</label>
          <select
            className="border-none rounded-lg px-4 py-2 text-base text-[#23242a] bg-[#fff37b] focus:outline-none focus:ring-2 focus:ring-[#fff37b] shadow-md transition-all duration-150"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">-- Select Department --</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* If department is empty, prompt user to select one */}
        {!department && (
          <p className="text-gray-300 text-center text-lg font-medium mb-8">Please select a department to view its timetable.</p>
        )}

        {/* Loading animation */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="relative flex h-16 w-16">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fff37b] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-16 w-16 bg-[#fff37b] opacity-90"></span>
            </span>
            <span className="mt-4 text-[#fff37b] text-lg font-semibold">Loading...</span>
          </div>
        )}

        {/* If a department is selected but no data returned, show message */}
        {department && !loading && timetable.length === 0 && (
          <p className="text-gray-400 text-center text-lg font-medium mb-8">No timetable data for <span className="font-bold">{department}</span></p>
        )}

        {/* Responsive Table Container */}
        {department && !loading && timetable.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 rounded-xl shadow-xl bg-[#23242a] text-base">
              <thead>
                <tr className="bg-[#fff37b] text-[#23242a] rounded-t-xl">
                  <th className="p-4 font-bold text-lg rounded-tl-xl">Level</th>
                  {days.map((day, i) => (
                    <th
                      key={day}
                      className={`p-4 font-bold text-lg text-center ${i === days.length - 1 ? 'rounded-tr-xl' : ''}`}
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.keys(groupedData).length === 0 && (
                  <tr>
                    <td className="p-8 text-center text-gray-400" colSpan={days.length + 1}>
                      No timetable data
                    </td>
                  </tr>
                )}
                {Object.keys(groupedData).map((level, rowIdx) => (
                  <tr
                    key={level}
                    className={rowIdx % 2 === 0 ? 'bg-[#282a36]' : 'bg-[#23242a]'}
                  >
                    {/* LEVEL Cell */}
                    <td className="p-4 font-bold text-center text-[#fff37b] text-lg border-b border-[#393a3f] align-top">
                      {level}
                    </td>
                    {/* DAY Cells */}
                    {days.map((day) => {
                      const courses = groupedData[level][day];
                      return (
                        <td key={day} className="p-4 border-b border-[#393a3f] align-top min-w-[180px]">
                          {courses.length === 0 ? (
                            <span className="text-gray-500 italic">No Course</span>
                          ) : (
                            courses.map((courseItem, index) => (
                              <div
                                key={index}
                                className="mb-4 last:mb-0 p-4 rounded-xl bg-gradient-to-tr from-[#393a3f] to-[#474a4f] shadow-inner hover:shadow-lg transition-shadow duration-200"
                              >
                                <p className="font-bold text-[#fff37b] text-base mb-1">
                                  {courseItem.courseName} <span className="font-normal text-xs text-[#fff37b]/80">({courseItem.courseCode})</span>
                                </p>
                                <p className="text-[#f2f2f2] text-sm mb-1">{courseItem.venue}</p>
                                <p className="text-xs text-[#fff37b]/80">{courseItem.time}</p>
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
    </div>
  );
}

export default Dashboard;

// 📌 src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [timetable, setTimetable] = useState(null);
  const [department, setDepartment] = useState("Computer Science"); // Example department

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/timetable/${department}`);
        setTimetable(response.data);
        console.log(response.data); // For debugging purposes only
      } catch (error) {
        console.error("Error fetching timetable", error);
      }
    };
    fetchTimetable();
  }, [department]);
  

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {timetable ? (
        <pre>{JSON.stringify(timetable, null, 2)}</pre>
      ) : (
        <p>Loading timetable...</p>
      )}
    </div>
  );
}
export default Dashboard;
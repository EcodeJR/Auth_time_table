// 📌 src/pages/SuperAdmin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function SuperAdmin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null); // Track which user is being verified

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (userRole !== "superadmin") {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleManageUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await axios.get("https://time-table-backend.vercel.app/api/admin/unverified");
      if (!response.data.length) {
        alert("No unverified users found");
      }
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleVerify = async (id) => {
    setVerifyingId(id);
    try {
      await axios.post(`http://localhost:5000/api/admin/verify/${id}`);
      setUsers(users.filter((user) => user._id !== id)); // Remove verified user from list
    } catch (error) {
      console.error("Verification failed", error);
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Super Admin Panel</h1>
      <button
        onClick={handleManageUsers}
        className="bg-red-500 text-white p-2 mt-4 rounded"
        disabled={loadingUsers}
      >
        {loadingUsers ? "Loading Unverified Admins..." : "Load Unverified Admins"}
      </button>
      <ul className="mt-4">
        {users.map((user) => (
          <li key={user._id} className="border p-2 mt-2 flex justify-between items-center">
            <span>
              {user.email} - {user.role}
            </span>
            <button
              onClick={() => handleVerify(user._id)}
              className="bg-green-500 text-white p-1 rounded"
              disabled={verifyingId === user._id}
            >
              {verifyingId === user._id ? "Verifying..." : "Verify"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SuperAdmin;

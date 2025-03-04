import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function SuperAdmin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (userRole !== "superadmin") {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleManageUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/unverified");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const handleVerify = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/verify/${id}`);
      setUsers(users.filter((user) => user._id !== id)); // Remove verified user from list
    } catch (error) {
      console.error("Verification failed", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Super Admin Panel</h1>
      <button onClick={handleManageUsers} className="bg-red-500 text-white p-2 mt-4">
        Load Unverified Admins
      </button>
      <ul className="mt-4">
        {users.map((user) => (
          <li key={user._id} className="border p-2 mt-2 flex justify-between">
            {user.email} - {user.role}
            <button onClick={() => handleVerify(user._id)} className="bg-green-500 text-white p-1">
              Verify
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default SuperAdmin;

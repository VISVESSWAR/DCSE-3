import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Spinner from "../../ui/Spinner";
import { UserData } from "../../context/UserContext";
import { backendUrl } from "../../utils/urls";
import { useNavigate } from "react-router-dom";

export default function FacultyList() {
  const navigate = useNavigate();
  const { user } = UserData();
  const [facultyList, setFacultyList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${backendUrl}/api/faculty`, {
          headers: {
            "x-user-email": user.email,
          },
        });
        setFacultyList(response.data);
      } catch (error) {
        console.error("Error fetching faculty:", error);
        toast.error("Failed to fetch faculty list");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaculty();
  }, [user.email]);

  const filteredFaculty = facultyList.filter((faculty) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      faculty.name?.toLowerCase().includes(searchLower) ||
      faculty.contactInfo?.email?.toLowerCase().includes(searchLower) ||
      faculty.department?.toLowerCase().includes(searchLower) ||
      faculty.position?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) return <Spinner />;

  return (
    <div className="p-4 text-base w-full min-h-screen bg-[#f5f7fa]">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Faculty Management</h2>
          <button
            onClick={() => navigate("/signup")}
            className="bg-[#145DA0] text-white px-4 py-2 rounded hover:bg-[#2E8BC0]"
          >
            Add New Faculty
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, email, department, or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border rounded"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-blue-100">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Position</th>
                <th className="py-3 px-4 text-left">Department</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculty.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No faculty found
                  </td>
                </tr>
              ) : (
                filteredFaculty.map((faculty) => (
                  <tr
                    key={faculty._id}
                    className="border-t border-gray-200 hover:bg-blue-50"
                  >
                    <td className="py-3 px-4">{faculty.name || "-"}</td>
                    <td className="py-3 px-4">
                      {faculty.contactInfo?.email || "-"}
                    </td>
                    <td className="py-3 px-4">{faculty.position || "-"}</td>
                    <td className="py-3 px-4">{faculty.department || "-"}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          faculty.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {faculty.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() =>
                          navigate(`/admin/faculty/update/${faculty._id}`)
                        }
                        className="bg-[#145DA0] text-white px-4 py-1 rounded hover:bg-[#2E8BC0] text-sm"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


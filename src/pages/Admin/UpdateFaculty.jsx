import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Spinner from "../../ui/Spinner";
import { UserData } from "../../context/UserContext";
import { backendUrl } from "../../utils/urls";
import { useParams, useNavigate } from "react-router-dom";

export default function UpdateFaculty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = UserData();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
    dob: "",
    dateOfJoining: "",
    phone: "",
    gender: "",
    qualifications: "",
    scaleOfPay: "",
    presentPay: "",
    natureOfAppointment: "",
    isActive: true,
  });

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${backendUrl}/api/faculty/${id}`, {
          headers: {
            "x-user-email": user.email,
          },
        });
        const faculty = response.data;
        setFormData({
          name: faculty.name || "",
          email: faculty.contactInfo?.email || "",
          position: faculty.position || "",
          department: faculty.department || "",
          dob: faculty.dob ? new Date(faculty.dob).toISOString().split("T")[0] : "",
          dateOfJoining: faculty.dateOfJoining
            ? new Date(faculty.dateOfJoining).toISOString().split("T")[0]
            : "",
          phone: faculty.contactInfo?.phone || "",
          gender: faculty.gender || "",
          qualifications: faculty.areasOfExpertise?.join(", ") || "",
          scaleOfPay: faculty.scaleOfPay || "",
          presentPay: faculty.presentPay || "",
          natureOfAppointment: faculty.natureOfAppointment || "",
          isActive: faculty.isActive !== undefined ? faculty.isActive : true,
        });
      } catch (error) {
        console.error("Error fetching faculty:", error);
        toast.error("Failed to fetch faculty details");
        navigate("/admin/faculty");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchFaculty();
    }
  }, [id, user.email, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updateData = {
        name: formData.name,
        position: formData.position,
        department: formData.department,
        dob: formData.dob ? new Date(formData.dob) : undefined,
        dateOfJoining: formData.dateOfJoining
          ? new Date(formData.dateOfJoining)
          : undefined,
        contactInfo: {
          email: formData.email,
          phone: formData.phone,
        },
        gender: formData.gender,
        areasOfExpertise: formData.qualifications
          ? formData.qualifications.split(",").map((q) => q.trim())
          : [],
        scaleOfPay: formData.scaleOfPay,
        presentPay: formData.presentPay,
        natureOfAppointment: formData.natureOfAppointment,
        isActive: formData.isActive,
      };

      await axios.put(`${backendUrl}/api/faculty/${id}`, updateData, {
        headers: {
          "x-user-email": user.email,
        },
      });

      toast.success("Faculty details updated successfully");
      navigate("/admin/faculty");
    } catch (error) {
      console.error("Error updating faculty:", error);
      toast.error(
        error.response?.data?.message || "Failed to update faculty details"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="p-4 text-base w-full min-h-screen bg-[#f5f7fa]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Update Faculty Details</h2>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Position</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Date of Joining</label>
              <input
                type="date"
                name="dateOfJoining"
                value={formData.dateOfJoining}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Qualifications</label>
              <input
                type="text"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                placeholder="Comma-separated"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Scale of Pay</label>
              <input
                type="text"
                name="scaleOfPay"
                value={formData.scaleOfPay}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Present Pay</label>
              <input
                type="text"
                name="presentPay"
                value={formData.presentPay}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Nature of Appointment</label>
              <select
                name="natureOfAppointment"
                value={formData.natureOfAppointment}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Select</option>
                <option value="Temporary">Temporary</option>
                <option value="Probationer">Probationer</option>
                <option value="Approved Probationer">Approved Probationer</option>
                <option value="Permanent">Permanent</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="font-medium">Active</label>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#145DA0] text-white px-6 py-2 rounded hover:bg-[#2E8BC0] disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Update Faculty"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/faculty")}
              className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


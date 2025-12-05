import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Spinner from "../../ui/Spinner";
import { UserData } from "../../context/UserContext";
import { backendUrl } from "../../utils/urls";

const CATEGORIES = [
  { value: "position", label: "Position" },
  { value: "department", label: "Department" },
  { value: "gender", label: "Gender" },
  { value: "natureOfAppointment", label: "Nature of Appointment" },
  { value: "eventType", label: "Event Type" },
  { value: "program", label: "Program" },
];

export default function ManageDropdowns() {
  const { user } = UserData();
  const [selectedCategory, setSelectedCategory] = useState("position");
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [bulkValues, setBulkValues] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    fetchOptions();
  }, [selectedCategory]);

  const fetchOptions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${backendUrl}/api/dropdowns/category/${selectedCategory}`,
        {
          headers: {
            "x-user-email": user.email,
          },
        }
      );
      setOptions(response.data);
    } catch (error) {
      console.error("Error fetching options:", error);
      toast.error("Failed to fetch dropdown options");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOption = async (e) => {
    e.preventDefault();
    if (!newValue.trim()) {
      toast.error("Please enter a value");
      return;
    }

    try {
      setIsSaving(true);
      await axios.post(
        `${backendUrl}/api/dropdowns`,
        {
          category: selectedCategory,
          value: newValue.trim(),
        },
        {
          headers: {
            "x-user-email": user.email,
          },
        }
      );
      toast.success("Option added successfully");
      setNewValue("");
      fetchOptions();
    } catch (error) {
      console.error("Error adding option:", error);
      toast.error(
        error.response?.data?.message || "Failed to add option"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkAdd = async (e) => {
    e.preventDefault();
    if (!bulkValues.trim()) {
      toast.error("Please enter values");
      return;
    }

    const values = bulkValues
      .split("\n")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    if (values.length === 0) {
      toast.error("Please enter at least one value");
      return;
    }

    try {
      setIsSaving(true);
      await axios.post(
        `${backendUrl}/api/dropdowns/bulk`,
        {
          category: selectedCategory,
          values,
        },
        {
          headers: {
            "x-user-email": user.email,
          },
        }
      );
      toast.success(`${values.length} options added successfully`);
      setBulkValues("");
      fetchOptions();
    } catch (error) {
      console.error("Error bulk adding options:", error);
      toast.error(
        error.response?.data?.message || "Failed to add options"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await axios.put(
        `${backendUrl}/api/dropdowns/${id}`,
        {
          isActive: !currentStatus,
        },
        {
          headers: {
            "x-user-email": user.email,
          },
        }
      );
      toast.success("Option updated successfully");
      fetchOptions();
    } catch (error) {
      console.error("Error updating option:", error);
      toast.error("Failed to update option");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this option?")) {
      return;
    }

    try {
      await axios.delete(`${backendUrl}/api/dropdowns/${id}`, {
        headers: {
          "x-user-email": user.email,
        },
      });
      toast.success("Option deleted successfully");
      fetchOptions();
    } catch (error) {
      console.error("Error deleting option:", error);
      toast.error("Failed to delete option");
    }
  };

  const handleStartEdit = (option) => {
    setEditingId(option._id);
    setEditValue(option.value);
  };

  const handleSaveEdit = async (id) => {
    if (!editValue.trim()) {
      toast.error("Value cannot be empty");
      return;
    }

    try {
      await axios.put(
        `${backendUrl}/api/dropdowns/${id}`,
        {
          value: editValue.trim(),
        },
        {
          headers: {
            "x-user-email": user.email,
          },
        }
      );
      toast.success("Option updated successfully");
      setEditingId(null);
      setEditValue("");
      fetchOptions();
    } catch (error) {
      console.error("Error updating option:", error);
      toast.error(
        error.response?.data?.message || "Failed to update option"
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="p-4 text-base w-full min-h-screen bg-[#f5f7fa]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Manage Dropdown Options</h2>

        <div className="mb-6">
          <label className="block font-medium mb-2">Select Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            Add Single Option - {CATEGORIES.find((c) => c.value === selectedCategory)?.label}
          </h3>
          <form onSubmit={handleAddOption} className="flex gap-2">
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Enter option value"
              className="flex-1 px-3 py-2 border rounded"
              disabled={isSaving}
            />
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#145DA0] text-white px-6 py-2 rounded hover:bg-[#2E8BC0] disabled:opacity-50"
            >
              {isSaving ? "Adding..." : "Add"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Bulk Add Options</h3>
          <p className="text-sm text-gray-600 mb-2">
            Enter one option per line
          </p>
          <form onSubmit={handleBulkAdd}>
            <textarea
              value={bulkValues}
              onChange={(e) => setBulkValues(e.target.value)}
              placeholder="Option 1&#10;Option 2&#10;Option 3"
              className="w-full px-3 py-2 border rounded mb-2"
              rows={5}
              disabled={isSaving}
            />
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#145DA0] text-white px-6 py-2 rounded hover:bg-[#2E8BC0] disabled:opacity-50"
            >
              {isSaving ? "Adding..." : "Bulk Add"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">
            Current Options - {CATEGORIES.find((c) => c.value === selectedCategory)?.label}
          </h3>
          {options.length === 0 ? (
            <p className="text-gray-500">No options found for this category</p>
          ) : (
            <table className="w-full">
              <thead className="bg-blue-100">
                <tr>
                  <th className="py-3 px-4 text-left">Value</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {options.map((option) => (
                  <tr
                    key={option._id}
                    className="border-t border-gray-200 hover:bg-blue-50"
                  >
                    <td className="py-3 px-4">
                      {editingId === option._id ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(option._id);
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          autoFocus
                        />
                      ) : (
                        option.value
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          option.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {option.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 justify-center">
                        {editingId === option._id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(option._id)}
                              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(option)}
                              className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleToggleActive(option._id, option.isActive)
                              }
                              className={`px-3 py-1 rounded text-sm ${
                                option.isActive
                                  ? "bg-orange-500 hover:bg-orange-600"
                                  : "bg-green-500 hover:bg-green-600"
                              } text-white`}
                            >
                              {option.isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              onClick={() => handleDelete(option._id)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}


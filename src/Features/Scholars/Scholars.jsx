import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Spinner from "../../ui/Spinner";
import Modal from "../../ui/Modal";
import AddScholar from "./AddScholar";
import { UserData } from "../../context/UserContext";

function Scholars() {
  const { user } = UserData();

  const isFaculty = user.role === "faculty";
  const [scholarsList, setScholarsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'
  const [columnVisibility, setColumnVisibility] = useState({
    name: true,
    registrationNumber: true,
    email: true,
    phone: true,
    areaOfResearch: true,
    supervisor: true,
    actions: true,
  });
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  useEffect(() => {
    const fetchScholars = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/pgscholars",
          {
            headers: {
              "x-user-email": user.email,
            },
          }
        );
        console.log(response.data);
        setScholarsList(response.data);
      } catch (error) {
        console.error("Error fetching scholars:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScholars();
  }, []);

  const updateScholarInList = (id, updatedScholar) => {
    setScholarsList((prev) =>
      prev.map((scholar) => (scholar._id === id ? updatedScholar : scholar))
    );
  };

  const deleteScholar = async (id) => {
    try {
      setIsLoading(true);
      await axios.delete(`http://localhost:5000/api/pgscholars/${id}`, {
        headers: {
          "x-user-email": user.email,
        },
      });
      setScholarsList((prev) => prev.filter((scholar) => scholar._id !== id));
      toast.success("Scholar details deleted successfully");
    } catch (error) {
      console.error("Error deleting scholar:", error);
      toast.error("Failed to delete the selected Scholar details");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredScholars = scholarsList.filter((scholar) => {
    const searchValue = searchTerm.toLowerCase();
    switch (filterType) {
      case "name":
        return scholar.name.toLowerCase().includes(searchValue);
      case "registrationNumber":
        return scholar.registrationNumber.toLowerCase().includes(searchValue);
      case "areaOfResearch":
        return scholar.areaOfResearch.toLowerCase().includes(searchValue);
      case "supervisor":
        return scholar.supervisor?.name.toLowerCase().includes(searchValue);
      default:
        return true;
    }
  }).sort((a, b) => {
    let valA, valB;
    switch (sortType) {
      case "name":
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
        break;
      case "registrationNumber":
        valA = a.registrationNumber.toLowerCase();
        valB = b.registrationNumber.toLowerCase();
        break;
      case "areaOfResearch":
        valA = a.areaOfResearch.toLowerCase();
        valB = b.areaOfResearch.toLowerCase();
        break;
      case "supervisor":
        valA = a.supervisor?.name.toLowerCase() || '';
        valB = b.supervisor?.name.toLowerCase() || '';
        break;
      default:
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
    }

    if (valA < valB) {
      return sortOrder === "asc" ? -1 : 1;
    }
    if (valA > valB) {
      return sortOrder === "asc" ? 1 : -1;
    }
    return 0;
  });

  const handleClearFilters = () => {
    setFilterType("name");
    setSearchTerm("");
    setSortType("name");
    setSortOrder("asc");
  };

  const exportToCSV = () => {
    const headers = ["Name", "Registration Number", "Email", "Phone", "Area of Research"];
    if (!isFaculty) {
      headers.push("Supervisor");
    }

    const rows = filteredScholars.map(scholar => {
      const row = [
        scholar.name,
        scholar.registrationNumber,
        scholar.contactInfo?.email,
        scholar.contactInfo?.phone,
        scholar.areaOfResearch
      ];
      if (!isFaculty) {
        row.push(scholar.supervisor?.name || '');
      }
      return row.map(field => `"${field}"`).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'scholars.csv';
    link.click();
    toast.success("Scholars data exported successfully!");
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="p-5 text-lg flex w-full min-h-screen flex-col ">
      <h2 className="font-bold text-3xl text-center mt-10 mb-8">
        Scholars List
      </h2>

      {/* Filter Section */}
      <div className="flex flex-wrap gap-4 mb-6 px-4 relative justify-start ">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="name">Filter by Name</option>
          <option value="registrationNumber">
            Filter by Registration Number
          </option>
          <option value="areaOfResearch">Filter by Area of Research</option>
          {!isFaculty && <option value="supervisor">Filter by Supervisor</option>}
        </select>
        <input
          type="text"
          placeholder={`Search by ${
            filterType === "name"
              ? "name"
              : filterType === "registrationNumber"
              ? "registration number"
              : filterType === "areaOfResearch"
              ? "area of research"
              : "supervisor"
          }...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="name">Sort by Name</option>
          <option value="registrationNumber">Sort by Registration Number</option>
          <option value="areaOfResearch">Sort by Area of Research</option>
          {!isFaculty && <option value="supervisor">Sort by Supervisor</option>}
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        <button
          onClick={handleClearFilters}
          className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Clear Filters
        </button>

        <button
          onClick={exportToCSV}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700"
        >
          Export Data (CSV)
        </button>

        <div className="relative">
          <button
            onClick={() => setShowColumnDropdown(!showColumnDropdown)}
            className="bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Columns
          </button>
          {showColumnDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
              {Object.keys(columnVisibility).map((columnKey) => (
                <label
                  key={columnKey}
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  <input
                    type="checkbox"
                    checked={columnVisibility[columnKey]}
                    onChange={() =>
                      setColumnVisibility((prev) => ({
                        ...prev,
                        [columnKey]: !prev[columnKey],
                      }))
                    }
                    className="mr-2"
                  />
                  {columnKey.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[70vh] flex justify-center">
        <table className="min-w-[800px] bg-white rounded-xl shadow-lg border border-gray-300">
          <thead>
            <tr className="bg-blue-100 text-black sticky top-0 z-10">
              {columnVisibility.name && <th className="py-3 px-4 text-center">Name</th>}
              {columnVisibility.registrationNumber && <th className="py-3 px-4 text-center">Registration Number</th>}
              {columnVisibility.email && <th className="py-3 px-4 text-center">Email</th>}
              {columnVisibility.phone && <th className="py-3 px-4 text-center">Phone</th>}
              {columnVisibility.areaOfResearch && <th className="py-3 px-4 text-center">Area of Research</th>}
              {!isFaculty && columnVisibility.supervisor && (
                <th className="py-3 px-4 text-center">Supervisor</th>
              )}
              {columnVisibility.actions && isFaculty && <th className="py-3 px-4 text-center">Actions</th>}
              {columnVisibility.actions && !isFaculty && <th className="py-3 px-4 text-center">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredScholars.length === 0 ? (
              <tr>
                <td colSpan={Object.values(columnVisibility).filter(Boolean).length} className="text-center py-8 text-gray-500">
                  No scholars found matching your search criteria.
                </td>
              </tr>
            ) : (
              filteredScholars.map((scholar) => (
                <tr
                  key={scholar._id}
                  className="border-t border-gray-200 hover:bg-blue-50 transition"
                >
                  {columnVisibility.name && <td className="py-2 px-4 text-center">{scholar.name}</td>}
                  {columnVisibility.registrationNumber && <td className="py-2 px-4 text-center">
                    {scholar.registrationNumber}
                  </td>}
                  {columnVisibility.email && <td className="py-2 px-4 text-center">
                    {scholar.contactInfo?.email}
                  </td>}
                  {columnVisibility.phone && <td className="py-2 px-4 text-center">
                    {scholar.contactInfo?.phone}
                  </td>}
                  {columnVisibility.areaOfResearch && <td className="py-2 px-4 text-center">
                    {scholar.areaOfResearch}
                  </td>}
                  {!isFaculty && columnVisibility.supervisor && (
                    <td className="py-2 px-4 text-center">
                      {scholar?.supervisor?.name}
                    </td>
                  )}
                  {columnVisibility.actions && (
                    <td className="py-2 px-4 flex gap-2 text-center">
                      {isFaculty && (
                        <>
                          <Modal>
                            <Modal.Body opens="form">
                              <button className="bg-yellow-300 hover:bg-yellow-400 text-black rounded-full px-3 py-1 text-sm font-semibold">
                                Update
                              </button>
                            </Modal.Body>
                            <Modal.Window name="form">
                              <AddScholar
                                formData={scholar}
                                onUpdate={updateScholarInList}
                              />
                            </Modal.Window>
                          </Modal>

                          <button
                            onClick={() => deleteScholar(scholar._id)}
                            className="bg-red-400 hover:bg-red-500 text-white rounded-full px-3 py-1 text-sm font-semibold"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {!isFaculty && (
                        <span className="text-gray-500">No actions</span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Scholars;

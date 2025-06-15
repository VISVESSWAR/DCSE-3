import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Spinner from "../../ui/Spinner";
import Modal from "../../ui/Modal";
import AddScholar from "./AddScholar";
import { UserData } from "../../context/UserContext";

function Scholars() {
  const { user } = UserData();

  const isAdmin = user.position === "Admin";
  const [scholarsList, setScholarsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchScholars = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/pgscholars",
          {
          headers: {
            'x-user-email': user.email,
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
      await axios.delete(`http://localhost:5000/api/pgscholars/${id}`);
      setScholarsList((prev) => prev.filter((scholar) => scholar._id !== id));
      toast.success("Scholar details deleted successfully");
    } catch (error) {
      console.error("Error deleting scholar:", error);
      toast.error("Failed to delete the selected Scholar details");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="p-5 text-lg flex w-full min-h-screen flex-col ">
      <h2 className="font-bold text-3xl text-center mt-10 mb-8">
        Scholars List
      </h2>
      <div className="overflow-x-auto flex justify-center">
        <table className="min-w-[800px] bg-white rounded-xl shadow-lg border border-gray-300">
          <thead>
            <tr className="bg-blue-100 text-black">
              <th className="py-3 px-4 text-center">Name</th>
              <th className="py-3 px-4 text-center">Registration Number</th>
              <th className="py-3 px-4 text-center">Email</th>
              <th className="py-3 px-4 text-center">Phone</th>
              <th className="py-3 px-4 text-center">Area of Research</th>
              {isAdmin && <th className="py-3 px-4 text-center">Supervisor</th>}
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {scholarsList.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No scholars available.
                </td>
              </tr>
            ) : (
              scholarsList.map((scholar) => (
                <tr
                  key={scholar._id}
                  className="border-t border-gray-200 hover:bg-blue-50 transition"
                >
                  <td className="py-2 px-4 text-center">{scholar.name}</td>
                  <td className="py-2 px-4 text-center">
                    {scholar.registrationNumber}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {scholar.contactInfo?.email}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {scholar.contactInfo?.phone}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {scholar.areaOfResearch}
                  </td>
                  {isAdmin && (
                    <td className="py-2 px-4 text-center">
                      {scholar.supervisor.name}
                    </td>
                  )}
                  <td className="py-2 px-4 flex gap-2 text-center">
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
                    {isAdmin && (
                      <button
                        onClick={() => deleteScholar(scholar._id)}
                        className="bg-red-400 hover:bg-red-500 text-white rounded-full px-3 py-1 text-sm font-semibold"
                      >
                        Delete
                      </button>
                    )}
                  </td>
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

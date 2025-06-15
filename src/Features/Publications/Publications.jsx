import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Spinner from "../../ui/Spinner";
import Modal from "../../ui/Modal";
import AddPublication from "./AddPublication";
import { UserData } from "../../context/UserContext";

function Publications() {
  const { user } = UserData();
  const isAdmin = user.position === "Admin";
  const [publicationsList, setPublicationsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/publications",
          {
            headers: {
              "x-user-email": user.email,
            },
          }
        );
        setPublicationsList(response.data);
      } catch (error) {
        console.error("Error fetching publications:", error);
        toast.error("Failed to fetch publications");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublications();
  }, [user.email]);

  const updatePublicationInList = (id, updatedPublication) => {
    setPublicationsList((prev) =>
      prev.map((publication) =>
        publication._id === id ? updatedPublication : publication
      )
    );
  };

  const deletePublication = async (id) => {
    try {
      setIsLoading(true);
      await axios.delete(`http://localhost:5000/api/publications/${id}`, {
        headers: {
          "x-user-email": user.email,
        },
      });
      setPublicationsList((prev) =>
        prev.filter((publication) => publication._id !== id)
      );
      toast.success("Publication deleted successfully");
    } catch (error) {
      console.error("Error deleting publication:", error);
      toast.error("Failed to delete the selected publication");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="p-5 text-lg flex w-full min-h-screen flex-col">
      <h2 className="font-bold text-3xl text-center mt-10 mb-8">
        Publications List
      </h2>
      <div className="overflow-x-auto flex justify-center">
        <table className="min-w-[800px] bg-white rounded-xl shadow-lg border border-gray-300">
          <thead>
            <tr className="bg-blue-100 text-black">
              <th className="py-3 px-4 text-center">Title</th>
              <th className="py-3 px-4 text-center">Author</th>
              <th className="py-3 px-4 text-center">Date of Publication</th>
              <th className="py-3 px-4 text-center">Journal/Publisher</th>
              <th className="py-3 px-4 text-center">DOI</th>
              {isAdmin && <th className="py-3 px-4 text-center">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {publicationsList.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No publications available.
                </td>
              </tr>
            ) : (
              publicationsList.map((publication) => (
                <tr
                  key={publication._id}
                  className="border-t border-gray-200 hover:bg-blue-50 transition"
                >
                  <td className="py-2 px-4 text-center">{publication.title}</td>
                  <td className="py-2 px-4 text-center">
                    {publication.authors?.join(", ") || "-"}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {new Date(publication.publicationDate).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {publication.journal || "-"}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {publication.doi || "-"}
                  </td>
                  {isAdmin && (
                    <td className="py-2 px-4 flex gap-2 justify-center">
                      <Modal>
                        <Modal.Body opens="form">
                          <button className="bg-yellow-300 hover:bg-yellow-400 text-black rounded-full px-3 py-1 text-sm font-semibold">
                            Update
                          </button>
                        </Modal.Body>
                        <Modal.Window name="form">
                          <AddPublication
                            formData={publication}
                            onUpdate={updatePublicationInList}
                          />
                        </Modal.Window>
                      </Modal>
                      <button
                        onClick={() => deletePublication(publication._id)}
                        className="bg-red-400 hover:bg-red-500 text-white rounded-full px-3 py-1 text-sm font-semibold"
                      >
                        Delete
                      </button>
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

export default Publications;

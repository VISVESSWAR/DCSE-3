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
  const [filterType, setFilterType] = useState("title");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/publications",
          {
            headers: {
              'x-user-email': user.email,
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
      prev.map((publication) => (publication._id === id ? updatedPublication : publication))
    );
  };

  const deletePublication = async (id) => {
    try {
      setIsLoading(true);
      await axios.delete(`http://localhost:5000/api/publications/${id}`, {
        headers: {
          'x-user-email': user.email,
        },
      });
      setPublicationsList((prev) => prev.filter((publication) => publication._id !== id));
      toast.success("Publication deleted successfully");
    } catch (error) {
      console.error("Error deleting publication:", error);
      toast.error("Failed to delete the selected publication");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPublications = publicationsList.filter((publication) => {
    const searchValue = searchTerm.toLowerCase();
    switch (filterType) {
      case "title":
        return publication.title.toLowerCase().includes(searchValue);
      case "author":
        return publication.authors?.some(author => 
          author.toLowerCase().includes(searchValue)
        ) || false;
      case "journal":
        return (publication.journal || '').toLowerCase().includes(searchValue);
      default:
        return true;
    }
  });

  if (isLoading) return <Spinner />;

  return (
    <div className="p-5 text-lg flex w-full min-h-screen flex-col bg-[#edf4fb]">
      <h2 className="font-bold text-3xl text-center mt-10 mb-8">
        Publications List
      </h2>

      {/* Filter Section */}
      <div className="flex justify-center gap-4 mb-6">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="title">Filter by Title</option>
          <option value="author">Filter by Author</option>
          <option value="journal">Filter by Journal/Publisher</option>
        </select>
        <input
          type="text"
          placeholder={`Search by ${filterType === "title" ? "title" : filterType === "author" ? "author" : "journal/publisher"}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

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
            {filteredPublications.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No publications found matching your search criteria.
                </td>
              </tr>
            ) : (
              filteredPublications.map((publication) => (
                <tr
                  key={publication._id}
                  className="border-t border-gray-200 hover:bg-blue-50 transition"
                >
                  <td className="py-2 px-4 text-center">{publication.title}</td>
                  <td className="py-2 px-4 text-center">{publication.authors?.join(', ') || '-'}</td>
                  <td className="py-2 px-4 text-center">
                    {new Date(publication.publicationDate).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 text-center">{publication.journal || '-'}</td>
                  <td className="py-2 px-4 text-center">{publication.doi || '-'}</td>
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
                            onFetchPublications={fetchPublications}
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

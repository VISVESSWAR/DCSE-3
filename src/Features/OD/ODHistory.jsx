import axios from "axios";
import { useEffect, useState } from "react";
import { UserData } from "../../context/UserContext";
import toast from "react-hot-toast";
import RequestDetails from "./RequestDetails";
import Modal from "../../ui/Modal";

export default function RequestList() {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filterType, setFilterType] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");

  const { user } = UserData();

  useEffect(() => {
    async function fetchReqs() {
      let api =
        user.role !== "faculty"
          ? "http://localhost:5000/api/odrequests"
          : `http://localhost:5000/api/odrequests/user/${user.userId}`;
      try {
        const res = await axios.get(api, {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-user-email": user.email,
          },
        });
        setRequests(res.data);
      } catch {
        toast.error("Failed to load requests");
      }
    }
    fetchReqs();
  }, [user]);

  const filteredRequests = requests.filter((request) => {
    const searchValue = searchTerm.toLowerCase();
    switch (filterType) {
      case "name":
        return request.name.toLowerCase().includes(searchValue);
      case "status":
        return request.status.toLowerCase().includes(searchValue);
      default:
        return true;
    }
  });

  if(requests && requests.length===0)
    return <p className="mx-auto text-center text-2xl font-bold ">No record found</p>
  return (
    <div className="p-10 max-w-4xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">OD Requests</h1>

      {/* Filter Section */}
      <div className="flex justify-center gap-4 mb-6">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="name">Filter by Name</option>
          <option value="status">Filter by Status</option>
        </select>
        <input
          type="text"
          placeholder={`Search by ${filterType === "name" ? "name" : "status"}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <table className="w-full table-auto bg-white shadow rounded">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredRequests.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-8 text-gray-500">
                No requests found matching your search criteria.
              </td>
            </tr>
          ) : (
            filteredRequests.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="p-2 text-center">{r.name}</td>
                <td className="p-2 text-center">{r.status}</td>
                <td className="p-2 text-center">
                  <Modal>
                    <Modal.Body close={() => setSelected(null)} opens={"form"}>
                      <button
                        onClick={() => setSelected(r)}
                        className="bg-[#145DA0] text-white px-3 py-1 rounded hover:bg-[#2E8BC0]"
                      >
                        View
                      </button>
                    </Modal.Body>
                    <Modal.Window name="form">
                      <RequestDetails
                        data={r}
                        isHod={user.role === "hod"}
                        onSuccess={(updatedReq) => {
                          setRequests((reqs) =>
                            reqs.map((r) =>
                              r._id === updatedReq._id ? updatedReq : r
                            )
                          );
                          setSelected(updatedReq);
                        }}
                        close={() => setSelected(null)}
                      />
                    </Modal.Window>
                  </Modal>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

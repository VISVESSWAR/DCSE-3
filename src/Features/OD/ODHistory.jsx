import axios from "axios";
import { useEffect, useState } from "react";
import { UserData } from "../../context/UserContext";
import toast from "react-hot-toast";
import RequestDetails from "./RequestDetails";
import Modal from "../../ui/Modal";

export default function RequestList() {
  const [requests, setRequests] = useState([
    {
      _id: "req1",
      name: "Dr. Aisha Rao",
      status: "Pending",
      requestType: "Conference",
      startDate: "2025-07-01",
      endDate: "2025-07-05",
      eventType: "National",
      areaOfResearch: "Artificial Intelligence",
      reason: "Attending national AI conference",
      supportingDocuments: [],
      userId: "fac123",
    },
    {
      _id: "req2",
      name: "Dr. Ramesh Kumar",
      status: "Approved",
      requestType: "Workshop",
      startDate: "2025-06-15",
      endDate: "2025-06-16",
      eventType: "International",
      areaOfResearch: "Cybersecurity",
      reason: "Invited to present workshop",
      supportingDocuments: ["doc1.pdf", "doc2.jpg"],
      userId: "fac456",
    },
  ]);

  const { user } = UserData();
  // const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);

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
  useEffect(() => {
    const testRequests = [
      {
        _id: "req1",
        name: "Dr. Aisha Rao",
        status: "Pending",
        requestType: "Conference",
        startDate: "2025-07-01",
        endDate: "2025-07-05",
        eventType: "National",
        areaOfResearch: "Artificial Intelligence",
        reason: "Attending national AI conference",
        supportingDocuments: [],
        userId: "fac123",
      },
      {
        _id: "req2",
        name: "Dr. Ramesh Kumar",
        status: "Approved",
        requestType: "Workshop",
        startDate: "2025-06-15",
        endDate: "2025-06-16",
        eventType: "International",
        areaOfResearch: "Cybersecurity",
        reason: "Invited to present workshop",
        supportingDocuments: ["doc1.pdf", "doc2.jpg"],
        userId: "fac456",
      },
    ];

    // Simulate role-based filtering
    const filtered =
      user.role === "faculty"
        ? testRequests.filter((r) => r.userId === user._id)
        : testRequests;

    setRequests(filtered);
  }, [user]);
  if (requests && requests.length === 0)
    return (
      <p className="mx-auto text-center text-2xl font-bold ">No record found</p>
    );
  return (
    <div className="p-10 max-w-4xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">OD Requests</h1>
      <table className="w-full table-auto bg-white shadow rounded">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r._id} className="border-t">
              <td className="p-2 text-center">{r.name}</td>
              <td className="p-2 text-center">{r.status}</td>
              <td className="p-2 text-center">
                <Modal>
                  <Modal.Body close={() => setSelected(null)} opens={"view"}>
                    <button
                      onClick={() => setSelected(r)}
                      className="bg-[#145DA0] text-white px-3 py-1 rounded hover:bg-[#2E8BC0]"
                    >
                      View
                    </button>
                  </Modal.Body>
                  <Modal.Window name="view">
                    <RequestDetails
                      data={r}
                      // isHod={true}
                      isHod={user.role === "hod"}
                      onSuccess={(updatedReq) => {
                        setRequests((reqs) =>
                          reqs.map((r) =>
                            r._id === updatedReq._id ? updatedReq : r
                          )
                        );
                        setSelected(updatedReq);
                      }}
                      edit={false}
                      close={() => setSelected(null)}
                    />
                  </Modal.Window>

                  {user.role === "faculty" && r.status === "Pending" && (
                    <>
                      <Modal.Body
                        close={() => setSelected(null)}
                        opens={"edit"}
                      >
                        <button
                          onClick={() => setSelected(r)}
                          className="bg-[#145DA0] text-white px-3 py-1 rounded hover:bg-[#2E8BC0] mx-2"
                        >
                          Edit
                        </button>
                      </Modal.Body>
                      <Modal.Window name="edit">
                        <RequestDetails
                          data={r}
                          // isHod={true}
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
                          edit={true}
                        />
                      </Modal.Window>
                    </>
                  )}
                </Modal>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

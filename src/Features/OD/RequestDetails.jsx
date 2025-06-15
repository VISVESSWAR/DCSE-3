import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  TbId,
  TbUser,
  TbCheck,
  TbCalendarTime,
  TbCalendarEvent,
  TbBulb,
  TbFlag,
  TbMessage,
  TbFile,
  TbUpload,
  TbUserCheck,
  TbUserX,
  TbX,
} from "react-icons/tb";
import { UserData } from "../../context/UserContext";

export default function RequestDetails({ data, isHod, onSuccess, close }) {
  const { register, handleSubmit } = useForm();
  const {user}=UserData();

  const submitDocs = async (formData) => {
    try {
      const fd = new FormData();
      for (let file of formData.documents) fd.append("documents", file);
      const res = await axios.put(`/api/odrequests/${data._id}/addDocs`, fd);
      toast.success("Documents uploaded");
      onSuccess(res.data);
    } catch {
      toast.error("Upload failed");
    }
  };

  const approve = async (status) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/odrequests/${data._id}/${status}`,
         {},
        {

          headers: {
            "Content-Type": "multipart/form-data",
            "x-user-email": user.email,
          },
        }
      );
      toast.success(`${status} successful`);
      onSuccess(res.data);
    } catch {
      toast.error("Operation failed");
    }
  };

  return (
    <div className="bg-[#fbfbfb] rounded text-lg max-w-xl mx-auto p-4  flex flex-col h-[100vh] my-auto justify-center items-center-safe ">
      <h2 className="text-xl text-center flex items-center gap-2 justify-center mb-2 font-bold capitalize">
        <TbUser className="text-[#145DA0] " />
        {data.name}'s Request
      </h2>
      <div className="flex flex-col space-y-3 text-black overflow-y-auto max-h-[80vh] px-2 justify-center items-center  ">
        {/* {data._id && (
          <div className="w-full bg-[#fbfbfb] px-4 py-2 rounded flex gap-2 items-center">
            <TbId /> <strong>Request ID:</strong> {data._id}
          </div>
        )}
        {data.userId && (
          <div className="w-full bg-[#fbfbfb] px-4 py-2 rounded flex gap-2 items-center">
            <TbUser /> <strong>User ID:</strong> {data.userId}
          </div>
        )} */}
        {data.requestType && (
          <div className="w-full bg-[#fbfbfb] px-4 py-2 rounded flex gap-2 items-center">
            <TbFlag /> <strong>Request Type:</strong> {data.requestType}
          </div>
        )}
        {data.eventType && (
          <div className="w-full bg-[#fbfbfb] px-4 py-2 rounded flex gap-2 items-center">
            <TbCalendarEvent /> <strong>Event Type:</strong> {data.eventType}
          </div>
        )}
        {data.areaOfResearch && (
          <div className="w-full bg-[#fbfbfb] px-4 py-2 rounded flex gap-2 items-center">
            <TbBulb /> <strong>Area of Research:</strong> {data.areaOfResearch}
          </div>
        )}
        {data.reason && (
          <div className="w-full bg-[#fbfbfb] px-4 py-2 rounded flex gap-2 items-center">
            <TbMessage /> <strong>Reason:</strong> {data.reason}
          </div>
        )}
        {data.startDate && (
          <div className="w-full bg-[#fbfbfb] px-4 py-2 rounded flex gap-2 items-center">
            <TbCalendarTime /> <strong>Start Date:</strong>{" "}
            {new Date(data.startDate).toLocaleDateString()}
          </div>
        )}
        {data.endDate && (
          <div className="w-full bg-[#fbfbfb] px-4 py-2 rounded flex gap-2 items-center">
            <TbCalendarTime /> <strong>End Date:</strong>{" "}
            {new Date(data.endDate).toLocaleDateString()}
          </div>
        )}
        {data.startTime && (
          <div className="w-full bg-[#fbfbfb] px-4 py-2 rounded flex gap-2 items-center">
            <TbCalendarTime /> <strong>Start Date:</strong>{" "}
            {new Date(data.startDate).toLocaleTimeString()}
          </div>
        )}
        {data.endTime && (
          <div className="w-full bg-[#fbfbfb] px-4 py-2 rounded flex gap-2 items-center">
            <TbCalendarTime /> <strong>End Date:</strong>{" "}
            {new Date(data.endDate).toLocaleTimeString()}
          </div>
        )}

        {data.status && (
          <div className="w-full bg-[#fbfbfb] px-4 py-2 rounded flex gap-2 items-center">
            <TbCheck /> <strong>Status:</strong> {data.status}
          </div>
        )}

        {data.supportingDocuments?.length > 0 && (
          <div className="w-full bg-[#fbfbfb] px-4 py-2 rounded">
            <div className="flex items-center gap-2">
              <TbFile />
              <strong>Supporting Documents:</strong>
            </div>
            <ul className="list-disc ml-6 mt-2 text-blue-700 underline">
              {data.supportingDocuments.map((f, idx) => (
                <li key={idx}>
                  <a
                    href={`http://localhost:5000/uploads/${f}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Document {idx + 1}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!isHod &&
          (!data.supportingDocuments ||
            data.supportingDocuments.length === 0) && (
            <form
              onSubmit={handleSubmit(submitDocs)}
              className="w-full flex flex-col space-y-2"
            >
              <input
                type="file"
                {...register("documents")}
                multiple
                className="w-full text-sm"
              />
              <button className="bg-[#145DA0] text-white px-4 py-2 rounded flex items-center justify-center gap-2">
                <TbUpload />
                Upload Docs
              </button>
            </form>
          )}

        {isHod && data.status === "Pending" && (
          <div className="w-full flex flex-col sm:flex-row gap-4 justify-center mt-4">
            <button
              onClick={() => approve("approve")}
              className="bg-[#145DA0] text-white px-4 py-2 rounded flex items-center justify-center gap-2"
            >
              <TbUserCheck /> Approve
            </button>
            <button
              onClick={() => approve("reject")}
              className="bg-red-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
            >
              <TbUserX /> Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

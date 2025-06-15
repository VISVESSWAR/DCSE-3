import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { UserData } from "../../context/UserContext";

export default function ODRequestForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const {user}=UserData();
  const [type, setType] = useState("Conduct");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [numDays, setNumDays] = useState(0);

  function updateDays(start, end) {
    if (start && end) {
      const startObj = new Date(start);
      const endObj = new Date(end);
      const diffTime = endObj - startObj;

      if (diffTime < 0) {
        toast.error("End date cannot be before start date.");
        setNumDays(0);
        return;
      }

      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setNumDays(diffDays);
    }
  }

  const onSubmit = async (data) => {
    // Handle custom event type
    if (data.eventType === "Others" && data.otherEventType) {
      data.eventType = data.otherEventType;
    }
    delete data.otherEventType;

    // Validate dates
    if (new Date(data.endDate) < new Date(data.startDate)) {
      toast.error("End date cannot be earlier than start date");
      return;
    }

    // Prepare FormData
    const formData = new FormData();
    formData.append("requestType", data.requestType);
    formData.append("name", user.name);
    formData.append("eventType", data.eventType);
    formData.append("startDate", data.startDate);
    formData.append("endDate", data.endDate);
    formData.append("numberOfDays", Number(numDays));
    formData.append("startTime", data.startTime);
    formData.append("endTime", data.endTime);
    formData.append("topic", data.topic);
    formData.append("location", data.location);
    formData.append("forwardToDean", data.forwardToDean);

    if (data.procurements !== undefined) {
      formData.append("procurements", data.procurements);
    }

    // Number of days (calculated separately and stored in state)
    formData.append("days", numDays.toString());

    // Append files
    if (data.documents && data.documents.length > 0) {
      for (const file of data.documents) {
        formData.append("documents", file);
      }
    }
// ,
//         {
//           headers: {
//             "x-user-email": user.email,
//           },
//         }
    // Debug: log entries manually
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    // Make the request
    try {
      const res = await axios.post(
        "http://localhost:5000/api/odrequests",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-user-email": user.email,
          },
        }
      );

      toast.success("Request submitted successfully");
      console.log("Saved ODRequest:", res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Submission failed");
      console.error("Submission error:", err);
    }
  };

  const [isOther, setIsOther] = useState(false);

  const requestType = watch("requestType", "Conduct");

  return (
    <div className="min-h-screen bg-[#fbfbfb] text-black p-4 flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-3xl space-y-6 bg-white p-8 rounded-xl shadow-xl"
      >
        <h2 className="text-2xl font-semibold text-center">OD Request Form</h2>

        <div className="space-y-1">
          <label className="block">Type of Request</label>
          <select
            {...register("requestType", { required: true })}
            className="w-full p-2 rounded bg-gray-100"
            onChange={(e) => setType(e.target.value)}
          >
            <option value="Conduct">Conduct</option>
            <option value="Participate">Participate</option>
          </select>
          {errors.requestType && <div className="h-0.5 bg-red-500"></div>}
        </div>

        <div className="space-y-1">
          <label className="block">Type of Event</label>
          <select
            {...register("eventType", { required: true })}
            className="w-full p-2 rounded bg-gray-100"
            onChange={(e) => {
              const selected = e.target.value;
              setIsOther(selected === "Others");
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Select an event type
            </option>
            <option value="Course">Course</option>
            <option value="Workshop">Workshop</option>
            <option value="Seminar">Seminar</option>
            <option value="Conference">Conference</option>
            <option value="Industrial Visit">Industrial Visit</option>
            <option value="Others">Others</option>
          </select>
          {errors.eventType && <div className="h-0.5 bg-red-500"></div>}
        </div>

        {isOther && (
          <div className="space-y-1">
            <label className="block">Specify Event Type</label>
            <input
              {...register("otherEventType", { required: true })}
              className="w-full p-2 rounded bg-gray-100"
              placeholder="Enter event type"
            />
            {errors.otherEventType && <div className="h-0.5 bg-red-500"></div>}
          </div>
        )}

        <div className="space-y-1">
          <label className="block">Start Date</label>
          <input
            type="date"
            {...register("startDate", { required: true })}
            onChange={(e) => {
              setStartDate(e.target.value);
              updateDays(e.target.value, endDate);
            }}
            className="w-full p-3 rounded bg-gray-100 border border-gray-300"
          />
          {errors.startDate && <div className="h-0.5 bg-red-500"></div>}
        </div>

        <div className="space-y-1">
          <label className="block">End Date</label>
          <input
            type="date"
            {...register("endDate", { required: true })}
            onChange={(e) => {
              setEndDate(e.target.value);
              updateDays(startDate, e.target.value);
            }}
            className="w-full p-3 rounded bg-gray-100 border border-gray-300"
          />
          {errors.endDate && <div className="h-0.5 bg-red-500"></div>}
        </div>
        <div className="space-y-1">
          <label className="block">Number of Days</label>
          <input
            type="number"
            value={numDays}
            readOnly
            className="w-full p-3 rounded bg-gray-100 border border-gray-300"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block">Start Time</label>
            <input
              type="time"
              {...register("startTime", { required: true })}
              className="w-full p-2 rounded bg-gray-100"
            />
            {errors.startTime && <div className="h-0.5 bg-red-500"></div>}
          </div>
          <div className="space-y-1">
            <label className="block">End Time</label>
            <input
              type="time"
              {...register("endTime", { required: true })}
              className="w-full p-2 rounded bg-gray-100"
            />
            {errors.endTime && <div className="h-0.5 bg-red-500"></div>}
          </div>
        </div>

        <div className="space-y-1">
          <label className="block">Topic / Event Name</label>
          <input
            {...register("topic", { required: true })}
            className="w-full p-2 rounded bg-gray-100"
          />
          {errors.topic && <div className="h-0.5 bg-red-500"></div>}
        </div>

        <div className="space-y-1">
          <label className="block">Location</label>
          <input
            {...register("location", { required: true })}
            className="w-full p-2 rounded bg-gray-100"
          />
          {errors.location && <div className="h-0.5 bg-red-500"></div>}
        </div>

        {type === "Conduct" && (
          <div className="space-y-1">
            <label className="block">Need Department Procurements?</label>
            <select
              {...register("procurements", { required: true })}
              className="w-full p-2 rounded bg-gray-100"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.procurements && <div className="h-0.5 bg-red-500"></div>}
          </div>
        )}

        <div className="space-y-1">
          <label className="block">Forward Request to Dean?</label>
          <select
            {...register("forwardToDean", { required: true })}
            className="w-full p-2 rounded bg-gray-100"
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          {errors.forwardToDean && <div className="h-0.5 bg-red-500"></div>}
        </div>

        <div className="space-y-1">
          <label className="block">Supporting Document</label>
          <input
            type="file"
            multiple
            {...register("documents", { required: true })}
            className="w-full p-4 rounded bg-gray-100 file:text-white file:bg-[#145DA0] file:px-4 file:py-2 file:rounded"
          />

          {errors.document && <div className="h-0.5 bg-red-500"></div>}
        </div>

        <div className="w-fit mx-auto">
          <button
            type="submit"
            className="bg-[#145DA0] rounded-full p-2 px-4 mt-5 w-fit self-center text-white hover:bg-[#2E8BC0] hover:cursor-pointer font-semibold focus:ring-blue-700 "
          >
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
}

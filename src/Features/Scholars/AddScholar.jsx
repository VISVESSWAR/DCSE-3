import axios from "axios";
import { useForm } from "react-hook-form";
import FormRow from "./FormRow";
import toast from "react-hot-toast";
import { useState } from "react";
import Spinner from "../../ui/Spinner";
const phoneNoPattern = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/;
const researchAreas = [
  "Artificial Intelligence",
  "Data Science",
  "Cybersecurity",
  "Wireless Networks",
  "Computer Vision",
  "Quantum Computing",
];

const supervisors = [
  "Dr. A. Sharma",
  "Dr. B. Rao",
  "Dr. C. Mehta",
  "Dr. D. Roy",
  "Dr. E. Kumar",
];

export default function AddScholar({ formData = {} }) {
  const { _id: editId, ...editData } = formData;
  const isEditing = Boolean(editId);
  const { register, reset, formState, handleSubmit, getValues } = useForm({
    defaultValues: isEditing ? editData : {},
  });
  const { errors } = formState;
  // const [formData, setFormData] = useState({
  //   name: "",
  //   registrationNumber: "",
  //   contactInfo: { email: "", phone: "" },
  //   areaOfResearch: "",
  //   supervisor: "",
  // });
  const [isLoading, setIsLoading] = useState(false);
  const validatePhone = (no) => {
    console.log(no);
    return phoneNoPattern.test(no);
  };

  async function onSubmit(data) {
    const payload = {
      name: data.name,
      registrationNumber: data.registrationNumber,
      contactInfo: {
        email: data.email,
        phone: data.phone,
      },
      areaOfResearch: data.areaOfResearch,
      supervisor: data.supervisor,
    };

    try {
      setIsLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/pgscholars",
        payload
      );
      console.log(res.data);
      toast.success("Scholar details added successfully");
      reset();
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error(
        err.response?.data || err.message || "Failed to add new Scholar details"
      );
    } finally {
      setIsLoading(false);
    }
  }
  const [scholarsList, setScholarsList] = useState([]);
  const [currentScholar, setCurrentScholar] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const submitUpdate = async (event) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      const response = await axios.put(
        `http://localhost:5000/api/pgscholars/${currentScholar._id}`,
        formData
      );

      setScholarsList((prev) =>
        prev.map((scholar) =>
          scholar._id === currentScholar._id ? response.data : scholar
        )
      );

      setIsModalVisible(false);
      setCurrentScholar(null);
    } catch (error) {
      console.error("Error updating scholar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  function onError(error) {
    console.log(error);
  }

  if (isLoading) return <Spinner />;
  return (
    <div className="p-2 text-lg h-screen flex-col bg-[#edf4fb] mx-auto flex justify-center items-start min-h-screen ">
      <h1 className="font-bold text-3xl text-center mt-5 mx-auto">
        Add Scholar
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className="flex flex-col min-w-[60%] max-w-lg mx-auto mt-10 border-2 border-black p-10 rounded-xl  shadow-black shadow-[6px_6px_6px_-2px_rgba(0,0,0,0.3)] bg-gray-50"
      >
        <FormRow label={"name"} error={errors?.name?.message}>
          <input
            name="name"
            value={editData.name}
            className="rounded-full bg-[#fbfbfb] px-3 text-center w-60 mx-4 border-[2px] border-black"
            {...register("name", { required: "This is required field" })}
          ></input>
        </FormRow>

        <FormRow
          label={"registrationNumber"}
          error={errors?.registrationNumber?.message}
        >
          <input
            name="registrationNumber"
            value={editData.registrationNumber}
            className="rounded-full bg-[#fbfbfb] px-3 text-center w-60 mx-4 border-[2px] border-black"
            {...register("registrationNumber", {
              required: "This is required field",
            })}
          ></input>
        </FormRow>

        <FormRow label={"email"} error={errors?.email?.message}>
          <input
            name="email"
            type="email"
            value={editData.email}
            className="rounded-full bg-[#fbfbfb] px-3 text-center w-60 mx-4 border-[2px] border-black"
            {...register("email", { required: "This is required field" })}
          ></input>
        </FormRow>

        <FormRow label={"phone"} error={errors?.phone?.message}>
          <input
            name="phone"
            type="tel"
            value={editData.phone}
            placeholder="Enter 10 digit mobile number"
            className="rounded-full bg-[#fbfbfb] px-3 text-center w-60 mx-4 border-[2px] border-black"
            {...register("phone", {
              required: "This is required field",
              validate: (value) =>
                validatePhone(value) || "Enter a valid phone number",
            })}
          ></input>
        </FormRow>

        <FormRow
          label={"areaOfResearch"}
          error={errors?.areaOfResearch?.message}
        >
          <select
            {...register("areaOfResearch", { required: true })}
            id="areaOfResearch"
            value={editData.areaOfResearch}
            className="rounded-full bg-[#fbfbfb] px-3 text-center w-60 mx-4 border-[2px] border-black"
          >
            <option value="">Select</option>
            {researchAreas.map((area, idx) => (
              <option key={idx} value={area}>
                {area}
              </option>
            ))}
          </select>
        </FormRow>

        <FormRow label={"supervisor"} error={errors?.supervisor?.message}>
          <select
            {...register("supervisor", { required: true })}
            id="supervisor"
            value={editData.supervisor}
            className="rounded-full bg-[#fbfbfb] px-3 text-center w-60 mx-4 border-[2px] border-black"
          >
            <option value="">Select</option>
            {supervisors.map((name, idx) => (
              <option key={idx} value={name}>
                {name}
              </option>
            ))}
          </select>
        </FormRow>

        <button
          type="submit"
          className="bg-[#145DA0] rounded-full p-2 px-4 mt-5 w-fit self-center text-white hover:bg-[#2E8BC0] hover:cursor-pointer font-semibold focus:ring-blue-700"
        >
          Add Scholar
        </button>
      </form>
    </div>
  );
}

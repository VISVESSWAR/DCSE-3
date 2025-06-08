import axios from "axios";
import { useForm } from "react-hook-form";
import FormRow from "./FormRow";
import toast from "react-hot-toast";
import { useState } from "react";
import Spinner from "../../ui/Spinner";
import { UserData } from "../../context/UserContext";
const phoneNoPattern = /^(?:(?:\+|0{0,2})91(\s*[\\-]\s*)?|[0]?)?[789]\d{9}$/;
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

export default function AddScholar({ formData = {}, onClose, onUpdate }) {
  const { _id: editId, contactInfo = {}, ...data } = formData;
  const { user } = UserData();
  const { phone, email } = contactInfo;

  const editData = Object.keys(formData).length
    ? {
        ...data,
        phone,
        email,
      }
    : null;
  const isEditing = Boolean(editId);
  const { register, reset, formState, handleSubmit } = useForm({
    defaultValues: isEditing ? editData : {},
  });
  const { errors } = formState;

  const [isLoading, setIsLoading] = useState(false);
  const validatePhone = (no) => {
    // console.log(no);
    return phoneNoPattern.test(no);
  };
  // console.log(editData);
  async function handleAddScholar(payload) {
    try {
      setIsLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/pgscholars",
        payload
      );
      console.log(res.data);
      toast.success("Scholar details added successfully");
      reset();
      onClose?.();
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error(
        err.response?.data || err.message || "Failed to add new Scholar details"
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdate(payload) {
    try {
      setIsLoading(true);
      const response = await axios.put(
        `http://localhost:5000/api/pgscholars/${editId}`,
        payload
      );
      toast.success("Updated Scholar Details Successfully");
      reset();
      onUpdate(editId, payload);
      onClose?.();
    } catch (error) {
      console.error("Error updating scholar:", error);
      toast.error("Failed to update Scholar Details");
    } finally {
      setIsLoading(false);
    }
  }
  async function onSubmit(data) {
    const payload = {
      name: data.name,
      registrationNumber: data.registrationNumber,
      contactInfo: {
        email: data.email,
        phone: data.phone,
      },
      areaOfResearch: data.areaOfResearch,
      supervisor: user._id,
    };

    if (isEditing) {
      handleUpdate(payload);
    } else {
      handleAddScholar(payload);
    }
  }

  function onError(error) {
    console.log(error);
  }

  if (isLoading) return <Spinner />;
  return (
    <div className="p-2 text-lg h-screen flex-col  mx-auto flex justify-center items-start min-h-screen ">
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
            className="rounded-full bg-[#fbfbfb] px-3 text-center w-60 mx-4 border-[2px] border-black"
            {...register("email", { required: "This is required field" })}
          ></input>
        </FormRow>

        <FormRow label={"phone"} error={errors?.phone?.message}>
          <input
            name="phone"
            type="tel"
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

        {/* <FormRow label={"supervisor"} error={errors?.supervisor?.message}>
          <select
            {...register("supervisor", { required: true })}
            id="supervisor"
            className="rounded-full bg-[#fbfbfb] px-3 text-center w-60 mx-4 border-[2px] border-black"
          >
            <option value="">Select</option>
            {supervisors.map((name, idx) => (
              <option key={idx} value={name}>
                {name}
              </option>
            ))}
          </select>
        </FormRow> */}

        <button
          type="submit"
          className="bg-[#145DA0] rounded-full p-2 px-4 mt-5 w-fit self-center text-white hover:bg-[#2E8BC0] hover:cursor-pointer font-semibold focus:ring-blue-700"
        >
          {isEditing ? "Update" : "Add Scholar"}
        </button>
      </form>
    </div>
  );
}

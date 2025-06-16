import axios from "axios";
import { useForm } from "react-hook-form";
import FormRow from "./FormRow";
import toast from "react-hot-toast";
import { useState } from "react";
import Spinner from "../../ui/Spinner";
import { UserData } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

const phoneNoPattern = /^(?:(?:\+|0{0,2})91(\s*[\\-]\s*)?|[0]?)?[789]\d{9}$/;

export default function AddScholar({ formData = {}, onClose, onUpdate }) {
  const navigate = useNavigate();
  const { _id: editId, contactInfo = {}, ...data } = formData;
  const { user } = UserData();
  console.log("User data in AddScholar:", user);
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
    return phoneNoPattern.test(no);
  };

  async function handleAddScholar(payload) {
    console.log(user.email)
    try {
      setIsLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/pgscholars",
        payload,
        {
          headers: {
            'x-user-email': user.email,
          },
        }
      );
      console.log(res.data);
      toast.success("Scholar details added successfully");
      reset();
      setIsLoading(false);
      if (onClose) {
        onClose();
      } else {
        navigate("/scholars");
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error(
        err.response?.data?.message || err.message || "Failed to add new Scholar details"
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
      if (onUpdate) {
        onUpdate(editId, payload);
      }
      if (onClose) {
        onClose();
      } else {
        navigate("/scholars");
      }
    } catch (error) {
      console.error("Error updating scholar:", error);
      toast.error(error.response?.data?.message || "Failed to update Scholar Details");
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
      supervisor: user.userId,
    };

    if (isEditing) {
      handleUpdate(payload);
    } else {
      console.log("Payload sent to backend:", payload);
      handleAddScholar(payload);
    }
  }

  function onError(error) {
    console.log(error);
  }

  if (isLoading) return <Spinner />;

  return (
    <div className="p-2 text-lg h-screen flex-col mx-auto flex justify-center items-start min-h-screen">
      <h1 className="font-bold text-3xl text-center mt-5 mx-auto">
        {isEditing ? "Update Scholar" : "Add Scholar"}
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className="flex flex-col min-w-[60%] max-w-lg mx-auto mt-10 border-2 border-black p-10 rounded-xl shadow-black shadow-[6px_6px_6px_-2px_rgba(0,0,0,0.3)] bg-gray-50"
      >
        <FormRow label="name" error={errors?.name?.message}>
          <input
            name="name"
            className="rounded-full bg-[#fbfbfb] px-3 text-center w-60 mx-4 border-[2px] border-black"
            {...register("name", { required: "This is required field" })}
          />
        </FormRow>

        <FormRow label="registrationNumber" error={errors?.registrationNumber?.message}>
          <input
            name="registrationNumber"
            className="rounded-full bg-[#fbfbfb] px-3 text-center w-60 mx-4 border-[2px] border-black"
            {...register("registrationNumber", {
              required: "This is required field",
            })}
          />
        </FormRow>

        <FormRow label="email" error={errors?.email?.message}>
          <input
            name="email"
            type="email"
            className="rounded-full bg-[#fbfbfb] px-3 text-center w-60 mx-4 border-[2px] border-black"
            {...register("email", { required: "This is required field" })}
          />
        </FormRow>

        <FormRow label="phone" error={errors?.phone?.message}>
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
          />
        </FormRow>

        <FormRow label="areaOfResearch" error={errors?.areaOfResearch?.message}>
          <select
            name="areaOfResearch"
            className="rounded-full bg-[#fbfbfb] px-3 text-center w-60 mx-4 border-[2px] border-black"
            {...register("areaOfResearch", { required: "This is required field" })}
          >
            <option value="">Select Area of Research</option>
            <option value="Artificial Intelligence">Artificial Intelligence</option>
            <option value="Data Science">Data Science</option>
            <option value="CyberSecurity">CyberSecurity</option>
            <option value="Wireless Networks">Wireless Networks</option>
            <option value="Computer Vision">Computer Vision</option>
            <option value="Quantum Computing">Quantum Computing</option>
          </select>
        </FormRow>

        <button
          type="submit"
          className="bg-[#145DA0] rounded-full p-2 px-4 mt-5 w-fit self-center text-white hover:bg-[#2E8BC0] hover:cursor-pointer font-semibold focus:ring-blue-700"
        >
          {isEditing ? "Update Scholar" : "Add Scholar"}
        </button>
      </form>
    </div>
  );
}

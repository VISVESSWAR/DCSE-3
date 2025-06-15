import axios from "axios";
import { useForm } from "react-hook-form";
import FormRow from "./FormRow";
import toast from "react-hot-toast";
import { useState } from "react";
import Spinner from "../../ui/Spinner";
import { UserData } from "../../context/UserContext";
const phoneNoPattern = /^(?:(?:\+|0{0,2})91(\s*[\\-]\s*)?|[0]?)?[789]\d{9}$/;

export default function AddScholar({ formData = {}, onClose, onUpdate }) {
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
    // console.log(no);
    return phoneNoPattern.test(no);
  };
  // console.log(editData);
  async function handleAddScholar(payload) {
    console.log(user.email);
    try {
      setIsLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/pgscholars",
        payload,
        {
          headers: {
            "x-user-email": user.email,
          },
        }
      );
      console.log(res.data);
      toast.success("Scholar details added successfully");
      reset();
      setIsLoading(false);
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

  // if (isLoading) return <Spinner />;
  return (
    <div className=" text-lg min-h-screen bg-[#f5f7fa] flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className="w-full max-w-2xl border  border-gray-300 rounded-xl bg-white shadow-md p-10 space-y-6"
      >
        <h1 className="text-3xl font-bold text-center text-[#145DA0]">
          {isEditing ? "Update Scholar" : "Add Scholar"}
        </h1>
        <div className="h-[80vh] overflow-y-auto p-10 space-y-6">
          <div className="space-y-1">
            <label className="block">Name</label>
            <input
              name="name"
              className="w-full p-2 rounded bg-gray-100 border border-gray-300"
              {...register("name", { required: "This is required field" })}
            />
            {errors?.name && <div className="h-0.5 bg-red-500" />}
          </div>

          <div className="space-y-1">
            <label className="block">Registration Number</label>
            <input
              name="registrationNumber"
              className="w-full p-2 rounded bg-gray-100 border border-gray-300"
              {...register("registrationNumber", {
                required: "This is required field",
              })}
            />
            {errors?.registrationNumber && <div className="h-0.5 bg-red-500" />}
          </div>

          <div className="space-y-1">
            <label className="block">Email</label>
            <input
              name="email"
              type="email"
              className="w-full p-2 rounded bg-gray-100 border border-gray-300"
              {...register("email", { required: "This is required field" })}
            />
            {errors?.email && <div className="h-0.5 bg-red-500" />}
          </div>

          <div className="space-y-1">
            <label className="block">Phone Number</label>
            <input
              name="phone"
              type="tel"
              placeholder="Enter 10 digit mobile number"
              className="w-full p-3 rounded bg-gray-100 border border-gray-300"
              {...register("phone", {
                required: "This is required field",
                validate: (value) =>
                  validatePhone(value) || "Enter a valid phone number",
              })}
            />
            {errors?.phone && <div className="h-0.5 bg-red-500" />}
          </div>

          <div className="space-y-1">
            <label className="block">Area of Research</label>
            <input
              type="text"
              placeholder="e.g., Artificial Intelligence"
              className="w-full p-3 rounded bg-gray-100 border border-gray-300"
              {...register("areaOfResearch", {
                required: "This is required field",
              })}
            />
            {errors?.areaOfResearch && <div className="h-0.5 bg-red-500" />}
          </div>

        <button
          type="submit"
          className="w-fit mx-auto block bg-[#145DA0] text-white px-6 py-2 rounded hover:bg-[#2E8BC0] transition duration-200"
          >
          {isEditing ? "Update Scholar" : "Add Scholar"}
        </button>
          </div>
      </form>
    </div>
  );
}

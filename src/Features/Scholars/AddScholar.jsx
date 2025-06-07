import axios from "axios";
import React from "react";
import { useForm } from "react-hook-form";

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

export default function AddScholar() {
  const { register, reset, getValues, formState, handleSubmit } = useForm();

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
    const res = await axios.post("http://localhost:5000/api/pgscholars", payload);
    console.log(res.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}

  function onError(error) {
    console.log(error);
    reset();
  }
  return (
    <div className="p-5 text-lg flex w-full h-screen flex-col bg-blue-200">
      <h1 className="font-bold text-3xl text-center mt-20">AddScholar</h1>
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className="flex flex-col self-center lg:w-[40%] mt-10 border-2 border-black p-8 rounded-xl"
      >
        <div className="my-2 p-2 font-semibold flex justify-between">
          <label id="name">Name</label>
          <input
            name="name"
            className="rounded-full bg-stone-200 px-3 text-center w-60"
            {...register("name", { required: "This is required field" })}
          ></input>
        </div>

        <div className="my-2 p-2 font-semibold flex justify-between">
          <label id="registrationNumber">registrationNumber</label>
          <input
            name="registrationNumber"
            className="rounded-full bg-stone-200 px-3 text-center w-60"
            {...register("registrationNumber", {
              required: "This is required field",
            })}
          ></input>
        </div>

        <div className="my-2 p-2 font-semibold flex justify-between">
          <label id="email">email</label>
          <input
            name="email"
            type="email"
            className="rounded-full bg-stone-200 px-3 text-center w-60"
            {...register("email", { required: "This is required field" })}
          ></input>
        </div>

        <div className="my-2 p-2 font-semibold flex justify-between">
          <label id="phone">phone</label>
          <input
            name="phone"
            className="rounded-full bg-stone-200 px-3 text-center w-60"
            {...register("phone", { required: "This is required field" })}
          ></input>
        </div>

        <div className="my-2 p-2 font-semibold flex justify-between">
          <label htmlFor="areaOfResearch">Area of Research</label>
          <select
            {...register("areaOfResearch", { required: true })}
            id="areaOfResearch"
            className="rounded-full bg-stone-200 px-3 text-center w-60"
          >
            <option value="">Select</option>
            {researchAreas.map((area, idx) => (
              <option key={idx} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        <div className="my-2 p-2 font-semibold flex justify-between">
          <label htmlFor="supervisor">Supervisor</label>
          <select
            {...register("supervisor", { required: true })}
            id="supervisor"
            className="rounded-full bg-stone-200 px-3 text-center w-60"
          >
            <option value="">Select</option>
            {supervisors.map((name, idx) => (
              <option key={idx} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-400 rounded-full p-2 px-4 mt-5 w-fit self-center"
        >
          Add Scholar
        </button>
      </form>
    </div>
  );
}

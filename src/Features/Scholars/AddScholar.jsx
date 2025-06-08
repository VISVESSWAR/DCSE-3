import axios from "axios";
import { useForm } from "react-hook-form";
import FormRow from "./FormRow";

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
  const { errors } = formState;
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
            className="rounded-full bg-[#fbfbfb] px-3 text-center w-60 mx-4 border-[2px] border-black"
            {...register("phone", { required: "This is required field" })}
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

        <FormRow label={"supervisor"} error={errors?.supervisor?.message}>
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
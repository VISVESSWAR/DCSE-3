import axios from "axios";
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
    console.log(data);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/pgscholars",
        data
      );
      console.log(res);
    } catch (err) {
      console.error(err);
    }
  }
  function onError(error) {
    console.log(error);
    reset();
  }
  return (
    <div className="p-2 text-lg h-screen flex-col bg-[#fff5ed] mx-auto flex justify-center items-start min-h-screen ">
      <h1 className="font-bold text-3xl text-center mt-5 mx-auto">
        AddScholar
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className="flex flex-col min-w-[60%] max-w-lg mx-auto mt-10 border-2 border-black p-10 rounded-xl "
      >
        <div className="my-2 p-2 font-semibold flex justify-between">
          <label id="name">Name</label>
          <input
            name="name"
            className="rounded-full bg-[#F9F6F0] px-3 text-center w-60 mx-4 border-[2px] border-black"
            {...register("name", { required: "This is required field" })}
          ></input>
        </div>

        <div className="my-2 p-2 font-semibold flex justify-between">
          <label id="registrationNumber">Registration Number</label>
          <input
            name="registrationNumber"
            className="rounded-full bg-[#F9F6F0] px-3 text-center w-60 mx-4 border-[2px] border-black"
            {...register("registrationNumber", {
              required: "This is required field",
            })}
          ></input>
        </div>

        <div className="my-2 p-2 font-semibold flex justify-between">
          <label id="email">Email</label>
          <input
            name="email"
            type="email"
            className="rounded-full bg-[#F9F6F0] px-3 text-center w-60 mx-4 border-[2px] border-black"
            {...register("email", { required: "This is required field" })}
          ></input>
        </div>

        <div className="my-2 p-2 font-semibold flex justify-between">
          <label id="phone">phone</label>
          <input
            name="phone"
            className="rounded-full bg-[#F9F6F0] px-3 text-center w-60 mx-4 border-[2px] border-black"
            {...register("phone", { required: "This is required field" })}
          ></input>
        </div>

        <div className="my-2 p-2 font-semibold flex justify-between">
          <label htmlFor="areaOfResearch">Area of Research</label>
          <select
            {...register("areaOfResearch", { required: true })}
            id="areaOfResearch"
            className="rounded-full bg-[#F9F6F0] px-3 text-center w-60 mx-4 border-[2px] border-black"
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
            className="rounded-full bg-[#F9F6F0] px-3 text-center w-60 mx-4 border-[2px] border-black"
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
        className="bg-[#956471] rounded-full p-2 px-4 mt-5 w-fit self-center text-white hover:bg-[#b4818f] hover:cursor-pointer font-semibold"
        >
          Add Scholar
        </button>
      </form>
    </div>
  );
}

import { useState } from "react";
import { UserData } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function Signup({ onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "faculty",
  });
  const { signup } = UserData();
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await signup(form);
    if (success) {
      setForm({
        name: "",
        email: "",
        password: "",
        role: "faculty",
      });
      navigate("/login");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto space-y-4 flex flex-col justify-center my-auto min-h-[100vh] w-[80%]"
    >
      <h2 className="text-xl font-bold text-center">Signup</h2>
      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Name"
        className="w-full px-3 py-2 border rounded"
        required
      />
      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="w-full px-3 py-2 border rounded"
        required
      />
      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Password"
        className="w-full px-3 py-2 border rounded"
        required
      />
      <select
        name="role"
        value={form.role}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded"
      >
        <option value="faculty">Faculty</option>
        <option value="hod">HOD</option>
        <option value="admin">Admin</option>
      </select>
      <button
        type="submit"
        className="w-full bg-[#145DA0] text-white py-2 rounded"
      >
        Sign Up
      </button>
    </form>
  );
}

import { useState } from "react";
import { UserData } from "../../context/UserContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showAboutUs, setShowAboutUs] = useState(false);
  const { login } = UserData();
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(form);
    if (success) {
      setForm({ email: "", password: "" });
      navigate("/");
    }
  };

  const handleAboutUsClick = () => {
    setShowAboutUs(true);
  };

  const handleBackClick = () => {
    setShowAboutUs(false);
  };

  if (showAboutUs) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-6xl w-full">
          <h1 className="text-3xl font-bold text-center text-blue-800 mb-6 font-sans">
            About the Faculty OD Request and Approval Module
          </h1>

          <p className="text-gray-700 text-center mb-8 leading-relaxed font-sans">
            The Faculty OD Request and Approval Module was developed as part of
            a summer internship project. It is designed to streamline and
            digitize the official duty (OD) request and approval process for
            faculty members involved in academic and institutional activities
            such as courses, workshops, training programs, FDPs, STTPs,
            conferences, industrial visits, publications, and university
            representation. The module also supports confidential report
            generation and department-level data consolidation through a
            centralized and user-friendly interface.
          </p>

          <h2 className="text-xl font-bold text-center text-blue-800 mb-8 font-sans">
            Meet the Team
          </h2>

          <div className="flex flex-col sm:flex-col md:flex-row justify-center flex-wrap gap-6 font-sans">
            {/* Card 1 */}
            <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-6 w-48 min-w-[12rem]">
              <div className="w-28 h-28 bg-gray-200 rounded-full mb-4 flex items-center justify-center overflow-hidden">
                <img
                  src="/visvess (1).jpg"
                  alt="VISVESSWAR A M"
                  className="object-contain object-top w-28 h-28 rounded-full p-1"
                />
              </div>
              <div className="text-lg font-semibold text-center mb-2 px-5">
                VISVESSWAR A M
              </div>
              <div className="text-sm text-gray-600 text-center">
                B.E. Computer Science and Engineering, 4th Year
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-6 w-48 min-w-[12rem]">
              <div className="w-28 h-28 mb-4 flex items-center justify-center overflow-hidden">
                <img
                  src="/nikhitaa.jpeg"
                  alt="Nikhitaa M"
                  className="object-cover object-center w-28 h-28 rounded-full p-1"
                />
              </div>
              <div className="text-lg font-semibold text-center mb-2">
                NIKHITAA M
              </div>
              <div className="text-sm text-gray-600 text-center">
                B.E. Computer Science and Engineering, 3rd Year
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-6 w-48 min-w-[12rem]">
              <div className="w-28 h-28 mb-4 flex items-center justify-center overflow-hidden">
                <img
                  src="/sainikitha.jpeg"
                  alt="Sainikitha I"
                  className="object-cover object-center w-28 h-28 rounded-full p-1"
                />
              </div>
              <div className="text-lg font-semibold text-center mb-2">
                SAINIKITHA I
              </div>
              <div className="text-sm text-gray-600 text-center">
                B.E. Computer Science and Engineering, 3rd Year
              </div>
            </div>

            {/* Card 4 */}
            <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-6 w-48 min-w-[12rem]">
              <div className="w-28 h-28 mb-4 flex items-center justify-center overflow-hidden">
                <img
                  src="/shibani.jpg"
                  alt="Shibani Selvakumar"
                  className="object-cover object-center w-28 h-28 rounded-full p-1"
                />
              </div>
              <div className="text-lg font-semibold text-center mb-2">
                SHIBANI SELVAKUMAR
              </div>
              <div className="text-sm text-gray-600 text-center">
                B.E. Computer Science and Engineering, 3rd Year
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 text-center mt-8 font-sans">
            This portal was built during the Summer Internship - June 2025 by
            students from the Department of Computer Science and Engineering,
            Anna University.
          </p>

          <div className="text-center mt-8">
            <button
              onClick={handleBackClick}
              className="bg-[#145DA0] text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto space-y-4 flex flex-col justify-center self-center min-h-[100vh] w-[80%]">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-bold text-center">Login</h2>
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
        <button
          type="submit"
          className="w-full bg-[#145DA0] text-white py-2 rounded hover:cursor-pointer"
        >
          Log In
        </button>
        <p className="text-center mt-2">
          <Link
            to="/forgot-password"
            className="text-[#145DA0] font-semibold hover:underline text-sm"
          >
            Forgot Password?
          </Link>
        </p>
        <p className="text-center mt-2">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-[#145DA0] font-semibold hover:underline"
          >
            Sign up here
          </Link>
        </p>
        <button
          type="button"
          onClick={handleAboutUsClick}
          className="text-[#145DA0] font-semibold hover:underline text-center w-full mt-2"
          style={{
            outline: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          About Us
        </button>
      </form>
    </div>
  );
}

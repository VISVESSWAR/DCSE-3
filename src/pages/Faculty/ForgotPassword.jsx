import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { backendUrl } from "../../utils/urls";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetLink, setResetLink] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    console.log("\n=== FRONTEND: FORGOT PASSWORD REQUEST ===");
    console.log("Email:", email);
    console.log("Backend URL:", `${backendUrl}/api/auth/forgot-password`);
    console.log("Time:", new Date().toISOString());
    console.log("==========================================\n");

    try {
      setIsLoading(true);
      console.log("Sending request to backend...");
      
      const response = await axios.post(`${backendUrl}/api/auth/forgot-password`, {
        email,
      });
      
      console.log("Response received:", response.data);
      console.log("Response status:", response.status);
      
      toast.success(response.data.message || "Password reset link sent to your email");
      setResetLink(response.data.resetLink || "");
      setEmailSent(true);
      
      // Log reset link if provided
      if (response.data.resetLink) {
        console.log("\n=== RESET LINK (Check Server Console Too) ===");
        console.log(response.data.resetLink);
        console.log("=============================================\n");
      }
    } catch (error) {
      console.error("\n=== FRONTEND ERROR ===");
      console.error("Error:", error);
      console.error("Error Response:", error.response?.data);
      console.error("Error Status:", error.response?.status);
      console.error("========================\n");
      
      toast.error(
        error.response?.data?.message || "Failed to send password reset email"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="max-w-lg mx-auto space-y-4 flex flex-col justify-center self-center min-h-[100vh] w-[80%]">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-center mb-4">Check Your Email</h2>
          <p className="text-gray-700 text-center mb-4">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-600 text-center mb-4">
            Please check your inbox and click on the link to reset your password.
          </p>
          
          {/* Show reset link in development mode */}
          {resetLink && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm font-semibold text-yellow-800 mb-2">
                Development Mode: Reset Link
              </p>
              <p className="text-xs text-gray-600 mb-2 break-all">
                {resetLink}
              </p>
              <a
                href={resetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Click here to reset password
              </a>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                setEmailSent(false);
                setEmail("");
                setResetLink("");
              }}
              className="w-full bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
            >
              Try Another Email
            </button>
            <Link
              to="/login"
              className="w-full bg-[#145DA0] text-white py-2 rounded hover:bg-blue-700 text-center py-2"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto space-y-4 flex flex-col justify-center self-center min-h-[100vh] w-[80%]">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-bold text-center">Forgot Password</h2>
        <p className="text-sm text-gray-600 text-center">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-3 py-2 border rounded"
          required
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#145DA0] text-white py-2 rounded hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>
        <p className="text-center mt-2">
          Remember your password?{" "}
          <Link
            to="/login"
            className="text-[#145DA0] font-semibold hover:underline"
          >
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}


import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { backendUrl } from "../../utils/urls";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");
  const [tokenValid, setTokenValid] = useState(false);
  const [manualToken, setManualToken] = useState("");
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("\n=== RESET PASSWORD PAGE LOADED ===");
    console.log("URL:", window.location.href);
    console.log("All search params:", Object.fromEntries(searchParams));
    console.log("User Agent:", navigator.userAgent);
    console.log("==================================\n");

    let foundToken = searchParams.get("token");
    console.log("Token from URL params:", foundToken ? `${foundToken.substring(0, 10)}...` : "none");

    // Try to get token from URL hash if not in query params (some mobile browsers)
    if (!foundToken) {
      const hash = window.location.hash;
      if (hash) {
        const hashParams = new URLSearchParams(hash.substring(1));
        foundToken = hashParams.get("token");
        console.log("Token from hash:", foundToken ? `${foundToken.substring(0, 10)}...` : "none");
      }
    }

    // Try to extract token from full URL if it's malformed (mobile browsers sometimes break URLs)
    if (!foundToken) {
      const fullUrl = window.location.href;
      const tokenMatch = fullUrl.match(/[?&#]token=([^&#]+)/);
      if (tokenMatch) {
        foundToken = decodeURIComponent(tokenMatch[1].split('&')[0].split('#')[0]);
        console.log("Token extracted from URL:", foundToken ? `${foundToken.substring(0, 10)}...` : "none");
      }
    }

    if (foundToken) {
      setToken(foundToken);
      setTokenValid(true);
      console.log("Token found, form ready");
    } else {
      console.error("No token found in URL");
      // Don't redirect immediately - show manual entry option
      setShowManualEntry(true);
    }
  }, [navigate, searchParams]);

  // Handle manual token entry
  const handleManualTokenSubmit = () => {
    if (manualToken.trim()) {
      setToken(manualToken.trim());
      setTokenValid(true);
      setShowManualEntry(false);
      console.log("Manual token set:", manualToken.substring(0, 10) + "...");
    } else {
      toast.error("Please enter a reset token");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("Invalid reset token. Please request a new password reset link.");
      navigate("/forgot-password");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    console.log("\n=== RESET PASSWORD SUBMIT ===");
    console.log("Token:", token ? `${token.substring(0, 10)}...` : "MISSING");
    console.log("Password length:", password.length);
    console.log("=============================\n");

    try {
      setIsLoading(true);
      console.log("Sending reset request to backend...");
      
      const response = await axios.post(`${backendUrl}/api/auth/reset-password`, {
        token,
        password,
      });
      
      console.log("Reset successful:", response.data);
      toast.success(response.data.message || "Password reset successfully");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("\n=== RESET PASSWORD ERROR ===");
      console.error("Error:", error);
      console.error("Error Response:", error.response?.data);
      console.error("Error Status:", error.response?.status);
      console.error("============================\n");
      
      toast.error(
        error.response?.data?.message || "Failed to reset password. Token may have expired."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!tokenValid && !showManualEntry) {
    return (
      <div className="max-w-sm mx-auto space-y-4 flex flex-col justify-center self-center min-h-[100vh] w-[80%]">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-center mb-4 text-red-600">Invalid Reset Link</h2>
          <p className="text-gray-700 text-center mb-4">
            The reset link is invalid or missing. Please request a new password reset link.
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full bg-[#145DA0] text-white py-2 rounded hover:bg-blue-700 mb-2"
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  if (showManualEntry && !token) {
    return (
      <div className="max-w-sm mx-auto space-y-4 flex flex-col justify-center self-center min-h-[100vh] w-[80%]">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-center mb-4">Reset Password</h2>
          <p className="text-sm text-gray-600 text-center mb-4">
            The reset token was not found in the URL. You can manually enter it below.
          </p>
          <p className="text-xs text-gray-500 text-center mb-2">
            Copy the token from the reset link in your email (the part after "token=")
          </p>
          <p className="text-xs text-gray-400 text-center mb-4">
            Example: If link is "http://example.com/reset-password?token=abc123xyz", 
            copy "abc123xyz"
          </p>
          <textarea
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            placeholder="Paste reset token here (the long string after token=)"
            className="w-full px-3 py-2 border rounded mb-4 min-h-[80px]"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleManualTokenSubmit}
              className="flex-1 bg-[#145DA0] text-white py-2 rounded hover:bg-blue-700"
            >
              Continue
            </button>
            <button
              onClick={() => navigate("/forgot-password")}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
            >
              Request New Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto space-y-4 flex flex-col justify-center self-center min-h-[100vh] w-[80%]">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-bold text-center">Reset Password</h2>
        <p className="text-sm text-gray-600 text-center">
          Enter your new password below.
        </p>
        {!token && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
            <p className="text-xs text-yellow-800 text-center mb-2">
              No token detected. If you're on mobile, you can enter the token manually.
            </p>
            <button
              type="button"
              onClick={() => setShowManualEntry(true)}
              className="w-full text-xs bg-yellow-100 text-yellow-800 py-1 rounded hover:bg-yellow-200"
            >
              Enter Token Manually
            </button>
          </div>
        )}
        {token && (
          <p className="text-xs text-gray-500 text-center mb-2">
            Token detected: {token.substring(0, 15)}...
          </p>
        )}
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New Password"
          className="w-full px-3 py-2 border rounded"
          required
          disabled={isLoading}
          minLength={6}
        />
        <input
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm New Password"
          className="w-full px-3 py-2 border rounded"
          required
          disabled={isLoading}
          minLength={6}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#145DA0] text-white py-2 rounded hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}


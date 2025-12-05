import axios from "axios";
import { useForm } from "react-hook-form";
import FormRow from "../Scholars/FormRow";
import toast from "react-hot-toast";
import { useState } from "react";
import Spinner from "../../ui/Spinner";
import { UserData } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "../../utils/urls";
export default function AddPublication({
  formData = {},
  onClose,
  onUpdate,
  onFetchPublications,
}) {
  const navigate = useNavigate();
  const { _id: editId, ...data } = formData;
  const { user } = UserData();
  
  // Transform edit data to match form structure
  let editData = null;
  if (Object.keys(formData).length) {
    editData = {
      ...data,
      author: Array.isArray(data.authors) ? data.authors.join(", ") : data.author || "",
      journalOrPublisher: data.journal || data.journalOrPublisher || "",
      // Handle legacy publicationDate if it exists
      year: data.year || (data.publicationDate ? new Date(data.publicationDate).getFullYear() : ""),
      month: data.month || (data.publicationDate ? new Date(data.publicationDate).getMonth() + 1 : ""),
    };
  }
  
  const isEditing = Boolean(editId);
  const { register, reset, formState, handleSubmit } = useForm({
    defaultValues: isEditing ? editData : {},
  });
  const { errors } = formState;
  const [isLoading, setIsLoading] = useState(false);
  const [authorId, setAuthorId] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  async function handleAddPublication(payload) {
    try {
      setIsLoading(true);
      const res = await axios.post(`${backendUrl}/api/publications`, payload, {
        headers: {
          "x-user-email": user.email,
        },
      });
      toast.success("Publication added successfully");
      reset();
      if (onClose) {
        onClose();
      } else {
        navigate("/publications");
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      if (err.response?.data?.message?.includes("Duplicate citation_id")) {
        toast.error(
          "A publication with this DOI already exists. Please use a different DOI or leave it empty."
        );
      } else {
        toast.error(
          err.response?.data?.message ||
            err.message ||
            "Failed to add new publication"
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdate(payload) {
    try {
      setIsLoading(true);
      const response = await axios.put(
        `${backendUrl}/api/publications/${editId}`,
        payload,
        {
          headers: {
            "x-user-email": user.email,
          },
        }
      );
      toast.success("Updated Publication Successfully");
      reset();
      if (onUpdate) {
        onUpdate(editId, payload);
      }
      if (onClose) {
        onClose();
      } else {
        navigate("/publications");
      }
    } catch (error) {
      console.error("Error updating publication:", error);
      if (error.response?.data?.message?.includes("Duplicate citation_id")) {
        toast.error(
          "A publication with this DOI already exists. Please use a different DOI or leave it empty."
        );
      } else {
        toast.error(
          error.response?.data?.message || "Failed to update Publication"
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyProfile() {
    if (!authorId) {
      toast.error("Please enter an author ID");
      return;
    }
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${backendUrl}/api/publications/verify-profile?authorId=${authorId}`,
        {
          headers: {
            "x-user-email": user.email,
          },
        }
      );
      setProfileData(response.data.profile);
      setShowVerificationModal(true);
    } catch (error) {
      console.error("Error verifying profile:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to verify Google Scholar profile. Please check the author ID."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirmAndFetch() {
    if (!authorId) {
      toast.error("Please enter an author ID");
      return;
    }
    try {
      setIsLoading(true);
      setShowVerificationModal(false);
      const response = await axios.get(
        `${backendUrl}/api/publications/fetch-and-store?authorId=${authorId}`,
        {
          headers: {
            "x-user-email": user.email,
          },
        }
      );
      toast.success(response.data.message || "Publications fetched successfully");
      setAuthorId("");
      setProfileData(null);
      reset();
      if (onClose) {
        onClose();
      } else if (onFetchPublications) {
        onFetchPublications();
      } else {
        navigate("/publications");
      }
    } catch (error) {
      console.error("Error fetching publications:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch publications from Google Scholar"
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(data) {
    const payload = {
      title: data.title,
      authors: data.author.split(",").map((a) => a.trim()),
      journal: data.journalOrPublisher,
      volume: data.volume || undefined,
      issue: data.issue || undefined,
      year: parseInt(data.year),
      month: data.month ? parseInt(data.month) : undefined,
      doi: data.doi || undefined,
    };

    if (isEditing) {
      handleUpdate(payload);
    } else {
      handleAddPublication(payload);
    }
  }

  function onError(error) {
    console.log(error);
  }

  if (isLoading) return <Spinner />;

  return (
    <div className="text-lg min-h-screen bg-[#f5f7fa] flex items-center justify-center py-10">
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className="w-full max-w-2xl border border-gray-300 rounded-xl bg-white shadow-md p-10"
      >
        <h1 className="text-3xl font-bold text-center text-[#145DA0]">
          {isEditing ? "Edit Publication" : "Add Publication"}
        </h1>

        <FormRow label="Title" error={errors?.title?.message}>
          <input
            name="title"
            className="w-full p-2 rounded bg-gray-100 border border-gray-300"
            {...register("title", { required: "This is required field" })}
          />
        </FormRow>

        <FormRow label="Author" error={errors?.author?.message}>
          <input
            name="author"
            className="w-full p-2 rounded bg-gray-100 border border-gray-300"
            {...register("author", { required: "This is required field" })}
          />
        </FormRow>

        <FormRow
          label="Journal Name"
          error={errors?.journalOrPublisher?.message}
        >
          <input
            name="journalOrPublisher"
            className="w-full p-2 rounded bg-gray-100 border border-gray-300"
            {...register("journalOrPublisher", {
              required: "This is required field",
            })}
          />
        </FormRow>

        <FormRow label="Volume" error={errors?.volume?.message}>
          <input
            name="volume"
            placeholder="Optional"
            className="w-full p-2 rounded bg-gray-100 border border-gray-300"
            {...register("volume")}
          />
        </FormRow>

        <FormRow label="Issue" error={errors?.issue?.message}>
          <input
            name="issue"
            placeholder="Optional"
            className="w-full p-2 rounded bg-gray-100 border border-gray-300"
            {...register("issue")}
          />
        </FormRow>

        <div className="flex gap-4">
          <FormRow label="Month" error={errors?.month?.message} className="flex-1">
            <select
              name="month"
              className="w-full p-2 rounded bg-gray-100 border border-gray-300"
              {...register("month")}
            >
              <option value="">Select Month (Optional)</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </FormRow>

          <FormRow label="Year" error={errors?.year?.message} className="flex-1">
            <input
              name="year"
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              placeholder="Year (Required)"
              className="w-full p-2 rounded bg-gray-100 border border-gray-300"
              {...register("year", {
                required: "Year is required",
                min: {
                  value: 1900,
                  message: "Year must be 1900 or later",
                },
                max: {
                  value: new Date().getFullYear(),
                  message: `Year cannot be later than ${new Date().getFullYear()}`,
                },
              })}
            />
          </FormRow>
        </div>

        <div className="space-y-1">
          <label className="block font-medium">Google Scholar Author ID</label>
          <div className="flex gap-2">
            <input
              value={authorId}
              onChange={(e) => {
                setAuthorId(e.target.value);
                setProfileData(null);
                setShowVerificationModal(false);
              }}
              placeholder="Enter author ID"
              className="w-full p-2 rounded bg-gray-100 border border-gray-300"
            />
            <button
              type="button"
              onClick={handleVerifyProfile}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Verify Profile"}
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            First verify the profile, then confirm to fetch publications
          </p>
        </div>

        {showVerificationModal && profileData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-lg">
              <h2 className="text-xl font-bold mb-4 text-[#145DA0]">
                Verify Google Scholar Profile
              </h2>
              <div className="space-y-3 mb-4">
                <div>
                  <strong>Name:</strong> {profileData.name || "N/A"}
                </div>
                {profileData.affiliation && (
                  <div>
                    <strong>Affiliation:</strong> {profileData.affiliation}
                  </div>
                )}
                {profileData.email && (
                  <div>
                    <strong>Email:</strong> {profileData.email}
                  </div>
                )}
                {profileData.interests && profileData.interests.length > 0 && (
                  <div>
                    <strong>Research Interests:</strong>{" "}
                    {profileData.interests.join(", ")}
                  </div>
                )}
                {profileData.totalCitations !== undefined && (
                  <div>
                    <strong>Total Citations:</strong> {profileData.totalCitations}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Is this your Google Scholar profile? Publications will be mapped
                to your faculty account.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowVerificationModal(false);
                    setProfileData(null);
                  }}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAndFetch}
                  disabled={isLoading}
                  className="bg-[#145DA0] text-white px-4 py-2 rounded hover:bg-[#0e3e6e] disabled:opacity-50"
                >
                  {isLoading ? "Fetching..." : "Confirm & Fetch Publications"}
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-fit mx-auto block bg-[#145DA0] text-white px-6 py-2 mt-5 rounded hover:bg-[#2E8BC0] transition duration-200"
        >
          {isEditing ? "Update Publication" : "Add Publication"}
        </button>
      </form>
    </div>
  );
}

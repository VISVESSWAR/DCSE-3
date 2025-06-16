import axios from "axios";
import { useForm } from "react-hook-form";
import FormRow from "../Scholars/FormRow";
import toast from "react-hot-toast";
import { useState } from "react";
import Spinner from "../../ui/Spinner";
import { UserData } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function AddPublication({ formData = {}, onClose, onUpdate, onFetchPublications }) {
  const navigate = useNavigate();
  const { _id: editId, ...data } = formData;
  const { user } = UserData();
  const editData = Object.keys(formData).length ? data : null;
  const isEditing = Boolean(editId);
  const { register, reset, formState, handleSubmit } = useForm({
    defaultValues: isEditing ? editData : {},
  });
  const { errors } = formState;
  const [isLoading, setIsLoading] = useState(false);
  const [authorId, setAuthorId] = useState("");

  async function handleAddPublication(payload) {
    try {
      setIsLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/publications",
        payload,
        {
          headers: {
            'x-user-email': user.email,
          },
        }
      );
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
        toast.error("A publication with this DOI already exists. Please use a different DOI or leave it empty.");
      } else {
        toast.error(
          err.response?.data?.message || err.message || "Failed to add new publication"
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
        `http://localhost:5000/api/publications/${editId}`,
        payload,
        {
          headers: {
            'x-user-email': user.email,
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
        toast.error("A publication with this DOI already exists. Please use a different DOI or leave it empty.");
      } else {
        toast.error(error.response?.data?.message || "Failed to update Publication");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFetchFromGoogleScholar() {
    if (!authorId) {
      toast.error("Please enter an author ID");
      return;
    }
    try {
      setIsLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/publications/fetch-and-store?authorId=${authorId}`,
        {
          headers: {
            'x-user-email': user.email,
          },
        }
      );
      toast.success("Publications fetched successfully");
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
      toast.error(error.response?.data?.message || "Failed to fetch publications from Google Scholar");
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(data) {
    const payload = {
      title: data.title,
      authors: [data.author],
      publicationDate: data.publicationDate,
      journal: data.journalOrPublisher,
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
    <div className="p-2 text-lg h-screen flex-col mx-auto flex justify-center items-start min-h-screen">
      <h1 className="font-bold text-3xl text-center mt-5 mx-auto">
        {isEditing ? "Edit Publication" : "Add Publication"}
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className="flex flex-col min-w-[60%] max-w-lg mx-auto mt-10 border-2 border-black p-10 rounded-xl shadow-black shadow-[6px_6px_6px_-2px_rgba(0,0,0,0.3)] bg-gray-50"
      >
        <FormRow label="title" error={errors?.title?.message}>
          <input
            name="title"
            className="rounded-full bg-[#fbfbfb] px-3 text-center w-60 mx-4 border-[2px] border-black"
            {...register("title", { required: "This is required field" })}
          />
        </FormRow>

        <FormRow label="author" error={errors?.author?.message}>
          <input
            name="author"
            className="rounded-full bg-[#fbfbfb] px-3 text-center w-60 mx-4 border-[2px] border-black"
            {...register("author", { required: "This is required field" })}
          />
        </FormRow>

        <FormRow label="publicationDate" error={errors?.publicationDate?.message}>
          <input
            name="publicationDate"
            type="date"
            className="rounded-full bg-[#fbfbfb] px-3 text-center w-60 mx-4 border-[2px] border-black"
            {...register("publicationDate", { required: "This is required field" })}
          />
        </FormRow>

        <FormRow label="journalOrPublisher" error={errors?.journalOrPublisher?.message}>
          <input
            name="journalOrPublisher"
            className="rounded-full bg-[#fbfbfb] px-3 text-center w-60 mx-4 border-[2px] border-black"
            {...register("journalOrPublisher", { required: "This is required field" })}
          />
        </FormRow>

        <FormRow label="doi" error={errors?.doi?.message}>
          <input
            name="doi"
            placeholder="Optional"
            className="rounded-full bg-[#fbfbfb] px-3 text-center w-60 mx-4 border-[2px] border-black"
            {...register("doi")}
          />
        </FormRow>

        <div className="text-center my-4">
          <span className="text-xl font-semibold">or</span>
        </div>

        <div className="my-4 p-2 font-semibold flex justify-between items-center">
          <label className="capitalize text-xl">Google Scholar Author ID</label>
          <div className="flex gap-2">
            <input
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
              placeholder="Enter author ID"
              className="rounded-full bg-[#fbfbfb] px-3 text-center w-60 border-[2px] border-black"
            />
            <button
              type="button"
              onClick={handleFetchFromGoogleScholar}
              className="bg-green-400 hover:bg-green-500 text-white rounded-full px-3 py-1 text-sm font-semibold"
            >
              Fetch
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="bg-[#145DA0] rounded-full p-2 px-4 mt-5 w-fit self-center text-white hover:bg-[#2E8BC0] hover:cursor-pointer font-semibold focus:ring-blue-700"
        >
          {isEditing ? "Update" : "Add Publication"}
        </button>
      </form>
    </div>
  );
}

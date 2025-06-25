import React, { useRef } from "react";
import { toast } from "react-hot-toast";

export default function FacultyAttachments({ form, setForm, readOnly }) {
  const fileInputRef = useRef();

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newAttachments = files.map((file) => ({
      name: file.name,
      type: file.type,
      size: file.size,
      file, // actual File object
    }));

    setForm((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newAttachments],
    }));

    toast.success(`${files.length} file(s) added`);
  };

  const removeFile = (index) => {
    const updated = [...(form.attachments || [])];
    updated.splice(index, 1);
    setForm((prev) => ({
      ...prev,
      attachments: updated,
    }));
  };

  return (
    <div className="border rounded p-4 space-y-4">
      <h3 className="text-lg font-bold text-[#145DA0]">Supporting Documents</h3>

      {!readOnly && (
        <div>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white px-4 py-2 rounded font-medium"
          >
            Upload Files
          </button>
        </div>
      )}

      {form.attachments?.length > 0 ? (
        <ul className="list-disc pl-5 space-y-1">
          {form.attachments.map((file, index) => {
            const isUploaded = file.url && file.filename; // uploaded file
            const displayName = file.name || file.filename;

            return (
              <li
                key={index}
                className="flex justify-between items-center text-sm"
              >
                {isUploaded ? (
                  <a
                    href={`http://localhost:5000${file.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 underline"
                  >
                    {displayName}
                  </a>
                ) : (
                  <span>{displayName}</span>
                )}

                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-600 text-xs ml-2"
                  >
                    Remove
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">No files uploaded yet.</p>
      )}
    </div>
  );
}

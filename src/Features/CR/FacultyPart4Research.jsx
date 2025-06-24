import React from "react";
export default function FacultyPart4Research({
  form,
  setForm,
  fileUploads,
  setFileUploads,
  readOnly,
}) {
  console.log(form);
  const handleListChange = (field, index, value) => {
    const updated = [...form[field]];
    updated[index] = value;
    setForm({ ...form, [field]: updated });
  };

  const addRow = (field) => {
    setForm((f) => ({ ...f, [field]: [...f[field], ""] }));
  };

  const removeRow = (field, index) => {
    const updated = [...form[field]];
    updated.splice(index, 1);
    setForm({ ...form, [field]: updated });
  };

  const fields = [
    "additionalQualifications",
    "booksOrGuides",
    "memberships",
    "conferences",
    "consultingWork",
    "pastoralFunctions",
    "otherContributions",
  ];

  return (
    <div className="border rounded p-4 space-y-6">
      <h3 className="text-lg font-bold mb-2">
        Part IV: Publications & Activities
      </h3>

      {fields.map((field) => (
        <div key={field}>
          <label className="font-semibold capitalize">
            {field.replace(/([A-Z])/g, " $1")}
          </label>
          {form[field].map((item, idx) => (
            <div key={idx} className="flex gap-2 mt-1">
              <input
                type="text"
                disabled={readOnly}
                value={item}
                onChange={(e) => handleListChange(field, idx, e.target.value)}
                className="w-full border p-1 rounded"
              />
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeRow(field, idx)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {!readOnly && (
            <button
              type="button"
              onClick={() => addRow(field)}
              className="text-blue-600 text-sm mt-1"
            >
              + Add {field.replace(/([A-Z])/g, " $1")}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

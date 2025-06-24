import React from "react";
import toast from "react-hot-toast";

export default function FacultyPart3Potential({ form, setForm, readOnly }) {
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleArrayChange = (field, index, value) => {
    const updated = [...(form[field] || [])];
    updated[index] = value;
    setForm({ ...form, [field]: updated });
  };

  const addArrayItem = (field) => {
    setForm({ ...form, [field]: [...(form[field] || []), ""] });
  };

  const removeArrayItem = (field, index) => {
    const updated = [...(form[field] || [])];
    updated.splice(index, 1);
    setForm({ ...form, [field]: updated });
  };

  const handleTableChange = (index, field, value) => {
    const updated = [...(form.subjectsTaught || [])];
    const currentRow = updated[index] || {};

    // Allow empty string for user to clear input
    if (["studentsAppeared", "studentsPassed"].includes(field)) {
      if (value === "") {
        updated[index] = { ...currentRow, [field]: "" };
        setForm({ ...form, subjectsTaught: updated });
        return;
      }

      const numericValue = parseInt(value, 10);
      if (isNaN(numericValue) || numericValue < 0) {
        toast.error("Please enter a valid non-negative number");
        return;
      }

      if (field === "studentsPassed") {
        const appeared = parseInt(currentRow.appeared || 0);
        if (!isNaN(appeared) && numericValue > appeared) {
          toast.error("Passed students cannot exceed students appeared");
          return;
        }
      }

      if (field === "studentsAppeared") {
        const passed = parseInt(currentRow.passed || 0);
        if (!isNaN(passed) && passed > numericValue) {
          toast.error("Students passed cannot be more than appeared");
          return;
        }
      }
    }

    updated[index] = { ...currentRow, [field]: value };
    setForm({ ...form, subjectsTaught: updated });
  };

  const addSubjectRow = () => {
    setForm({
      ...form,
      subjectsTaught: [
        ...(form.subjectsTaught || []),
        {
          subject: "",
          contactHours: "",
          studentsAppeared: "",
          studentsPassed: "",
          remarks: "",
        },
      ],
    });
  };

  const removeSubjectRow = (index) => {
    const updated = [...(form.subjectsTaught || [])];
    updated.splice(index, 1);
    setForm({ ...form, subjectsTaught: updated });
  };

  const rc = form.researchGuidance || { qualified: {}, registered: {} };

  return (
    <div className="border rounded p-4 space-y-6">
      <h3 className="text-lg font-bold mb-2">
        Part III: Examination & Contributions
      </h3>

      {/* 5(a) Subjects Taught Table */}
      <div>
        <label className="font-semibold">
          5(a) Subjects Taught (Semester-wise)
        </label>
        <div className="overflow-auto mt-2">
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-1">S.No</th>
                <th className="border p-1">Subjects Taught</th>
                <th className="border p-1">Contact Hours/Week</th>
                <th className="border p-1">Students Appeared</th>
                <th className="border p-1">Students Passed</th>
                <th className="border p-1">Remarks</th>
                {!readOnly && <th className="border p-1">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {(form.subjectsTaught || []).map((row, i) => (
                <tr key={i}>
                  <td className="border p-1 text-center">{i + 1}</td>
                  <td className="border p-1">
                    <input
                      disabled={readOnly}
                      className="w-full p-1"
                      value={row.subject}
                      onChange={(e) =>
                        handleTableChange(i, "subject", e.target.value)
                      }
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      disabled={readOnly}
                      className="w-full p-1"
                      value={row.contactHours}
                      onChange={(e) =>
                        handleTableChange(i, "contactHours", e.target.value)
                      }
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      disabled={readOnly}
                      className="w-full p-1"
                      value={row.studentsAppeared}
                      onChange={(e) =>
                        handleTableChange(i, "studentsAppeared", e.target.value)
                      }
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      disabled={readOnly}
                      className="w-full p-1"
                      value={row.studentsPassed}
                      onChange={(e) =>
                        handleTableChange(i, "studentsPassed", e.target.value)
                      }
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      disabled={readOnly}
                      className="w-full p-1"
                      value={row.remarks}
                      onChange={(e) =>
                        handleTableChange(i, "remarks", e.target.value)
                      }
                    />
                  </td>
                  {!readOnly && (
                    <td className="border p-1 text-center">
                      <button
                        type="button"
                        className="text-red-500 text-xs"
                        onClick={() => removeSubjectRow(i)}
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!readOnly && (
            <button
              type="button"
              className="mt-2 text-sm text-blue-600"
              onClick={addSubjectRow}
            >
              + Add Row
            </button>
          )}
        </div>
      </div>

      {/* 5(b) Additional Info */}
      <div>
        <label className="font-semibold">
          5(b) Any Other Information to item 5
        </label>
        <textarea
          disabled={readOnly}
          className="w-full border p-2 rounded mt-1"
          name="examResults"
          value={form.examResults || ""}
          onChange={handleChange}
        />
      </div>

      {/* 6 - Contributions */}
      <div>
        <label className="font-semibold block">6. Contributions</label>
        {[
          {
            name: "labDevelopment",
            label: "i) Laboratory or workshop development",
          },
          {
            name: "modelsAndAids",
            label: "ii) Preparation of models, demo equipment, teaching aids",
          },
          { name: "shortCourses", label: "iii) Short courses conducted" },
        ].map((item) => (
          <div key={item.name} className="mt-1">
            <label className="text-sm">{item.label}</label>
            <textarea
              disabled={readOnly}
              name={item.name}
              value={form[item.name] || ""}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1"
            />
          </div>
        ))}
      </div>

      {/* 7(a) Students who obtained degrees */}
      <div>
        <label className="font-semibold block">
          7(a) No. of students who have obtained research degrees
        </label>
        <div className="grid grid-cols-3 gap-4 mt-2">
          {["phd", "mphil", "pg"].map((level) => (
            <div key={level}>
              <label className="capitalize text-sm">{level}</label>
              <input
                type="number"
                min="0"
                step="1"
                disabled={readOnly}
                value={rc.qualified?.[level] ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    researchGuidance: {
                      ...rc,
                      qualified: {
                        ...rc.qualified,
                        [level]: e.target.value,
                      },
                      registered: rc.registered,
                    },
                  })
                }
                className="w-full border rounded p-1"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 7(b) Students registered */}
      <div>
        <label className="font-semibold block mt-4">
          7(b) Students registered for research
        </label>
        <div className="grid grid-cols-4 gap-4 mt-2">
          {["phd", "pg", "pgDiploma", "ug"].map((level) => (
            <div key={level}>
              <label className="capitalize text-sm">{level}</label>
              <input
                type="number"
                min="0"
                step="1"
                disabled={readOnly}
                value={rc.registered?.[level] ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    researchGuidance: {
                      ...rc,
                      registered: {
                        ...rc.registered,
                        [level]: e.target.value,
                      },
                      qualified: rc.qualified,
                    },
                  })
                }
                className="w-full border rounded p-1"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 7(c) Papers Published */}
      <div>
        <label className="font-semibold">7(c) Papers Published</label>
        {(form.papersPublished || []).map((item, index) => (
          <div key={index} className="flex items-center gap-2 mt-1">
            <input
              type="text"
              disabled={readOnly}
              className="w-full border p-1 rounded"
              value={item}
              onChange={(e) =>
                handleArrayChange("papersPublished", index, e.target.value)
              }
            />
            {!readOnly && (
              <button
                type="button"
                className="text-red-500 text-sm"
                onClick={() => removeArrayItem("papersPublished", index)}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        {!readOnly && (
          <button
            type="button"
            className="mt-2 text-sm text-blue-600"
            onClick={() => addArrayItem("papersPublished")}
          >
            + Add Paper
          </button>
        )}
      </div>

      {/* 7(d) Research Instruments */}
      <div className="mt-4">
        <label className="font-semibold">
          7(d) Instrumentation / Innovations
        </label>
        {(form.researchInstruments || []).map((item, index) => (
          <div key={index} className="flex items-center gap-2 mt-1">
            <input
              type="text"
              disabled={readOnly}
              className="w-full border p-1 rounded"
              value={item}
              onChange={(e) =>
                handleArrayChange("researchInstruments", index, e.target.value)
              }
            />
            {!readOnly && (
              <button
                type="button"
                className="text-red-500 text-sm"
                onClick={() => removeArrayItem("researchInstruments", index)}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        {!readOnly && (
          <button
            type="button"
            className="mt-2 text-sm text-blue-600"
            onClick={() => addArrayItem("researchInstruments")}
          >
            + Add Instrument
          </button>
        )}
      </div>
    </div>
  );
}

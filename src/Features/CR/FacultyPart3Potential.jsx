import React from "react";

export default function FacultyPart3Potential({ form, setForm }) {

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleResearchCountChange = (e, level) => {
    const updatedCounts = { ...form.researchCounts, [level]: e.target.value };
    setForm({ ...form, researchCounts: updatedCounts });
  };
    console.log(form)

  return (
    <div className="border rounded p-4 space-y-4">
      <h3 className="text-lg font-bold mb-2">
        Part III: Research & Contributions
      </h3>

      <div>
        <label className="font-semibold">Exam Results Summary</label>
        <textarea
          className="w-full border p-2 rounded mt-1"
          name="examResults"
          value={form.examResults}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="font-semibold">
          Your Contributions (workshops, models, teaching aids, etc.)
        </label>
        <textarea
          className="w-full border p-2 rounded mt-1"
          name="contributions"
          value={form.contributions}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {["phd", "mphil", "pg", "ug"].map((level) => (
          <div key={level}>
            <label className="capitalize">{level} Students Guided</label>
            <input
              type="number"
              className="w-full border p-1 rounded"
              value={form.researchCounts[level]}
              onChange={(e) => handleResearchCountChange(e, level)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

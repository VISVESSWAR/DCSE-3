import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { UserData } from "../../context/UserContext";
import { useParams } from "react-router-dom";

export default function SelfAssessmentForm() {
  const { user } = UserData();
  const { reportId } = useParams();

  const [form, setForm] = useState({
  examResults: "85% pass overall. Excellent results in DSA and AI.",
  contributions: "Organized coding workshops, developed lab manuals.",
  researchCounts: { phd: 2, mphil: 1, pg: 4, ug: 8 },
  subjectsTaught: [
    {
      subject: "Data Structures",
      contactHours: 45,
      studentsAppeared: 60,
      studentsPassed: 58,
      remarks: "Well performed",
    },
    {
      subject: "AI Basics",
      contactHours: 40,
      studentsAppeared: 55,
      studentsPassed: 50,
      remarks: "Improved over the term",
    },
  ],
  memberships: ["CSI", "IEEE"],
  booksOrGuides: ["Guide to Data Structures", "AI Handbook"],
  conferences: ["International Conf. on ML 2024"],
  consultingWork: ["Industry collaboration with ABC Corp"],
  papersPublished: [
    "Efficient Algorithms for Sorting",
    "AI in Education Systems",
  ],
  researchInstruments: ["TensorFlow Models", "Neural Net Simulators"],
  additionalQualifications: ["PhD in AI", "M.Tech in CSE"],
  pastoralFunctions: ["Mentor for 2nd year students"],
  attachments: [],
  otherContributions: ["Organized NSS camp", "Internal ISO auditor"],
  facultySignature: "DR. JOHN DOE",
});

  const [faculty, setFaculty] = useState({});
  const [fileUploads, setFileUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/crreport/report/${reportId}`,
          {
            headers: { "x-user-email": user.email },
          }
        );
        const report = res.data;
        setFaculty(report.faculty);
        if (report.selfAssessment) {
          setForm((f) => ({
            ...f,
            ...report.selfAssessment,
            researchCounts: report.selfAssessment.researchCounts || {
              phd: 0,
              mphil: 0,
              pg: 0,
              ug: 0,
            },
            subjectsTaught: report.selfAssessment.subjectsTaught || [],
          }));
        }
      } catch (err) {
        toast.error("Failed to load CR Report");
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role !== "hod") {
      fetchReport();
    } else {
      setLoading(false);
    }
  }, [user, reportId]);

  const handleField = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleArrayField = (field, index, value) => {
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

  const handleSubjectChange = (index, key, value) => {
    const updated = [...form.subjectsTaught];
    updated[index] = { ...updated[index], [key]: value };
    setForm({ ...form, subjectsTaught: updated });
  };

  const handleFileChange = (e) => {
    setFileUploads(Array.from(e.target.files));
  };

  const confirmSignature = () => {
    if (window.confirm(`Sign this report as ${user.name.toUpperCase()}?`)) {
      setForm((f) => ({ ...f, facultySignature: user.name.toUpperCase() }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("examResults", form.examResults);
      data.append("contributions", form.contributions);
      data.append("facultySignature", form.facultySignature);
      data.append("researchCounts", JSON.stringify(form.researchCounts));
      data.append("subjectsTaught", JSON.stringify(form.subjectsTaught));
      [
        "memberships",
        "booksOrGuides",
        "consultingWork",
        "papersPublished",
        "researchInstruments",
        "additionalQualifications",
        "pastoralFunctions",
        "otherContributions",
      ].forEach((key) => {
        data.append(key, JSON.stringify(form[key]));
      });
      fileUploads.forEach((file) => data.append("attachments", file));

      await axios.post(
        `http://localhost:5000/api/crreport/${reportId}/self-assessment/attachments`,
        data,
        {
          headers: { "x-user-email": user.email },
        }
      );

      toast.success("Self-assessment submitted successfully!");
    } catch (err) {
      toast.error("Submission failed");
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto bg-white p-6 rounded shadow space-y-6"
    >
      <h2 className="text-2xl font-bold text-center">
        Faculty Self-Assessment
      </h2>

      <div className="border rounded p-4 space-y-2 text-sm">
        <div>
          <strong>Name:</strong> {faculty.name}
        </div>
        <div>
          <strong>Designation:</strong> {faculty.designation}
        </div>
        <div>
          <strong>DOB:</strong> {new Date(faculty.dob).toLocaleDateString()}
        </div>
        <div>
          <strong>Department:</strong> {faculty.department}
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold">Subjects Taught</h3>
        {form.subjectsTaught.map((subj, idx) => (
          <div key={idx} className="grid grid-cols-5 gap-2 items-center">
            <input
              className="border p-1 rounded"
              placeholder="Subject"
              value={subj.subject}
              onChange={(e) =>
                handleSubjectChange(idx, "subject", e.target.value)
              }
            />
            <input
              className="border p-1 rounded"
              placeholder="Contact Hrs"
              type="number"
              value={subj.contactHours}
              onChange={(e) =>
                handleSubjectChange(idx, "contactHours", e.target.value)
              }
            />
            <input
              className="border p-1 rounded"
              placeholder="Appeared"
              type="number"
              value={subj.studentsAppeared}
              onChange={(e) =>
                handleSubjectChange(idx, "studentsAppeared", e.target.value)
              }
            />
            <input
              className="border p-1 rounded"
              placeholder="Passed"
              type="number"
              value={subj.studentsPassed}
              onChange={(e) =>
                handleSubjectChange(idx, "studentsPassed", e.target.value)
              }
            />
            <input
              className="border p-1 rounded"
              placeholder="Remarks"
              value={subj.remarks}
              onChange={(e) =>
                handleSubjectChange(idx, "remarks", e.target.value)
              }
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setForm({ ...form, subjectsTaught: [...form.subjectsTaught, {}] })
          }
          className="text-blue-600 text-sm mt-1"
        >
          + Add Subject
        </button>
      </div>

      {/* Exam Results */}
      <div>
        <label className="font-semibold">Exam Results Summary</label>
        <textarea
          className="w-full border p-2 rounded mt-1"
          rows={3}
          name="examResults"
          value={form.examResults}
          onChange={handleField}
        />
      </div>

      {/* Contributions */}
      <div>
        <label className="font-semibold">
          Your Contributions (workshops, models, teaching aids, etc.)
        </label>
        <textarea
          className="w-full border p-2 rounded mt-1"
          rows={3}
          name="contributions"
          value={form.contributions}
          onChange={handleField}
        />
      </div>

      {/* Repeated List Fields */}
      {[
        "papersPublished",
        "researchInstruments",
        "additionalQualifications",
        "booksOrGuides",
        "memberships",
        "conferences",
        "consultingWork",
        "pastoralFunctions",
        "otherContributions",
      ].map((field) => (
        <div key={field}>
          <label className="font-semibold capitalize">
            {field.replace(/([A-Z])/g, " $1")}
          </label>
          {form[field].map((item, idx) => (
            <div key={idx} className="flex gap-2 mt-1">
              <input
                type="text"
                value={item}
                onChange={(e) => handleArrayField(field, idx, e.target.value)}
                className="w-full border p-1 rounded"
              />
              <button
                type="button"
                onClick={() => removeRow(field, idx)}
                className="text-red-500 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addRow(field)}
            className="text-blue-600 text-sm mt-1"
          >
            + Add {field.replace(/([A-Z])/g, " $1")}
          </button>
        </div>
      ))}

      {/* Research Counts */}
      <div className="grid grid-cols-4 gap-4">
        {["phd", "mphil", "pg", "ug"].map((level) => (
          <div key={level}>
            <label className="capitalize">{level} Students Guided</label>
            <input
              type="number"
              className="w-full border p-1 rounded"
              value={form.researchCounts[level]}
              onChange={(e) =>
                setForm({
                  ...form,
                  researchCounts: {
                    ...form.researchCounts,
                    [level]: e.target.value,
                  },
                })
              }
            />
          </div>
        ))}
      </div>

      {/* File Upload */}
      <div>
        <label className="font-semibold">Upload Supporting Documents</label>
        <input
          type="file"
          multiple
          className="block w-full mt-2"
          onChange={handleFileChange}
        />
      </div>

      {/* Signature */}
      <div className="mt-4">
        <label className="font-semibold">Signature</label>
        <br />
        {form.facultySignature ? (
          <div className="text-green-600 font-bold mt-1">
            {form.facultySignature}
          </div>
        ) : (
          <button
            type="button"
            onClick={confirmSignature}
            className="text-blue-600 underline"
          >
            Click to Sign with your Name
          </button>
        )}
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        Submit Self-Assessment
      </button>
    </form>
  );
}

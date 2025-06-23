import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import HODPart1Performance from "./HODPart1Performance";
import HODPart2Assessment from "./HODPart2Assessment";
import FacultyPart3Potential from "./FacultyPart3Potential";
import FacultyPart4Research from "./FacultyPart4Research";
import FacultySignatures from "./FacultySignatures";
import HODSignaturesPart1 from "./HODSignaturesPart1";
import HODSignaturesPart2 from "./HODSignaturesPart2";
export default function FullReport({ user }) {
  const { reportId } = useParams();
  const [form, setForm] = useState({
    examResults: "",
    contributions: "",
    researchCounts: { phd: 0, mphil: 0, pg: 0, ug: 0 },
    subjectsTaught: [],
    memberships: [],
    booksOrGuides: [],
    conferences: [],
    consultingWork: [],
    papersPublished: [],
    researchInstruments: [],
    additionalQualifications: [],
    pastoralFunctions: [],
    attachments: [],
    otherContributions: [],
    facultySignature: "",
    hodPart1: {}, // <-- mapped to hodSection.performance
    hodPart2: {}, // <-- mapped to hodSection.potential
  });

  const [faculty, setFaculty] = useState({});
  const [fileUploads, setFileUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const isHOD = user?.role === "hod";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/crreport/report/${reportId}`,
          {
            headers: { "x-user-email": user.email },
          }
        );
        const report = res.data;
        console.log(report);

        setFaculty(report.faculty || {});

        setForm((prev) => ({
          ...prev,
          ...report.selfAssessment,
          hodPart1: report.hodSection?.performance || {},
          hodPart2: report.hodSection?.potential || {},
          researchCounts: report.selfAssessment?.researchCounts || {
            phd: 0,
            mphil: 0,
            pg: 0,
            ug: 0,
          },
          subjectsTaught: report.selfAssessment?.subjectsTaught || [],
        }));
      } catch (err) {
        toast.error("Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reportId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      // Append self-assessment (excluding HOD parts)
      const { hodPart1, hodPart2, ...selfAssessmentOnly } = form;

      data.append("selfAssessment", JSON.stringify(selfAssessmentOnly));

      // Append HOD section
      const hodSection = {
        performance: hodPart1,
        potential: hodPart2,
      };
      data.append("hodSection", JSON.stringify(hodSection));

      // Append attachments
      fileUploads.forEach((file) => data.append("attachments", file));

      await axios.post(
        `http://localhost:5000/api/crreport/${reportId}/self-assessment/attachments`,
        data,
        { headers: { "x-user-email": user.email } }
      );

      toast.success("CR Report submitted successfully");
    } catch (err) {
      toast.error("Submission failed");
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-auto bg-white p-6 rounded shadow space-y-6"
    >
      <h2 className="text-2xl font-bold text-center text-[#145DA0] mb-4">
        Confidential Report (CR) Full Report
      </h2>

      {/* Faculty Basic Info (shown at top of Page 1 & 4) */}
      <div className="space-y-2 border p-4 rounded text-sm">
        <div>
          <strong>Name:</strong> {faculty.name}
        </div>
        <div>
          <strong>DOB:</strong>{" "}
          {faculty.dob && new Date(faculty.dob).toLocaleDateString()}
        </div>
        <div>
          <strong>Designation:</strong> {faculty.designation}
        </div>
        <div>
          <strong>Department:</strong> {faculty.department}
        </div>
        <div>
          <strong>Scale of Pay / Present Pay:</strong> {faculty.scaleOfPay} /{" "}
          {faculty.presentPay}
        </div>
        <div>
          <strong>Post Held & Appointment Type:</strong> {faculty.postHeld}
        </div>
      </div>

      {/* Part I: Performance Assessment */}
      <HODPart1Performance
        data={{ ...form.hodPart1, faculty }}
        onChange={(key, value) =>
          setForm((prev) => ({
            ...prev,
            hodPart1: {
              ...prev.hodPart1,
              [key]: value,
            },
          }))
        }
        readOnly={!isHOD}
      />
      {isHOD && (
        <HODSignaturesPart1 form={form} setForm={setForm} user={user} />
      )}
      {/* Part II: Potential Assessment */}
      <HODPart2Assessment
        data={form.hodPart2}
        onChange={(key, value) =>
          setForm((prev) => ({
            ...prev,
            hodPart2: {
              ...prev.hodPart2,
              [key]: value,
            },
          }))
        }
        readOnly={!isHOD}
      />
      {isHOD && (
        <HODSignaturesPart2 form={form} setForm={setForm} user={user} />
      )}

      {/* Part III: Faculty Self-Assessment */}
      <FacultyPart3Potential
        form={form}
        setForm={setForm}
        user={user}
        faculty={faculty}
      />

      {/* Part IV: Faculty Research */}
      <FacultyPart4Research
        form={form}
        setForm={setForm}
        fileUploads={fileUploads}
        setFileUploads={setFileUploads}
      />

      {/* Signatures */}
      <FacultySignatures form={form} setForm={setForm} user={user} />

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded font-semibold mt-4"
      >
        Submit CR Report
      </button>
    </form>
  );
}

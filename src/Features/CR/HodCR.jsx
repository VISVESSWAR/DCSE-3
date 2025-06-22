// Updated GenerateCR.jsx component
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { UserData } from "../../context/UserContext";
import { toast } from "react-hot-toast";

export default function HodCR() {
  const { user } = UserData();
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [hodSection, setHodSection] = useState({});
  const [facultySection, setFacultySection] = useState({});

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/crreport/report/${reportId}`,
          {
            headers: { "x-user-email": user.email },
          }
        );
        setReport(res.data);

        setFacultySection(res.data.selfAssessment || {});
        setHodSection(res.data.hodSection || {});
      } catch (err) {
        toast.error("Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const handleHodChange = (e) => {
    const { name, value } = e.target;
    setHodSection((s) => ({ ...s, [name]: value }));
  };

  const handleHodSubmit = async () => {
    setUpdating(true);
    try {
      await axios.post(
        `http://localhost:5000/api/crreport/${reportId}/hod-section`,
        hodSection,
        {
          headers: { "x-user-email": user.email },
        }
      );
      toast.success("HOD section saved");
    } catch (err) {
      toast.error("Failed to submit HOD section");
    } finally {
      setUpdating(false);
    }
  };

  const downloadPDF = () => {
    window.open(
      `http://localhost:5000/api/crreport/${reportId}/download`,
      "_blank"
    );
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;

  const isFaculty = user.role === "faculty";
  const isHOD = user.role === "hod";

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow text-sm">
      <h2 className="text-xl font-bold mb-4">
        CR Report: {report.faculty?.name}
      </h2>

      {/* Pages 1–3: HOD Section */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">Part I – HOD Evaluation</h3>
        {[
          "controlClass",
          "classRecords",
          "contributions",
          "researchAbility",
          "professionalStanding",
          "extraCurricular",
          "willingness",
          "lapses",
          "overallRating",
        ].map((field) => (
          <div key={field} className="mb-2">
            <label className="block font-medium capitalize">
              {field.replace(/([A-Z])/g, " $1")}
            </label>
            <textarea
              className="border rounded w-full p-2"
              name={field}
              value={hodSection[field] || ""}
              onChange={handleHodChange}
              readOnly={!isHOD}
            />
          </div>
        ))}

        <h3 className="font-semibold mt-4">Part II – Potential Assessment</h3>
        {[
          "physicalCapacity",
          "stability",
          "mentalCapacity",
          "aptitude",
          "abilityToManage",
          "getAlong",
          "academicLeadership",
          "generalAppraisal",
          "specialRemarks",
          "fitness",
        ].map((field) => (
          <div key={field} className="mb-2">
            <label className="block font-medium capitalize">
              {field.replace(/([A-Z])/g, " $1")}
            </label>
            <textarea
              className="border rounded w-full p-2"
              name={`potential.${field}`}
              value={hodSection?.potential?.[field] || ""}
              onChange={(e) =>
                setHodSection((s) => ({
                  ...s,
                  potential: { ...s.potential, [field]: e.target.value },
                }))
              }
              readOnly={!isHOD}
            />
          </div>
        ))}
        {isHOD && (
          <button
            onClick={handleHodSubmit}
            disabled={updating}
            className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
          >
            {updating ? "Saving..." : "Submit HOD Section"}
          </button>
        )}
      </div>

      {/* Pages 4–5: Self Assessment */}
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Part III – Self Assessment
        </h3>
        {facultySection.subjectsTaught?.length > 0 && (
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Subject</th>
                  <th className="border p-2">Hrs</th>
                  <th className="border p-2">Appeared</th>
                  <th className="border p-2">Passed</th>
                  <th className="border p-2">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {facultySection.subjectsTaught.map((subj, idx) => (
                  <tr key={idx}>
                    <td className="border p-1">{subj.subject}</td>
                    <td className="border p-1">{subj.contactHours}</td>
                    <td className="border p-1">{subj.studentsAppeared}</td>
                    <td className="border p-1">{subj.studentsPassed}</td>
                    <td className="border p-1">{subj.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {[
          "examResults",
          "contributions",
          "memberships",
          "papersPublished",
          "consultingWork",
          "booksOrGuides",
          "pastoralFunctions",
          "additionalQualifications",
          "otherContributions",
        ].map(
          (field) =>
            facultySection[field]?.length > 0 && (
              <div key={field} className="mb-2">
                <label className="font-medium capitalize">
                  {field.replace(/([A-Z])/g, " $1")}
                </label>
                <ul className="list-disc ml-5">
                  {Array.isArray(facultySection[field]) ? (
                    facultySection[field].map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))
                  ) : (
                    <li>{facultySection[field]}</li>
                  )}
                </ul>
              </div>
            )
        )}
      </div>

      {/* PDF Download */}
      <div className="mt-6">
        <button
          onClick={downloadPDF}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Download Final PDF
        </button>
      </div>
    </div>
  );
}

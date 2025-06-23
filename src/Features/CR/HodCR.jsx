// Updated GenerateCR.jsx component with complete HOD section
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
// import { useParams } from "react-router-dom";
// import { UserData } from "../../context/UserContext";

// export default function HodCR() {
//   const { user } = UserData();
//   const { reportId } = useParams();
export default function HodCR({ reportId, user }) {

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
    const keys = name.split(".");
    if (keys.length === 2) {
      setHodSection((s) => ({
        ...s,
        [keys[0]]: { ...s[keys[0]], [keys[1]]: value },
      }));
    } else {
      setHodSection((s) => ({ ...s, [name]: value }));
    }
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
    if (user.role !== "hod") {
      toast.error("Only HOD can download this report.");
      return;
    }

    axios
      .get(`http://localhost:5000/api/crreport/${reportId}/download`, {
        headers: { "x-user-email": user.email },
        responseType: "blob",
      })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `CR_Report_${reportId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(() => {
        toast.error("Download failed");
      });
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
        <h3 className="text-lg font-bold mb-4">
          Part I: Performance Assessment (for HOD)
        </h3>

        <div className="space-y-2 rounded-md border p-4">
          <div className="font-semibold">
            5. Ability as a teacher as evidenced from the performance of
            students in the subject taught by him:
          </div>
          <div className="ml-6">
            i) Control over the class and popularity among students:
            <input
              name="performance.controlClass"
              value={hodSection.performance?.controlClass || ""}
              onChange={handleHodChange}
              className="w-full rounded border px-2 py-1 mt-1"
              disabled={!isHOD}
            />
          </div>
          <div className="ml-6">
            ii) Students counselling and interest in student welfare:
            <input
              name="performance.studentCounseling"
              value={hodSection.performance?.studentCounseling || ""}
              onChange={handleHodChange}
              className="w-full rounded border px-2 py-1 mt-1"
              disabled={!isHOD}
            />
          </div>
          <div className="ml-6">
            iii) Average percentage of pass in the subject taught by him:
            <input
              name="performance.avgPassPercentage"
              value={hodSection.performance?.avgPassPercentage || ""}
              onChange={handleHodChange}
              className="w-full rounded border px-2 py-1 mt-1"
              disabled={!isHOD}
            />
          </div>
          <div>
            <span className="font-semibold">
              6.* Comments on maintenance of class records, thoroughness and
              promptness in internal evaluation:
            </span>
            <input
              name="performance.classRecords"
              value={hodSection.performance?.classRecords || ""}
              onChange={handleHodChange}
              className="w-full rounded border px-2 py-1 mt-1"
              disabled={!isHOD}
            />
          </div>
          <div>
            <span className="font-semibold">
              7. Contributions to development of the institution (labs, guides,
              courses, etc.):
            </span>
            <textarea
              name="performance.contributions"
              value={hodSection.performance?.contributions || ""}
              onChange={handleHodChange}
              className="w-full rounded border px-2 py-1 mt-1"
              disabled={!isHOD}
              rows="3"
            ></textarea>
          </div>
          <div>
            <span className="font-semibold">
              8. Interest in and ability for research:
            </span>
            <textarea
              name="performance.researchAbility"
              value={hodSection.performance?.researchAbility || ""}
              onChange={handleHodChange}
              className="w-full rounded border px-2 py-1 mt-1"
              disabled={!isHOD}
              rows="3"
            ></textarea>
          </div>
          <div>
            <span className="font-semibold">9. Professional standing:</span>
            <input
              name="performance.professionalStanding"
              value={hodSection.performance?.professionalStanding || ""}
              onChange={handleHodChange}
              className="w-full rounded border px-2 py-1 mt-1"
              disabled={!isHOD}
            />
          </div>
          <div>
            <span className="font-semibold">
              10. Extra-curricular responsibilities held:
            </span>
            <input
              name="performance.extraCurricular"
              value={hodSection.performance?.extraCurricular || ""}
              onChange={handleHodChange}
              className="w-full rounded border px-2 py-1 mt-1"
              disabled={!isHOD}
            />
          </div>
          <div>
            <span className="font-semibold">
              11. Willingness to accept work and cooperate:
            </span>
            <input
              name="performance.willingness"
              value={hodSection.performance?.willingness || ""}
              onChange={handleHodChange}
              className="w-full rounded border px-2 py-1 mt-1"
              disabled={!isHOD}
            />
          </div>
          <div>
            <span className="font-semibold">
              12. Lapses pointed out/punishment awarded:
            </span>
            <input
              name="performance.lapses"
              value={hodSection.performance?.lapses || ""}
              onChange={handleHodChange}
              className="w-full rounded border px-2 py-1 mt-1"
              disabled={!isHOD}
            />
          </div>
          <div>
            <span className="font-semibold">13. Overall rating:</span>
            <input
              name="performance.overallRating"
              value={hodSection.performance?.overallRating || ""}
              onChange={handleHodChange}
              className="w-full rounded border px-2 py-1 mt-1"
              disabled={!isHOD}
            />
          </div>
        </div>

        <div className="pt-6">
          <h3 className="text-lg font-bold mb-2">
            Part II – Potential Assessment
          </h3>

          <div className="pt-2">
            <label className="font-bold">
              A. (i) Physical Capacity and general demeanour
            </label>
            <input
              type="text"
              name="potential.physicalCapacity"
              value={hodSection.potential?.physicalCapacity || ""}
              onChange={handleHodChange}
              disabled={!isHOD}
              className="w-full rounded border px-3 py-2 mt-1"
            />
            <label className="font-bold mt-2 block">
              (ii) Stability, Poise, Fairness, Dependability
            </label>
            <input
              type="text"
              name="potential.stability"
              value={hodSection.potential?.stability || ""}
              onChange={handleHodChange}
              disabled={!isHOD}
              className="w-full rounded border px-3 py-2 mt-1"
            />
            <label className="font-bold mt-2 block">
              (iii) Mental Capacity: Analytical ability, power of expression,
              ability to participate in discussions.
            </label>
            <input
              type="text"
              name="potential.mentalCapacity"
              value={hodSection.potential?.mentalCapacity || ""}
              onChange={handleHodChange}
              disabled={!isHOD}
              className="w-full rounded border px-3 py-2 mt-1"
            />
          </div>

          <div className="pt-2">
            <label className="font-bold">
              B. (i) Aptitude for work: Aptitude, initiative, self-reliance,
              thoroughness, sense of responsibility
            </label>
            <input
              type="text"
              name="potential.aptitude"
              value={hodSection.potential?.aptitude || ""}
              onChange={handleHodChange}
              disabled={!isHOD}
              className="w-full rounded border px-3 py-2 mt-1"
            />
            <label className="font-bold mt-2 block">
              (ii) Ability to manage: Capacity to take decisions, ability to
              plan and programme, supervise and guide and control
            </label>
            <input
              type="text"
              name="potential.abilityToManage"
              value={hodSection.potential?.abilityToManage || ""}
              onChange={handleHodChange}
              disabled={!isHOD}
              className="w-full rounded border px-3 py-2 mt-1"
            />
          </div>

          <div className="pt-2">
            <label className="font-bold">
              C. (i) Ability to get along: Tact, helpfulness to fellow official,
              subordinates and to the public
            </label>
            <input
              type="text"
              name="potential.getAlong"
              value={hodSection.potential?.getAlong || ""}
              onChange={handleHodChange}
              disabled={!isHOD}
              className="w-full rounded border px-3 py-2 mt-1"
            />
            <label className="font-bold mt-2 block">
              (ii) Potential for Academic leadership.
            </label>
            <input
              type="text"
              name="potential.academicLeadership"
              value={hodSection.potential?.academicLeadership || ""}
              onChange={handleHodChange}
              disabled={!isHOD}
              className="w-full rounded border px-3 py-2 mt-1"
            />
            <label className="font-bold mt-2 block">
              (iii) General appraisal of the officers good and bad qualities in
              a narrative form, particularly those pertaining to his / her
              integrity and ability to correct himself/herself, if his faults
              are pointed out.
            </label>
            <input
              type="text"
              name="potential.generalAppraisal"
              value={hodSection.potential?.generalAppraisal || ""}
              onChange={handleHodChange}
              disabled={!isHOD}
              className="w-full rounded border px-3 py-2 mt-1"
            />
            <label className="font-bold mt-2 block">
              (iv) Special remarks or commendations if any.
            </label>
            <input
              type="text"
              name="potential.specialRemarks"
              value={hodSection.potential?.specialRemarks || ""}
              onChange={handleHodChange}
              disabled={!isHOD}
              className="w-full rounded border px-3 py-2 mt-1"
            />
          </div>

          <div className="pt-2">
            <label className="font-bold">
              D. Fitness for regularization / Declaration of completion of
              probation / confirmation / promotion.
            </label>
            <input
              type="text"
              name="potential.fitness"
              value={hodSection.potential?.fitness || ""}
              onChange={handleHodChange}
              disabled={!isHOD}
              className="w-full rounded border px-3 py-2 mt-1"
            />
          </div>
        </div>

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
      {/* <div>
        <h3 className="text-lg font-semibold mb-2">
          Part III – Self Assessment
        </h3>
      </div> */}

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

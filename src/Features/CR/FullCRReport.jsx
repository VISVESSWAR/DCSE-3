import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { UserData } from "../../context/UserContext";
import { toast } from "react-hot-toast";

import HodCR from "./HodCR";
import SelfAssessmentForm from "./SelfAssessment";

export default function FullCRReport() {
  const { user } = UserData();
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
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
        setReport(res.data);
      } catch (err) {
        toast.error("Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchReport();
  }, [user, reportId]);

  if (loading) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow space-y-10">
      <h2 className="text-2xl font-bold text-center mb-4">
        Confidential Report for: {report?.faculty?.name}
      </h2>

      {/* Pages 1–3 (HOD View & Fill) */}
      <div className="border p-4 rounded-md shadow-sm">
        <HodCR reportId={reportId} user={user} />
      </div>

      {/* Pages 4–5 (Faculty View & Fill) */}
      <div className="border p-4 rounded-md shadow-sm">
        <SelfAssessmentForm reportId={reportId} user={user} />
      </div>
    </div>
  );
}

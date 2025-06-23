// src/components/HODSignatures.jsx
import React from "react";

export default function HODSignatures({ form, setForm, readOnly }) {
  return (
    <div className="border rounded p-4 space-y-4 mt-4 text-sm">
      <h3 className="text-lg font-bold text-[#145DA0] mb-2">Signatures</h3>

      <div>
        <label className="font-semibold block">Signature of Reporting Officer (HOD):</label>
        <input
          type="text"
          name="reportingOfficerSignature"
          value={form.reportingOfficerSignature || ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              reportingOfficerSignature: e.target.value,
            }))
          }
          disabled={readOnly}
          className="w-full border rounded px-2 py-1 mt-1"
        />
      </div>

      <div>
        <label className="font-semibold block">Signature of Reviewing Officer:</label>
        <input
          type="text"
          name="reviewingOfficerSignature"
          value={form.reviewingOfficerSignature || ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              reviewingOfficerSignature: e.target.value,
            }))
          }
          disabled={readOnly}
          className="w-full border rounded px-2 py-1 mt-1"
        />
      </div>

      <div>
        <label className="font-semibold block">Signature of Accepting Authority:</label>
        <input
          type="text"
          name="acceptingAuthoritySignature"
          value={form.acceptingAuthoritySignature || ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              acceptingAuthoritySignature: e.target.value,
            }))
          }
          disabled={readOnly}
          className="w-full border rounded px-2 py-1 mt-1"
        />
      </div>
    </div>
  );
}

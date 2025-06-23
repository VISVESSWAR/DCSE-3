import React from "react";
import ConfirmedSignature from "./ConfirmedSiganture";

export default function HODSignaturesPart1({ form, setForm, user }) {
  const sig = form.hodPart1?.performanceAssessmentSignature || {};

  const confirm = (roleKey) => {
    if (
      window.confirm(`Sign as ${user.name.toUpperCase()} for ${roleKey}?`)
    ) {
      const newEntry = {
        name: user.name.toUpperCase(),
        date: new Date().toISOString(),
      };

      setForm((prev) => ({
        ...prev,
        hodPart1: {
          ...prev.hodPart1,
          performanceAssessmentSignature: {
            ...sig,
            [roleKey]: newEntry,
          },
        },
      }));
    }
  };

  return (
    <div className="mt-6 border rounded p-4">
      <h3 className="text-lg font-bold text-[#145DA0] mb-2">
        HOD Signatures – Performance Assessment
      </h3>

      <ConfirmedSignature
        label="Signature of Reporting Officer"
        name={sig.reportingOfficer?.name}
        date={sig.reportingOfficer?.date && new Date(sig.reportingOfficer.date).toLocaleDateString()}
        confirmed={!!sig.reportingOfficer}
        onConfirm={() => confirm("reportingOfficer")}
      />

      <ConfirmedSignature
        label="Signature of Reviewing Officer"
        name={sig.reviewingOfficer?.name}
        date={sig.reviewingOfficer?.date && new Date(sig.reviewingOfficer.date).toLocaleDateString()}
        confirmed={!!sig.reviewingOfficer}
        onConfirm={() => confirm("reviewingOfficer")}
      />

      <ConfirmedSignature
        label="Signature of Principal"
        name={sig.principal?.name}
        date={sig.principal?.date && new Date(sig.principal.date).toLocaleDateString()}
        confirmed={!!sig.principal}
        onConfirm={() => confirm("principal")}
      />
    </div>
  );
}

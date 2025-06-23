import React from "react";
import ConfirmedSignature from "./ConfirmedSiganture";

export default function HODSignaturesPart2({ form, setForm, user }) {
  const sig = form.hodPart2?.potentialAssessmentSignature || {};

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
        hodPart2: {
          ...prev.hodPart2,
          potentialAssessmentSignature: {
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
        HOD Signatures – Potential Assessment
      </h3>

      <ConfirmedSignature
        label="Signature of HOD"
        name={sig.hod?.name}
        date={sig.hod?.date && new Date(sig.hod.date).toLocaleDateString()}
        confirmed={!!sig.hod}
        onConfirm={() => confirm("hod")}
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

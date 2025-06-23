import React from "react";

export default function FacultySignatures({ form, setForm, user }) {
  const confirmSignature = () => {
    if (
      window.confirm(
        `Clicking OK will digitally sign this report as ${user.name.toUpperCase()}. This action cannot be undone. Proceed?`
      )
    ) {
      setForm((f) => ({ ...f, facultySignature: user.name.toUpperCase() }));
    }
  };

  return (
    <div className="border rounded p-4 space-y-4">
      <h3 className="text-lg font-bold mb-2">Signature Confirmation</h3>

      {form.facultySignature ? (
        <div className="text-green-600 font-bold mt-1">
          Signed as: {form.facultySignature}
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
  );
}

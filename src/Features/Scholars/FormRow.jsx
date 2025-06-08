import React from "react";

export default function FormRow({ label, children, error }) {
  return (
    <div>
      <div className="my-2 p-2 font-semibold flex justify-between">
        <label id={label} className="capitalize">{label}</label>
        {children}
      </div>
      {error && <Error></Error>}
    </div>
  );
}

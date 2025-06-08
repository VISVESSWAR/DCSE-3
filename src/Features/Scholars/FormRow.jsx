import React from "react";
import Error from "../../ui/Error";

export default function FormRow({ label, children, error }) {
  return (
    <div>
      <div className="my-2 p-2 font-semibold flex justify-between">
        <label id={label} className="capitalize text-xl">
          {label}
        </label>
        {children}
      </div>
      {error && <Error>{error}</Error>}
    </div>
  );
}

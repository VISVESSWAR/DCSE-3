import React from "react";
import Sidebar from "../../ui/Sidbear";
import { UserData } from "../../context/UserContext";

export default function Dashboard() {
  const { user } = UserData();
  return (
    <div>
      <h1 className="text-center capitalize text-3xl mt-20 font-bold">welcome {user.name}</h1>
    </div>
  );
}

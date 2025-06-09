import React from "react";
import Sidebar from "../ui/Sidbear";
import { Outlet } from "react-router-dom";
export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 bg-[#edf4fb]">
        <Outlet />
      </main>
    </div>
  );
}

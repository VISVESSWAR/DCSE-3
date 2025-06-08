import React from "react";
import Sidebar from "./Faculty/Dashboard";
import { Outlet } from "react-router-dom";
export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 ">
        <Outlet />
      </main>
    </div>
  );
}

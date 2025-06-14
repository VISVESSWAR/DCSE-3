// import { useState } from "react";
import "./App.css";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import FacultyLogin from "./pages/Faculty/Login";
import ODRequest from "./Features/OD/ODRequest";
import ODHistory from "./Features/OD/ODHistory";
import AddPublication from "./Features/Publications/AddPublication";
import Publications from "./Features/Publications/Publications";
import AddScholar from "./Features/Scholars/AddScholar";
import FacultyScholars from "./Features/Scholars/Scholars";
import { Toaster } from "react-hot-toast";
import { UserData } from "./context/UserContext";
import GenerateCR from "./Features/CR/GenerateCR";
import Dashboard from "./pages/Faculty/Dashboard";
import Signup from "./pages/Faculty/Signup";
import ProtectedRoutes from "./ui/ProtectedRoutes";
function App() {
  const { user } = UserData();
  return (
    <>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<Home />}>
            <Route path="login" element={<FacultyLogin />} />
            <Route path="signup" element={<Signup />} />

            <Route
              element={
                <ProtectedRoutes>
                  <Outlet />
                </ProtectedRoutes>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="scholars" element={<FacultyScholars />} />
              <Route path="scholar/add" element={<AddScholar />} />
              <Route path="OD" element={<ODHistory />} />
              <Route path="OD/new" element={<ODRequest />} />
              <Route path="publications" element={<Publications />} />
              <Route path="publication/add" element={<AddPublication />} />
              <Route path="CR" element={<GenerateCR />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        containerStyle={{ margin: "10px" }}
        gutter={12}
        toastOptions={{
          success: {
            duration: 3000,
          },
          error: {
            duration: 5000,
          },
          style: {
            fontSize: "16px",
            maxWidth: "500px",
            padding: "16px 24px",
            backgroundColor: "#ffffff",
            color: "var(--color-grey-700)",
          },
        }}
      />
    </>
  );
}

export default App;

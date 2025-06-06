import { useState } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import FacultyLogin from "./pages/Faculty/Login";
import FacultyScholars from "./Features/Scholars/Scholars";
import ODRequest from "./Features/OD/ODRequest";
import ODHistory from "./Features/OD/ODHistory";
import AddPublication from "./Features/Publications/AddPublication";
import Publications from "./Features/Publications/Publications";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="login" element={<FacultyLogin />} />
        <Route path="scholars" element={<FacultyScholars />} />
        <Route path="scholars/add" element={<FacultyScholars />} />
        <Route path="OD" element={<ODHistory />} />
        <Route path="OD/new" element={<ODRequest />} />
        <Route path="publications" element={<Publications />} />
        <Route path="publications/add" element={<AddPublication />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

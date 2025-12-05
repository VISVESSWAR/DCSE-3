const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const facultyRoutes = require("./routes/facultyRoutes");
const pgScholarRoutes = require("./routes/pgScholarRoutes");
const publicationRoutes = require("./routes/publicationRoutes");
const authRoutes = require("./routes/authRoutes");
const path = require("path");
const odRoutes = require("./routes/ODRoutes");
const crReportRoutes = require("./routes/crRoutes");
const dropdownRoutes = require("./routes/dropdownRoutes");

dotenv.config();

// Log environment variables (masked for security)
console.log("\n=== SERVER STARTUP ===");
console.log("NODE_ENV:", process.env.NODE_ENV || "not set");
console.log("PORT:", process.env.PORT || 5000);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL || "not set");
console.log("EMAIL_SERVICE:", process.env.EMAIL_SERVICE || "not set");
console.log("EMAIL_USER:", process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 3)}***` : "not set");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "***set***" : "not set");
console.log("MONGO_URI:", process.env.MONGO_URI ? "***set***" : "not set");
console.log("=====================\n");

connectDB();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Faculty Portal Backend Running");
});
// Temporary middleware to simulate login
// app.use((req, res, next) => {
//   req.user = {
//     _id: '6845c010f4d7457e793dfd3d', // faculty
//     role: 'faculty',
//     // _id: "6845bcc003d9421f7b3a4cd0", // admin
//     // role: "admin",
//     // _id: "6845c02cf4d7457e793dfd41", // hod
//     // role: "hod",
//   };
//   next();
// });

app.use("/api/faculty", facultyRoutes);
app.use("/api/pgscholars", pgScholarRoutes);
app.use("/api/publications", publicationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dropdowns", dropdownRoutes);
app.use("/uploads", express.static("uploads", {
  setHeaders: (res, path) => {
    if (path.endsWith(".pdf")) {
      res.setHeader("Content-Type", "application/pdf");
    }
    if (path.endsWith(".docx")) {
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    }
  },
}));
app.use('/static', express.static(path.join(__dirname, 'assets')))
app.use("/api/odrequests", odRoutes);
app.use("/api/crreport", crReportRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

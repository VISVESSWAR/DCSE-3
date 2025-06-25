const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const {
  getOrCreateCRReport,
  updateSelfAssessment,
  updateHODSection,
  finalizeReport,
  downloadReport,
  getAllReports,
  updateFull,
  downloadCRPDF,
} = require("../controllers/CRController");
const { restrictTo } = require("../middleware/roleAccess");
const CRReport = require("../models/CRReport");
const Faculty = require("../models/Faculty");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.get("/", restrictTo("faculty", "admin", "hod"), getAllReports);
// Get or create CR report for a faculty (faculty or HOD)
router.get("/:facultyId", restrictTo("faculty"), getOrCreateCRReport);
// Create or update CR report (faculty only)
// router.post("/:facultyId", restrictTo("faculty"), async (req, res) => {
//   try {
//     const facultyId = req.params.facultyId;
//     const { year, period, facultyAcknowledgement, facultyFinalSignature } =
//       req.body;

//     // Find existing report or create new one
//     let report = await CRReport.findOne({
//       "faculty.facultyId": facultyId,
//       year,
//     });
//     if (!report) {
//       // Get faculty details
//       let faculty = await Faculty.findOne({ facultyId });
//       if (!faculty) {
//         try {
//           faculty = await Faculty.findById(facultyId);
//         } catch (e) {
//           // Not a valid ObjectId, skip
//         }
//       }
//       if (!faculty)
//         return res.status(404).json({ message: "Faculty not found" });

//       report = new CRReport({
//         faculty: {
//           facultyId: faculty.facultyId || faculty._id,
//           name: faculty.name,
//           dob: faculty.dob,
//           qualifications: faculty.areasOfExpertise?.join(", "),
//           designation: faculty.position,
//           scaleOfPay: faculty.scaleOfPay,
//           presentPay: faculty.presentPay,
//           postHeld: faculty.natureOfAppointment,
//           department: faculty.department,
//           dateOfJoining: faculty.dateOfJoining,
//         },
//         year,
//         period,
//         status: "draft",
//       });
//     }

//     // Update faculty acknowledgement
//     if (facultyAcknowledgement) {
//       report.facultyAcknowledgement = facultyAcknowledgement;
//     }

//     // Update faculty final signature
//     if (facultyFinalSignature) {
//       report.facultyFinalSignature = facultyFinalSignature;
//     }

//     await report.save();
//     res.json(report);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });
// Get individual CR report by ID (for HOD access)
router.get(
  "/report/:reportId",
  restrictTo("faculty", "hod"),
  async (req, res) => {
    try {
      const report = await CRReport.findById(req.params.reportId);
      if (!report) {
        return res.status(404).json({ message: "CR Report not found" });
      }
      res.json(report);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Update self-assessment (faculty only)
router.post(
  "/:reportId/self-assessment",
  restrictTo("faculty"),
  updateSelfAssessment
);

router.patch("/:reportId/update-full", updateFull);

router.post(
  "/:reportId/self-assessment/attachments",
  restrictTo("faculty"),
  upload.array("attachments"),
  async (req, res) => {
    try {
      const CRReport = require("../models/CRReport");
      const report = await CRReport.findById(req.params.reportId);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      if (!report.selfAssessment) {
        report.selfAssessment = { attachments: [] };
      } else if (!Array.isArray(report.selfAssessment.attachments)) {
        report.selfAssessment.attachments = [];
      }

      // Safely append new attachments
      report.selfAssessment.attachments = [
        ...(report.selfAssessment.attachments || []),
        ...req.files.map((f) => ({
          filename: f.filename,
          url: `/uploads/${f.filename}`,
        })),
      ];

      await report.save();

      res.json({ selfAssessment: report.selfAssessment });
    } catch (err) {
      console.error("Self-assessment upload error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// Update HOD section (HOD only)
router.post("/:reportId/hod-section", restrictTo("hod"), updateHODSection);

// Finalize report (HOD only)
router.post("/:reportId/finalize", restrictTo("hod"), finalizeReport);

// Download final report (faculty or HOD)
router.get("/:reportId/download", restrictTo("faculty", "hod"), downloadCRPDF);

// List all CRs    HOD review (HOD only)
router.get("/pending/hod", restrictTo("hod"), async (req, res) => {
  try {
    const CRReport = require("../models/CRReport");
    const reports = await CRReport.find({ status: "pending_hod_review" });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

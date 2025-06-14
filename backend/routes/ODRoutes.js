const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  createRequest,
  addDocs,
  updateStatus,
  getAllRequests,
  getUserRequests,
} = require("../controllers/ODController");
const { restrictTo } = require("../middleware/roleAccess");
const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Init multer
const upload = multer({ storage });

// POST /api/odrequests (with files)
router.post(
  "/",
  upload.array("documents"),
  restrictTo("faculty"),
  createRequest
);

// PUT /api/odrequests/:id/docs
router.put(
  "/:id/docs",
  upload.array("documents"),
  restrictTo("faculty"),
  addDocs
);

router.put("/:id/:status", restrictTo("hod", "admin"), updateStatus);
router.get("/", restrictTo("hod", "admin"), getAllRequests);
router.get("/user/:userId", restrictTo("faculty"), getUserRequests);

module.exports = router;

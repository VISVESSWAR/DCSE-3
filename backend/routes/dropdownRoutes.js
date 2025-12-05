const express = require("express");
const router = express.Router();
const {
  getAllOptions,
  getOptionsByCategory,
  addOption,
  updateOption,
  deleteOption,
  bulkAddOptions,
} = require("../controllers/dropdownController");
const { restrictTo } = require("../middleware/roleAccess");

// Public routes (for fetching options)
router.get("/", getAllOptions);
router.get("/category/:category", getOptionsByCategory);

// Admin-only routes (for managing options)
router.post("/", restrictTo("admin"), addOption);
router.put("/:id", restrictTo("admin"), updateOption);
router.delete("/:id", restrictTo("admin"), deleteOption);
router.post("/bulk", restrictTo("admin"), bulkAddOptions);

module.exports = router;


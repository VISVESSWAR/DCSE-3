const mongoose = require("mongoose");

const dropdownOptionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: [
      "position",
      "department",
      "gender",
      "natureOfAppointment",
      "eventType",
      "program",
    ],
  },
  value: {
    type: String,
    required: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure unique combination of category and value
dropdownOptionSchema.index({ category: 1, value: 1 }, { unique: true });

module.exports = mongoose.model("DropdownOption", dropdownOptionSchema);


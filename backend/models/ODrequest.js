const mongoose = require("mongoose");

const ODRequestSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  requestType: {
    type: String,
    required: true,
    trim: true,
  },
  eventType: {
    type: String,
    required: true,
    trim: true,
  },
  topic: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
    trim: true,
  },
  endTime: {
    type: String,
    required: true,
    trim: true,
  },
  numberOfDays: {
    type: Number,
    required: true,
  },
  departmentProcurementNeeded: {
    type: Boolean,
    default: false,
  },
  forwardToDean: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  supportingDocuments: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model("ODRequest", ODRequestSchema);

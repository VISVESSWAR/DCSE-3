const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  courseCode: String,
  courseName: String,
  semester: String,
  year: Number,
});

const facultySchema = new mongoose.Schema({
  facultyId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  position: { type: String, required: true },
  contactInfo: {
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  areasOfExpertise: [String],
  classesHandled: [classSchema],
  dob: { type: Date },
  dateOfJoining: { type: Date },
  department: { type: String },
  gender: { type: String },
  profilePicUrl: { type: String },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("Faculty", facultySchema);

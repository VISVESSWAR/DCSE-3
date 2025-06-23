const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema({
  filename: String,
  url: String,
});

const selfAssessmentSchema = new mongoose.Schema({
  coursesTaught: [
    {
      title: String,
      level: String, // UG or PG
      hoursPerWeek: String,
      studentsRegistered: Number,
    },
  ],
  subjectsTaught: [
    {
      subject: String,
      contactHours: Number,
      studentsAppeared: Number,
      studentsPassed: Number,
      remarks: String,
    },
  ],
  examResults: String,
  contributions: String,
  attachments: [attachmentSchema],
  researchCounts: {
    phd: Number,
    mphil: Number,
    pg: Number,
    ug: Number,
  },
  papersPublished: [String],
  researchInstruments: [String],
  additionalQualifications: [String],
  booksOrGuides: [String],
  memberships: [String],
  conferences: [String],
  consultingWork: [String],
  otherContributions: [String],
  pastoralFunctions: [String],
});

const hodSectionSchema = new mongoose.Schema({
  performance: {
    controlClass: String,
    studentCounseling: String,
    avgPassPercentage: String,
    classRecords: String,
    contributions: String,
    researchAbility: String,
    professionalStanding: String,
    extraCurricular: String,
    willingness: String,
    lapses: String,
    overallRating: String,
  },
  potential: {
    physicalCapacity: String,
    stability: String,
    mentalCapacity: String,
    aptitude: String,
    abilityToManage: String,
    getAlong: String,
    academicLeadership: String,
    generalAppraisal: String,
    specialRemarks: String,
    fitness: String,
  },
  // Signature for Part I
  performanceAssessmentSignature: {
    reportingOfficer: {
      name: String,
      date: Date,
    },
    reviewingOfficer: {
      name: String,
      date: Date,
    },
    principal: {
      name: String,
      date: Date,
    },
  },
  potentialAssessmentSignature: {
    hod: {
      name: String,
      date: Date,
    },
    principal: {
      name: String,
      date: Date,
    },
  },
});

const CRReportSchema = new mongoose.Schema({
  faculty: {
    facultyId: { type: String, required: true },
    name: String,
    dob: Date,
    qualifications: String,
    designation: String,
    scaleOfPay: String,
    presentPay: String,
    postHeld: String,
    department: String,
    dateOfJoining: Date,
  },
  year: String,
  period: String,
  status: {
    type: String,
    enum: ["draft", "faculty-filled", "hod-signed", "finalized"],
    default: "draft",
  },
  selfAssessment: selfAssessmentSchema,
  hodSection: hodSectionSchema,
  facultySignature: String, // Faculty's name as signature
  facultySignDate: Date,
  hodSignDate: Date,
  attachments: [attachmentSchema],
  intermediateOfficerRemarks: String,
  intermediateOfficerSignature: {
    name: String,
    designation: String,
    date: Date,
    signatureImage: String,
  },
  facultyAcknowledgement: {
    remarks: String,
    date: Date,
    signatureImage: String,
  },
});

module.exports = mongoose.model("CRReport", CRReportSchema);

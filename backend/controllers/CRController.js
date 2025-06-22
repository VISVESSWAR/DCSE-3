const CRReport = require("../models/CRReport");
const Faculty = require("../models/Faculty");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");

const getAllReports = async (req, res) => {
  try {
    const {
      status,
      year,
      period,
      facultyId,
      search = "",
      page = 1,
      limit = 10,
    } = req.query;
    console.log(req.query)

    const query = {};

    if (status) query.status = status;
    if (year) query.year = year;
    if (period) query.period = period;
    if (facultyId) query["faculty.facultyId"] = facultyId;
    if (search) query["faculty.name"] = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;

    const reports = await CRReport.find(query).skip(skip).limit(Number(limit));
    const total = await CRReport.countDocuments(query);
    console.log(reports,total)
    res.json({ reports, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create or fetch CR report for a faculty
const getOrCreateCRReport = async (req, res) => {
  try {
    const facultyId = req.user.facultyId || req.params.facultyId;
    let report = await CRReport.findOne({
      "faculty.facultyId": facultyId,
      year: req.query.year,
      period: req.query.period,
    });
    // console.log(req.query, facultyId, report);
    if (!report) {
      // Try to find by facultyId, then by _id
      let faculty = await Faculty.findOne({ facultyId });
      if (!faculty) {
        try {
          faculty = await Faculty.findById(facultyId);
        } catch (e) {
          // Not a valid ObjectId, skip
        }
      }
      if (!faculty)
        return res.status(404).json({ message: "Faculty not found" });
      report = new CRReport({
        faculty: {
          facultyId: faculty.facultyId || faculty._id,
          name: faculty.name,
          dob: faculty.dob,
          qualifications: faculty.areasOfExpertise?.join(", "),
          designation: faculty.position,
          scaleOfPay: faculty.scaleOfPay,
          presentPay: faculty.presentPay,
          postHeld: faculty.natureOfAppointment,
          department: faculty.department,
          dateOfJoining: faculty.dateOfJoining,
        },
        year: req.query.year,
        period: req.query.period,
      });
      await report.save();
    }
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update self-assessment (faculty)
const updateSelfAssessment = async (req, res) => {
  try {
    const { reportId } = req.params;
    const update = req.body;
    const report = await CRReport.findById(reportId);
    if (!report) return res.status(404).json({ message: "Report not found" });

    report.selfAssessment = update;
    report.facultySignature = req.user.name;
    report.facultySignDate = new Date();
    report.status = "pending_hod_review";
    await report.save();
    res.json(report);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update HOD section
const updateHODSection = async (req, res) => {
  try {
    const { reportId } = req.params;
    const update = req.body;
    const report = await CRReport.findById(reportId);
    if (!report) return res.status(404).json({ message: "Report not found" });

    report.hodSection = {
      ...update,
      hodSignature: req.user.name,
      hodDate: new Date(),
    };
    report.hodSignDate = new Date();
    report.status = "finalized";
    await report.save();
    res.json(report);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Finalize report (after HOD sign)
const finalizeReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await CRReport.findByIdAndUpdate(
      reportId,
      { status: "finalized" },
      { new: true }
    );
    res.json(report);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Download final report (PDF generation to be implemented)
const downloadReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await CRReport.findById(reportId);
    if (!report || report.status !== "finalized") {
      return res.status(404).json({ message: "Finalized report not found" });
    }

    // Load HTML template
    const templatePath = path.join(
      __dirname,
      "../utils/cr_report_template.html"
    );
    let templateHtml = fs.readFileSync(templatePath, "utf8");

    // Prepare data for template
    const faculty = report.faculty || {};
    const hod = report.hodSection || {};
    const self = report.selfAssessment || {};
    const year = report.year || "";

    // HOD Section (5-13)
    const hodSectionHtml = `
      <div>5. Ability as a teacher: ${hod.performance?.controlClass || ""}</div>
      <div>6. Comments on class records: ${
        hod.performance?.classRecords || ""
      }</div>
      <div>7. Contributions: ${hod.performance?.contributions || ""}</div>
      <div>8. Research ability: ${hod.performance?.researchAbility || ""}</div>
      <div>9. Professional standing: ${
        hod.performance?.professionalStanding || ""
      }</div>
      <div>10. Extra-curricular: ${hod.performance?.extraCurricular || ""}</div>
      <div>11. Willingness: ${hod.performance?.willingness || ""}</div>
      <div>12. Lapses: ${hod.performance?.lapses || ""}</div>
      <div>13. Overall rating: ${hod.performance?.overallRating || ""}</div>
    `;

    // Potential Assessment (Part II)
    const potentialSectionHtml = `
      <div>A. Physical Capacity: ${hod.potential?.physicalCapacity || ""}</div>
      <div>B. Stability: ${hod.potential?.stability || ""}</div>
      <div>C. Mental Capacity: ${hod.potential?.mentalCapacity || ""}</div>
      <div>D. Aptitude: ${hod.potential?.aptitude || ""}</div>
      <div>E. Ability to manage: ${hod.potential?.abilityToManage || ""}</div>
      <div>F. Get along: ${hod.potential?.getAlong || ""}</div>
      <div>G. Academic leadership: ${
        hod.potential?.academicLeadership || ""
      }</div>
      <div>H. General appraisal: ${hod.potential?.generalAppraisal || ""}</div>
      <div>I. Special remarks: ${hod.potential?.specialRemarks || ""}</div>
      <div>J. Fitness: ${hod.potential?.fitness || ""}</div>
    `;

    // Self-Assessment Table
    let selfAssessmentHtml = "";
    if (self.subjectsTaught && self.subjectsTaught.length > 0) {
      selfAssessmentHtml +=
        '<table class="table"><tr><th>Subject</th><th>Contact Hours</th><th>Appeared</th><th>Passed</th><th>Remarks</th></tr>';
      self.subjectsTaught.forEach((s) => {
        selfAssessmentHtml += `<tr><td>${s.subject || ""}</td><td>${
          s.contactHours || ""
        }</td><td>${s.studentsAppeared || ""}</td><td>${
          s.studentsPassed || ""
        }</td><td>${s.remarks || ""}</td></tr>`;
      });
      selfAssessmentHtml += "</table>";
    }
    if (self.examResults)
      selfAssessmentHtml += `<div>Exam Results: ${self.examResults}</div>`;
    if (self.contributions)
      selfAssessmentHtml += `<div>Contributions: ${self.contributions}</div>`;
    // Add more fields as needed

    // Attachments
    let attachmentsHtml = "";
    if (report.attachments && report.attachments.length > 0) {
      attachmentsHtml += "<ul>";
      report.attachments.forEach((a) => {
        attachmentsHtml += `<li><a href="${
          process.env.BASE_URL || ""
        }/uploads/${a.filename}">${a.filename}</a></li>`;
      });
      attachmentsHtml += "</ul>";
    }

    // Replace placeholders
    templateHtml = templateHtml
      .replace(/{{YEAR}}/g, year)
      .replace(/{{FACULTY_NAME}}/g, faculty.name || "")
      .replace(
        /{{DOB}}/g,
        faculty.dob ? new Date(faculty.dob).toLocaleDateString() : ""
      )
      .replace(/{{QUALIFICATIONS}}/g, faculty.qualifications || "")
      .replace(/{{DESIGNATION}}/g, faculty.designation || "")
      .replace(/{{SCALE_PAY}}/g, faculty.scaleOfPay || "")
      .replace(/{{POST_HELD}}/g, faculty.postHeld || "")
      .replace(/{{HOD_SECTION}}/g, hodSectionHtml)
      .replace(/{{HOD_STATION}}/g, hod.hodStation || "DCSE, AU, Chennai")
      .replace(
        /{{HOD_DATE}}/g,
        hod.hodDate ? new Date(hod.hodDate).toLocaleDateString() : ""
      )
      .replace(/{{HOD_NAME}}/g, hod.hodSignature || "HOD")
      .replace(/{{POTENTIAL_SECTION}}/g, potentialSectionHtml)
      .replace(/{{SELF_ASSESSMENT}}/g, selfAssessmentHtml)
      .replace(/{{ATTACHMENTS}}/g, attachmentsHtml);

    // Generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(templateHtml, { waitUntil: "networkidle0" });
    const pdfPath = path.join(
      __dirname,
      `../outputs/CR_Report_${reportId}.pdf`
    );
    await page.pdf({ path: pdfPath, format: "A4", printBackground: true });
    await browser.close();

    res.download(pdfPath, `CR_Report_${reportId}.pdf`, (err) => {
      if (!err) {
        fs.unlink(pdfPath, () => {});
      }
    });
  } catch (err) {
    console.error("Error generating CR report PDF:", err);
    res.status(500).json({ message: "Failed to generate CR report PDF" });
  }
};

// GET /api/crreport/:id/download
const downloadCRPDF = async (req, res) => {
  try {
    const reportId = req.params.id;
    const report = await CRReport.findById(reportId);
    if (!report)
      return res.status(404).json({ message: "CR Report not found" });

    // Load HTML template
    const templatePath = path.join(
      __dirname,
      "../utils/cr_report_template.html"
    );
    let templateHtml = fs.readFileSync(templatePath, "utf8");

    // Prepare data for template
    const faculty = report.faculty || {};
    const hod = report.hodSection || {};
    const self = report.selfAssessment || {};
    const year = report.year || "";

    // Replace placeholders in template
    templateHtml = templateHtml
      .replace(/{{YEAR}}/g, year)
      .replace(/{{FACULTY_NAME}}/g, faculty.name || "")
      .replace(
        /{{DOB}}/g,
        faculty.dob ? new Date(faculty.dob).toLocaleDateString() : ""
      )
      .replace(/{{QUALIFICATIONS}}/g, faculty.qualifications || "")
      .replace(/{{DESIGNATION}}/g, faculty.designation || "")
      .replace(/{{SCALE_PAY}}/g, faculty.scaleOfPay || "")
      .replace(/{{POST_HELD}}/g, faculty.postHeld || "")
      .replace(/{{CONTROL_CLASS}}/g, hod.controlClass || "")
      .replace(/{{STUDENT_COUNSELING}}/g, hod.studentCounseling || "")
      .replace(/{{AVG_PASS_PERCENTAGE}}/g, hod.avgPassPercentage || "")
      .replace(/{{CLASS_RECORDS}}/g, hod.classRecords || "")
      .replace(/{{CONTRIBUTIONS}}/g, hod.contributions || "")
      .replace(/{{RESEARCH_ABILITY}}/g, hod.researchAbility || "")
      .replace(/{{PROFESSIONAL_STANDING}}/g, hod.professionalStanding || "")
      .replace(/{{EXTRA_CURRICULAR}}/g, hod.extraCurricular || "")
      .replace(/{{WILLINGNESS}}/g, hod.willingness || "")
      .replace(/{{LAPSES}}/g, hod.lapses || "")
      .replace(/{{OVERALL_RATING}}/g, hod.overallRating || "")
      // Potential Assessment
      .replace(/{{PHYSICAL_CAPACITY}}/g, hod.potential?.physicalCapacity || "")
      .replace(/{{STABILITY}}/g, hod.potential?.stability || "")
      .replace(/{{MENTAL_CAPACITY}}/g, hod.potential?.mentalCapacity || "")
      .replace(/{{APTITUDE}}/g, hod.potential?.aptitude || "")
      .replace(/{{ABILITY_TO_MANAGE}}/g, hod.potential?.abilityToManage || "")
      .replace(/{{GET_ALONG}}/g, hod.potential?.getAlong || "")
      .replace(
        /{{ACADEMIC_LEADERSHIP}}/g,
        hod.potential?.academicLeadership || ""
      )
      .replace(/{{GENERAL_APPRAISAL}}/g, hod.potential?.generalAppraisal || "")
      .replace(/{{SPECIAL_REMARKS}}/g, hod.potential?.specialRemarks || "")
      .replace(/{{FITNESS}}/g, hod.potential?.fitness || "")
      // Self-Assessment
      .replace(/{{MEMBERSHIP}}/g, self.membership || "")
      .replace(/{{EXAM_RESULTS}}/g, self.examResults || "")
      .replace(/{{CONTRIBUTIONS}}/g, self.contributions || "");
    // Add more replacements as needed

    // Attachments (as links)
    let attachmentsHtml = "";
    if (report.attachments && report.attachments.length > 0) {
      attachmentsHtml += "<ul>";
      report.attachments.forEach((a) => {
        attachmentsHtml += `<li><a href=\"${a.url}\">${a.filename}</a></li>`;
      });
      attachmentsHtml += "</ul>";
    }
    templateHtml = templateHtml.replace(/{{ATTACHMENTS}}/g, attachmentsHtml);

    // Generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(templateHtml, { waitUntil: "networkidle0" });
    const pdfPath = path.join(
      __dirname,
      `../outputs/CR_Report_${reportId}.pdf`
    );
    await page.pdf({ path: pdfPath, format: "A4", printBackground: true });
    await browser.close();

    res.download(pdfPath, `CR_Report_${reportId}.pdf`, (err) => {
      if (!err) {
        fs.unlink(pdfPath, () => {});
      }
    });
  } catch (err) {
    console.error("Error generating CR report PDF:", err);
    res.status(500).json({ message: "Failed to generate CR report PDF" });
  }
};

module.exports = {
  getAllReports,
  getOrCreateCRReport,
  updateSelfAssessment,
  updateHODSection,
  finalizeReport,
  downloadReport,
  downloadCRPDF,
};

const CRReport = require("../models/CRReport");
const Faculty = require("../models/Faculty");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const formatDate = require("../utils/formatDate");
const { PDFDocument } = require("pdf-lib");
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
    console.log(req.query);

    const query = {};

    if (status) query.status = status;
    if (year) query.year = year;
    if (period) query.period = period;
    if (facultyId) query["faculty.facultyId"] = facultyId;
    if (search) query["faculty.name"] = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;

    const reports = await CRReport.find(query).skip(skip).limit(Number(limit));
    const total = await CRReport.countDocuments(query);
    // console.log(reports, total);
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

    if (report) {
      return res.status(200).json({
        message: "Report already exists",
        created: false,
        report,
      });
    }

    // Try to find by facultyId string first
    let faculty = await Faculty.findOne({ facultyId });

    // If not found, try to use it as an ObjectId only if valid
    if (!faculty && mongoose.Types.ObjectId.isValid(facultyId)) {
      faculty = await Faculty.findById(facultyId);
    }

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    // Create new report
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

    res.status(201).json({
      message: "New CR Report created successfully",
      created: true,
      report,
    });
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

    report.selfAssessment = {
      ...req.body,
      subjectsTaught: JSON.parse(req.body.subjectsTaught || "[]"),
      researchCounts: JSON.parse(req.body.researchCounts || "{}"),
      memberships: JSON.parse(req.body.memberships || "[]"),
      booksOrGuides: JSON.parse(req.body.booksOrGuides || "[]"),
      consultingWork: JSON.parse(req.body.consultingWork || "[]"),
      papersPublished: JSON.parse(req.body.papersPublished || "[]"),
      researchInstruments: JSON.parse(req.body.researchInstruments || "[]"),
      additionalQualifications: JSON.parse(
        req.body.additionalQualifications || "[]"
      ),
      pastoralFunctions: JSON.parse(req.body.pastoralFunctions || "[]"),
      otherContributions: JSON.parse(req.body.otherContributions || "[]"),
      attachments: files,
    };

    report.facultySignature = req.user.name;
    report.facultySignDate = new Date();
    report.status = "faculty-filled";
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
// const downloadReport = async (req, res) => {
//   try {
//     const { reportId } = req.params;
//     const report = await CRReport.findById(reportId);
//     console.log(report, reportId);
//     if (!report || report.status !== "finalized") {
//       return res.status(404).json({ message: "Finalized report not found" });
//     }

//     // Load HTML template
//     const templatePath = path.join(
//       __dirname,
//       "../utils/cr_report_template.html"
//     );
//     let templateHtml = fs.readFileSync(templatePath, "utf8");

//     // Prepare data for template
//     const faculty = report.faculty || {};
//     const hod = report.hodSection || {};
//     const self = report.selfAssessment || {};
//     const year = report.year || "";

//     // HOD Section (5-13)
//     const hodSectionHtml = `
//       <div>5. Ability as a teacher: ${hod.performance?.controlClass || ""}</div>
//       <div>6. Comments on class records: ${
//         hod.performance?.classRecords || ""
//       }</div>
//       <div>7. Contributions: ${hod.performance?.contributions || ""}</div>
//       <div>8. Research ability: ${hod.performance?.researchAbility || ""}</div>
//       <div>9. Professional standing: ${
//         hod.performance?.professionalStanding || ""
//       }</div>
//       <div>10. Extra-curricular: ${hod.performance?.extraCurricular || ""}</div>
//       <div>11. Willingness: ${hod.performance?.willingness || ""}</div>
//       <div>12. Lapses: ${hod.performance?.lapses || ""}</div>
//       <div>13. Overall rating: ${hod.performance?.overallRating || ""}</div>
//     `;

//     // Potential Assessment (Part II)
//     const potentialSectionHtml = `
//       <div>A. Physical Capacity: ${hod.potential?.physicalCapacity || ""}</div>
//       <div>B. Stability: ${hod.potential?.stability || ""}</div>
//       <div>C. Mental Capacity: ${hod.potential?.mentalCapacity || ""}</div>
//       <div>D. Aptitude: ${hod.potential?.aptitude || ""}</div>
//       <div>E. Ability to manage: ${hod.potential?.abilityToManage || ""}</div>
//       <div>F. Get along: ${hod.potential?.getAlong || ""}</div>
//       <div>G. Academic leadership: ${
//         hod.potential?.academicLeadership || ""
//       }</div>
//       <div>H. General appraisal: ${hod.potential?.generalAppraisal || ""}</div>
//       <div>I. Special remarks: ${hod.potential?.specialRemarks || ""}</div>
//       <div>J. Fitness: ${hod.potential?.fitness || ""}</div>
//     `;

//     // Self-Assessment Table
//     let selfAssessmentHtml = "";
//     if (self.subjectsTaught && self.subjectsTaught.length > 0) {
//       selfAssessmentHtml +=
//         '<table class="table"><tr><th>Subject</th><th>Contact Hours</th><th>Appeared</th><th>Passed</th><th>Remarks</th></tr>';
//       self.subjectsTaught.forEach((s) => {
//         selfAssessmentHtml += `<tr><td>${s.subject || ""}</td><td>${
//           s.contactHours || ""
//         }</td><td>${s.studentsAppeared || ""}</td><td>${
//           s.studentsPassed || ""
//         }</td><td>${s.remarks || ""}</td></tr>`;
//       });
//       selfAssessmentHtml += "</table>";
//     }
//     if (self.examResults)
//       selfAssessmentHtml += `<div>Exam Results: ${self.examResults}</div>`;
//     if (self.contributions)
//       selfAssessmentHtml += `<div>Contributions: ${self.contributions}</div>`;
//     // Add more fields as needed

//     // Attachments
//     let attachmentsHtml = "";
//     if (report.attachments && report.attachments.length > 0) {
//       attachmentsHtml += "<ul>";
//       report.attachments.forEach((a) => {
//         attachmentsHtml += `<li><a href="${
//           process.env.BASE_URL || ""
//         }/uploads/${a.filename}">${a.filename}</a></li>`;
//       });
//       attachmentsHtml += "</ul>";
//     }

//     // Replace placeholders
//     templateHtml = templateHtml
//       .replace(/{{YEAR}}/g, year)
//       .replace(/{{FACULTY_NAME}}/g, faculty.name || "")
//       .replace(
//         /{{DOB}}/g,
//         faculty.dob ? new Date(faculty.dob).toLocaleDateString() : ""
//       )
//       .replace(/{{QUALIFICATIONS}}/g, faculty.qualifications || "")
//       .replace(/{{DESIGNATION}}/g, faculty.designation || "")
//       .replace(/{{SCALE_PAY}}/g, faculty.scaleOfPay || "")
//       .replace(/{{POST_HELD}}/g, faculty.postHeld || "")
//       .replace(/{{HOD_SECTION}}/g, hodSectionHtml)
//       .replace(/{{HOD_STATION}}/g, hod.hodStation || "DCSE, AU, Chennai")
//       .replace(
//         /{{HOD_DATE}}/g,
//         hod.hodDate ? new Date(hod.hodDate).toLocaleDateString() : ""
//       )
//       .replace(/{{HOD_NAME}}/g, hod.hodSignature || "HOD")
//       .replace(/{{POTENTIAL_SECTION}}/g, potentialSectionHtml)
//       .replace(/{{SELF_ASSESSMENT}}/g, selfAssessmentHtml)
//       .replace(/{{ATTACHMENTS}}/g, attachmentsHtml);

//     // Generate PDF
//     const browser = await puppeteer.launch({
//       headless: true,
//       args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     });
//     const page = await browser.newPage();
//     await page.setContent(templateHtml, { waitUntil: "networkidle0" });
//     const pdfPath = path.join(
//       __dirname,
//       `../outputs/CR_Report_${reportId}.pdf`
//     );
//     await page.pdf({ path: pdfPath, format: "A4", printBackground: true });
//     await browser.close();

//     res.download(pdfPath, `CR_Report_${reportId}.pdf`, (err) => {
//       if (!err) {
//         fs.unlink(pdfPath, () => {});
//       }
//     });
//   } catch (err) {
//     console.error("Error generating CR report PDF:", err);
//     res.status(500).json({ message: "Failed to generate CR report PDF" });
//   }
// };
const downloadReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await CRReport.findById(reportId);
    if (!report || report.status !== "finalized") {
      return res.status(404).json({ message: "Finalized report not found" });
    }

    const templatePath = path.join(
      __dirname,
      "../utils/cr_report_template.html"
    );
    let templateHtml = fs.readFileSync(templatePath, "utf8");

    const faculty = report.faculty || {};
    const hod = report.hodSection || {};
    const self = report.selfAssessment || {};
    const year = report.year || "";

    // Subjects Taught Table
    let subjectsTableHtml = "";
    if (self.subjectsTaught && self.subjectsTaught.length > 0) {
      subjectsTableHtml += `
        <table class="table">
          <tr>
            <th>Subject</th>
            <th>Contact Hours</th>
            <th>Appeared</th>
            <th>Passed</th>
            <th>Remarks</th>
          </tr>`;
      self.subjectsTaught.forEach((s) => {
        subjectsTableHtml += `
          <tr>
            <td>${s.subject || ""}</td>
            <td>${s.contactHours || ""}</td>
            <td>${s.studentsAppeared || ""}</td>
            <td>${s.studentsPassed || ""}</td>
            <td>${s.remarks || ""}</td>
          </tr>`;
      });
      subjectsTableHtml += "</table>";
    }

    // Attachments
    let attachmentsHtml = "";
    if (self.attachments && self.attachments.length > 0) {
      attachmentsHtml += "<ul>";
      self.attachments.forEach((a) => {
        attachmentsHtml += `<li><a href="/uploads/${a.filename}">${a.filename}</a></li>`;
      });
      attachmentsHtml += "</ul>";
    }

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
      .replace(/{{INSTITUTION}}/g, "Anna University")
      .replace(/{{DEPARTMENT}}/g, faculty.department || "")
      .replace(
        /{{DATE_OF_JOINING}}/g,
        faculty.dateOfJoining
          ? new Date(faculty.dateOfJoining).toLocaleDateString()
          : ""
      )
      .replace(/{{CONTROL_CLASS}}/g, hod.performance?.controlClass || "")
      .replace(
        /{{STUDENT_COUNSELING}}/g,
        hod.performance?.studentCounseling || ""
      )
      .replace(
        /{{AVG_PASS_PERCENTAGE}}/g,
        hod.performance?.avgPassPercentage || ""
      )
      .replace(/{{CLASS_RECORDS}}/g, hod.performance?.classRecords || "")
      .replace(/{{CONTRIBUTIONS}}/g, hod.performance?.contributions || "")
      .replace(/{{RESEARCH_ABILITY}}/g, hod.performance?.researchAbility || "")
      .replace(
        /{{PROFESSIONAL_STANDING}}/g,
        hod.performance?.professionalStanding || ""
      )
      .replace(/{{EXTRA_CURRICULAR}}/g, hod.performance?.extraCurricular || "")
      .replace(/{{WILLINGNESS}}/g, hod.performance?.willingness || "")
      .replace(/{{LAPSES}}/g, hod.performance?.lapses || "")
      .replace(/{{OVERALL_RATING}}/g, hod.performance?.overallRating || "")
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
      .replace(
        /{{HOD_STATION}}/g,
        hod.performanceAssessmentSignature?.station || "DCSE, AU, Chennai"
      )
      .replace(
        /{{HOD_DATE}}/g,
        hod.performanceAssessmentSignature?.date
          ? new Date(
              hod.performanceAssessmentSignature.date
            ).toLocaleDateString()
          : ""
      )
      .replace(/{{HOD_NAME}}/g, report.hodName || "HOD")
      .replace(/{{MEMBERSHIP}}/g, (self.memberships || []).join(", "))
      .replace(/{{EXAM_RESULTS}}/g, self.examResults || "")
      .replace(/{{SUBJECTS_TABLE}}/g, subjectsTableHtml)
      .replace(/{{ATTACHMENTS}}/g, attachmentsHtml)
      .replace(/{{SELF_EXAM_RESULTS}}/g, self.examResults || "")
      .replace(/{{SELF_CONTRIBUTIONS}}/g, self.contributions || "")
      .replace(
        /{{SELF_RESEARCH_PHD}}/g,
        self.researchCounts?.phd?.toString() || "0"
      )
      .replace(
        /{{SELF_RESEARCH_MPHIL}}/g,
        self.researchCounts?.mphil?.toString() || "0"
      )
      .replace(
        /{{SELF_RESEARCH_PG}}/g,
        self.researchCounts?.pg?.toString() || "0"
      )
      .replace(
        /{{SELF_RESEARCH_UG}}/g,
        self.researchCounts?.ug?.toString() || "0"
      )
      .replace(
        /{{SELF_PAPERS_PUBLISHED}}/g,
        (self.papersPublished || []).join(", ")
      )
      .replace(/{{SELF_BOOKS_GUIDES}}/g, (self.booksOrGuides || []).join(", "))
      .replace(
        /{{SELF_RESEARCH_INSTRUMENTS}}/g,
        (self.researchInstruments || []).join(", ")
      )
      .replace(
        /{{SELF_ADDITIONAL_QUALIFICATIONS}}/g,
        (self.additionalQualifications || []).join(", ")
      )
      .replace(/{{SELF_CONSULTING}}/g, (self.consultingWork || []).join(", "))
      .replace(
        /{{SELF_OTHER_CONTRIBUTIONS}}/g,
        (self.otherContributions || []).join(", ")
      )
      .replace(
        /{{SELF_PASTORAL_FUNCTIONS}}/g,
        (self.pastoralFunctions || []).join(", ")
      )
      .replace(/{{FACULTY_SIGNATURE}}/g, report.facultySignature || "")
      .replace(
        /{{FACULTY_SIGN_DATE}}/g,
        report.facultySignDate
          ? new Date(report.facultySignDate).toLocaleDateString()
          : ""
      );

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

module.exports = { downloadReport };


const downloadCRPDF = async (req, res) => {
  try {
    const reportId = req.params.reportId;
    console.log(reportId)
    const report = await CRReport.findById(reportId);
    if (!report)
      return res.status(404).json({ message: "CR Report not found" });

    const templatePath = path.join(
      __dirname,
      "../utils/cr_report_template.html"
    );
    let templateHtml = fs.readFileSync(templatePath, "utf8");

    const faculty = report.faculty || {};
    const hod = report.hodSection || {};
    const self = report.selfAssessment || {};
    const year = report.year || "";
    const period = report.period || "";
    const attachments = self.attachments || [];

    console.log(hod, self);

    // Subjects table rows
    const subjectsHtml = (self.subjectsTaught || [])
      .map(
        (s) => `
      <tr>
        <td>${s.subject}</td>
        <td>${s.contactHours}</td>
        <td>${s.studentsAppeared}</td>
        <td>${s.studentsPassed}</td>
        <td>${s.remarks || ""}</td>
      </tr>
    `
      )
      .join("");

    const enclosuresHtml = attachments
      .map(
        (a, i) => `
      <p><strong>Attachment ${i + 1}:</strong> ${a.filename}</p>
    `
      )
      .join("");

    // Replace placeholders
    templateHtml = templateHtml
      .replace(/{{YEAR}}/g, year)
      .replace(/{{PERIOD}}/g, period)
      .replace(/{{FACULTY_NAME}}/g, faculty.name || "")
      .replace(/{{DOB}}/g, formatDate(faculty.dob))
      .replace(/{{QUALIFICATIONS}}/g, faculty.qualifications || "")
      .replace(/{{DESIGNATION}}/g, faculty.designation || "")
      .replace(
        /{{SCALE_PAY}}/g,
        `${faculty.scaleOfPay || ""}, Present Pay: ${faculty.presentPay || ""}`
      )
      .replace(/{{POST_HELD}}/g, faculty.postHeld || "")
      .replace(/{{DEPARTMENT}}/g, faculty.department || "")
      .replace(/{{DATE_OF_JOINING}}/g, formatDate(faculty.dateOfJoining))

      // Part I HOD Assessment
      .replace(/{{CONTROL_CLASS}}/g, hod.performance?.controlClass || "")
      .replace(
        /{{STUDENT_COUNSELING}}/g,
        hod.performance?.studentCounseling || ""
      )
      .replace(
        /{{AVG_PASS_PERCENTAGE}}/g,
        hod.performance?.avgPassPercentage || ""
      )
      .replace(/{{CLASS_RECORDS}}/g, hod.performance?.classRecords || "")
      .replace(/{{CONTRIBUTIONS}}/g, hod.performance?.contributions || "")
      .replace(/{{RESEARCH_ABILITY}}/g, hod.performance?.researchAbility || "")
      .replace(
        /{{PROFESSIONAL_STANDING}}/g,
        hod.performance?.professionalStanding || ""
      )
      .replace(/{{EXTRA_CURRICULAR}}/g, hod.performance?.extraCurricular || "")
      .replace(/{{WILLINGNESS}}/g, hod.performance?.willingness || "")
      .replace(/{{LAPSES}}/g, hod.performance?.lapses || "")
      .replace(/{{OVERALL_RATING}}/g, hod.performance?.overallRating || "")

      // Part I Signatures
      .replace(
        /{{PERF_HOD_NAME}}/g,
        hod.performance?.performanceAssessmentSignature?.hod?.name || ""
      )
      .replace(
        /{{PERF_HOD_DATE}}/g,
        formatDate(hod.performance?.performanceAssessmentSignature?.hod?.date)
      )
      .replace(
        /{{PERF_FACULTY_NAME}}/g,
        hod.performance?.performanceAssessmentSignature?.faculty?.name || ""
      )
      .replace(
        /{{PERF_FACULTY_DATE}}/g,
        formatDate(
          hod.performance?.performanceAssessmentSignature?.faculty?.date
        )
      )
      // .replace(/{{PERF_REVIEWING_NAME}}/g, hod.performance?.performanceAssessmentSignature?.reviewingOfficer?.name || "")
      // .replace(/{{PERF_REVIEWING_DATE}}/g, formatDate(hod.performance?.performanceAssessmentSignature?.reviewingOfficer?.date))

      // Part II HOD Potential
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

      // Part II Signatures
      .replace(
        /{{POT_HOD_NAME}}/g,
        hod.potential?.potentialAssessmentSignature?.hod?.name || ""
      )
      .replace(
        /{{POT_HOD_DATE}}/g,
        formatDate(hod.potential?.potentialAssessmentSignature?.hod?.date)
      )
      .replace(
        /{{POT_FACULTY_NAME}}/g,
        hod.potential?.potentialAssessmentSignature?.faculty?.name || ""
      )
      .replace(
        /{{POT_FACULTY_DATE}}/g,
        formatDate(hod.potential?.potentialAssessmentSignature?.faculty?.date)
      )

      // Self-assessment
      .replace(/{{MEMBERSHIPS}}/g, (self.memberships || []).join(", ")) // ✅ fix placeholder
      .replace(
        /{{SUBJECTS_ROWS}}/g,
        (self.subjectsTaught || [])
          .map(
            (s, idx) => `
            <tr>
              <td>${s.subject}</td>
              <td>${s.contactHours}</td>
              <td>${s.studentsAppeared}</td>
              <td>${s.studentsPassed}</td>
              <td>${s.remarks || ""}</td>
            </tr>
            `
          )
          .join("")
      )
      .replace(/{{EXAM_RESULTS}}/g, self.examResults || "")
      .replace(/{{LAB_DEVELOPMENT}}/g, self.labDevelopment || "")
      .replace(/{{MODELS_AND_AIDS}}/g, self.modelsAndAids || "")
      .replace(/{{SHORT_COURSES}}/g, self.shortCourses || "")
      .replace(/{{Q_PHD}}/g, self.researchGuidance?.qualified?.phd || "0")
      .replace(/{{Q_PG}}/g, self.researchGuidance?.qualified?.pg || "0")
      .replace(/{{Q_MPHIL}}/g, self.researchGuidance?.qualified?.mphil || "0")
      .replace(/{{R_PHD}}/g, self.researchGuidance?.registered?.phd || "0")
      .replace(/{{R_PG}}/g, self.researchGuidance?.registered?.pg || "0")
      .replace(/{{R_PGD}}/g, self.researchGuidance?.registered?.pgDiploma || "0")
      .replace(/{{R_UG}}/g, self.researchGuidance?.registered?.ug || "0")
      .replace(/{{PAPERS_PUBLISHED}}/g, (self.papersPublished || []).join("; "))
      .replace(/{{BOOKS_GUIDES}}/g, (self.booksOrGuides || []).join("; "))
      .replace(
        /{{RESEARCH_INSTRUMENTS}}/g,
        (self.researchInstruments || []).join("; ")
      )
      .replace(/{{CONFERENCES}}/g, (self.conferences || []).join("; "))
      .replace(/{{CONSULTING_WORK}}/g, (self.consultingWork || []).join("; "))
      .replace(
        /{{ADDITIONAL_QUALIFICATIONS}}/g,
        (self.additionalQualifications || []).join("; ")
      )
      .replace(
        /{{PASTORAL_FUNCTIONS}}/g,
        (self.pastoralFunctions || []).join("; ")
      )
      .replace(
        /{{OTHER_CONTRIBUTIONS}}/g,
        (self.otherContributions || []).join("; ")
      )
      .replace(
        /{{FACULTY_SIGN_DATE}}/g,
        formatDate(report.facultySignatureDate)
      )
      .replace(/{{FACULTY_SIGNATURE}}/g, report.facultySignature || "")
      .replace(
        /{{FACULTY_SIGN_DATE}}/g,
        formatDate(report.facultySignatureDate)
      )
      .replace(/{{ENCLOSURE_OBJECTS}}/g, enclosuresHtml);

    // === Generate Main PDF ===
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(templateHtml, { waitUntil: "networkidle0" });

    const tempDir = path.join(__dirname, "../outputs");
    const mainPDFPath = path.join(tempDir, `CR_Main_${reportId}.pdf`);
    await page.pdf({ path: mainPDFPath, format: "A4", printBackground: true });

    // === Merge Attachment PDFs ===
    const mergedPdf = await PDFDocument.create();
    const addPdf = async (filePath) => {
      const pdfBytes = fs.readFileSync(filePath);
      const doc = await PDFDocument.load(pdfBytes);
      const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
      pages.forEach((p) => mergedPdf.addPage(p));
    };

    await addPdf(mainPDFPath);
    for (const att of attachments) {
      const attPath = path.join(
        __dirname,
        "..",
        "uploads",
        path.basename(att.url)
      );
      if (fs.existsSync(attPath) && attPath.endsWith(".pdf"))
        await addPdf(attPath);
    }

    const finalBytes = await mergedPdf.save();
    const finalPath = path.join(tempDir, `CR_Report_${reportId}_final.pdf`);
    fs.writeFileSync(finalPath, finalBytes);

    await browser.close();
    fs.unlinkSync(mainPDFPath);

    res.download(finalPath, `CR_Report_${reportId}.pdf`, (err) => {
      if (!err) fs.unlink(finalPath, () => {});
    });
  } catch (err) {
    console.error("Error generating CR PDF:", err);
    res.status(500).json({ message: "Failed to generate CR report PDF" });
  }
};

module.exports = downloadCRPDF;

const updateFull = async (req, res) => {
  try {
    const report = await CRReport.findById(req.params.reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const {
      selfAssessment = {},
      hodSection = {},
      status,
      period,
      facultySignature,
      facultySignatureDate,
    } = req.body;

    console.log("Incoming selfAssessment:", selfAssessment);
    console.log("Current report.selfAssessment:", report.selfAssessment);

    // Step 1: Remove attachments from incoming selfAssessment if present
    const { attachments, ...safeSelfAssessment } = selfAssessment;

    // Step 1: Preserve existing attachments from DB
    const existingAttachments = report.selfAssessment?.attachments || [];

    // Step 2: Replace selfAssessment with frontend values
    report.selfAssessment = {
      ...safeSelfAssessment,
    };

    // Step 3: Re-assign preserved attachments
    report.selfAssessment.attachments = existingAttachments;

    // Step 4: Merge HOD Section deeply
    report.hodSection = report.hodSection || { performance: {}, potential: {} };

    report.hodSection.performance = {
      ...report.hodSection.performance,
      ...hodSection?.performance,
    };

    report.hodSection.potential = {
      ...report.hodSection.potential,
      ...hodSection?.potential,
    };

    // Step 5: Update other fields
    if (facultySignature) report.facultySignature = facultySignature;
    if (facultySignatureDate)
      report.facultySignatureDate = facultySignatureDate;
    if (status) report.status = status;
    if (period) report.period = period;

    await report.save();
    console.log("Saved report:", report);
    res.json(report);
  } catch (err) {
    console.error("Error in PATCH /update-full:", err);
    res.status(500).json({ message: err.message });
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
  updateFull,
};

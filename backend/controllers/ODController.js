const ODRequest = require("../models/ODrequest");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const createRequest = async (req, res) => {
  try {
    console.log(req.body, req.body);
    const files = req.files.map((f) => f.filename);
    const data = {
      ...req.body,
      forwardToDean: req.body.forwardToDean === "Yes",
      procurements: req.body.procurements === "Yes",
    };

    const od = new ODRequest({
      ...data,
      supportingDocuments: files,
      userId: req.user._id,
    });

    await od.save();
    res.status(201).json(od);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Invalid request data" });
  }
};

const addDocs = async (req, res) => {
  try {
    const files = req.files.map((f) => f.filename);
    const updated = await ODRequest.findByIdAndUpdate(
      req.params.id,
      { $push: { supportingDocuments: { $each: files } } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.params;
    if (!["approve", "reject"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const updated = await ODRequest.findByIdAndUpdate(
      req.params.id,
      { status: status === "approve" ? "Approved" : "Rejected" },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Status update failed" });
  }
};

const getAllRequests = async (req, res) => {
  try {
    const data = await ODRequest.find().sort({ startDate: -1 });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Unable to fetch requests" });
  }
};

const getUserRequests = async (req, res) => {
  try {
    const userId = req.params.userId;
    const data = await ODRequest.find({ userId }).sort({ startDate: -1 });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Unable to fetch user requests" });
  }
};

const updateODDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const updated = await ODRequest.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "OD Request not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update OD details" });
  }
};
const getImageBase64 = (imagePath) => {
  const image = fs.readFileSync(imagePath);
  const ext = path.extname(imagePath).substring(1); // 'png' or 'jpg'
  return `data:image/${ext};base64,${image.toString("base64")}`;
};
const generateODLetter = async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await ODRequest.findById(requestId);

    if (!request)
      return res.status(404).json({ error: "OD request not found" });

    const collegeName = "College of Engineering Guindy, Anna University";
    const district = "Chennai";
    const department = "Computer Science and Engineering";

    const {
      name,
      requestType,
      eventType,
      topic,
      location,
      startDate,
      endDate,
      startTime,
      endTime,
      numberOfDays,
      forwardToDean,
      status
    } = request;
    const year = new Date().getFullYear();
    const formattedFrom = new Date(startDate).toLocaleDateString("en-IN");
    const formattedTo = new Date(endDate).toLocaleDateString("en-IN");
    const currentDate = new Date().toLocaleDateString("en-IN");
    const leaveType = requestType;
    const forwardTo = requestType.toUpperCase() === "SCL" ? "The Head of Department" : "The Registrar";



    const templatePath = path.join(
      __dirname,
      "../utils/od_letter_template.html"
    );

    let templateHtml = fs.readFileSync(templatePath, "utf8");

    const hodSignature = `
      <div class="signature">
        <span class="bold">Head of Department</span><br>
        ${status === "Approved" ? '<span style="font-size: 12px;">Virtually Signed</span><br> ' : '</br/>'}
       
        ___________________
      </div>`;

    const deanSignature = forwardToDean
      ? `
      <div class="signature">
        <span class="bold">Dean</span><br>
        ${status === "Approved" ? '<span style="font-size: 12px;">Virtually Signed</span><br>' : '</br/>'}
        
        ___________________
      </div>`
      : '';



    const fullDetailsParagraph = `I am requesting <span class="bold">${leaveType}</span> leave as I am going to participate in a <span class="bold">${eventType.toLowerCase()}</span> titled "<span class="bold">${topic}</span>". The event is scheduled to take place from <span class="bold">${formattedFrom}</span> to <span class="bold">${formattedTo}</span>, spanning <span class="bold">${numberOfDays}</span> day(s). The venue for the event is <span class="bold">${location}</span>.`;

    const leftLogoBase64 = getImageBase64(
      path.join(__dirname, "..", "assets", "Anna_University_Logo.png")
    );
    const rightLogoBase64 = getImageBase64(
      path.join(__dirname, "..", "assets", "CSE_logo.png")
    );

    templateHtml = templateHtml
      .replace(/{{LEFT_LOGO_PATH}}/g, leftLogoBase64)
      .replace(/{{RIGHT_LOGO_PATH}}/g, rightLogoBase64)

      .replace(/{{YEAR}}/g, year)
      .replace(/{{CURRENT_DATE}}/g, currentDate)
      .replace(/{{FORWARD_TO}}/g, forwardTo)
      .replace(
        /{{FROM_SECTION}}/g,
        `<p><span class="bold">From,</span><br>${name}<br>${department}<br>${collegeName}<br>${district}</p>`
      )
      .replace(/{{PURPOSE_PARAGRAPH}}/g, fullDetailsParagraph)
      .replace(/{{NAME}}/g, name)
      .replace(/{{DEAN_SIGNATURE}}/g, deanSignature)
      .replace(/{{HOD_SIGNATURE}}/g, hodSignature);

    console.log("Attempting to launch browser...");
    const browser = await puppeteer.launch({
      headless: true, // Use newHeadless: 'new' for newer versions
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Needed for some environments
    });
    console.log("Browser launched.");
    const page = await browser.newPage();
    console.log("New page created.");
    await page.setContent(templateHtml, { waitUntil: "networkidle0" });
    console.log("HTML content set.");

    const pdfPath = path.join(
      __dirname,
      `../outputs/OD_Letter_${requestId}.pdf`
    );
    console.log(`Generating PDF to: ${pdfPath}`);
    await page.pdf({ path: pdfPath, format: "A4", printBackground: true });
    console.log("PDF generated.");
    await browser.close();
    console.log("Browser closed.");

    res.download(pdfPath, `OD_Letter_${requestId}.pdf`, (err) => {
      if (err) {
        console.error("Error during file download:", err);
      } else {
        console.log("File sent, attempting to unlink...");
        fs.unlink(pdfPath, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Error unlinking PDF file:", unlinkErr);
          } else {
            console.log("PDF file unlinked successfully.");
          }
        });
      }
    });
  } catch (err) {
    console.error("Error generating OD letter:", err);
    res.status(500).json({ error: "Failed to generate OD letter by server" });
  }
};

module.exports = {
  getAllRequests,
  getUserRequests,
  createRequest,
  addDocs,
  updateStatus,
  updateODDetails,
  generateODLetter,
};

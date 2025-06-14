const ODRequest = require("../models/ODrequest");

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
module.exports = {
  getAllRequests,
  getUserRequests,
  createRequest,
  addDocs,
  updateStatus,
};

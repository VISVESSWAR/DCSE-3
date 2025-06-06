const PGScholar = require('../models/PGScholar');


const addPGScholar = async (req, res) => {
  try {
    const scholar = new PGScholar(req.body);
    const savedScholar = await scholar.save();
    res.status(201).json(savedScholar);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getAllPGScholars = async (req, res) => {
  try {
    const scholars = await PGScholar.find();
    res.json(scholars);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePGScholar = async (req, res) => {
  try {
    const updated = await PGScholar.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: 'Scholar not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deletePGScholar = async (req, res) => {
  try {
    const deleted = await PGScholar.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Scholar not found' });
    res.json({ message: 'Scholar deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addPGScholar,
  getAllPGScholars,
  updatePGScholar,
  deletePGScholar
};

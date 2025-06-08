const Publication = require('../models/Publication');

const addPublication = async (req, res) => {
  try {
    const publication = new Publication(req.body);
    const saved = await publication.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getAllPublications = async (req, res) => {
  try {
    const publications = await Publication.find();
    res.json(publications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePublication = async (req, res) => {
  try {
    const updated = await Publication.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: 'Publication not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


const deletePublication = async (req, res) => {
  try {
    const deleted = await Publication.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Publication not found' });
    res.json({ message: 'Publication deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addPublication,
  getAllPublications,
  updatePublication,
  deletePublication
};

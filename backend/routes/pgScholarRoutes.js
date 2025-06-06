const express = require('express');
const router = express.Router();
const {
  addPGScholar,
  getAllPGScholars,
  updatePGScholar,
  deletePGScholar
} = require('../controllers/pgScholarController');

// Route: /api/pgscholars
router.post('/', addPGScholar);
router.get('/', getAllPGScholars);
router.put('/:id', updatePGScholar);
router.delete('/:id', deletePGScholar);

module.exports = router;

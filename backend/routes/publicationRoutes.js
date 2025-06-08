const express = require('express');
const router = express.Router();
const {
  addPublication,
  getAllPublications,
  updatePublication,
  deletePublication
} = require('../controllers/publicationController');

// Route: /api/publications
router.post('/', addPublication);
router.get('/', getAllPublications);
router.put('/:id', updatePublication);
router.delete('/:id', deletePublication);

module.exports = router;

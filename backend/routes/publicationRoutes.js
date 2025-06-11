const express = require('express');
const router = express.Router();
const {
  addPublication,
  getAllPublications,
  updatePublication,
  deletePublication
} = require('../controllers/publicationController');
const { restrictTo } = require('../middleware/roleAccess');  

// Route: /api/publications
router.post('/', restrictTo('faculty'), addPublication);
router.get('/', restrictTo('hod', 'admin'), getAllPublications);
router.put('/:id', restrictTo('faculty'), updatePublication);
router.delete('/:id', restrictTo('faculty'), deletePublication);

module.exports = router;

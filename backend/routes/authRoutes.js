const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, testEmail } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/test-email', testEmail); // Test endpoint for debugging

module.exports = router;

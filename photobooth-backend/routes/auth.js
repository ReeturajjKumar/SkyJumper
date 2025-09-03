const express = require('express');
const { adminLogin } = require('../middleware/auth');

const router = express.Router();

// Admin login route
router.post('/admin/login', adminLogin);

module.exports = router;
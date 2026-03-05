const express = require('express');
const router = express.Router();

const { getDashboardStats } = require('../controllers/therapist.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// All therapist routes require authentication and therapist role
router.use(protect);
router.use(restrictTo('therapist'));

// Dashboard stats for the logged-in therapist
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;


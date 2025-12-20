const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { allowRoles, allowPermission } = require('../middleware/roleMiddleware');
const { isApproved } = require('../middleware/accountStatus');

/* =================================================
   LAB DASHBOARD
================================================= */
router.get(
  '/dashboard',
  protect,
  allowRoles('laboratory'),
  isApproved,
  (req, res) => {
    res.json({
      message: 'Welcome to Laboratory Dashboard',
      lab: req.user.fullName
    });
  }
);

/* =================================================
   VIEW TEST REQUESTS
================================================= */
router.get(
  '/test-requests',
  protect,
  allowRoles('laboratory'),
  allowPermission('VIEW_TEST_REQUESTS'),
  isApproved,
  (req, res) => {
    res.json({ message: 'Lab test requests fetched' });
  }
);

/* =================================================
   UPLOAD LAB REPORT
================================================= */
router.post(
  '/upload-report',
  protect,
  allowRoles('laboratory'),
  allowPermission('UPLOAD_REPORT'),
  isApproved,
  (req, res) => {
    res.json({ message: 'Lab report uploaded successfully' });
  }
);

module.exports = router;

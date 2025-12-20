const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { allowRoles, allowPermission } = require('../middleware/roleMiddleware');
const { isApproved } = require('../middleware/accountStatus');

/* =================================================
   THERAPIST DASHBOARD
================================================= */
router.get(
  '/dashboard',
  protect,
  allowRoles('therapist'),
  isApproved,
  (req, res) => {
    res.json({
      message: 'Welcome to Therapist Dashboard',
      therapist: req.user.fullName
    });
  }
);

/* =================================================
   VIEW ASSIGNED CHILDREN
================================================= */
router.get(
  '/children',
  protect,
  allowRoles('therapist'),
  allowPermission('VIEW_ASSIGNED_CHILDREN'),
  isApproved,
  (req, res) => {
    res.json({ message: 'Assigned children fetched' });
  }
);

/* =================================================
   ADD THERAPY SESSION
================================================= */
router.post(
  '/session',
  protect,
  allowRoles('therapist'),
  allowPermission('ADD_THERAPY_SESSION'),
  isApproved,
  (req, res) => {
    res.json({ message: 'Therapy session added' });
  }
);

/* =================================================
   UPDATE CHILD PROGRESS
================================================= */
router.put(
  '/progress/:childId',
  protect,
  allowRoles('therapist'),
  allowPermission('UPDATE_PROGRESS'),
  isApproved,
  (req, res) => {
    res.json({ message: 'Therapy progress updated' });
  }
);

module.exports = router;

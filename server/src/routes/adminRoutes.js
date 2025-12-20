// 
const express = require('express');
const router = express.Router();

const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware'); // <-- destructured
const { allowRoles, allowPermission } = require('../middleware/roleMiddleware');

/* =================================================
   ADMIN DASHBOARD
================================================= */
router.get(
  '/dashboard',
  protect,
  allowRoles('admin'),
  (req, res) => {
    res.json({
      message: 'Welcome to Admin Dashboard',
      admin: req.user.fullName
    });
  }
);

/* =================================================
   GET ALL PENDING USERS (Doctor / Therapist / Lab)
================================================= */
router.get(
  '/pending-users',
  protect,
  allowRoles('admin'),
  async (req, res) => {
    try {
      const users = await User.find({
        accountStatus: 'pending',
        primaryRole: { $ne: 'parent' }
      }).select('-password');

      res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/* =================================================
   APPROVE USER
================================================= */
router.put(
  '/approve/:id',
  protect,
  allowPermission('MANAGE_USERS'),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.accountStatus = 'approved';
      user.auditLogs.push({
        action: 'ACCOUNT_APPROVED',
        performedBy: req.user._id
      });

      await user.save();
      res.json({ message: 'User approved successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/* =================================================
   REJECT USER
================================================= */
router.put(
  '/reject/:id',
  protect,
  allowPermission('MANAGE_USERS'),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.accountStatus = 'rejected';
      user.auditLogs.push({
        action: 'ACCOUNT_REJECTED',
        performedBy: req.user._id
      });

      await user.save();
      res.json({ message: 'User rejected successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/* =================================================
   SUSPEND USER
================================================= */
router.put(
  '/suspend/:id',
  protect,
  allowPermission('MANAGE_USERS'),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.accountStatus = 'suspended';
      user.auditLogs.push({
        action: 'ACCOUNT_SUSPENDED',
        performedBy: req.user._id
      });

      await user.save();
      res.json({ message: 'User suspended successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;

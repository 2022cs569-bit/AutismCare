const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { isApproved } = require('../middleware/accountStatus');

router.get(
  '/children',
  protect,
  allowRoles('parent'),
  isApproved,
  (req, res) => {
    res.json({ message: 'Parent children data' });
  }
);

module.exports = router;

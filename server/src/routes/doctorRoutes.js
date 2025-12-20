const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { allowRoles, allowPermission } = require('../middleware/roleMiddleware');
const { isApproved } = require('../middleware/accountStatus');

router.post(
  '/diagnosis',
  protect,
  allowRoles('doctor'),
  allowPermission('ADD_DIAGNOSIS'),
  isApproved,
  (req, res) => {
    res.json({ message: 'Diagnosis added' });
  }
);

module.exports = router;

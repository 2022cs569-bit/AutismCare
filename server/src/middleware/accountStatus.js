exports.isApproved = (req, res, next) => {
  if (req.user.accountStatus !== 'approved') {
    return res.status(403).json({
      message: `Account ${req.user.accountStatus}. Access denied`
    });
  }
  next();
};

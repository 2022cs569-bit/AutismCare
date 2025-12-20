// 
// Middleware to check user role
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.primaryRole)) {
      return res.status(403).json({ message: 'Access denied: insufficient role' });
    }
    next();
  };
};

// Middleware to check user permissions
const allowPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({ message: 'Access denied: insufficient permission' });
    }
    next();
  };
};

module.exports = { allowRoles, allowPermission };

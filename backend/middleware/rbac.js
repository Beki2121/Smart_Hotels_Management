// Role-based access control middleware
// Usage: router.get('/route', authenticate, checkRole('admin','manager'), handler)

module.exports.checkRole = function checkRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      });
    }
    next();
  };
};

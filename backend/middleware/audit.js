// Audit logging middleware
// Logs write operations to audit_log table

module.exports = function audit(action, entity) {
  return async (req, res, next) => {
    // Store original json() to intercept the response
    const originalJson = res.json.bind(res);

    res.json = async (data) => {
      try {
        // Only log successful write operations by authenticated users
        if (req.user && res.statusCode >= 200 && res.statusCode < 400) {
          // Audit logging will be implemented after models are created
          // For now, just log to console
          console.log(
            `[AUDIT] User ${req.user.userId} - ${action} on ${entity}`,
          );
        }
      } catch (err) {
        console.error("Audit log failed:", err.message);
        // Never let audit failure break the response
      }
      return originalJson(data);
    };

    next();
  };
};

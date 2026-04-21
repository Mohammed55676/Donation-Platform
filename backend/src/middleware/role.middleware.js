/**
 * src/middleware/role.middleware.js
 * Role-based access control (RBAC) middleware.
 * Must be used after `protect` so req.user is available.
 *
 * Usage:
 *   router.delete('/:id', protect, requireRole('admin'), handler)
 *   router.put('/:id',    protect, requireRole('admin', 'user'), handler)
 */
const { sendError } = require('../utils/apiResponse');

/**
 * Returns a middleware that allows only the specified roles.
 * @param {...string} roles - Allowed roles ('user', 'admin')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Not authenticated.', 401);
    }
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Required role: ${roles.join(' or ')}.`,
        403
      );
    }
    next();
  };
}

module.exports = { requireRole };

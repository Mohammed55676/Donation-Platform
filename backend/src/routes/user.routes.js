/**
 * src/routes/user.routes.js
 *
 * GET    /api/users                  (admin)
 * GET    /api/users/:id              (auth)
 * PUT    /api/users/:id              (self or admin)
 * PUT    /api/users/:id/status       (admin)
 * DELETE /api/users/:id              (admin)
 */
const express = require('express');
const router  = express.Router();

const {
  listUsers, getContactableCharities, createUser, getUser, updateUser, updateUserStatus, deleteUser, toggleWishlist
} = require('../controllers/user.controller');
const { protect }      = require('../middleware/auth.middleware');
const { requireRole }  = require('../middleware/role.middleware');

router.get('/',                  protect, requireRole('admin'), listUsers);
router.post('/',                 protect, requireRole('admin'), createUser);
router.get('/contactable-charities', protect, getContactableCharities);
router.get('/:id',               protect, getUser);
router.put('/:id',               protect, updateUser);
router.put('/:id/status',        protect, requireRole('admin'), updateUserStatus);
router.delete('/:id',            protect, requireRole('admin'), deleteUser);
router.post('/:id/wishlist',     protect, toggleWishlist);

module.exports = router;

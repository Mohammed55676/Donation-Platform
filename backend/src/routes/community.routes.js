/**
 * src/routes/community.routes.js
 *
 * GET    /api/community              (auth)
 * GET    /api/community/:id          (auth)
 * POST   /api/community              (auth)
 * PUT    /api/community/:id          (owner or admin)
 * DELETE /api/community/:id          (owner or admin)
 * POST   /api/community/:id/like     (auth, toggle)
 */
const express = require('express');
const Joi     = require('joi');
const router  = express.Router();

const {
  listRequests, getRequest, createRequest,
  updateRequest, deleteRequest, toggleLike,
} = require('../controllers/community.controller');
const { protect }  = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const requestSchema = Joi.object({
  title:       Joi.string().max(120).required(),
  description: Joi.string().max(2000).required(),
  category:    Joi.string().valid('ملابس', 'طعام', 'أثاث', 'كتب', 'طبي', 'غذاء', 'أخرى').required(),
  urgency:     Joi.string().valid('عالية', 'متوسطة', 'منخفضة').default('متوسطة'),
  location:    Joi.string().allow(''),
  image:       Joi.string().uri().allow('', null),
});

router.get('/',           protect, listRequests);
router.get('/:id',        protect, getRequest);
router.post('/',          protect, validate(requestSchema), createRequest);
router.put('/:id',        protect, updateRequest);
router.delete('/:id',     protect, deleteRequest);
router.post('/:id/like',  protect, toggleLike);

module.exports = router;

/**
 * src/middleware/validate.middleware.js
 * Joi-based request body validation middleware factory.
 * Returns 400 with field-level error details on invalid input.
 *
 * Usage:
 *   const { validate } = require('../middleware/validate.middleware');
 *   router.post('/', validate(myJoiSchema), handler);
 */
const { sendError } = require('../utils/apiResponse');

/**
 * @param {import('joi').Schema} schema - A Joi schema to validate req.body against
 * @param {'body'|'query'|'params'} [target='body']
 */
function validate(schema, target = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,   // collect ALL errors
      stripUnknown: true,  // remove unexpected fields
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.context?.key || d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      }));
      return sendError(res, 'Validation failed.', 400, details);
    }

    // Replace body with sanitized value
    req[target] = value;
    next();
  };
}

module.exports = { validate };

/**
 * src/utils/apiResponse.js
 * Standardized JSON response helpers.
 * Every endpoint should use these to guarantee consistent structure.
 *
 * Success shape:  { success: true,  data: <payload>,  message?: string, meta?: object }
 * Error shape:    { success: false, error: string,     details?: array }
 */

/**
 * Send a 2xx success response.
 * @param {import('express').Response} res
 * @param {*} data       - Response payload
 * @param {string} [message]
 * @param {number} [statusCode=200]
 * @param {object} [meta] - Optional pagination / extra metadata
 */
function sendSuccess(res, data, message = 'OK', statusCode = 200, meta = undefined) {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {string} error   - Human-readable error message
 * @param {number} [statusCode=500]
 * @param {Array}  [details] - Validation error details
 */
function sendError(res, error, statusCode = 500, details = undefined) {
  const body = { success: false, error };
  if (details) body.details = details;
  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess, sendError };

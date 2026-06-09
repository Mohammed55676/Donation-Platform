/**
 * src/utils/pagination.js
 * Reusable pagination helper.
 * Parses query params and returns Mongoose skip/limit values plus meta.
 */

const DEFAULT_PAGE  = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT     = 100;

/**
 * Parse pagination params from an Express request query.
 * @param {object} query  - req.query
 * @returns {{ page: number, limit: number, skip: number }}
 */
function parsePagination(query) {
  const page  = Math.max(1, parseInt(query.page,  10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Build the pagination meta object to include in API responses.
 * @param {number} total  - Total number of documents matching the query
 * @param {number} page
 * @param {number} limit
 */
function buildPaginationMeta(total, page, limit) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  };
}

module.exports = { parsePagination, buildPaginationMeta };

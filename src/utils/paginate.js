/**
 * src/utils/paginate.js
 */

function parsePagination(query) {
  const page   = Math.max(1, parseInt(query.page  || "1",  10));
  const limit  = Math.min(100, Math.max(1, parseInt(query.limit || "20", 10)));
  const skip   = (page - 1) * limit;
  return { page, limit, skip };
}

function buildPaginationMeta(page, limit, total) {
  const pages = Math.ceil(total / limit) || 1;
  return { page, limit, total, pages, hasNext: page < pages, hasPrev: page > 1 };
}

module.exports = { parsePagination, buildPaginationMeta };

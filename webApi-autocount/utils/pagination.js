/**
 * Parse and normalise pagination parameters from query string.
 * @param {object} query  - req.query
 * @param {number} defaultLimit - rows per page when not supplied
 * @returns {{ page, limit, offset }}
 */
export function parsePagination(query, defaultLimit = 20) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Build pagination metadata from count + page/limit values.
 * @param {number} totalRecords
 * @param {number} page
 * @param {number} limit
 */
export function buildPaginationMeta(totalRecords, page, limit) {
  const totalPages = Math.ceil(totalRecords / limit) || 1;

  return {
    currentPage: page,
    totalPages,
    totalRecords,
    limit,
  };
}

/**
 * Append OFFSET / FETCH NEXT clauses to a SQL string.
 * Works with SQL Server 2012+ (ORDER BY required before OFFSET).
 * The caller is responsible for adding ORDER BY before calling this.
 *
 * @param {object} request  - mssql Request instance
 * @param {number} offset
 * @param {number} limit
 * @returns {string}  SQL fragment
 */
export function sqlPaginate(request, offset, limit) {
  request.input("_offset", offset);
  request.input("_limit", limit);

  return "OFFSET @_offset ROWS FETCH NEXT @_limit ROWS ONLY";
}

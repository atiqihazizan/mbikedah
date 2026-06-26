/**
 * Build a consistent success response envelope.
 */
export function successResponse(data, message = "Success", extras = {}) {
  const payload = {
    success: true,
    message,
    ...extras,
  };

  if (Array.isArray(data)) {
    payload.total = data.length;
    payload.data = data;
  } else {
    payload.data = data;
  }

  return payload;
}

/**
 * Build a paginated success response envelope.
 */
export function paginatedResponse(data, pagination, message = "Success") {
  return {
    success: true,
    message,
    data,
    pagination: {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      limit: pagination.limit,
    },
  };
}

/**
 * Build a consistent error response envelope.
 */
export function errorResponse(message = "An error occurred.", error = undefined) {
  const payload = {
    success: false,
    message,
  };

  if (error !== undefined) {
    payload.error = error;
  }

  return payload;
}

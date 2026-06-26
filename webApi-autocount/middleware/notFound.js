import { errorResponse } from "../utils/response.js";

export function notFound(req, res) {
  res.status(404).json(errorResponse(`Route ${req.method} ${req.originalUrl} not found.`));
}

import { errorResponse } from "../utils/response.js";

/**
 * API Key authentication middleware.
 * Checks for X-API-Key header against the configured API_KEY env variable.
 * Replace or extend this with JWT validation if needed.
 */
export function apiKeyAuth(req, res, next) {
  const apiKey = req.headers["x-api-key"];

  if (!process.env.API_KEY) {
    return next();
  }

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json(errorResponse("Unauthorized. Invalid or missing API key."));
  }

  next();
}

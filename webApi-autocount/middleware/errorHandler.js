import logger from "./logger.js";
import { errorResponse } from "../utils/response.js";

export function errorHandler(err, req, res, next) {
  logger.error(`${err.name || "Error"}: ${err.message}`, {
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  if (err.name === "RequestError" || err.name === "ConnectionError") {
    return res
      .status(503)
      .json(errorResponse("Database error. Please try again later.", err.message));
  }

  if (err.name === "ValidationError") {
    return res.status(422).json(errorResponse(err.message));
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json(errorResponse(err.message));
  }

  return res
    .status(500)
    .json(
      errorResponse(
        "Internal server error.",
        process.env.NODE_ENV === "development" ? err.message : undefined
      )
    );
}

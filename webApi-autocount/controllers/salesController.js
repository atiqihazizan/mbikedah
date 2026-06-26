import { validationResult } from "express-validator";
import * as salesService from "../services/salesService.js";
import { successResponse, paginatedResponse, errorResponse } from "../utils/response.js";

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json(errorResponse("Validation failed.", errors.array()));
    return false;
  }
  return true;
}

export async function getSalesInvoices(req, res, next) {
  if (!handleValidation(req, res)) return;
  try {
    const { data, pagination } = await salesService.getSalesInvoices(req.query);
    res.json(paginatedResponse(data, pagination));
  } catch (err) {
    next(err);
  }
}

export async function getSalesInvoiceByDocNo(req, res, next) {
  try {
    const invoice = await salesService.getSalesInvoiceByDocNo(req.params.docNo);
    if (!invoice) {
      return res
        .status(404)
        .json(errorResponse(`Sales invoice '${req.params.docNo}' not found.`));
    }
    res.json(successResponse(invoice));
  } catch (err) {
    next(err);
  }
}

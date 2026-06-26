import { validationResult } from "express-validator";
import * as apService from "../services/apService.js";
import { successResponse, paginatedResponse, errorResponse } from "../utils/response.js";

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json(errorResponse("Validation failed.", errors.array()));
    return false;
  }
  return true;
}

export async function getCreditors(req, res, next) {
  if (!handleValidation(req, res)) return;
  try {
    const { data, pagination } = await apService.getCreditors(req.query);
    res.json(paginatedResponse(data, pagination));
  } catch (err) {
    next(err);
  }
}

export async function getCreditorByAccNo(req, res, next) {
  try {
    const creditor = await apService.getCreditorByAccNo(req.params.accNo);
    if (!creditor) {
      return res.status(404).json(errorResponse(`Creditor '${req.params.accNo}' not found.`));
    }
    res.json(successResponse(creditor));
  } catch (err) {
    next(err);
  }
}

export async function getInvoices(req, res, next) {
  if (!handleValidation(req, res)) return;
  try {
    const { data, pagination } = await apService.getInvoices(req.query);
    res.json(paginatedResponse(data, pagination));
  } catch (err) {
    next(err);
  }
}

export async function getInvoiceByDocNo(req, res, next) {
  try {
    const invoice = await apService.getInvoiceByDocNo(req.params.docNo);
    if (!invoice) {
      return res.status(404).json(errorResponse(`Invoice '${req.params.docNo}' not found.`));
    }
    res.json(successResponse(invoice));
  } catch (err) {
    next(err);
  }
}

export async function getPayments(req, res, next) {
  if (!handleValidation(req, res)) return;
  try {
    const { data, pagination } = await apService.getPayments(req.query);
    res.json(paginatedResponse(data, pagination));
  } catch (err) {
    next(err);
  }
}

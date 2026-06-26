import { validationResult } from "express-validator";
import * as arService from "../services/arService.js";
import { successResponse, paginatedResponse, errorResponse } from "../utils/response.js";

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json(errorResponse("Validation failed.", errors.array()));
    return false;
  }
  return true;
}

export async function getDebtors(req, res, next) {
  if (!handleValidation(req, res)) return;
  try {
    const { data, pagination } = await arService.getDebtors(req.query);
    res.json(paginatedResponse(data, pagination));
  } catch (err) {
    next(err);
  }
}

export async function getDebtorByAccNo(req, res, next) {
  try {
    const debtor = await arService.getDebtorByAccNo(req.params.accNo);
    if (!debtor) {
      return res.status(404).json(errorResponse(`Debtor '${req.params.accNo}' not found.`));
    }
    res.json(successResponse(debtor));
  } catch (err) {
    next(err);
  }
}

export async function getInvoices(req, res, next) {
  if (!handleValidation(req, res)) return;
  try {
    const { data, pagination } = await arService.getInvoices(req.query);
    res.json(paginatedResponse(data, pagination));
  } catch (err) {
    next(err);
  }
}

export async function getInvoiceByDocNo(req, res, next) {
  try {
    const invoice = await arService.getInvoiceByDocNo(req.params.docNo);
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
    const data = await arService.getPayments(req.query);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}

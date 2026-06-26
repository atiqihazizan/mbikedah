import { validationResult } from "express-validator";
import * as glService from "../services/glService.js";
import { successResponse, paginatedResponse, errorResponse } from "../utils/response.js";

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json(errorResponse("Validation failed.", errors.array()));
    return false;
  }
  return true;
}

export async function getAccounts(req, res, next) {
  if (!handleValidation(req, res)) return;
  try {
    const data = await glService.getAccounts(req.query);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}

export async function getCashBook(req, res, next) {
  if (!handleValidation(req, res)) return;
  try {
    const data = await glService.getCashBook(req.query);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}

export async function getJournal(req, res, next) {
  if (!handleValidation(req, res)) return;
  try {
    const data = await glService.getJournal(req.query);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}

export async function getLedger(req, res, next) {
  if (!handleValidation(req, res)) return;
  try {
    const data = await glService.getLedger(req.query);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}

export async function getTrialBalance(req, res, next) {
  if (!handleValidation(req, res)) return;
  try {
    const data = await glService.getTrialBalance(req.query);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}

export async function getProfitLoss(req, res, next) {
  if (!handleValidation(req, res)) return;
  try {
    const data = await glService.getProfitLoss(req.query);
    res.json({ success: true, message: "Success", ...data });
  } catch (err) {
    next(err);
  }
}

export async function getBalanceSheet(req, res, next) {
  if (!handleValidation(req, res)) return;
  try {
    const data = await glService.getBalanceSheet(req.query);
    res.json({ success: true, message: "Success", ...data });
  } catch (err) {
    next(err);
  }
}

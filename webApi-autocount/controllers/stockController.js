import { validationResult } from "express-validator";
import * as stockService from "../services/stockService.js";
import { successResponse, paginatedResponse, errorResponse } from "../utils/response.js";

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json(errorResponse("Validation failed.", errors.array()));
    return false;
  }
  return true;
}

export async function getItems(req, res, next) {
  if (!handleValidation(req, res)) return;
  try {
    const { data, pagination } = await stockService.getItems(req.query);
    res.json(paginatedResponse(data, pagination));
  } catch (err) {
    next(err);
  }
}

export async function getItemByCode(req, res, next) {
  try {
    const item = await stockService.getItemByCode(req.params.itemCode);
    if (!item) {
      return res.status(404).json(errorResponse(`Item '${req.params.itemCode}' not found.`));
    }
    res.json(successResponse(item));
  } catch (err) {
    next(err);
  }
}

export async function getStockBalance(req, res, next) {
  if (!handleValidation(req, res)) return;
  try {
    const data = await stockService.getStockBalance(req.query);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}

export async function getStockMovement(req, res, next) {
  if (!handleValidation(req, res)) return;
  try {
    const { data, pagination } = await stockService.getStockMovement(req.query);
    res.json(paginatedResponse(data, pagination));
  } catch (err) {
    next(err);
  }
}

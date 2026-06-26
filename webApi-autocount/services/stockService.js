import * as stockRepository from "../repositories/stockRepository.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";

export async function getItems(query) {
  const { page, limit, offset } = parsePagination(query);
  const { data, total } = await stockRepository.getItems({
    keyword: query.keyword,
    offset,
    limit,
  });

  return { data, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getItemByCode(itemCode) {
  return stockRepository.getItemByCode(itemCode);
}

export async function getStockBalance(query) {
  return stockRepository.getStockBalance({
    itemCode: query.itemCode,
    location: query.location,
  });
}

export async function getStockMovement(query) {
  const { page, limit, offset } = parsePagination(query);
  const { data, total } = await stockRepository.getStockMovement({
    itemCode: query.itemCode,
    from: query.from,
    to: query.to,
    offset,
    limit,
  });

  return { data, pagination: buildPaginationMeta(total, page, limit) };
}

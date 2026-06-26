import * as salesRepository from "../repositories/salesRepository.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";

export async function getSalesInvoices(query) {
  const { page, limit, offset } = parsePagination(query);
  const { data, total } = await salesRepository.getSalesInvoices({
    from: query.from,
    to: query.to,
    customer: query.customer,
    offset,
    limit,
  });

  return { data, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getSalesInvoiceByDocNo(docNo) {
  return salesRepository.getSalesInvoiceByDocNo(docNo);
}

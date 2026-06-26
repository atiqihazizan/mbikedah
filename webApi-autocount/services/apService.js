import * as apRepository from "../repositories/apRepository.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";

export async function getCreditors(query) {
  const { page, limit, offset } = parsePagination(query);
  const { data, total } = await apRepository.getCreditors({
    keyword: query.keyword,
    offset,
    limit,
  });

  return { data, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getCreditorByAccNo(accNo) {
  return apRepository.getCreditorByAccNo(accNo);
}

export async function getInvoices(query) {
  const { page, limit, offset } = parsePagination(query);
  const { data, total } = await apRepository.getInvoices({
    from: query.from,
    to: query.to,
    creditor: query.creditor,
    offset,
    limit,
  });

  return { data, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getInvoiceByDocNo(docNo) {
  return apRepository.getInvoiceByDocNo(docNo);
}

export async function getPayments(query) {
  const { page, limit, offset } = parsePagination(query);
  const { data, total } = await apRepository.getPayments({
    from: query.from,
    to: query.to,
    creditor: query.creditor,
    offset,
    limit,
  });

  return { data, pagination: buildPaginationMeta(total, page, limit) };
}

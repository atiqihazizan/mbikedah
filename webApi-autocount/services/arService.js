import * as arRepository from "../repositories/arRepository.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";

export async function getDebtors(query) {
  const { page, limit, offset } = parsePagination(query);
  const { data, total } = await arRepository.getDebtors({
    keyword: query.keyword,
    offset,
    limit,
  });

  return { data, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getDebtorByAccNo(accNo) {
  return arRepository.getDebtorByAccNo(accNo);
}

export async function getInvoices(query) {
  const { page, limit, offset } = parsePagination(query);
  const { data, total } = await arRepository.getInvoices({
    from: query.from,
    to: query.to,
    debtor: query.debtor,
    offset,
    limit,
  });

  return { data, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getInvoiceByDocNo(docNo) {
  return arRepository.getInvoiceByDocNo(docNo);
}

export async function getPayments(query) {
  return arRepository.getPayments({
    from: query.from,
    to: query.to,
    debtor: query.debtor,
  });
}

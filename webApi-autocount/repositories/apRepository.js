/**
 * AP Repository — AutoCount AED_MBI
 *
 * Tables:
 *   Creditor       — Creditor master
 *   APInvoice      — AP Invoice header  (join key: DocKey)
 *   APInvoiceDTL   — AP Invoice GL lines
 *   APPayment      — AP Payment header
 */

import { getPool, sql } from "../config/database.js";
import { sqlPaginate } from "../utils/pagination.js";

export async function getCreditors({ keyword, offset, limit }) {
  const pool = await getPool();
  const request = pool.request();

  const hasKeyword = Boolean(keyword);

  const countRequest = pool.request();
  if (hasKeyword) countRequest.input("keyword", sql.NVarChar(200), `%${keyword}%`);

  const countResult = await countRequest.query(
    hasKeyword
      ? `SELECT COUNT(*) AS total FROM Creditor WHERE AccNo LIKE @keyword OR CompanyName LIKE @keyword`
      : `SELECT COUNT(*) AS total FROM Creditor`
  );
  const total = countResult.recordset[0].total;

  let query = `
    SELECT
      AccNo          AS accNo,
      CompanyName    AS companyName,
      Attention      AS contactPerson,
      Phone1         AS phone,
      EmailAddress   AS email,
      Address1       AS address1,
      Address2       AS address2,
      Address3       AS address3,
      Address4       AS address4,
      CreditLimit    AS creditLimit,
      DisplayTerm    AS creditTerm,
      CurrencyCode   AS currencyCode,
      IsActive       AS isActive,
      AreaCode       AS areaCode,
      PurchaseAgent  AS purchaseAgent
    FROM Creditor
    WHERE 1 = 1
  `;

  if (hasKeyword) {
    request.input("keyword", sql.NVarChar(200), `%${keyword}%`);
    query += " AND (AccNo LIKE @keyword OR CompanyName LIKE @keyword)";
  }

  query += ` ORDER BY AccNo ${sqlPaginate(request, offset, limit)}`;

  const result = await request.query(query);
  return { data: result.recordset, total };
}

export async function getCreditorByAccNo(accNo) {
  const pool = await getPool();
  const request = pool.request();

  request.input("accNo", sql.NVarChar(30), accNo);

  const result = await request.query(`
    SELECT
      AccNo          AS accNo,
      CompanyName    AS companyName,
      Attention      AS contactPerson,
      Phone1         AS phone,
      Phone2         AS phone2,
      Fax1           AS fax,
      EmailAddress   AS email,
      Address1       AS address1,
      Address2       AS address2,
      Address3       AS address3,
      Address4       AS address4,
      PostCode       AS postCode,
      CreditLimit    AS creditLimit,
      DisplayTerm    AS creditTerm,
      CurrencyCode   AS currencyCode,
      IsActive       AS isActive,
      AreaCode       AS areaCode,
      PurchaseAgent  AS purchaseAgent,
      RegisterNo     AS registerNo,
      TaxRegisterNo  AS taxRegisterNo,
      Note           AS note
    FROM Creditor
    WHERE AccNo = @accNo
  `);

  return result.recordset[0] || null;
}

export async function getInvoices({ from, to, creditor, offset, limit }) {
  const pool = await getPool();
  const request = pool.request();

  let conditions = [];
  if (from) {
    request.input("from", sql.Date, from);
    conditions.push("h.DocDate >= @from");
  }
  if (to) {
    request.input("to", sql.Date, to);
    conditions.push("h.DocDate <= @to");
  }
  if (creditor) {
    request.input("creditor", sql.NVarChar(30), creditor);
    conditions.push("h.CreditorCode = @creditor");
  }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

  const countRequest = pool.request();
  if (from)     countRequest.input("from",     sql.Date,         from);
  if (to)       countRequest.input("to",       sql.Date,         to);
  if (creditor) countRequest.input("creditor", sql.NVarChar(30), creditor);

  const countResult = await countRequest.query(
    `SELECT COUNT(*) AS total FROM APInvoice h ${where}`
  );
  const total = countResult.recordset[0].total;

  const query = `
    SELECT
      h.DocNo            AS docNo,
      h.DocDate          AS docDate,
      h.CreditorCode     AS creditorCode,
      c.CompanyName      AS creditorName,
      h.Description      AS description,
      h.CurrencyCode     AS currencyCode,
      h.CurrencyRate     AS currencyRate,
      h.Total            AS subTotal,
      h.Tax              AS taxAmt,
      h.NetTotal         AS netTotal,
      h.Outstanding      AS outstanding,
      h.Cancelled        AS cancelled,
      h.SupplierInvoiceNo AS supplierInvNo
    FROM APInvoice h
    INNER JOIN Creditor c ON c.AccNo = h.CreditorCode
    ${where}
    ORDER BY h.DocDate DESC, h.DocNo DESC
    ${sqlPaginate(request, offset, limit)}
  `;

  const result = await request.query(query);
  return { data: result.recordset, total };
}

export async function getInvoiceByDocNo(docNo) {
  const pool = await getPool();
  const request = pool.request();

  request.input("docNo", sql.NVarChar(30), docNo);

  const headerResult = await request.query(`
    SELECT
      h.DocKey           AS docKey,
      h.DocNo            AS docNo,
      h.DocDate          AS docDate,
      h.CreditorCode     AS creditorCode,
      c.CompanyName      AS creditorName,
      h.Description      AS description,
      h.CurrencyCode     AS currencyCode,
      h.CurrencyRate     AS currencyRate,
      h.Total            AS subTotal,
      h.Tax              AS taxAmt,
      h.NetTotal         AS netTotal,
      h.Outstanding      AS outstanding,
      h.Cancelled        AS cancelled,
      h.SupplierInvoiceNo AS supplierInvNo,
      h.Note             AS note
    FROM APInvoice h
    INNER JOIN Creditor c ON c.AccNo = h.CreditorCode
    WHERE h.DocNo = @docNo
  `);

  if (!headerResult.recordset[0]) return null;

  const docKey = headerResult.recordset[0].docKey;

  const detailResult = await pool.request()
    .input("docKey", sql.BigInt, docKey)
    .query(`
      SELECT
        Seq         AS seq,
        AccNo       AS accNo,
        Description AS description,
        TaxType     AS taxType,
        TaxRate     AS taxRate,
        Tax         AS taxAmt,
        SubTotal    AS subTotal,
        Amount      AS amount,
        NetAmount   AS netAmount,
        ProjNo      AS projNo,
        DeptNo      AS deptNo
      FROM APInvoiceDTL
      WHERE DocKey = @docKey
      ORDER BY Seq
    `);

  const { docKey: _dk, ...header } = headerResult.recordset[0];
  return { ...header, details: detailResult.recordset };
}

export async function getPayments({ from, to, creditor, offset, limit }) {
  const pool = await getPool();
  const request = pool.request();

  let conditions = [];
  if (from) {
    request.input("from", sql.Date, from);
    conditions.push("h.DocDate >= @from");
  }
  if (to) {
    request.input("to", sql.Date, to);
    conditions.push("h.DocDate <= @to");
  }
  if (creditor) {
    request.input("creditor", sql.NVarChar(30), creditor);
    conditions.push("h.CreditorCode = @creditor");
  }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

  const countRequest = pool.request();
  if (from)     countRequest.input("from",     sql.Date,         from);
  if (to)       countRequest.input("to",       sql.Date,         to);
  if (creditor) countRequest.input("creditor", sql.NVarChar(30), creditor);

  const countResult = await countRequest.query(
    `SELECT COUNT(*) AS total FROM APPayment h ${where}`
  );
  const total = countResult.recordset[0].total;

  const query = `
    SELECT
      h.DocNo        AS docNo,
      h.DocDate      AS docDate,
      h.CreditorCode AS creditorCode,
      c.CompanyName  AS creditorName,
      h.Description  AS description,
      h.CurrencyCode AS currencyCode,
      h.CurrencyRate AS currencyRate,
      h.NetTotal     AS netTotal,
      h.Cancelled    AS cancelled
    FROM APPayment h
    INNER JOIN Creditor c ON c.AccNo = h.CreditorCode
    ${where}
    ORDER BY h.DocDate DESC, h.DocNo DESC
    ${sqlPaginate(request, offset, limit)}
  `;

  const result = await request.query(query);
  return { data: result.recordset, total };
}

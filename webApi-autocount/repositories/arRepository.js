/**
 * AR Repository — AutoCount AED_MBI
 *
 * Tables:
 *   Debtor         — Debtor master
 *   ARInvoice      — AR Invoice header  (join key: DocKey)
 *   ARInvoiceDTL   — AR Invoice GL lines (no ItemCode — account-based)
 *   ARPayment      — AR Payment/Receipt header
 */

import { getPool, sql } from "../config/database.js";
import { sqlPaginate } from "../utils/pagination.js";

export async function getDebtors({ keyword, offset, limit }) {
  const pool = await getPool();
  const request = pool.request();

  const hasKeyword = Boolean(keyword);

  const countRequest = pool.request();
  if (hasKeyword) countRequest.input("keyword", sql.NVarChar(200), `%${keyword}%`);

  const countResult = await countRequest.query(
    hasKeyword
      ? `SELECT COUNT(*) AS total FROM Debtor WHERE AccNo LIKE @keyword OR CompanyName LIKE @keyword`
      : `SELECT COUNT(*) AS total FROM Debtor`
  );
  const total = countResult.recordset[0].total;

  let query = `
    SELECT
      AccNo         AS accNo,
      CompanyName   AS companyName,
      Attention     AS contactPerson,
      Phone1        AS phone,
      EmailAddress  AS email,
      Address1      AS address1,
      Address2      AS address2,
      Address3      AS address3,
      Address4      AS address4,
      CreditLimit   AS creditLimit,
      DisplayTerm   AS creditTerm,
      CurrencyCode  AS currencyCode,
      IsActive      AS isActive,
      AreaCode      AS areaCode,
      SalesAgent    AS salesAgent
    FROM Debtor
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

export async function getDebtorByAccNo(accNo) {
  const pool = await getPool();
  const request = pool.request();

  request.input("accNo", sql.NVarChar(30), accNo);

  const result = await request.query(`
    SELECT
      AccNo         AS accNo,
      CompanyName   AS companyName,
      Attention     AS contactPerson,
      Phone1        AS phone,
      Phone2        AS phone2,
      Fax1          AS fax,
      EmailAddress  AS email,
      Address1      AS address1,
      Address2      AS address2,
      Address3      AS address3,
      Address4      AS address4,
      PostCode      AS postCode,
      CreditLimit   AS creditLimit,
      DisplayTerm   AS creditTerm,
      CurrencyCode  AS currencyCode,
      IsActive      AS isActive,
      AreaCode      AS areaCode,
      SalesAgent    AS salesAgent,
      RegisterNo    AS registerNo,
      TaxRegisterNo AS taxRegisterNo,
      Note          AS note
    FROM Debtor
    WHERE AccNo = @accNo
  `);

  return result.recordset[0] || null;
}

export async function getInvoices({ from, to, debtor, offset, limit }) {
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
  if (debtor) {
    request.input("debtor", sql.NVarChar(30), debtor);
    conditions.push("h.DebtorCode = @debtor");
  }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

  const countRequest = pool.request();
  if (from)   countRequest.input("from",   sql.Date,         from);
  if (to)     countRequest.input("to",     sql.Date,         to);
  if (debtor) countRequest.input("debtor", sql.NVarChar(30), debtor);

  const countResult = await countRequest.query(
    `SELECT COUNT(*) AS total FROM ARInvoice h ${where}`
  );
  const total = countResult.recordset[0].total;

  const query = `
    SELECT
      h.DocNo        AS docNo,
      h.DocDate      AS docDate,
      h.DebtorCode   AS debtorCode,
      d.CompanyName  AS debtorName,
      h.Description  AS description,
      h.CurrencyCode AS currencyCode,
      h.CurrencyRate AS currencyRate,
      h.Total        AS subTotal,
      h.Tax          AS taxAmt,
      h.NetTotal     AS netTotal,
      h.Outstanding  AS outstanding,
      h.Cancelled    AS cancelled,
      h.SalesAgent   AS salesAgent
    FROM ARInvoice h
    INNER JOIN Debtor d ON d.AccNo = h.DebtorCode
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
      h.DocKey       AS docKey,
      h.DocNo        AS docNo,
      h.DocDate      AS docDate,
      h.DebtorCode   AS debtorCode,
      d.CompanyName  AS debtorName,
      h.Description  AS description,
      h.CurrencyCode AS currencyCode,
      h.CurrencyRate AS currencyRate,
      h.Total        AS subTotal,
      h.Tax          AS taxAmt,
      h.NetTotal     AS netTotal,
      h.Outstanding  AS outstanding,
      h.Cancelled    AS cancelled,
      h.SalesAgent   AS salesAgent,
      h.Note         AS note
    FROM ARInvoice h
    INNER JOIN Debtor d ON d.AccNo = h.DebtorCode
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
      FROM ARInvoiceDTL
      WHERE DocKey = @docKey
      ORDER BY Seq
    `);

  const { docKey: _dk, ...header } = headerResult.recordset[0];
  return { ...header, details: detailResult.recordset };
}

export async function getPayments({ from, to, debtor }) {
  const pool = await getPool();
  const request = pool.request();

  let query = `
    SELECT
      h.DocNo        AS docNo,
      h.DocDate      AS docDate,
      h.DebtorCode   AS debtorCode,
      d.CompanyName  AS debtorName,
      h.Description  AS description,
      h.CurrencyCode AS currencyCode,
      h.CurrencyRate AS currencyRate,
      h.NetTotal     AS netTotal,
      h.Cancelled    AS cancelled
    FROM ARPayment h
    INNER JOIN Debtor d ON d.AccNo = h.DebtorCode
    WHERE 1 = 1
  `;

  if (from) {
    request.input("from", sql.Date, from);
    query += " AND h.DocDate >= @from";
  }
  if (to) {
    request.input("to", sql.Date, to);
    query += " AND h.DocDate <= @to";
  }
  if (debtor) {
    request.input("debtor", sql.NVarChar(30), debtor);
    query += " AND h.DebtorCode = @debtor";
  }

  query += " ORDER BY h.DocDate DESC, h.DocNo DESC";

  const result = await request.query(query);
  return result.recordset;
}

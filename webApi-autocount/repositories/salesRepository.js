/**
 * Sales Repository — AutoCount AED_MBI
 *
 * Tables:
 *   IV      — Sales Invoice header  (join key: DocKey)
 *   IVDTL   — Sales Invoice item lines
 *   Debtor  — Customer master
 */

import { getPool, sql } from "../config/database.js";
import { sqlPaginate } from "../utils/pagination.js";

export async function getSalesInvoices({ from, to, customer, offset, limit }) {
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
  if (customer) {
    request.input("customer", sql.NVarChar(30), customer);
    conditions.push("h.DebtorCode = @customer");
  }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

  const countRequest = pool.request();
  if (from)     countRequest.input("from",     sql.Date,         from);
  if (to)       countRequest.input("to",       sql.Date,         to);
  if (customer) countRequest.input("customer", sql.NVarChar(30), customer);

  const countResult = await countRequest.query(
    `SELECT COUNT(*) AS total FROM IV h ${where}`
  );
  const total = countResult.recordset[0].total;

  const query = `
    SELECT
      h.DocNo        AS docNo,
      h.DocDate      AS docDate,
      h.DebtorCode   AS customerCode,
      h.DebtorName   AS customerName,
      h.Description  AS description,
      h.CurrencyCode AS currencyCode,
      h.CurrencyRate AS currencyRate,
      h.Total        AS subTotal,
      h.Tax          AS taxAmt,
      h.NetTotal     AS netTotal,
      h.Cancelled    AS cancelled,
      h.SalesAgent   AS salesAgent,
      h.RefDocNo     AS refDocNo
    FROM IV h
    ${where}
    ORDER BY h.DocDate DESC, h.DocNo DESC
    ${sqlPaginate(request, offset, limit)}
  `;

  const result = await request.query(query);
  return { data: result.recordset, total };
}

export async function getSalesInvoiceByDocNo(docNo) {
  const pool = await getPool();
  const request = pool.request();

  request.input("docNo", sql.NVarChar(30), docNo);

  const headerResult = await request.query(`
    SELECT
      h.DocKey       AS docKey,
      h.DocNo        AS docNo,
      h.DocDate      AS docDate,
      h.DebtorCode   AS customerCode,
      h.DebtorName   AS customerName,
      h.Description  AS description,
      h.CurrencyCode AS currencyCode,
      h.CurrencyRate AS currencyRate,
      h.Total        AS subTotal,
      h.Tax          AS taxAmt,
      h.NetTotal     AS netTotal,
      h.Cancelled    AS cancelled,
      h.SalesAgent   AS salesAgent,
      h.RefDocNo     AS refDocNo,
      h.Note         AS note,
      h.Remark1      AS remark1,
      h.Remark2      AS remark2
    FROM IV h
    WHERE h.DocNo = @docNo
  `);

  if (!headerResult.recordset[0]) return null;

  const docKey = headerResult.recordset[0].docKey;

  const detailResult = await pool.request()
    .input("docKey", sql.BigInt, docKey)
    .query(`
      SELECT
        Seq          AS seq,
        ItemCode     AS itemCode,
        Description  AS description,
        UOM          AS uom,
        Qty          AS qty,
        UnitPrice    AS unitPrice,
        Discount     AS discount,
        DiscountAmt  AS discountAmt,
        SubTotal     AS subTotal,
        TaxType      AS taxType,
        TaxRate      AS taxRate,
        Tax          AS taxAmt,
        Location     AS location,
        ProjNo       AS projNo,
        DeptNo       AS deptNo
      FROM IVDTL
      WHERE DocKey = @docKey AND MainItem = 'T'
      ORDER BY Seq
    `);

  const { docKey: _dk, ...header } = headerResult.recordset[0];
  return { ...header, details: detailResult.recordset };
}

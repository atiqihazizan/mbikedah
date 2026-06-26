/**
 * GL Repository — AutoCount AED_MBI
 *
 * Tables:
 *   GLMast   — Chart of Accounts
 *   GLDTL    — Posted GL transaction lines
 *   CB/CBDTL — Cash Book (verify columns if error)
 *   JE/JEDTL — Journal Entry (verify columns if error)
 */

import { getPool, sql } from "../config/database.js";

export async function getAccounts({ accountCode, accountName }) {
  const pool = await getPool();
  const request = pool.request();

  let query = `
    SELECT
      AccNo        AS accountCode,
      Description  AS accountName,
      AccType      AS accountType,
      ParentAccNo  AS parentAccNo,
      CurrencyCode AS currencyCode
    FROM GLMast
    WHERE 1 = 1
  `;

  if (accountCode) {
    request.input("accountCode", sql.NVarChar(30), `%${accountCode}%`);
    query += " AND AccNo LIKE @accountCode";
  }

  if (accountName) {
    request.input("accountName", sql.NVarChar(200), `%${accountName}%`);
    query += " AND Description LIKE @accountName";
  }

  query += " ORDER BY AccNo";

  const result = await request.query(query);
  return result.recordset;
}

export async function getCashBook({ from, to }) {
  const pool = await getPool();
  const request = pool.request();

  let query = `
    SELECT
      h.DocNo       AS docNo,
      h.DocDate     AS docDate,
      h.AccNo       AS accountCode,
      g.Description AS accountName,
      h.Description AS description,
      h.ChequeNo    AS chequeNo,
      h.DocAmt      AS docAmt,
      h.Cancelled   AS cancelled
    FROM CB h
    INNER JOIN GLMast g ON g.AccNo = h.AccNo
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

  query += " ORDER BY h.DocDate, h.DocNo";

  const result = await request.query(query);
  return result.recordset;
}

export async function getJournal({ from, to }) {
  const pool = await getPool();
  const request = pool.request();

  let query = `
    SELECT
      h.DocNo       AS docNo,
      h.DocDate     AS docDate,
      h.Description AS description,
      h.Cancelled   AS cancelled,
      d.AccNo       AS accountCode,
      g.Description AS accountName,
      d.Description AS lineDescription,
      d.DR          AS debit,
      d.CR          AS credit
    FROM JE h
    INNER JOIN JEDTL d ON d.DocKey = h.DocKey
    INNER JOIN GLMast g ON g.AccNo = d.AccNo
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

  query += " ORDER BY h.DocDate, h.DocNo";

  const result = await request.query(query);
  return result.recordset;
}

export async function getLedger({ account, from, to }) {
  const pool = await getPool();
  const request = pool.request();

  let query = `
    SELECT
      d.RefNo1      AS docNo,
      d.TransDate   AS docDate,
      d.AccNo       AS accountCode,
      g.Description AS accountName,
      d.Description AS description,
      d.DR          AS debit,
      d.CR          AS credit,
      d.JournalType AS journalType,
      d.ProjNo      AS projNo,
      d.DeptNo      AS deptNo
    FROM GLDTL d
    INNER JOIN GLMast g ON g.AccNo = d.AccNo
    WHERE 1 = 1
  `;

  if (account) {
    request.input("account", sql.NVarChar(30), account);
    query += " AND d.AccNo = @account";
  }

  if (from) {
    request.input("from", sql.Date, from);
    query += " AND d.TransDate >= @from";
  }

  if (to) {
    request.input("to", sql.Date, to);
    query += " AND d.TransDate <= @to";
  }

  query += " ORDER BY d.TransDate, d.RefNo1";

  const result = await request.query(query);
  return result.recordset;
}

export async function getTrialBalance({ from, to }) {
  const pool = await getPool();
  const request = pool.request();

  let query = `
    SELECT
      d.AccNo                     AS accountCode,
      g.Description               AS accountName,
      g.AccType                   AS accountType,
      SUM(d.DR)                   AS totalDebit,
      SUM(d.CR)                   AS totalCredit,
      SUM(d.DR) - SUM(d.CR)       AS balance
    FROM GLDTL d
    INNER JOIN GLMast g ON g.AccNo = d.AccNo
    WHERE 1 = 1
  `;

  if (from) {
    request.input("from", sql.Date, from);
    query += " AND d.TransDate >= @from";
  }

  if (to) {
    request.input("to", sql.Date, to);
    query += " AND d.TransDate <= @to";
  }

  query += `
    GROUP BY d.AccNo, g.Description, g.AccType
    HAVING SUM(d.DR) <> 0 OR SUM(d.CR) <> 0
    ORDER BY d.AccNo
  `;

  const result = await request.query(query);
  return result.recordset;
}

export async function getProfitLoss({ from, to }) {
  const pool = await getPool();
  const request = pool.request();

  let query = `
    SELECT
      d.AccNo                     AS accountCode,
      g.Description               AS accountName,
      g.AccType                   AS accountType,
      SUM(d.DR)                   AS totalDebit,
      SUM(d.CR)                   AS totalCredit,
      CASE
        WHEN g.AccType = 'I' THEN SUM(d.CR) - SUM(d.DR)
        WHEN g.AccType = 'X' THEN SUM(d.DR) - SUM(d.CR)
        ELSE 0
      END                         AS amount
    FROM GLDTL d
    INNER JOIN GLMast g ON g.AccNo = d.AccNo
    WHERE g.AccType IN ('I', 'X')
  `;

  if (from) {
    request.input("from", sql.Date, from);
    query += " AND d.TransDate >= @from";
  }

  if (to) {
    request.input("to", sql.Date, to);
    query += " AND d.TransDate <= @to";
  }

  query += `
    GROUP BY d.AccNo, g.Description, g.AccType
    ORDER BY g.AccType DESC, d.AccNo
  `;

  const result = await request.query(query);
  return result.recordset;
}

export async function getBalanceSheet({ date }) {
  const pool = await getPool();
  const request = pool.request();

  let query = `
    SELECT
      d.AccNo                     AS accountCode,
      g.Description               AS accountName,
      g.AccType                   AS accountType,
      SUM(d.DR)                   AS totalDebit,
      SUM(d.CR)                   AS totalCredit,
      CASE
        WHEN g.AccType = 'A' THEN SUM(d.DR) - SUM(d.CR)
        ELSE SUM(d.CR) - SUM(d.DR)
      END                         AS balance
    FROM GLDTL d
    INNER JOIN GLMast g ON g.AccNo = d.AccNo
    WHERE g.AccType IN ('A', 'L', 'E')
  `;

  if (date) {
    request.input("date", sql.Date, date);
    query += " AND d.TransDate <= @date";
  }

  query += `
    GROUP BY d.AccNo, g.Description, g.AccType
    HAVING SUM(d.DR) <> 0 OR SUM(d.CR) <> 0
    ORDER BY g.AccType, d.AccNo
  `;

  const result = await request.query(query);
  return result.recordset;
}

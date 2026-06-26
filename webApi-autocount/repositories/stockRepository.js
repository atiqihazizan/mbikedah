/**
 * Stock Repository — AutoCount AED_MBI
 *
 * Tables:
 *   Item         — Stock item master
 *   ItemBalQty   — Current stock balance per item per location per UOM
 *   StockDTL     — Stock transaction movement
 */

import { getPool, sql } from "../config/database.js";
import { sqlPaginate } from "../utils/pagination.js";

export async function getItems({ keyword, offset, limit }) {
  const pool = await getPool();
  const request = pool.request();

  const hasKeyword = Boolean(keyword);

  const countRequest = pool.request();
  if (hasKeyword) countRequest.input("keyword", sql.NVarChar(200), `%${keyword}%`);

  const countResult = await countRequest.query(
    hasKeyword
      ? `SELECT COUNT(*) AS total FROM Item WHERE ItemCode LIKE @keyword OR Description LIKE @keyword`
      : `SELECT COUNT(*) AS total FROM Item`
  );
  const total = countResult.recordset[0].total;

  let query = `
    SELECT
      ItemCode      AS itemCode,
      Description   AS description,
      Desc2         AS desc2,
      ItemGroup     AS itemGroup,
      ItemType      AS itemType,
      BaseUOM       AS baseUom,
      SalesUOM      AS salesUom,
      PurchaseUOM   AS purchaseUom,
      CostingMethod AS costingMethod,
      IsActive      AS isActive,
      StockControl  AS stockControl,
      GlobalCode    AS globalCode
    FROM Item
    WHERE 1 = 1
  `;

  if (hasKeyword) {
    request.input("keyword", sql.NVarChar(200), `%${keyword}%`);
    query += " AND (ItemCode LIKE @keyword OR Description LIKE @keyword)";
  }

  query += ` ORDER BY ItemCode ${sqlPaginate(request, offset, limit)}`;

  const result = await request.query(query);
  return { data: result.recordset, total };
}

export async function getItemByCode(itemCode) {
  const pool = await getPool();
  const request = pool.request();

  request.input("itemCode", sql.NVarChar(30), itemCode);

  const result = await request.query(`
    SELECT
      ItemCode      AS itemCode,
      Description   AS description,
      Desc2         AS desc2,
      ItemGroup     AS itemGroup,
      ItemType      AS itemType,
      BaseUOM       AS baseUom,
      SalesUOM      AS salesUom,
      PurchaseUOM   AS purchaseUom,
      CostingMethod AS costingMethod,
      IsActive      AS isActive,
      StockControl  AS stockControl,
      GlobalCode    AS globalCode,
      Note          AS note
    FROM Item
    WHERE ItemCode = @itemCode
  `);

  return result.recordset[0] || null;
}

export async function getStockBalance({ itemCode, location }) {
  const pool = await getPool();
  const request = pool.request();

  let query = `
    SELECT
      b.ItemCode    AS itemCode,
      i.Description AS description,
      b.UOM         AS uom,
      b.Location    AS location,
      b.BalQty      AS balanceQty
    FROM ItemBalQty b
    INNER JOIN Item i ON i.ItemCode = b.ItemCode
    WHERE 1 = 1
  `;

  if (itemCode) {
    request.input("itemCode", sql.NVarChar(30), itemCode);
    query += " AND b.ItemCode = @itemCode";
  }

  if (location) {
    request.input("location", sql.NVarChar(30), location);
    query += " AND b.Location = @location";
  }

  query += " ORDER BY b.ItemCode, b.Location, b.UOM";

  const result = await request.query(query);
  return result.recordset;
}

export async function getStockMovement({ itemCode, from, to, offset, limit }) {
  const pool = await getPool();
  const request = pool.request();

  let conditions = [];
  if (itemCode) {
    request.input("itemCode", sql.NVarChar(30), itemCode);
    conditions.push("s.ItemCode = @itemCode");
  }
  if (from) {
    request.input("from", sql.Date, from);
    conditions.push("s.DocDate >= @from");
  }
  if (to) {
    request.input("to", sql.Date, to);
    conditions.push("s.DocDate <= @to");
  }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

  const countRequest = pool.request();
  if (itemCode) countRequest.input("itemCode", sql.NVarChar(30), itemCode);
  if (from)     countRequest.input("from",     sql.Date,         from);
  if (to)       countRequest.input("to",       sql.Date,         to);

  const countResult = await countRequest.query(
    `SELECT COUNT(*) AS total FROM StockDTL s ${where}`
  );
  const total = countResult.recordset[0].total;

  const query = `
    SELECT
      s.DocDate     AS docDate,
      s.DocType     AS docType,
      s.DocKey      AS docKey,
      s.ItemCode    AS itemCode,
      i.Description AS description,
      s.UOM         AS uom,
      s.Qty         AS qty,
      s.Location    AS location,
      s.Cost        AS unitCost,
      s.TotalCost   AS totalCost,
      s.BatchNo     AS batchNo,
      s.ProjNo      AS projNo
    FROM StockDTL s
    INNER JOIN Item i ON i.ItemCode = s.ItemCode
    ${where}
    ORDER BY s.DocDate DESC, s.StockDTLKey DESC
    ${sqlPaginate(request, offset, limit)}
  `;

  const result = await request.query(query);
  return { data: result.recordset, total };
}

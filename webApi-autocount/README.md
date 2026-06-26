# AutoCount REST API

Read-only REST API for AutoCount Accounting built with Node.js + Express + MSSQL.

---

## Tech Stack

| Package | Purpose |
|---|---|
| `express` | HTTP framework |
| `mssql` | SQL Server driver with connection pool |
| `helmet` | Security headers |
| `cors` | Cross-origin resource sharing |
| `compression` | Gzip response compression |
| `morgan` + `winston` | HTTP & application logging |
| `express-validator` | Request validation |
| `express-rate-limit` | Rate limiting |
| `swagger-jsdoc` + `swagger-ui-express` | API documentation |
| `dotenv` | Environment variables |

---

## Installation

```bash
# Clone / copy the project
cd webApi-autocount

# Install dependencies
npm install

# Copy env file
cp .env.example .env
```

---

## Configuration

Edit `.env` and fill in all values:

```env
PORT=3000
NODE_ENV=development

# SQL Server
DB_SERVER=192.168.1.100
DB_DATABASE=AutoCount
DB_USER=sa
DB_PASSWORD=yourpassword
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

# Security
API_KEY=your-secret-api-key

# CORS (comma-separated or * for all)
CORS_ORIGIN=http://localhost:8080
```

---

## Run

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

---

## Folder Structure

```
webApi-autocount/
├── config/
│   └── database.js          # MSSQL connection pool
├── controllers/
│   ├── glController.js
│   ├── arController.js
│   ├── apController.js
│   ├── salesController.js
│   └── stockController.js
├── services/
│   ├── glService.js
│   ├── arService.js
│   ├── apService.js
│   ├── salesService.js
│   └── stockService.js
├── repositories/
│   ├── glRepository.js      # Raw SQL queries — adjust table names here
│   ├── arRepository.js
│   ├── apRepository.js
│   ├── salesRepository.js
│   └── stockRepository.js
├── routes/
│   ├── gl.js
│   ├── ar.js
│   ├── ap.js
│   ├── sales.js
│   └── stock.js
├── middleware/
│   ├── errorHandler.js      # Centralised error handling
│   ├── notFound.js
│   ├── logger.js            # Winston + Daily Rotate
│   └── auth.js              # API Key authentication
├── utils/
│   ├── response.js          # Consistent response envelopes
│   ├── pagination.js        # Pagination helpers
│   └── dateHelper.js        # Date utilities
├── swagger/
│   └── swagger.js           # OpenAPI 3.0 spec
├── logs/                    # Auto-created at runtime
├── server.js                # Entry point
├── .env.example
└── package.json
```

---

## API List

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Server + database health check |

### General Ledger — `/api/gl`

| Method | Endpoint | Query Parameters |
|---|---|---|
| GET | `/api/gl/accounts` | `accountCode`, `accountName` |
| GET | `/api/gl/cashbook` | `from`, `to` |
| GET | `/api/gl/journal` | `from`, `to` |
| GET | `/api/gl/ledger` | `account`, `from`, `to` |
| GET | `/api/gl/trial-balance` | `from`, `to` |
| GET | `/api/gl/profit-loss` | `from`, `to` |
| GET | `/api/gl/balance-sheet` | `date` |

### Account Receivable — `/api/ar`

| Method | Endpoint | Query Parameters |
|---|---|---|
| GET | `/api/ar/debtors` | `keyword`, `page`, `limit` |
| GET | `/api/ar/debtors/:accNo` | — |
| GET | `/api/ar/invoices` | `from`, `to`, `debtor`, `page`, `limit` |
| GET | `/api/ar/invoices/:docNo` | — |
| GET | `/api/ar/payments` | `from`, `to`, `debtor` |

### Account Payable — `/api/ap`

| Method | Endpoint | Query Parameters |
|---|---|---|
| GET | `/api/ap/creditors` | `keyword`, `page`, `limit` |
| GET | `/api/ap/creditors/:accNo` | — |
| GET | `/api/ap/invoices` | `from`, `to`, `creditor`, `page`, `limit` |
| GET | `/api/ap/invoices/:docNo` | — |
| GET | `/api/ap/payments` | `from`, `to`, `creditor`, `page`, `limit` |

### Sales — `/api/sales`

| Method | Endpoint | Query Parameters |
|---|---|---|
| GET | `/api/sales/invoices` | `from`, `to`, `customer`, `page`, `limit` |
| GET | `/api/sales/invoices/:docNo` | — |

### Stock — `/api/stock`

| Method | Endpoint | Query Parameters |
|---|---|---|
| GET | `/api/stock/items` | `keyword`, `page`, `limit` |
| GET | `/api/stock/items/:itemCode` | — |
| GET | `/api/stock/balance` | `itemCode`, `location` |
| GET | `/api/stock/movement` | `itemCode`, `from`, `to`, `page`, `limit` |

---

## Swagger UI

Open browser at:

```
http://localhost:3000/api-docs
```

Raw OpenAPI JSON:

```
http://localhost:3000/api-docs.json
```

---

## Authentication

All `/api/*` routes require the header:

```
X-API-Key: your-secret-api-key
```

Set `API_KEY=` in `.env`. If left empty, auth is disabled (development mode).

---

## Response Format

### Success (list)
```json
{
  "success": true,
  "message": "Success",
  "total": 100,
  "data": []
}
```

### Success (paginated)
```json
{
  "success": true,
  "message": "Success",
  "data": [],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalRecords": 100,
    "limit": 20
  }
}
```

### Error
```json
{
  "success": false,
  "message": "Database error. Please try again later.",
  "error": "..."
}
```

---

## AutoCount Table Reference

Repositories use the following AutoCount SQL Server table names.  
**Adjust column names in `repositories/` if your AutoCount version differs.**

| Module | Table | Description |
|---|---|---|
| GL | `GLAccount` | Chart of Accounts |
| GL | `GLTrans` | Posted GL transaction lines |
| AR | `ARDebtor` | Debtor master |
| AR | `ARINV` | AR Invoice header |
| AR | `ARINVDet` | AR Invoice lines |
| AR | `ARRCP` | AR Receipt header |
| AP | `APCreditor` | Creditor master |
| AP | `APINV` | AP Invoice header |
| AP | `APINVDet` | AP Invoice lines |
| AP | `APPMT` | AP Payment header |
| Sales | `SL_IV` | Sales Invoice header |
| Sales | `SL_IVDet` | Sales Invoice lines |
| Stock | `ItemMaster` | Stock item master |
| Stock | `StockBalance` | Current stock balance |
| Stock | `StockMovement` | Stock transaction movement |

> GL account types assumed: `A` = Asset, `L` = Liability, `E` = Equity, `I` = Income, `X` = Expense.  
> Verify `AccType` values against your AutoCount database before using P&L and Balance Sheet endpoints.

---

## Logging

Logs are written to the `logs/` directory (auto-created):

- `logs/app-YYYY-MM-DD.log` — all log levels
- `logs/error-YYYY-MM-DD.log` — errors only

Logs are rotated daily, zipped, and kept for 30 days.

---

## Deployment

### PM2 (recommended)

```bash
npm install -g pm2
pm2 start server.js --name autocount-api
pm2 save
pm2 startup
```

### Environment variables for production

```env
NODE_ENV=production
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=false
```

### Nginx reverse proxy (example)

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

---

## Security Notes

- All SQL queries use **parameterised inputs** — no string concatenation.
- Rate limiting: 100 requests per 15 minutes per IP (configurable).
- Helmet sets secure HTTP headers.
- CORS is restricted to `CORS_ORIGIN` in `.env`.
- API is **read-only** — no INSERT, UPDATE or DELETE operations exist.

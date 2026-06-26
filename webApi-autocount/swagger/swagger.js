import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AutoCount REST API",
      version: "1.0.0",
      description: `
## AutoCount Accounting — Read-Only REST API

Provides read-only access to AutoCount SQL Server data for Web and Mobile applications.

### Modules
- **GL** — General Ledger: Accounts, Cash Book, Journal, Ledger, Trial Balance, P&L, Balance Sheet
- **AR** — Account Receivable: Debtors, Invoices, Payments
- **AP** — Account Payable: Creditors, Invoices, Payments
- **Sales** — Sales Invoices
- **Stock** — Items, Balance, Movement

### Authentication
Pass your API key in the \`X-API-Key\` header.

### Pagination
All list endpoints support \`?page=1&limit=20\`.

### Date Format
All date parameters must follow **YYYY-MM-DD** format.
      `,
      contact: {
        name: "MBI Clicks",
        email: "support@mbiclicks.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Development",
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
        },
      },
      schemas: {
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Success" },
            data: { type: "object" },
          },
        },
        SuccessListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Success" },
            total: { type: "integer", example: 25 },
            data: { type: "array", items: { type: "object" } },
          },
        },
        PaginatedResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Success" },
            data: { type: "array", items: { type: "object" } },
            pagination: {
              type: "object",
              properties: {
                currentPage: { type: "integer", example: 1 },
                totalPages: { type: "integer", example: 5 },
                totalRecords: { type: "integer", example: 100 },
                limit: { type: "integer", example: 20 },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "An error occurred." },
            error: { type: "string", example: "Detailed error message" },
          },
        },
        ValidationErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation failed." },
            error: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: "API key missing or invalid",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                success: false,
                message: "Unauthorized. Invalid or missing API key.",
              },
            },
          },
        },
        NotFound: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { success: false, message: "Record not found." },
            },
          },
        },
        ValidationError: {
          description: "Request validation failed",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
            },
          },
        },
        ServerError: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                success: false,
                message: "Internal server error.",
              },
            },
          },
        },
      },
    },
    security: [{ ApiKeyAuth: [] }],
    tags: [
      { name: "General Ledger", description: "GL module — accounts, journal, financial reports" },
      { name: "Account Receivable", description: "AR module — debtors, invoices, receipts" },
      { name: "Account Payable", description: "AP module — creditors, invoices, payments" },
      { name: "Sales", description: "Sales module — sales invoices" },
      { name: "Stock", description: "Stock module — items, balance, movement" },
    ],
  },
  apis: ["./routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);

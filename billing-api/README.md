# Billing Management API

A comprehensive billing management system built with Node.js, Express, and MySQL.

## Features

- Complete billing lifecycle management
- Role-based access control
- Status workflow management
- Audit logging
- Email notifications
- Scheduled status changes
- Batch operations
- File attachments
- Detailed history tracking

## Prerequisites

- Node.js >= 14.0.0
- MySQL >= 8.0
- npm >= 6.0.0

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd billing-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=159.223.60.43
DB_USER=mbiclicks
DB_PASSWORD=mBi23kEdahh
DB_NAME=mbiclickpro

# JWT
JWT_SECRET=mbiclickPro23
JWT_EXPIRES_IN=24h

# Email (replace with your SMTP settings)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=noreply@example.com
```

4. Initialize the database:
```bash
node src/scripts/initDb.js
```

## Project Structure

```
billing-api/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── server.js       # Application entry point
├── tests/              # Test files
├── .env                # Environment variables
├── .gitignore         # Git ignore file
└── package.json       # Project metadata
```

## API Endpoints

### Billing Management
- `GET /api/billing` - List all billings (with filters)
- `POST /api/billing` - Create new billing
- `GET /api/billing/:id` - Get billing details
- `PUT /api/billing/:id` - Update billing
- `DELETE /api/billing/:id` - Delete billing
- `PATCH /api/billing/:id/status` - Update billing status
- `GET /api/billing/:id/history` - Get status history
- `GET /api/billing/:id/audit` - Get audit logs
- `POST /api/billing/:id/schedule-status` - Schedule status change
- `PATCH /api/billing/batch/status` - Batch update statuses

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Status Workflow

1. Draft (1)
2. Pending Approval (2)
3. Approved (3)
4. Rejected (4)
5. Completed (5)
6. Cancelled (6)

Valid transitions:
- Draft → Pending Approval, Cancelled
- Pending Approval → Approved, Rejected, Cancelled
- Approved → Completed, Cancelled
- Rejected → Pending Approval, Cancelled
- Completed → (no further transitions)
- Cancelled → (no further transitions)

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Run tests:
```bash
npm test
```

## Security Features

- JWT authentication
- Role-based access control
- Request rate limiting
- Helmet security headers
- SQL injection protection
- XSS protection
- CORS configuration

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.

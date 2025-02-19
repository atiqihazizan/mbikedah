# MBI Click Pro - Billing API

## Overview
API untuk pengurusan billing MBI Click Pro. Sistem ini membolehkan pengguna membuat permohonan billing, melihat senarai billing, dan mengemaskini status billing mengikut flow yang ditetapkan.

## Tech Stack
- Node.js
- Express.js
- MySQL
- JWT Authentication

## Database Configuration
- Host: 159.223.60.43
- Database: mbiclickpro
- Port: 5001

## API Endpoints

### 1. Create Billing (POST /api/billings)
Endpoint untuk membuat billing baru.

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "issue_desc": "Deskripsi billing",
  "no_project": "Nombor projek",
  "issue_to": "Jabatan/Unit",
  "total": 1000.00,
  "status": 1,
  "payment_type": 1,
  "detail": [
    {
      "desc": "Deskripsi item",
      "budget": 1000.00,
      "qty": 1,
      "unit": "unit",
      "ref": "Rujukan"
    }
  ]
}
```

### 2. Get All Billings (GET /api/billings)
Endpoint untuk mendapatkan senarai semua billing.

**Request Headers:**
```
Authorization: Bearer <token>
```

### 3. Get Billing by ID (GET /api/billings/:id)
Endpoint untuk mendapatkan maklumat satu billing.

**Request Headers:**
```
Authorization: Bearer <token>
```

### 4. Update Billing Status (PATCH /api/billings/:id/status)
Endpoint untuk mengemaskini status billing.

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": 2,
  "remarks": "Catatan untuk perubahan status"
}
```

## Status Codes & Flow
1. Draft (1)
2. Approval HOD (2)
3. Checking Finance (3)
4. Approval Finance (4)
5. Approved (5)
6. Paid (6)
7. Rejected (7)

Flow status yang dibenarkan:
- Draft -> Approval HOD
- Approval HOD -> Checking Finance, Rejected
- Checking Finance -> Approval Finance
- Approval Finance -> Approved, Rejected
- Approved -> Paid
- Paid -> (no further transitions)
- Rejected -> (no further transitions)

## Example API Usage

### Create Billing
```bash
curl -X POST http://localhost:5001/api/billings \
-H "Authorization: Bearer <token>" \
-H "Content-Type: application/json" \
-d '{
  "issue_desc": "Test Billing",
  "no_project": "TEST-001",
  "issue_to": "Finance",
  "total": 1000.00,
  "status": 1,
  "payment_type": 1,
  "detail": [{
    "desc": "Item 1",
    "budget": 1000.00,
    "qty": 1,
    "unit": "unit",
    "ref": "REF001"
  }]
}'
```

### Get All Billings
```bash
curl -X GET http://localhost:5001/api/billings \
-H "Authorization: Bearer <token>"
```

### Get Billing by ID
```bash
curl -X GET http://localhost:5001/api/billings/1 \
-H "Authorization: Bearer <token>"
```

### Update Billing Status
```bash
curl -X PATCH http://localhost:5001/api/billings/1/status \
-H "Authorization: Bearer <token>" \
-H "Content-Type: application/json" \
-d '{
  "status": 2,
  "remarks": "Diluluskan oleh HOD"
}'
```

## Installation & Setup

1. Clone repository:
```bash
git clone https://github.com/your-username/mbiclickpro.git
cd mbiclickpro/app/billing-api
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables dalam `.env`:
```bash
PORT=5001
DB_HOST=159.223.60.43
DB_USER=mbiclicks
DB_PASSWORD=mBicLik@23
DB_NAME=mbiclickpro
JWT_SECRET=mbiclickPro23
JWT_EXPIRES_IN=24h
```

4. Run development server:
```bash
npm run dev
```

5. Run production server:
```bash
npm start
```

## Project Structure
```
billing-api/
├── src/
│   ├── controllers/
│   │   └── billingController.js    # Logic untuk handle billing requests
│   ├── middleware/
│   │   ├── auth.js                 # JWT authentication
│   │   └── validate.js             # Request validation
│   ├── models/
│   │   └── billing.js              # Database model untuk billing
│   ├── routes/
│   │   └── billingRoutes.js        # API route definitions
│   ├── config/
│   │   └── database.js             # Database configuration
│   ├── app.js                      # Express app setup
│   └── server.js                   # Server entry point
├── .env                            # Environment variables
└── package.json                    # Project dependencies
```

## Error Handling

### Common Error Codes

1. Authentication Errors (401, 403)
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "Invalid token provided"
}
```

2. Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "issue_desc": "Description is required",
    "total": "Total must be a number"
  }
}
```

3. Status Transition Errors (400)
```json
{
  "success": false,
  "message": "Invalid status transition",
  "error": "Cannot transition from Draft to Approved directly"
}
```

4. Database Errors (500)
```json
{
  "success": false,
  "message": "Database error occurred",
  "error": "Error details..."
}
```

### Error Prevention
1. Input Validation
   - Semua input divalidate menggunakan express-validator
   - Format data diperiksa sebelum diproses
   - SQL injection prevention dengan parameterized queries

2. Status Validation
   - Status transition divalidate menggunakan STATUS_TRANSITIONS object
   - Hanya allow transitions yang dibenarkan
   - Track history untuk setiap perubahan status

3. Authentication & Authorization
   - JWT token validation untuk setiap request
   - Token expiry handling
   - Role-based access control

## Validation
1. Authentication - memastikan user sudah login
2. Input validation - memastikan semua data yang diperlukan ada dan dalam format yang betul
3. Status validation - memastikan perubahan status mengikut flow yang betul

## Response Format
Semua API akan return response dalam format berikut:

**Success Response:**
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Error details"
}
```

## Security
- JWT token-based authentication
- Role-based access control
- Input validation
- Status transition validation

## Environment Variables
```
PORT=5001
DB_HOST=159.223.60.43
DB_USER=mbiclicks
DB_PASSWORD=mBicLik@23
DB_NAME=mbiclickpro
JWT_SECRET=mbiclickPro23
JWT_EXPIRES_IN=24h
```

## Testing API

### Using Postman

1. Import collection:
   - Open Postman
   - Import collection dari file `MBIClickPro.postman_collection.json`

2. Setup environment:
   - Create new environment
   - Add variables:
     ```
     base_url: http://localhost:5001
     token: <your_jwt_token>
     ```

3. Test endpoints:
   - Gunakan collection runner untuk test semua endpoints
   - Check response status dan format

### Using Curl

1. Login dan dapatkan token:
```bash
curl -X POST http://localhost:5001/api/auth/login \
-H "Content-Type: application/json" \
-d '{
  "username": "your_username",
  "password": "your_password"
}'
```

2. Test create billing:
```bash
curl -X POST http://localhost:5001/api/billings \
-H "Authorization: Bearer <token>" \
-H "Content-Type: application/json" \
-d '{
  "issue_desc": "Test Billing",
  "no_project": "TEST-001",
  "issue_to": "Finance",
  "total": 1000.00,
  "status": 1,
  "payment_type": 1,
  "detail": [{
    "desc": "Item 1",
    "budget": 1000.00,
    "qty": 1,
    "unit": "unit",
    "ref": "REF001"
  }]
}'
```

## Performance Optimization

1. Database Optimization
   - Indexed columns: id, status_id, created_by
   - Optimized queries dengan JOIN statements
   - Connection pooling untuk handle multiple requests

2. Caching
   - Response caching untuk GET requests
   - Cache invalidation pada updates
   - Redis cache untuk high-traffic scenarios

3. Rate Limiting
   - Limit requests per IP
   - Prevent DoS attacks
   - Custom limits untuk different endpoints

## Maintenance

1. Logging
   - Error logging ke file system
   - Activity logging untuk audit
   - Performance metrics tracking

2. Monitoring
   - Server health monitoring
   - Database connection monitoring
   - API response time tracking

3. Backup
   - Daily database backups
   - Transaction logs backup
   - Automated backup verification

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## Support

Untuk technical support atau questions:
- Email: support@mbiclickpro.com
- Phone: +60 XXXXXXXX
- Working Hours: 9:00 AM - 5:00 PM (Malaysia Time)

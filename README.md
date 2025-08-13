# MBI Clicks - Billing Management System

## 📋 Project Overview

MBI Clicks is a comprehensive billing management system designed for organizational financial workflows. The system streamlines the entire billing process from initial request to final approval, ensuring proper budget control and financial accountability.

### 🚀 Key Features
- **Billing Workflow Management**: Complete end-to-end billing process automation
- **Multi-Level Approval System**: Hierarchical approval workflow with role-based permissions
- **Budget Control & Monitoring**: Real-time budget tracking and allocation management
- **Financial Reporting**: Comprehensive financial statements and expense analysis
- **Document Management**: Automated PDF generation and Excel export capabilities
- **Bank Integration**: Centralized bank account and transaction management



## 🔄 Business Workflow & User Levels

### 📋 Billing Application Process (5 Steps)

1. **Billing Request Creation**
   - User submits billing request with details
   - Attaches supporting documents
   - Selects budget category and amount

2. **Department Review**
   - Department head reviews request
   - Validates budget availability
   - Approves or requests modifications

3. **Budget Verification**
   - Budget officer checks budget allocation
   - Confirms sufficient funds
   - Updates budget status

4. **Bank Processing**
   - Bank officer processes payment
   - Updates bank balance
   - Generates transaction records

5. **Final Approval & Payment**
   - Final approval by authorized personnel
   - Payment processing and confirmation
   - Completion notification

### 👥 User Levels & Permissions

#### **Level 1: Regular Users**
- Create billing requests
- View own billing history
- Upload supporting documents
- Track request status

#### **Level 2: Department Heads**
- Review department requests
- Approve/reject within department
- Monitor department budget usage
- Generate department reports

#### **Level 3: Budget Officers**
- Manage budget allocations
- Monitor overall budget status
- Approve budget-related requests
- Generate budget reports

#### **Level 4: Bank Officers**
- Process bank transactions
- Manage bank accounts
- Update payment status
- Generate bank statements

#### **Level 5: System Administrators**
- User management and role assignment
- System configuration
- Access to all modules
- System maintenance

### 📊 Budget Categories
- **Operational Expenses**: Day-to-day operational costs
- **Capital Expenditure**: Equipment and infrastructure
- **Travel & Entertainment**: Business travel and events
- **Training & Development**: Employee training programs
- **Maintenance & Repairs**: Facility and equipment maintenance

## 📥 Prerequisites

Before installing, ensure you have:

### **System Requirements**
- **PHP 8.2+** with extensions:
  - BCMath, Ctype, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML, cURL, GD, ZIP
- **Composer** (latest version)
- **Node.js 18+** and **npm** or **yarn**
- **Git**

### **Database Requirements**
- **MySQL 8.0+** or **PostgreSQL 13+**
- **Redis** (optional, for caching and queues)

### **Development Framework Requirements**
- **Laravel 11.31** (PHP Framework)
- **React 18.2.0** (JavaScript Framework)
- **Vite** (Build Tool)
- **Tailwind CSS** (Styling Framework)
- **Laravel Sanctum** (API Authentication)
- **Laravel Excel** (Data Export)
- **Laravel DomPDF** (PDF Generation)

## 🚀 Installation & Setup

### 1. Clone the Project

```bash
git clone <repository-url>
cd mbiclicks
```

### 2. Backend Setup (Laravel)

```bash
# Navigate to API directory
cd api

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env file
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=mbiclicks
# DB_USERNAME=your_username
# DB_PASSWORD=your_password

# Run database migrations
php artisan migrate

# Seed initial data (optional)
php artisan db:seed

# Start Laravel development server
php artisan serve
```

### 3. Frontend Setup (React)

```bash
# Navigate to frontend directory
cd ../frontend

# Install Node.js dependencies
npm install

# Start development server
npm run dev
```

## ⚙️ Configuration

### Laravel Configuration

#### Environment Variables (.env)
```env
APP_NAME="MBI Clicks"
APP_ENV=local
APP_KEY=base64:your_generated_key
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mbiclicks
DB_USERNAME=your_username
DB_PASSWORD=your_password

CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost
```

#### Database Configuration
- Create database: `mbiclicks`
- Run migrations: `php artisan migrate`
- Optional: Seed with sample data: `php artisan db:seed`

### React Configuration

#### Environment Variables
Create `.env` file in frontend directory:
```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME="MBI Clicks"
```

#### Vite Configuration
- Development server runs on port 3000
- API proxy configured to Laravel backend
- Hot module replacement enabled

## 🔧 Development Commands

### Laravel Commands
```bash
# Start development server
php artisan serve

# Run migrations
php artisan migrate

# Clear cache
php artisan cache:clear

# Generate API documentation
php artisan route:list --path=api

# Run tests
php artisan test
```

### React Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Generate component indexes
npm run components
```

## 📁 Project Structure

```
mbiclicks/
├── api/                    # Laravel Backend
│   ├── app/
│   │   ├── Http/Controllers/  # API Controllers
│   │   ├── Models/            # Eloquent Models
│   │   ├── Policies/          # Authorization Policies
│   │   └── Resources/         # API Resources
│   ├── database/
│   │   ├── migrations/        # Database Migrations
│   │   └── seeders/           # Database Seeders
│   └── routes/api.php         # API Routes
├── frontend/              # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable Components
│   │   ├── views/             # Page Components
│   │   ├── hooks/             # Custom Hooks
│   │   └── utils/             # Utility Functions
│   └── public/                # Static Assets
```

## 🌐 Access Points

- **Laravel API**: http://localhost:8000
- **React App**: http://localhost:3000
- **API Documentation**: http://localhost:8000/api

## 🔐 Default Users

After seeding the database, you can use:
- **Admin User**: admin@mbiclicks.com / password
- **Regular User**: user@mbiclicks.com / password

## 📊 System Modules & Data Structure

### **Core Business Modules**
- **User Management**: Employee accounts, roles, and permissions
- **Department Structure**: Organizational hierarchy and reporting lines
- **Billing Management**: Complete billing lifecycle and workflow
- **Budget Control**: Budget allocation, tracking, and monitoring
- **Bank Operations**: Account management and transaction processing
- **Financial Reporting**: Comprehensive financial analysis and statements

### **Key Business Entities**
- **Users**: Employees with role-based access to system functions
- **Departments**: Organizational units with budget allocations
- **Billings**: Financial requests with approval workflow
- **Budgets**: Financial allocations by category and department
- **Banks**: Financial institutions and account management
- **Transactions**: Payment records and financial movements

## 🚨 Troubleshooting

### Common Issues

1. **Composer dependencies fail**
   ```bash
   composer clear-cache
   composer install --ignore-platform-reqs
   ```

2. **Database connection error**
   - Check database credentials in `.env`
   - Ensure database service is running
   - Verify database exists

3. **React build fails**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **CORS issues**
   - Check `config/cors.php` configuration
   - Verify `SANCTUM_STATEFUL_DOMAINS` in `.env`

## 📝 Additional Notes

- **File Storage**: Uses Laravel's file storage system
- **Queue Jobs**: Configure Redis for background job processing
- **Caching**: Redis recommended for production caching
- **Logging**: Check `storage/logs/` for application logs

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push branch: `git push origin feature-name`
5. Submit pull request

## 📄 License

This project is proprietary software. All rights reserved.

---

**Need Help?** Check the Laravel and React documentation for detailed information about the frameworks used in this project.

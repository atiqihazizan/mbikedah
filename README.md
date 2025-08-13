# MBI Clicks - Billing Management System

## 📋 Project Overview

MBI Clicks is a comprehensive billing management system built with **Laravel 11** backend API and **React 18** frontend. The system handles billing processes, budget management, user authentication, and financial reporting for organizations.

### 🚀 Key Features
- **Billing Management**: Create, track, and manage billing workflows
- **Budget Control**: Budget allocation and tracking with history
- **User Management**: Role-based access control with multiple abilities
- **Bank Integration**: Bank account management and balance tracking
- **Reporting**: Financial reports and expense breakdowns
- **Document Export**: PDF and Excel export capabilities

## 🛠️ Tech Stack

### Backend (Laravel 11)
- **PHP 8.2+**
- **Laravel Framework 11.31**
- **MySQL/PostgreSQL Database**
- **Laravel Sanctum** for API authentication
- **Laravel Excel** for data export
- **Laravel DomPDF** for PDF generation
- **Redis** for caching and queues

### Frontend (React 18)
- **React 18.2.0** with Vite build tool
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **React Query** for state management
- **Headless UI** for accessible components

## 📥 Prerequisites

Before installing, ensure you have:

- **PHP 8.2+** with extensions:
  - BCMath, Ctype, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML, cURL, GD, ZIP
- **Composer** (latest version)
- **Node.js 18+** and **npm** or **yarn**
- **MySQL 8.0+** or **PostgreSQL 13+**
- **Redis** (optional, for caching)
- **Git**

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

## 📊 Database Tables

- `users` - User accounts and authentication
- `departments` - Organizational departments
- `positions` - Job positions
- `billings` - Billing records
- `billing_details` - Detailed billing information
- `budgets` - Budget allocations
- `banks` - Bank account information
- `transactions` - Financial transactions

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

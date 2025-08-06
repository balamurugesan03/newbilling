# PHP Billing Backend

This is the PHP version of the Node.js billing application backend.

## Requirements

- PHP 8.0 or higher
- MySQL 5.7 or higher
- Composer
- Apache/Nginx web server

## Installation

1. **Install Dependencies**
   ```bash
   composer install
   ```

2. **Configure Environment**
   - Copy `.env` file and update database credentials if needed
   - Default configuration:
     - Database: `dairy_billing`
     - Username: `root`
     - Password: `bala@12345`

3. **Set up Web Server**
   - Point your web server document root to this directory
   - Ensure `.htaccess` is enabled for Apache
   - For Nginx, configure URL rewriting to `index.php`

4. **Create Admin User**
   ```bash
   php createAdmin.php
   ```

## API Endpoints

All endpoints return JSON responses.

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product
- `POST /api/products/reduce-stock` - Reduce stock after sale

### Bills
- `GET /api/bills` - Get all bills
- `POST /api/bills` - Create bill
- `GET /api/bills/credit-report` - Get credit report
- `POST /api/bills/mark-paid/{id}` - Mark bill as paid

### Dashboard
- `GET /api/dashboard/today` - Today's sales dashboard
- `GET /api/dashboard/debug` - Debug information

### Reports
- `GET /api/bill-history` - Bill history by date range
- `GET /api/yearly-report` - Yearly sales report

### Purchases
- `GET /api/purchases` - Get all purchases
- `POST /api/purchases/add` - Add purchase
- `PUT /api/purchases/{id}` - Update purchase
- `DELETE /api/purchases/{id}` - Delete purchase
- `POST /api/purchases/sync-products` - Sync purchases with products
- `GET /api/purchases/report/daily` - Daily purchase report
- `GET /api/purchases/report/range` - Purchase report by range
- `GET /api/purchases/report/monthly` - Monthly purchase report

### Purchase Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices/add` - Add invoice
- `GET /api/invoices/{id}` - Get invoice by ID

## Features

- ✅ Complete MySQL database with auto-creation
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ CORS support
- ✅ RESTful API endpoints
- ✅ Automatic stock management
- ✅ Purchase-Product synchronization
- ✅ Credit bill tracking
- ✅ Comprehensive reporting
- ✅ Error handling

## Default Credentials

- Username: `admin`
- Password: `admin123`

## Database Schema

The application automatically creates the following tables:
- `users` - User authentication
- `items` - Product inventory
- `bills` - Sales transactions
- `purchases` - Purchase records
- `purchase_invoices` - Purchase invoices

## Differences from Node.js Version

1. **Framework**: Express.js → Custom PHP router
2. **ORM**: Sequelize → PDO with custom models
3. **Authentication**: JWT implementation using Firebase JWT library
4. **Password Hashing**: bcryptjs → PHP password_hash()
5. **Environment**: dotenv → vlucas/phpdotenv
6. **Database**: Same MySQL schema and functionality

## Development

Run on a local development server:
```bash
php -S localhost:5000 index.php
```

Or use XAMPP/WAMP with Apache configuration.
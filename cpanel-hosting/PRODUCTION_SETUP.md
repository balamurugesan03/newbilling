# Production Setup Guide for billing1.delightregister.online

## Backend API Configuration

### 1. Database Setup (IMPORTANT - UPDATE REQUIRED)
Update the following values in `api/.env`:

```env
# Database Configuration - UPDATE THESE VALUES
DB_HOST=localhost                     # Usually localhost for cPanel
DB_PORT=3306                         # Standard MySQL port
DB_DATABASE=delightr_billing         # Your actual cPanel database name
DB_USERNAME=delightr_billing_user    # Your actual cPanel database username  
DB_PASSWORD=your_secure_database_password  # Your actual database password
```

### 2. Security Configuration
- JWT Secret is already set to a strong key
- CORS is configured to allow your frontend domain
- Environment is set to production mode

### 3. API Endpoint
Your backend API will be available at:
`https://billing1.delightregister.online/api/`

### 4. Frontend Configuration
Frontend is already configured to use:
`https://billing1.delightregister.online` as the API base URL

## Deployment Checklist

### Before Going Live:
1. ✅ Update database credentials in `api/.env`
2. ✅ Verify domain points to your hosting
3. ✅ Upload files to cPanel File Manager
4. ✅ Set up database in cPanel MySQL Databases
5. ✅ Test API endpoints work
6. ✅ Test frontend connects to API

### File Structure:
```
public_html/
├── index.html              # Frontend
├── assets/                # Frontend assets
└── api/                   # Backend API
    ├── index.php          # API entry point
    ├── .env               # Environment config
    ├── .htaccess          # URL routing
    └── src/               # PHP source code
```

### Testing API:
Test these endpoints after deployment:
- `GET https://billing1.delightregister.online/api/dashboard/today`
- `POST https://billing1.delightregister.online/api/auth/login`

## Security Features Implemented
- ✅ CORS restricted to frontend domain
- ✅ Strong JWT secret key
- ✅ Environment variables for sensitive data
- ✅ Production mode enabled
- ✅ Database auto-creation with proper schema
- ✅ Default admin user creation

## Default Admin Credentials
Username: `admin`
Password: `admin123` (Change after first login)

---
Generated for billing1.delightregister.online deployment
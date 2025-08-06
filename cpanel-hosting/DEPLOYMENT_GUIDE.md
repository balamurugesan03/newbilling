# Deployment Guide for cPanel Hosting

## 🚀 Quick Deployment Steps

### 1. Upload Files
Upload all files from the `cpanel-hosting` folder to:
```
/home/delightregister/public_html/billing1.delightregister.online/
```

### 2. Install PHP Dependencies
In the `api` folder, run:
```bash
php composer.phar install --no-dev --optimize-autoloader
```

### 3. Set Permissions
```bash
chmod -R 755 api/
chmod 644 api/.env
```

### 4. Database Setup
- Database: `delightregister_bill1`
- Username: `delightregister_biller1`  
- Password: `=nFM,lEyhPPc!4WF`

The database and tables will be created automatically on first API call.

### 5. Create Admin User
Run this once after deployment:
```bash
php api/createAdmin.php
```

### 6. Test the Setup
- Frontend: https://billing1.delightregister.online/
- API Test: https://billing1.delightregister.online/api/dashboard/debug

## 📁 File Structure
```
/home/delightregister/public_html/billing1.delightregister.online/
├── index.html (Frontend)
├── assets/ (Frontend assets)
├── .htaccess (Root redirects)
└── api/
    ├── index.php (API entry point)
    ├── .htaccess (API redirects)
    ├── .env (Database config)
    ├── composer.json
    ├── createAdmin.php
    └── src/ (PHP backend)
```

## 🔧 Configuration
All database settings are in `api/.env`:
- DB_HOST=localhost
- DB_DATABASE=delightregister_bill1
- DB_USERNAME=delightregister_biller1
- DB_PASSWORD==nFM,lEyhPPc!4WF

## ✅ Default Login
- Username: `admin`
- Password: `admin123`

## 🔍 Troubleshooting
1. Check PHP error logs in cPanel
2. Ensure mod_rewrite is enabled
3. Verify database connection credentials
4. Check file permissions (755 for directories, 644 for files)
# cPanel Hosting Deployment Guide

## Folder Structure
```
cpanel-hosting/
├── public_html/          # Main website files (Frontend)
│   ├── index.html
│   ├── assets/
│   └── .htaccess
├── api/                  # Backend API files
│   ├── index.php
│   ├── src/
│   ├── vendor/
│   ├── .env
│   └── .htaccess
└── DEPLOYMENT_GUIDE.md
```

## Pre-Deployment Steps

### 1. Update Frontend API URL
Before uploading, update your frontend to point to the production API:
- In your React app, change API base URL from `http://localhost:5000` to `https://yourdomain.com/api`

### 2. Database Setup in cPanel
1. Create a new MySQL database in cPanel
2. Create a database user and assign it to the database
3. Grant all privileges to the user
4. Note down: database name, username, and password

### 3. Update .env Configuration
Edit `api/.env` file with your actual cPanel database credentials:
```
DB_HOST=localhost
DB_DATABASE=your_actual_database_name
DB_USERNAME=your_actual_database_user  
DB_PASSWORD=your_actual_database_password
JWT_SECRET=generate_a_very_long_random_string_here
```

## Deployment Steps

### 1. Upload Files to cPanel
1. **Upload public_html contents:**
   - Upload all files from `public_html/` folder to your domain's `public_html/` directory
   
2. **Upload API files:**
   - Create an `api` folder inside your `public_html/` directory
   - Upload all files from `api/` folder to `public_html/api/`

### 2. Set File Permissions
- Set folders to 755 permissions
- Set files to 644 permissions
- Set `.env` file to 600 permissions (more secure)

### 3. Install PHP Dependencies (if not already installed)
If Composer is available on your hosting:
```bash
cd public_html/api
composer install --no-dev --optimize-autoloader
```

If Composer is not available, the `vendor/` folder is already included.

### 4. Test the Installation
1. Visit your domain: `https://yourdomain.com`
2. Test API endpoint: `https://yourdomain.com/api/dashboard/debug`
3. Try logging in with default credentials:
   - Username: `admin`
   - Password: `admin123`

## Important Notes

### Security Considerations
1. **Change default admin password** immediately after deployment
2. **Use HTTPS** - most cPanel hosts provide free SSL certificates
3. **Database credentials** should be unique and strong
4. **JWT secret** should be a long, random string

### API Endpoints
All API calls should be made to: `https://yourdomain.com/api/`

Example endpoints:
- `POST /api/auth/login` - User login
- `GET /api/products` - Get all products
- `GET /api/dashboard/today` - Today's dashboard
- `POST /api/bills` - Create new bill

### Troubleshooting

**If you get 500 errors:**
1. Check error logs in cPanel
2. Verify database credentials in `.env`
3. Ensure PHP version is 8.0 or higher
4. Check file permissions

**If API calls fail:**
1. Verify .htaccess files are uploaded
2. Check if mod_rewrite is enabled
3. Test direct API access: `yourdomain.com/api/index.php`

**If frontend doesn't load properly:**
1. Check .htaccess in public_html
2. Verify all assets are uploaded
3. Check browser console for errors

## File Structure After Upload
```
yourdomain.com/public_html/
├── index.html            # Main app
├── assets/               # JS, CSS, images
├── .htaccess            # Frontend routing
└── api/                 # Backend API
    ├── index.php        # Main API entry
    ├── src/             # PHP classes
    ├── vendor/          # Dependencies
    ├── .env             # Configuration
    └── .htaccess        # API routing
```

## Default Login Credentials
- **Username:** admin
- **Password:** admin123

**⚠️ IMPORTANT: Change these credentials immediately after deployment!**
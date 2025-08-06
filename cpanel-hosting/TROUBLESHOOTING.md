# 🔧 Troubleshooting Guide - billing1.delightregister.online

## Website Not Working? Follow These Steps:

### 1. 🗂️ **Check File Upload Location**

**CRITICAL**: Files must be in the EXACT correct location:

**✅ Correct Path:**
```
/home/delightregister/public_html/billing1.delightregister.online/
```

**❌ Common Wrong Paths:**
```
/home/delightregister/public_html/                          # Too high
/home/delightregister/public_html/billing1/                 # Wrong folder name
/home/delightregister/public_html/billing1.delightregister/ # Incomplete name
```

### 2. 📁 **Verify File Structure After Upload**

After uploading, your server should have:
```
/home/delightregister/public_html/billing1.delightregister.online/
├── index.html              # Main frontend file
├── assets/                 # CSS, JS files
├── vite.svg
└── api/                    # Backend folder
    ├── index.php
    ├── .env
    ├── .htaccess
    ├── vendor/
    └── src/
```

### 3. 🔍 **Check DNS & Domain Setup**

In cPanel, verify:
1. **Subdomain Setup**: 
   - Go to cPanel → Subdomains
   - Ensure `billing1` subdomain exists
   - Document Root should be: `public_html/billing1.delightregister.online`

2. **DNS Records**:
   - `billing1.delightregister.online` should point to your server IP
   - Wait 24-48 hours for DNS propagation if recently created

### 4. 🔒 **SSL Certificate**

Check if SSL is properly configured:
- Try both `http://` and `https://`
- In cPanel → SSL/TLS → Manage SSL, ensure certificate covers `billing1.delightregister.online`

### 5. 🔧 **Common Upload Issues**

**Issue**: Files uploaded to wrong location
**Solution**: Move files from `public_html/` to `public_html/billing1.delightregister.online/`

**Issue**: Missing index.html
**Solution**: Ensure `index.html` is in the root of billing1.delightregister.online folder

**Issue**: Permission errors
**Solution**: Set folder permissions to 755, file permissions to 644

### 6. 🧪 **Test Steps**

Try these URLs in order:

1. **Test Domain**: http://billing1.delightregister.online
2. **Test HTTPS**: https://billing1.delightregister.online
3. **Test API**: https://billing1.delightregister.online/api/dashboard/today
4. **Test Direct File**: https://billing1.delightregister.online/index.html

### 7. 💾 **Database Issues**

If site loads but has database errors:
1. Go to cPanel → MySQL Databases
2. Verify database `delightregister_bill1` exists
3. Verify user `delightregister_biller1` has ALL PRIVILEGES on that database

### 8. 🔍 **Error Checking**

**Check cPanel Error Logs:**
1. Go to cPanel → Error Logs
2. Look for recent errors related to billing1.delightregister.online
3. Common errors:
   - File not found (wrong upload location)
   - Permission denied (file permissions)
   - Database connection errors

### 9. 🚀 **Quick Fix Checklist**

- [ ] Files uploaded to `/home/delightregister/public_html/billing1.delightregister.online/`
- [ ] `index.html` exists in root folder
- [ ] Subdomain `billing1` created in cPanel
- [ ] Database `delightregister_bill1` exists
- [ ] Database user has correct permissions
- [ ] SSL certificate covers the subdomain
- [ ] DNS has propagated (check with online DNS checker)

### 10. 📞 **If Still Not Working**

**Try this order:**
1. **Clear browser cache** and try again
2. **Test from different device/browser**
3. **Check from mobile data** (different internet)
4. **Wait 2-4 hours** for DNS propagation
5. **Contact hosting support** with exact error message

### 11. 🔄 **Alternative: Temporary Setup**

If subdomain issues persist, you can temporarily use:
1. Create folder: `/home/delightregister/public_html/billing/`
2. Upload files there
3. Access via: `delightregister.online/billing/`

---

## 📋 **Most Common Issue & Solution**

**99% of issues are caused by uploading files to the wrong location.**

**Double-check this path:**
`/home/delightregister/public_html/billing1.delightregister.online/`

The `billing1.delightregister.online` folder MUST exist and contain your files!
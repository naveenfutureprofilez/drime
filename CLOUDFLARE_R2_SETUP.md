# Cloudflare R2 Setup Guide for Laravel File Uploads

This guide will help you configure your Laravel application to use Cloudflare R2 instead of local storage for file uploads.

## ✅ Prerequisites Completed

Your Laravel application already has:
- ✅ AWS S3 compatible package installed (`league/flysystem-aws-s3-v3`)
- ✅ Cloudflare R2 disk configuration in `config/filesystems.php`
- ✅ Environment variables added to `.env`
- ✅ Upload disk driver changed to `cloudflare`
- ✅ Controllers optimized for S3-compatible storage

## 🔧 Step 1: Create Cloudflare R2 Bucket

1. **Log in to Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to R2 Object Storage

2. **Create a New Bucket**
   - Click "Create bucket"
   - Choose a unique bucket name (e.g., `your-app-uploads`)
   - Select a location close to your users
   - Click "Create bucket"

3. **Note Your Account ID**
   - Found in the right sidebar of the R2 overview page
   - You'll need this for the endpoint URL

## 🔑 Step 2: Generate R2 API Token

1. **Create R2 Token**
   - In Cloudflare Dashboard, go to "My Profile" → "API Tokens"
   - Click "Create Token"
   - Use "Custom token" template

2. **Configure Token Permissions**
   ```
   Permissions:
   - Account - Cloudflare R2:Edit
   
   Account Resources:
   - Include - Your Account
   
   Zone Resources:
   - Include - All zones (or specific zone if needed)
   ```

3. **Get Access Keys**
   - After creating the token, you'll see:
   - Access Key ID
   - Secret Access Key
   - Keep these secure!

## 🌍 Step 3: Configure Custom Domain (Optional but Recommended)

1. **Add Custom Domain to R2 Bucket**
   - In your bucket settings, go to "Settings" → "Custom Domains"
   - Add your domain (e.g., `files.yourdomain.com`)
   - Create a CNAME record in your DNS:
     ```
     CNAME files.yourdomain.com your-bucket-name.your-account-id.r2.cloudflarestorage.com
     ```

2. **Enable Public Access (if needed)**
   - For direct file access via URLs, enable public access
   - Be cautious with this setting based on your security requirements

## ⚙️ Step 4: Update Environment Variables

Replace the placeholder values in your `.env` file:

```bash
# Update these values with your actual Cloudflare R2 credentials
CLOUDFLARE_R2_KEY=your_actual_access_key_id
CLOUDFLARE_R2_SECRET=your_actual_secret_access_key
CLOUDFLARE_R2_BUCKET=your-bucket-name
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
CLOUDFLARE_R2_URL=https://files.yourdomain.com  # Optional: your custom domain
CLOUDFLARE_R2_REGION=auto
```

**Where to find these values:**
- `CLOUDFLARE_R2_KEY` → From API token creation
- `CLOUDFLARE_R2_SECRET` → From API token creation  
- `CLOUDFLARE_R2_BUCKET` → Your bucket name
- `CLOUDFLARE_R2_ENDPOINT` → Replace `your-account-id` with your actual Account ID
- `CLOUDFLARE_R2_URL` → Your custom domain (optional)

## 🧪 Step 5: Test Configuration

Run the test script to verify everything is working:

```bash
php test_cloudflare_r2.php
```

This will test:
- ✅ Authentication with Cloudflare R2
- ✅ Read/write permissions
- ✅ Directory access
- ✅ Configuration display

## 🚀 Step 6: Test File Upload

1. **Start your Laravel development server:**
   ```bash
   php artisan serve
   ```

2. **Test file upload through your web interface**
   - Upload a file through your application
   - Check that it appears in your Cloudflare R2 bucket
   - Try downloading the file to ensure it works

## 📁 File Storage Structure

Your files will now be stored in Cloudflare R2 with this structure:
```
your-bucket/
├── guest-uploads/           # Guest upload files
│   ├── abc123def456.jpg
│   └── xyz789uvw012.pdf
├── test-uploads/           # Test files (can be deleted)
└── other-directories/      # Other app uploads
```

## 🔒 Security Considerations

1. **Private Files**
   - Files are stored with `private` visibility by default
   - Downloads go through your Laravel application (with authentication)
   - Direct R2 URLs won't work unless you enable public access

2. **Public Files (Optional)**
   - If you need direct file URLs, configure public access in bucket settings
   - Update `'visibility' => 'public'` in `config/filesystems.php` if needed

3. **CORS Configuration**
   - Configure CORS in your R2 bucket if your frontend needs direct access:
   ```json
   [
     {
       "AllowedOrigins": ["https://yourdomain.com"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

## 💰 Cost Benefits

Switching to Cloudflare R2 provides:
- **No egress fees** (unlike AWS S3)
- **Competitive storage pricing** ($0.015/GB/month)
- **Global CDN** for faster file delivery
- **Better performance** for international users

## 🔧 Troubleshooting

### Common Issues:

1. **Authentication Errors**
   - Double-check your API token permissions
   - Ensure Account ID is correct in endpoint URL
   - Verify access key and secret are correctly set

2. **Bucket Not Found**
   - Ensure bucket name matches exactly
   - Check that bucket exists in the correct account

3. **Permission Denied**
   - Verify API token has R2:Edit permissions
   - Check bucket policies and public access settings

4. **Slow Uploads**
   - Consider enabling multipart uploads for large files
   - Check your internet connection and server location

### Debug Commands:

```bash
# Test configuration
php test_cloudflare_r2.php

# Check Laravel configuration
php artisan config:show

# Clear configuration cache
php artisan config:clear
```

## 📚 Migration from Local Storage

If you have existing files in local storage:

1. **Create a migration script** to copy files from local to R2
2. **Update database records** if needed to point to new storage paths
3. **Test thoroughly** before switching production traffic
4. **Keep local backups** during transition period

## ✨ Benefits You'll Get

- ✅ **Scalable storage** - No server disk space limitations
- ✅ **Global CDN** - Faster downloads worldwide  
- ✅ **Cost-effective** - No egress fees
- ✅ **Reliability** - Cloudflare's infrastructure
- ✅ **Easy management** - Web dashboard access

## 📞 Support

If you encounter issues:
1. Check Cloudflare R2 documentation
2. Verify your configuration with the test script
3. Check Laravel logs for detailed error messages
4. Review Cloudflare dashboard for API usage and errors

---

**🎉 Congratulations!** Your Laravel application is now using Cloudflare R2 for file storage.

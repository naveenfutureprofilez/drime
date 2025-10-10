# Drime Quick Setup Reference Card

## 🚀 Essential Steps for Production Deployment

### 1. Pre-Deployment Checklist
- [ ] Ubuntu 22.04 LTS server ready
- [ ] Domain name configured and pointing to server
- [ ] SSL certificate ready (we'll use Let's Encrypt)
- [ ] Email service credentials (Resend, SendGrid, etc.)
- [ ] Storage service credentials (Cloudflare R2 or AWS S3)

### 2. Server Requirements
```bash
# Minimum specifications:
- 2GB RAM (4GB recommended)
- 10GB storage + file storage space
- PHP 8.2+
- MySQL 8.0 or MariaDB 10.5+
- Node.js 18.x LTS
- Nginx web server
- Redis for caching/sessions
```

### 3. Essential Commands

#### Initial Server Setup
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx mysql-server redis-server git curl software-properties-common ufw
```

#### Install PHP 8.2
```bash
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.2 php8.2-fpm php8.2-cli php8.2-mysql php8.2-redis php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip php8.2-gd php8.2-intl php8.2-bcmath php8.2-imap
```

#### Install Node.js 18.x
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs build-essential
```

#### Deploy Application
```bash
cd /var/www
sudo git clone [your-repository] drime
cd drime
composer install --optimize-autoloader --no-dev
npm install && npm run build
php artisan key:generate
php artisan storage:link
```

### 4. Critical Configuration Files

#### Environment File (`.env`)
```bash
# MUST CHANGE THESE VALUES:
APP_URL=https://your-domain.com
DOMAIN_URL=https://your-domain.com
DB_PASSWORD=your-secure-database-password
MAIL_PASSWORD=your-email-service-api-key
MAIL_FROM_ADDRESS=noreply@your-domain.com
CLOUDFLARE_R2_KEY=your-r2-access-key
CLOUDFLARE_R2_SECRET=your-r2-secret-key
CLOUDFLARE_R2_BUCKET=your-bucket-name
```

#### Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/drime
# Copy the configuration from DEPLOYMENT_GUIDE.md
sudo ln -s /etc/nginx/sites-available/drime /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 5. Database Setup
```bash
sudo mysql_secure_installation
sudo mysql -u root -p

# In MySQL:
CREATE DATABASE drime CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'drime'@'localhost' IDENTIFIED BY 'your-secure-password';
GRANT ALL PRIVILEGES ON drime.* TO 'drime'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Run migrations:
php artisan migrate --seed --force
```

### 6. SSL Certificate
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 7. Queue Workers (Supervisor)
```bash
sudo apt install -y supervisor
sudo nano /etc/supervisor/conf.d/drime-queue.conf
# Copy the configuration from DEPLOYMENT_GUIDE.md
sudo supervisorctl reread && sudo supervisorctl update
```

### 8. Final Steps
```bash
# Set permissions
sudo chown -R www-data:www-data /var/www/drime
sudo chmod -R 775 /var/www/drime/storage /var/www/drime/bootstrap/cache

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set up cron job
echo "* * * * * www-data cd /var/www/drime && php artisan schedule:run >> /dev/null 2>&1" | sudo tee /etc/cron.d/drime-schedule

# Configure firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

## 🔧 Critical Environment Variables

### Must Configure These:
- `APP_URL` - Your website URL with https://
- `DB_PASSWORD` - Strong database password
- `MAIL_PASSWORD` - Your email service API key
- `CLOUDFLARE_R2_KEY` & `CLOUDFLARE_R2_SECRET` - Storage credentials

### Feature Toggles (Optional):
- `BILLING_ENABLED` - Enable/disable subscription features
- `GUEST_UPLOADS_ENABLED` - Allow anonymous file uploads
- `WORKSPACES_ENABLED` - Multi-user workspaces
- `NOTIFICATIONS_ENABLED` - Email notifications

### File Upload Limits:
- `GUEST_UPLOAD_MAX_FILE_SIZE` - Max file size in bytes (default: 10GB)
- `GUEST_UPLOAD_DEFAULT_EXPIRY_HOURS` - Default expiry (default: 72 hours)

## 🚨 Post-Deployment Testing

### 1. Check Application Health
```bash
curl -I https://your-domain.com
# Should return HTTP/2 200
```

### 2. Test Database Connection
```bash
php artisan tinker
# Run: DB::connection()->getPdo()
```

### 3. Test Email Configuration
```bash
php artisan tinker
# Run: Mail::raw('Test', function($m) { $m->to('test@example.com'); })
```

### 4. Verify Queue Workers
```bash
sudo supervisorctl status
# Should show drime-queue processes as RUNNING
```

### 5. Check Storage Connection
```bash
php artisan tinker
# Run: Storage::disk('cloudflare')->put('test.txt', 'Hello')
```

## 🔍 Troubleshooting Quick Fixes

### Application Not Loading (500 Error)
```bash
tail -f /var/www/drime/storage/logs/laravel.log
sudo chown -R www-data:www-data /var/www/drime/storage
sudo chmod -R 775 /var/www/drime/storage
```

### Queue Jobs Not Processing
```bash
sudo supervisorctl restart drime-queue:*
php artisan queue:failed
```

### File Uploads Failing
```bash
# Check PHP limits in /etc/php/8.2/fpm/php.ini:
upload_max_filesize = 2048M
post_max_size = 2048M
max_execution_time = 300
```

### Email Not Sending
```bash
php artisan queue:work --once
# Check for errors in output
```

## 📊 Monitoring Commands

### Check System Health
```bash
# Application status
curl -I https://your-domain.com

# Queue workers
sudo supervisorctl status

# Disk space
df -h

# Recent logs
tail -n 50 /var/www/drime/storage/logs/laravel.log
```

### Performance Optimization
```bash
# Clear all caches
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Optimize autoloader
composer dump-autoload --optimize
```

## 📚 Important File Locations

- **Application**: `/var/www/drime`
- **Logs**: `/var/www/drime/storage/logs/laravel.log`
- **Nginx config**: `/etc/nginx/sites-available/drime`
- **PHP config**: `/etc/php/8.2/fpm/php.ini`
- **Supervisor config**: `/etc/supervisor/conf.d/drime-queue.conf`
- **Environment**: `/var/www/drime/.env`

## 🎯 Admin Access

After deployment, create admin account:
```bash
php artisan tinker

$user = new App\Models\User();
$user->email = 'admin@your-domain.com';
$user->first_name = 'Admin';
$user->last_name = 'User';
$user->password = bcrypt('your-secure-password');
$user->email_verified_at = now();
$user->save();
$user->assignRole('admin');
```

Access admin panel at: `https://your-domain.com/admin`

---

**Support**: Refer to the complete `DEPLOYMENT_GUIDE.md` for detailed explanations.
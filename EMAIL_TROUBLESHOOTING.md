# Email Transfer Troubleshooting Guide

## Quick Diagnosis

If users are not receiving emails when adding an email address to transfers, follow this checklist:

### 1. Check Queue Workers
```bash
# Check if queue workers are running
ps aux | grep "queue:work"

# Start queue worker manually (for testing)
php artisan queue:work --queue=default,high --tries=3 --timeout=90 --verbose

# Use the management script
./deployment/scripts/queue-worker.sh status
./deployment/scripts/queue-worker.sh start
```

### 2. Test SMTP Configuration
```bash
# Test basic SMTP connectivity
curl "http://localhost:8000/test-mail/your-email@example.com"

# Or use artisan tinker
php artisan tinker
> Mail::raw('Test email', function($m) { $m->to('your-email@example.com')->subject('Test'); });
```

### 3. Check Queue Status
```bash
# List failed jobs
php artisan queue:failed

# Check recent queue activity
php artisan queue:work --once --verbose

# Monitor logs
tail -f storage/logs/laravel.log
tail -f storage/logs/queue-worker.log
```

### 4. Test Email Endpoints
```bash
# Test the email transfer endpoint
php test-email-transfer.php

# Or manually with curl
curl -X POST "http://localhost:8000/api/v1/guest-uploads/send-email" \
     -H "Content-Type: application/json" \
     -d '{
       "from_email": "test@example.com",
       "message": "Test message",
       "share_url": "http://localhost:8000/share/dummy-hash",
       "files": [{"filename": "test.pdf", "size": 1024000}]
     }'
```

## Common Issues & Solutions

### Issue 1: Queue Workers Not Processing Default Queue
**Symptoms:** Emails appear to be sent but never arrive  
**Cause:** Worker only processes "high" queue, but emails go to "default" queue  
**Solution:** Start worker with both queues: `--queue=default,high`

### Issue 2: SMTP Authentication Failure
**Symptoms:** "Failed to authenticate" errors in logs  
**Cause:** Wrong SMTP credentials  
**Solution:** Verify `.env` settings:
```bash
MAIL_MAILER=smtp
MAIL_HOST=smtp.resend.com
MAIL_PORT=465
MAIL_USERNAME=resend
MAIL_PASSWORD=your-resend-api-key
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=noreply@yourdomain.com
```

### Issue 3: Jobs Failing Silently
**Symptoms:** No errors reported but emails don't arrive  
**Cause:** Exception in Mailable class or email template  
**Solution:** Check failed jobs table and logs:
```bash
php artisan queue:failed
php artisan queue:retry all
```

### Issue 4: Memory/Timeout Issues
**Symptoms:** Workers stop processing or die unexpectedly  
**Cause:** Long-running processes or memory leaks  
**Solution:** Use supervisor and set memory limits:
```bash
# Copy supervisor config
sudo cp deployment/supervisor/laravel-worker.conf /etc/supervisor/conf.d/
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*
```

## Production Setup

### 1. Install Supervisor
```bash
# Ubuntu/Debian
sudo apt-get install supervisor

# macOS
brew install supervisor
```

### 2. Configure Queue Workers
```bash
# Copy the configuration
sudo cp deployment/supervisor/laravel-worker.conf /etc/supervisor/conf.d/

# Update the paths in the config file to match your environment
sudo nano /etc/supervisor/conf.d/laravel-worker.conf

# Reload supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*
```

### 3. Monitor Queue Workers
```bash
# Check status
sudo supervisorctl status laravel-worker:*

# View logs
sudo supervisorctl tail laravel-worker:* stdout

# Restart if needed
sudo supervisorctl restart laravel-worker:*
```

## Monitoring & Alerting

### Log Files to Monitor
- `storage/logs/laravel.log` - General application logs
- `storage/logs/queue-worker.log` - Queue worker output
- `storage/logs/worker.log` - Supervisor worker logs

### Key Metrics
- Queue job processing rate
- Failed job count
- Worker memory usage
- Email delivery success rate

### Health Checks
Add these endpoints to your monitoring:
- `GET /test-mail/{email}` - Test SMTP connectivity
- Queue worker process monitoring
- Failed jobs count alerts

## Emergency Recovery

If emails are completely broken:

1. **Immediate Fix**: Switch to synchronous mail processing
   ```bash
   # In .env, temporarily set:
   QUEUE_CONNECTION=sync
   php artisan config:clear
   ```

2. **Retry Failed Jobs**
   ```bash
   php artisan queue:retry all
   ```

3. **Clear and Restart Everything**
   ```bash
   php artisan queue:clear
   php artisan config:clear
   php artisan cache:clear
   ./deployment/scripts/queue-worker.sh restart
   ```

## Recent Improvements

This troubleshooting guide addresses the recent fixes made:

1. **Queue Configuration**: Set `GuestUploadSent` to use "high" priority queue
2. **Enhanced Logging**: Added detailed logging for email queueing operations  
3. **Error Handling**: Better error reporting in API responses
4. **Worker Management**: Scripts and configs for reliable queue processing
5. **Monitoring**: Health check endpoints and log monitoring
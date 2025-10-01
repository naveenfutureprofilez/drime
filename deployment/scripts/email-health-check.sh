#!/bin/bash

# Email System Health Check Script
# Usage: ./email-health-check.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../../" && pwd)"

echo "=== Email System Health Check ==="
echo "Timestamp: $(date)"
echo ""

# Check queue workers
echo "1. Queue Workers Status:"
WORKER_COUNT=$(ps aux | grep "queue:work" | grep -v grep | wc -l)
if [ $WORKER_COUNT -gt 0 ]; then
    echo "✅ $WORKER_COUNT queue worker(s) running"
    ps aux | grep "queue:work" | grep -v grep | head -3
else
    echo "❌ No queue workers running"
    echo "   Run: ./queue-worker.sh start"
fi
echo ""

# Check failed jobs
echo "2. Failed Jobs:"
cd "$PROJECT_DIR"
FAILED_COUNT=$(php artisan queue:failed --format=json 2>/dev/null | jq length 2>/dev/null || echo "0")
if [ "$FAILED_COUNT" = "0" ]; then
    echo "✅ No failed jobs"
else
    echo "⚠️  $FAILED_COUNT failed jobs found"
    echo "   Run: php artisan queue:failed"
fi
echo ""

# Test SMTP connectivity
echo "3. SMTP Configuration:"
if command -v curl >/dev/null 2>&1; then
    SMTP_TEST=$(curl -s "http://localhost:8000/test-mail/test@example.com" 2>/dev/null)
    if echo "$SMTP_TEST" | grep -q "success"; then
        echo "✅ SMTP connectivity working"
    else
        echo "❌ SMTP connectivity failed"
        echo "   Check your mail configuration"
    fi
else
    echo "⚠️  curl not available for SMTP test"
fi
echo ""

# Check log files
echo "4. Recent Log Activity:"
if [ -f "$PROJECT_DIR/storage/logs/laravel.log" ]; then
    RECENT_ERRORS=$(tail -50 "$PROJECT_DIR/storage/logs/laravel.log" | grep -c "ERROR\|CRITICAL")
    RECENT_EMAIL_LOGS=$(tail -50 "$PROJECT_DIR/storage/logs/laravel.log" | grep -c "Queuing email\|Email queued")
    
    echo "✅ Laravel log exists"
    echo "   Recent errors: $RECENT_ERRORS"
    echo "   Recent email logs: $RECENT_EMAIL_LOGS"
    
    if [ $RECENT_ERRORS -gt 0 ]; then
        echo "   Last few errors:"
        tail -50 "$PROJECT_DIR/storage/logs/laravel.log" | grep "ERROR\|CRITICAL" | tail -3 | sed 's/^/     /'
    fi
else
    echo "⚠️  No Laravel log file found"
fi
echo ""

# Check queue table (if database is accessible)
echo "5. Queue Status:"
QUEUE_SIZE=$(php artisan queue:work --once --stop-when-empty --quiet 2>/dev/null && echo "Queue processed" || echo "Queue check failed")
echo "   $QUEUE_SIZE"
echo ""

# Summary
echo "=== Summary ==="
if [ $WORKER_COUNT -gt 0 ] && [ "$FAILED_COUNT" = "0" ]; then
    echo "✅ Email system appears healthy"
    echo "   Workers running: $WORKER_COUNT"
    echo "   Failed jobs: $FAILED_COUNT"
else
    echo "⚠️  Email system needs attention"
    echo "   Workers running: $WORKER_COUNT"
    echo "   Failed jobs: $FAILED_COUNT"
    echo ""
    echo "Quick fixes:"
    echo "   - Start workers: ./queue-worker.sh start"
    echo "   - Retry failed jobs: php artisan queue:retry all"
    echo "   - Check logs: tail -f storage/logs/laravel.log"
fi
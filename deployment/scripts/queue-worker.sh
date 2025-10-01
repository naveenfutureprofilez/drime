#!/bin/bash

# Laravel Queue Worker Management Script
# Usage: ./queue-worker.sh [start|stop|restart|status]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../../" && pwd)"
WORKER_PIDFILE="$PROJECT_DIR/storage/queue-worker.pid"

start_worker() {
    echo "Starting Laravel queue worker..."
    
    # Kill existing worker if running
    if [ -f "$WORKER_PIDFILE" ] && kill -0 $(cat "$WORKER_PIDFILE") 2>/dev/null; then
        echo "Worker already running with PID $(cat $WORKER_PIDFILE)"
        return 1
    fi
    
    # Start new worker in background
    cd "$PROJECT_DIR"
    nohup php artisan queue:work --queue=default,high --sleep=3 --tries=3 --timeout=90 --memory=128 > storage/logs/queue-worker.log 2>&1 &
    
    # Save PID
    echo $! > "$WORKER_PIDFILE"
    echo "Queue worker started with PID $!"
}

stop_worker() {
    echo "Stopping Laravel queue worker..."
    
    if [ -f "$WORKER_PIDFILE" ]; then
        PID=$(cat "$WORKER_PIDFILE")
        if kill -0 "$PID" 2>/dev/null; then
            kill "$PID"
            rm -f "$WORKER_PIDFILE"
            echo "Queue worker stopped"
        else
            echo "Worker not running"
            rm -f "$WORKER_PIDFILE"
        fi
    else
        echo "No PID file found"
    fi
}

restart_worker() {
    stop_worker
    sleep 2
    start_worker
}

status_worker() {
    if [ -f "$WORKER_PIDFILE" ] && kill -0 $(cat "$WORKER_PIDFILE") 2>/dev/null; then
        echo "Queue worker is running with PID $(cat $WORKER_PIDFILE)"
        
        # Show recent jobs
        echo ""
        echo "Recent queue activity:"
        cd "$PROJECT_DIR"
        php artisan queue:failed | head -10
    else
        echo "Queue worker is not running"
    fi
}

case "$1" in
    start)
        start_worker
        ;;
    stop)
        stop_worker
        ;;
    restart)
        restart_worker
        ;;
    status)
        status_worker
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac
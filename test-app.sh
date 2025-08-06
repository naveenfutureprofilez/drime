#!/bin/bash

echo "🚀 Starting WeTransfer-like application..."

# Start Laravel backend
echo "Starting Laravel backend..."
php artisan serve --host=127.0.0.1 --port=8000 &
LARAVEL_PID=$!

# Wait for Laravel to start
sleep 3

# Start Vite frontend
echo "Starting Vite frontend..."
npm run dev &
VITE_PID=$!

echo "✅ Application started!"
echo "📍 Frontend: http://localhost:5173"
echo "📍 Backend: http://127.0.0.1:8000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
trap "echo 'Stopping services...' && kill $LARAVEL_PID $VITE_PID 2>/dev/null" EXIT
wait

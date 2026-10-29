#!/bin/sh
set -e

# Update Nginx port if $PORT is provided by cloud platform (Railway/Render)
PORT="${PORT:-80}"
sed -i "s/listen 80;/listen ${PORT};/g" /etc/nginx/nginx.conf

echo "==> Configuring Laravel environment..."
cd /var/www/html/backend

# Ensure directories exist with proper permissions
mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chmod -R 777 storage bootstrap/cache

# Run database migrations automatically against Supabase
if [ -n "$DB_HOST" ]; then
    echo "==> Running database migrations on ${DB_HOST}..."
    php artisan migrate --force --graceful || echo "Migration skipped or completed"
fi

echo "==> Starting Nginx, PHP-FPM, and Laravel Reverb on port ${PORT}..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

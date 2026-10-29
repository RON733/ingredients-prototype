#!/bin/sh
set -e

PORT="${PORT:-10000}"
echo "==> Configuring Nginx port to ${PORT}..."
sed -i "s/listen [0-9]\+;/listen ${PORT};/g" /etc/nginx/nginx.conf

echo "==> Configuring Laravel environment..."
cd /var/www/html/backend

mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chmod -R 777 storage bootstrap/cache

if [ -n "$DB_HOST" ]; then
    echo "==> Running database migrations on ${DB_HOST}..."
    php artisan migrate --force --graceful || echo "Migration step completed."
fi

echo "==> Starting Nginx, PHP-FPM, and Laravel Reverb on port ${PORT}..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
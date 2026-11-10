#!/bin/sh
set -e

PORT="${PORT:-10000}"
echo "==> Configuring Nginx port to ${PORT}..."
sed -i "s/listen [0-9]\+;/listen ${PORT};/g" /etc/nginx/nginx.conf

# Ensure PHP-FPM passes environment variables to PHP workers
echo "clear_env = no" >> /usr/local/etc/php-fpm.d/zz-docker.conf 2>/dev/null || true
if [ -f /usr/local/etc/php-fpm.d/www.conf ]; then
    sed -i 's/^;*clear_env\s*=.*/clear_env = no/' /usr/local/etc/php-fpm.d/www.conf 2>/dev/null || true
fi

echo "==> Configuring Laravel environment..."
cd /var/www/html/backend

mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chmod -R 777 storage bootstrap/cache

# Write out production .env file from environment variables if not present
if [ ! -f .env ]; then
    echo "==> Generating .env file from environment variables..."
    touch .env
    [ -n "$APP_NAME" ] && echo "APP_NAME=\"$APP_NAME\"" >> .env
    [ -n "$APP_ENV" ] && echo "APP_ENV=$APP_ENV" >> .env
    [ -n "$APP_KEY" ] && echo "APP_KEY=$APP_KEY" >> .env
    [ -n "$APP_DEBUG" ] && echo "APP_DEBUG=$APP_DEBUG" >> .env
    [ -n "$APP_URL" ] && echo "APP_URL=$APP_URL" >> .env
    [ -n "$DB_CONNECTION" ] && echo "DB_CONNECTION=$DB_CONNECTION" >> .env
    [ -n "$DB_HOST" ] && echo "DB_HOST=$DB_HOST" >> .env
    [ -n "$DB_PORT" ] && echo "DB_PORT=$DB_PORT" >> .env
    [ -n "$DB_DATABASE" ] && echo "DB_DATABASE=$DB_DATABASE" >> .env
    [ -n "$DB_USERNAME" ] && echo "DB_USERNAME=$DB_USERNAME" >> .env
    [ -n "$DB_PASSWORD" ] && echo "DB_PASSWORD=$DB_PASSWORD" >> .env
    [ -n "$DB_SSLMODE" ] && echo "DB_SSLMODE=$DB_SSLMODE" >> .env
    [ -n "$SESSION_DRIVER" ] && echo "SESSION_DRIVER=$SESSION_DRIVER" >> .env
    [ -n "$CACHE_STORE" ] && echo "CACHE_STORE=$CACHE_STORE" >> .env
    [ -n "$QUEUE_CONNECTION" ] && echo "QUEUE_CONNECTION=$QUEUE_CONNECTION" >> .env
    [ -n "$REVERB_APP_ID" ] && echo "REVERB_APP_ID=$REVERB_APP_ID" >> .env
    [ -n "$REVERB_APP_KEY" ] && echo "REVERB_APP_KEY=$REVERB_APP_KEY" >> .env
    [ -n "$REVERB_APP_SECRET" ] && echo "REVERB_APP_SECRET=$REVERB_APP_SECRET" >> .env
    [ -n "$REVERB_HOST" ] && echo "REVERB_HOST=$REVERB_HOST" >> .env
    [ -n "$REVERB_PORT" ] && echo "REVERB_PORT=$REVERB_PORT" >> .env
    [ -n "$REVERB_SCHEME" ] && echo "REVERB_SCHEME=$REVERB_SCHEME" >> .env
    [ -n "$PAYMONGO_SECRET_KEY" ] && echo "PAYMONGO_SECRET_KEY=$PAYMONGO_SECRET_KEY" >> .env
    [ -n "$PAYMONGO_PUBLIC_KEY" ] && echo "PAYMONGO_PUBLIC_KEY=$PAYMONGO_PUBLIC_KEY" >> .env
    [ -n "$PAYMONGO_WEBHOOK_SECRET" ] && echo "PAYMONGO_WEBHOOK_SECRET=$PAYMONGO_WEBHOOK_SECRET" >> .env
    [ -n "$PAYMONGO_API_URL" ] && echo "PAYMONGO_API_URL=$PAYMONGO_API_URL" >> .env
fi

# Fallback: If APP_KEY is still not set in environment or .env, generate one
if ! grep -q "^APP_KEY=" .env 2>/dev/null || [ -z "$(grep "^APP_KEY=" .env 2>/dev/null | cut -d'=' -f2-)" ]; then
    if [ -z "$APP_KEY" ]; then
        echo "==> Generating application key..."
        php artisan key:generate --force || true
    fi
fi

if [ -n "$DB_HOST" ]; then
    echo "==> Running database migrations on ${DB_HOST}..."
    php artisan migrate --force --graceful || echo "Migration step completed."
fi

echo "==> Starting Nginx, PHP-FPM, and Laravel Reverb on port ${PORT}..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

FROM php:8.3-fpm-alpine

# Install system tools and PHP extensions required for Laravel & Reverb
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    git \
    postgresql-dev \
    libzip-dev \
    icu-dev \
    linux-headers \
    && docker-php-ext-install pdo pdo_pgsql pgsql bcmath pcntl posix zip intl opcache

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy project files
COPY . /var/www/html

# Install Composer dependencies
RUN cd /var/www/html/backend && composer install --no-dev --optimize-autoloader --no-interaction

# Setup Nginx and Supervisor configs
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

# Strip any Windows CRLF endings, remove any UTF-8 BOM, and set permissions
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.sh \
    && sed -i 's/\r$//' /etc/nginx/nginx.conf \
    && sed -i 's/\r$//' /etc/supervisor/conf.d/supervisord.conf \
    && sed -i '1s/^\xEF\xBB\xBF//' /etc/supervisor/conf.d/supervisord.conf \
    && sed -i '1s/^\xEF\xBB\xBF//' /etc/nginx/nginx.conf \
    && chmod +x /usr/local/bin/entrypoint.sh \
    && chown -R www-data:www-data /var/www/html/backend/storage /var/www/html/backend/bootstrap/cache \
    && chmod -R 775 /var/www/html/backend/storage /var/www/html/backend/bootstrap/cache

EXPOSE 80 8080 10000

ENTRYPOINT ["/bin/sh", "/usr/local/bin/entrypoint.sh"]
#!/bin/sh
set -e

# Set default port if not provided
export PORT=${PORT:-80}

# Replace PORT placeholder in nginx config template
envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g 'daemon off;'

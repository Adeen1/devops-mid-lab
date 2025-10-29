# CORS Configuration Fix

## Changes Made to Fix Cross-Origin Errors

### 1. Backend CORS Configuration (`/be/api/index.js`)

- Updated CORS configuration to allow multiple origins including Docker containers
- Added proper headers and methods
- Enabled credentials support

### 2. Frontend API Configuration (`/fe/src/config/api.ts`)

- Created centralized API configuration
- Handles both development and production environments
- Automatically detects environment and adjusts API URLs

### 3. Nginx Proxy Configuration (`/fe/nginx.conf`)

- Added proxy configuration to forward `/api` requests to backend
- Eliminates CORS issues in production by serving frontend and API from same origin

### 4. Docker Configuration Updates

- Updated docker-compose files to ensure proper service communication
- Removed hardcoded environment variables that could cause conflicts

## How It Works

### Development Mode

- Frontend runs on `http://localhost:5173` (Vite dev server)
- Backend runs on `http://localhost:5000`
- CORS allows cross-origin requests between these ports

### Production Mode (Docker)

- Frontend served by Nginx on port 80
- Nginx proxies `/api/*` requests to backend container
- No CORS issues since requests appear to come from same origin

## Testing the Fix

### Development Testing

```bash
# Start backend
cd be && npm run start

# Start frontend (in another terminal)
cd fe && npm run dev

# Test in browser: http://localhost:5173
```

### Production Testing (Docker)

```bash
# Build and start all services
docker compose up -d

# Test in browser: http://localhost:3000
# API requests should work without CORS errors
```

### Verify CORS Headers

```bash
# Test API directly
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:5000/api/menu

# Should return CORS headers in response
```

## Troubleshooting

### If CORS errors persist:

1. Clear browser cache
2. Check browser dev tools network tab for actual request URLs
3. Verify environment variables are set correctly
4. Ensure all services are running and accessible

### Common Issues:

- **Mixed protocols**: Ensure both frontend and backend use same protocol (http/https)
- **Port conflicts**: Make sure ports 3000 and 5000 are available
- **Container networking**: Verify Docker containers can communicate on the bridge network

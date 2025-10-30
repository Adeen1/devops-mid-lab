# Frontend Production Dockerfile (for Railway deployment with Root Directory = fe)
# Build stage - Updated to support dynamic PORT
FROM node:18-alpine AS build
WORKDIR /app

# Copy frontend package files (already in fe/ directory context)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source code (already in fe/ directory context)
COPY . ./

# Build the application (Vite will read .env.production file)
RUN npm run build:prod

# Production stage with nginx
FROM nginx:alpine

# Install wget for health checks
RUN apk add --no-cache wget

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Create a simple nginx config
RUN echo 'server { listen 80; root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

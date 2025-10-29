# ------------------------------------------------------------
# Base Node image
# ------------------------------------------------------------
FROM node:18-alpine AS base
WORKDIR /app

# ------------------------------------------------------------
# Dependencies (full, for dev & build)
# ------------------------------------------------------------
FROM base AS deps
COPY package*.json ./
RUN npm ci

# ------------------------------------------------------------
# Development target (Vite dev server)
#   Build with: docker build --target dev -t myapp-dev .
#   Run   with: docker run --rm -it -p 5173:5173 myapp-dev
# ------------------------------------------------------------
FROM deps AS dev
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

# ------------------------------------------------------------
# Build target (creates production bundle in /app/dist)
# ------------------------------------------------------------
FROM deps AS build
COPY . .
# If you rely on env vars at build time, pass them with --build-arg or .env handling as needed
RUN npm run build:prod

# ------------------------------------------------------------
# Production static site (nginx)
#   Build with: docker build --target prod -t myapp-prod .
#   Run   with: docker run --rm -p 80:80 myapp-prod
# ------------------------------------------------------------
FROM nginx:alpine AS prod
# Optional: install wget for healthchecks
RUN apk add --no-cache wget
# Copy compiled assets
COPY --from=build /app/dist /usr/share/nginx/html
# Optional custom nginx config (if present in context)
#   Make sure your nginx.conf defines the server on port 80
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Non-root (defense in depth; nginx runs as nginx user by default on this image)
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1
CMD ["nginx", "-g", "daemon off;"]

# ------------------------------------------------------------
# API target (Node runtime)
#   Build with: docker build --target api -t myapp-api .
#   Run   with: docker run --rm -p 5000:5000 myapp-api
# ------------------------------------------------------------
FROM node:18-alpine AS api
WORKDIR /app
# Install only production deps for slimmer image
COPY package*.json ./
RUN npm ci --omit=dev

# Copy app source (JS/TS, API, etc.)
COPY . .

# Non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 \
    && chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/', (res)=>process.exit(res.statusCode===200?0:1)).on('error',()=>process.exit(1))"
CMD ["node", "./api/index.js"]

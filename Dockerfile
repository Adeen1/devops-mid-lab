# Stage 1: Build Frontend
FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
ARG CACHEBUST=1
COPY client/ .
RUN npm run build

# Stage 2: Setup Backend & Serve
FROM node:18-alpine
WORKDIR /app

# Copy Backend dependencies
COPY server/package.json ./package.json
RUN npm install

# Copy Backend source
COPY server/ ./server/

# Copy Built Frontend from Stage 1
COPY --from=client-builder /app/client/dist ./client/dist

# Expose port
EXPOSE 5000

# Start Application
CMD ["node", "server/src/index.js"]

# Docker Setup for Rouse Restaurant Application

This project contains Docker configurations for the complete Rouse Restaurant application stack including frontend, backend, and MongoDB database.

## 🏗️ Architecture

- **Frontend**: React/TypeScript with Vite, served by Nginx
- **Backend**: Node.js/Express API server
- **Database**: MongoDB with sample data initialization
- **Reverse Proxy**: Nginx for production frontend serving

## 📁 Docker Files Structure

```
├── docker-compose.yml          # Production configuration
├── docker-compose.dev.yml      # Development configuration
├── be/
│   ├── Dockerfile              # Backend production image
│   └── .dockerignore
├── fe/
│   ├── Dockerfile              # Frontend production image
│   ├── Dockerfile.dev          # Frontend development image
│   ├── nginx.conf              # Nginx configuration
│   └── .dockerignore
└── mongo-init/
    └── init-db.js              # MongoDB initialization script
```

## 🚀 Quick Start

### Production Environment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ This will delete database data)
docker-compose down -v
```

### Development Environment

```bash
# Build and start development services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## 🌐 Service URLs

| Service  | Production URL        | Development URL       |
| -------- | --------------------- | --------------------- |
| Frontend | http://localhost:3000 | http://localhost:3000 |
| Backend  | http://localhost:5000 | http://localhost:5000 |
| MongoDB  | localhost:27017       | localhost:27017       |

## 🔧 Environment Variables

### Backend (.env file in /be directory)

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://admin:password123@mongodb:27017/rouse_restaurant?authSource=admin
```

### Frontend

```env
NODE_ENV=production
VITE_API_BASE_URL=http://localhost:5000
```

## 📊 Database Configuration

- **Username**: admin
- **Password**: password123
- **Database**: rouse_restaurant
- **Port**: 27017

The database is automatically initialized with sample menu data when first started.

## 🛠️ Individual Service Commands

### Build Individual Services

```bash
# Build backend only
docker build -t rouse-backend ./be

# Build frontend only
docker build -t rouse-frontend ./fe
```

### Run Individual Services

```bash
# Run MongoDB only
docker run -d --name mongodb -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  mongo:7.0

# Run backend only (requires MongoDB)
docker run -d --name backend -p 5000:5000 \
  -e MONGO_URI=mongodb://admin:password123@mongodb:27017/rouse_restaurant?authSource=admin \
  rouse-backend

# Run frontend only
docker run -d --name frontend -p 3000:80 rouse-frontend
```

## 🔍 Health Checks

All services include health checks:

- **MongoDB**: Ping database connection
- **Backend**: HTTP request to main endpoint
- **Frontend**: HTTP request to Nginx server

## 📝 Logs and Debugging

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Follow logs in real-time
docker-compose logs -f backend
```

## 🧹 Cleanup Commands

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Complete cleanup (⚠️ removes everything)
docker system prune -a --volumes
```

## 🔒 Production Considerations

1. **Security**: Change default MongoDB credentials
2. **Volumes**: Database data persists in named volume `mongodb_data`
3. **Networks**: Services communicate via isolated Docker network
4. **Health Checks**: All services include health monitoring
5. **Resource Limits**: Consider adding memory/CPU limits for production

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 3000, 5000, and 27017 are available
2. **Volume Permissions**: Check Docker volume permissions if database fails to start
3. **Network Issues**: Verify Docker network configuration if services can't communicate
4. **Build Failures**: Clear Docker cache with `docker builder prune`

### Reset Everything

```bash
# Stop all services and remove volumes
docker-compose down -v

# Remove all containers and images
docker system prune -a

# Rebuild and restart
docker-compose up -d --build
```

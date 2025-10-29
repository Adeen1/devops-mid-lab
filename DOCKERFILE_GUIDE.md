# Dockerfile Guide

This project uses multiple Dockerfiles for different purposes:

## 📁 Dockerfile Structure

### 1. `Dockerfile` (Root)
- **Purpose:** Docker Compose development environment
- **Usage:** `docker-compose up`
- **Context:** Runs from repository root
- **Multi-stage:** Yes (builds both frontend and backend)

### 2. `Dockerfile.backend`
- **Purpose:** Railway production deployment (backend only)
- **Usage:** Used by Railway via `be/railway.json`
- **Context:** Runs from repository root, copies from `be/` directory
- **Referenced in:** `be/railway.json` → `dockerfilePath: "../Dockerfile.backend"`

### 3. `fe/Dockerfile.frontend`
- **Purpose:** Railway production deployment (frontend only)
- **Usage:** Used by Railway via `fe/railway.json`
- **Context:** Runs from `fe/` directory (Railway Root Directory = "fe")
- **Referenced in:** `fe/railway.json` → `dockerfilePath: "Dockerfile.frontend"`

## 🚀 Deployment Contexts

### Local Development (Docker Compose)
```bash
# Uses: Dockerfile (root)
docker-compose up
```

### Railway Deployment

**Backend:**
- Root Directory: ` ` (empty/root)
- Dockerfile: `Dockerfile.backend`
- Configured in: `be/railway.json`

**Frontend:**
- Root Directory: `fe`
- Dockerfile: `Dockerfile.frontend` (in fe/ directory)
- Configured in: `fe/railway.json`

## 🔧 CI/CD (GitHub Actions)

The CI/CD pipeline (`github/workflows/ci.yml`) does **NOT** use Dockerfiles.
It runs:
- Backend: ESLint + Jest tests
- Frontend: ESLint + Vite build

## ⚠️ Important Notes

1. **Never** modify Railway Dockerfiles without testing locally first
2. Railway backend builds from **root** but copies from `be/`
3. Railway frontend builds from **fe/** directory (Root Directory setting)
4. The main `Dockerfile` is for local docker-compose only

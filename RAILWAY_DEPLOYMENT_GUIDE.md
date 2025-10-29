# Railway Deployment Guide for DevOps Mid Lab

## ✅ Completed Steps

1. **Railway CLI Installation**: ✅ Installed via npm
2. **Project Linking**: ✅ Linked to project `appealing-light` (ID: 4b83beaa-0da0-4006-ae18-0348356044e4)
3. **MongoDB Database**: ✅ Added MongoDB service
4. **Environment Variables**: ✅ Set MONGO_URI=${{MongoDB.MONGO_URL}}
5. **Backend Domain**: ✅ https://devops-mid-lab-backend-production-afd8.up.railway.app

## 🔧 Manual Configuration Required in Railway Dashboard

### Backend Service Configuration

**CRITICAL**: You need to configure the Dockerfile Path in the Railway dashboard:

1. Go to https://railway.com/project/4b83beaa-0da0-4006-ae18-0348356044e4
2. Click on the `devops-mid-lab-backend` service
3. Go to **Settings** tab
4. Scroll down to **Build** section
5. Find **Dockerfile Path** field (currently shows: `Dockerfile`)
6. Change it to: `Dockerfile.backend`
7. Click **Update**
8. Trigger a new deployment by clicking **Deploy** button at the top

### Frontend Service Configuration

**CRITICAL**: Configure the Dockerfile Path and verify environment variables:

1. Go to https://railway.com/project/4b83beaa-0da0-4006-ae18-0348356044e4
2. Click on the `devops-mid-lab-frontend` service
3. Go to **Settings** tab
4. Scroll down to **Build** section
5. Find **Dockerfile Path** field
6. Change it to: `Dockerfile.frontend`
7. Click **Update**
8. Go to **Variables** tab
9. Verify `VITE_API_BASE_URL` is set to: `https://devops-mid-lab-backend-production-afd8.up.railway.app`
10. Trigger a new deployment by clicking **Deploy** button at the top

### Environment Variables to Verify/Add

#### Backend Service:
- ✅ `MONGO_URI` = `${{MongoDB.MONGO_URL}}` (Already set)
- Add if needed: `PORT` = `5000` (Railway auto-provides PORT, but good to have default)
- Add if needed: `NODE_ENV` = `production`
- Add: `FRONTEND_URL` = `<Your frontend URL after deploying frontend>`

#### MongoDB Service:
- No additional configuration needed (Railway manages this automatically)

## 📁 Project Structure for Railway

```
devops-mid-lab/
├── be/                          # Backend service (Node.js/Express)
│   ├── Dockerfile              # Docker configuration
│   ├── railway.json            # Railway service config
│   ├── nixpacks.toml          # Alternative build config
│   ├── package.json
│   ├── package-lock.json       # Required for npm ci
│   └── api/
│       └── index.js           # Entry point
│
├── fe/                          # Frontend service (React/Vite)
│   ├── Dockerfile              # Docker configuration
│   ├── railway.json            # Railway service config
│   ├── nixpacks.toml          # Alternative build config
│   ├── package.json
│   └── src/
│
├── railway.toml                # Multi-service configuration
└── railway.json                # Root configuration
```

## 🚀 Deployment Commands

### Deploy Backend:
```bash
# Link to backend service
railway link -s devops-mid-lab-backend

# Deploy
railway up

# Check logs
railway logs

# Check status
railway status
```

### Add Frontend Service (Next Step):
```bash
# Add a new service for frontend
railway service

# Or add from dashboard and link
railway link -s <frontend-service-name>
```

## 📝 Frontend Service Setup (To Do)

1. Go to Railway Dashboard
2. Click "New Service" → "GitHub Repo"
3. Select your repository
4. Configure:
   - **Name**: `devops-mid-lab-frontend`
   - **Root Directory**: `fe`
   - **Build Command**: `npm ci && npm run build:prod`
   - **Start Command**: `npx serve -s dist -l $PORT`

5. Environment Variables:
   - `VITE_API_BASE_URL` = `https://devops-mid-lab-backend-production-afd8.up.railway.app`

## 🔍 Troubleshooting

### Backend Build Fails with "package-lock.json not found"

- **Solution**: Change Dockerfile Path to `be/Dockerfile` in Build settings
- Alternative: Switch to Nixpacks builder with custom build command `cd be && npm ci --omit=dev`

### CORS Errors

- **Solution**: Add frontend URL to `FRONTEND_URL` environment variable in backend service

### MongoDB Connection Fails

- **Solution**: Verify `MONGO_URI=${{MongoDB.MONGO_URL}}` is set correctly
- Check MongoDB service is running in the same environment

### Port Issues

- **Solution**: Railway provides `$PORT` automatically. Ensure your app uses `process.env.PORT`

## 🌐 URLs After Deployment

- **Backend API**: https://devops-mid-lab-backend-production-afd8.up.railway.app
- **Frontend**: (Will be generated after frontend service deployment)
- **MongoDB**: Internal URL (accessible via `${{MongoDB.MONGO_URL}}`)

## 📊 Current Status

| Service | Status | Domain |
|---------|--------|--------|
| Backend | ⚠️ Needs Root Directory Configuration | ✅ Assigned |
| Frontend | ⏳ Not Deployed Yet | ❌ Not Assigned |
| MongoDB | ✅ Running | Internal Only |

## 🎯 Next Steps

1. **Configure Backend Root Directory** (MOST IMPORTANT)
   - Go to service settings
   - Set Root Directory to `be`
   - Redeploy

2. **Deploy Frontend**
   - Create new service in Railway
   - Link to same repository
   - Set root directory to `fe`
   - Configure environment variables

3. **Update CORS**
   - Once frontend is deployed, add its URL to backend's `FRONTEND_URL` variable

4. **Test the Application**
   - Access frontend URL
   - Verify backend API connectivity
   - Test database operations

## 💡 Alternative: Use Render (Already Configured)

Your project also has `render.yaml` configuration. If Railway continues to have issues, you can deploy to Render:

1. Go to https://render.com
2. New Web Service → Connect Repository
3. Render will auto-detect `render.yaml`
4. Configure MongoDB connection string in environment variables

## 📞 Support

If you encounter issues:
1. Check Railway logs: `railway logs`
2. Check build logs in Dashboard
3. Verify all environment variables are set
4. Ensure Root Directory is configured correctly

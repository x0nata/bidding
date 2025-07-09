# Frontend Deployment Guide

## Issue Resolution Summary

✅ **FIXED**: "No Output Directory named 'public' found" error
- **Solution 1**: Simple configuration with `outputDirectory: "public-vercel"`
- **Solution 2**: Alternative configuration using `@vercel/static-build`
- **Solution 3**: Manual Vercel dashboard configuration
- Build process correctly generates files and copies them to expected directory
- All static assets are properly referenced

## Prerequisites

1. Backend must be deployed first and accessible
2. You need the backend deployment URL (e.g., `https://your-backend-deployment.vercel.app`)

## Step 1: Update Backend URL Configuration

### Option A: Using the Update Script (Recommended)
```bash
cd Bidding-Website-master
node update-backend-url.js https://your-actual-backend-url.vercel.app
```

### Option B: Manual Update
Update the following files with your actual backend URL:

**`.env.production`:**
```env
REACT_APP_BACKEND_URL=https://your-backend-deployment.vercel.app/api
REACT_APP_API_URL=https://your-backend-deployment.vercel.app/api
REACT_APP_WEBSOCKET_URL=https://your-backend-deployment.vercel.app
REACT_APP_SOCKET_URL=https://your-backend-deployment.vercel.app
```

## Step 2: Test Build Process

```bash
npm run build
```

This should create a `build` directory with all static files.

## Step 3: Deploy to Vercel

### Method 1: Using Current Configuration (Recommended)
The current `vercel.json` is configured to work with the build process:

```bash
npm run build:vercel  # This builds and prepares files for Vercel
```

Then deploy using:
```bash
npm install -g vercel
vercel --prod
```

### Method 2: Alternative Configuration
If the current configuration doesn't work, try using the alternative:

```bash
cp vercel-alternative.json vercel.json
npm run build
vercel --prod
```

### Method 3: Manual Vercel Dashboard Configuration
1. Connect your GitHub repository to Vercel
2. In Project Settings → General:
   - **Build Command**: `npm run build:vercel`
   - **Output Directory**: `public-vercel`
   - **Install Command**: `npm install`
3. Set environment variables in Environment Variables section:
   - `REACT_APP_BACKEND_URL`: `https://your-backend-deployment.vercel.app/api`
   - `REACT_APP_API_URL`: `https://your-backend-deployment.vercel.app/api`
   - `REACT_APP_WEBSOCKET_URL`: `https://your-backend-deployment.vercel.app`
   - `REACT_APP_SOCKET_URL`: `https://your-backend-deployment.vercel.app`
   - `GENERATE_SOURCEMAP`: `false`

### Method 4: If All Else Fails
If you're still getting the "public" directory error:
1. In Vercel Dashboard → Project Settings → General
2. Set **Output Directory** to: `build`
3. Set **Build Command** to: `npm run build`
4. Remove the `vercel.json` file temporarily

## Step 4: Verify Deployment

1. Check that the frontend loads without errors
2. Test API connectivity by trying to login/register
3. Verify that static assets load correctly

## Configuration Files Updated

- ✅ `vercel.json` - Fixed output directory configuration
- ✅ `package.json` - Build scripts are correct
- ✅ `craco.config.js` - Build configuration is correct

## Troubleshooting

### Build Fails
- Check Node.js version (should be 18.x)
- Run `npm install` to ensure dependencies are installed
- Check for any TypeScript/ESLint errors

### API Connection Issues
- Verify backend URL is correct and accessible
- Check CORS configuration in backend
- Ensure environment variables are set in Vercel

### Static Assets Not Loading
- Check that `outputDirectory` is set to `build` in `vercel.json`
- Verify build process completes successfully
- Check browser network tab for 404 errors

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `REACT_APP_BACKEND_URL` | Main API endpoint | `https://backend.vercel.app/api` |
| `REACT_APP_API_URL` | Alternative API endpoint | `https://backend.vercel.app/api` |
| `REACT_APP_WEBSOCKET_URL` | WebSocket connection | `https://backend.vercel.app` |
| `REACT_APP_SOCKET_URL` | Socket.IO connection | `https://backend.vercel.app` |
| `REACT_APP_FRONTEND_URL` | Frontend URL for CORS | `https://bidding-sandy.vercel.app` |

## Next Steps After Deployment

1. Test all major functionality (login, bidding, payments)
2. Monitor for any console errors
3. Set up monitoring and analytics if needed
4. Configure custom domain if required

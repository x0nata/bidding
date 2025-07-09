# Frontend Deployment Fix for Monorepo

## Problem
Vercel was trying to build the backend instead of the frontend because:
- Repository contains both frontend (`Bidding-Website-master`) and backend (`Bid-Out-Backend-master`)
- Vercel was confused about which directory to build
- No root-level configuration to direct Vercel to the frontend

## Solution Applied

### Option 1: Root Directory Configuration (Recommended)
Set these in Vercel Dashboard → Project Settings → General:
- **Root Directory**: `Bidding-Website-master`
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### Option 2: Root-Level Configuration Files (Current Setup)
Created configuration files in repository root:

1. **`vercel.json`** - Points Vercel to frontend directory
2. **`package.json`** - Root package.json with build scripts that cd into frontend
3. **`.vercelignore`** - Ignores backend directory during deployment

## Environment Variables for Vercel
Add these to your Vercel project:
```
REACT_APP_BACKEND_URL=https://bidding-9vw1.vercel.app/api
REACT_APP_API_URL=https://bidding-9vw1.vercel.app/api
REACT_APP_WEBSOCKET_URL=https://bidding-9vw1.vercel.app
REACT_APP_SOCKET_URL=https://bidding-9vw1.vercel.app
GENERATE_SOURCEMAP=false
```

## Deployment Steps

### Method 1: Try Root Directory Setting First
1. Go to Vercel Dashboard
2. Project Settings → General
3. Set **Root Directory** to: `Bidding-Website-master`
4. Redeploy

### Method 2: Use Root Configuration (If Method 1 Fails)
1. Commit and push the new root files (`vercel.json`, `package.json`, `.vercelignore`)
2. In Vercel Dashboard, remove any Root Directory setting (leave blank)
3. Redeploy

## Verification
After deployment, check:
1. Frontend loads without errors
2. API calls work (try login/register)
3. Static assets load correctly
4. No console errors related to backend connectivity

## Troubleshooting
If still getting build errors:
1. Check Vercel build logs for which package.json it's using
2. Ensure environment variables are set in Vercel
3. Try clearing Vercel build cache
4. Contact support if the Root Directory setting isn't working

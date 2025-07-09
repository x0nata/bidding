# Horn of Antiques - Backend API

## Vercel Deployment Instructions

### 1. Deploy to Vercel

1. **Create New Project**: Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. **Import Repository**: Import your GitHub repository
3. **Configure Project**:
   - **Root Directory**: `Bid-Out-Backend-master`
   - **Framework Preset**: Other
   - **Build Command**: Leave empty or use `npm run build`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

### 2. Environment Variables

Add these environment variables in Vercel project settings:

```
MONGO_URI=mongodb+srv://bid:wasd1234@bid.cfyzacu.mongodb.net/bidding_site?retryWrites=true&w=majority&appName=bid&serverSelectionTimeoutMS=60000&connectTimeoutMS=60000
JWT_SECRET=antique_auction_jwt_secret_key_2024_secure_token
CLOUDINARY_CLOUD_NAME=dibeowy3f
CLOUDINARY_API_KEY=595733443582855
CLOUDINARY_API_SECRET=MBR5OPW_Wg8ZrNi_c3dHz76wX8A
FRONTEND_URL=https://bidding-sandy.vercel.app
NODE_ENV=production
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

### 3. Deploy

1. Click **Deploy**
2. Wait for deployment to complete
3. Test the API endpoints

### 4. Test Endpoints

After deployment, test these endpoints:

- `GET /` - API status
- `GET /health` - Health check
- `GET /api/category` - Categories list
- `POST /api/users/register` - User registration

### 5. Update Frontend

Once backend is deployed, update your frontend environment variables with the new backend URL.

## API Structure

- `/api/users` - User management
- `/api/product` - Product/auction management
- `/api/bidding` - Bidding functionality
- `/api/category` - Categories
- `/api/auction-management` - Serverless auction management

## Features

- ✅ Serverless-compatible
- ✅ MongoDB Atlas integration
- ✅ JWT authentication
- ✅ File upload with Cloudinary
- ✅ Email notifications
- ✅ Automated auction management
- ✅ CORS configured for production

## Notes

- WebSocket functionality is disabled in serverless environment
- Use polling-based updates via `/api/auction-management/auction-state/:id`
- Cron jobs are configured for auction management

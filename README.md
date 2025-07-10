# 🏺 Horn of Antiques - Ethiopian Antique Auction Platform

<div align="center">

![Horn of Antiques](https://img.shields.io/badge/Horn%20of%20Antiques-Antique%20Auction%20Platform-gold?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjRkZENzAwIi8+Cjwvc3ZnPgo=)

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Frontend-blue?style=for-the-badge)](https://bidding-9vw1.vercel.app/)
[![API Status](https://img.shields.io/badge/🚀_API-Backend-green?style=for-the-badge)](https://bidding-sandy.vercel.app/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com/)

*A modern, full-stack auction platform dedicated to Ethiopian antiques and cultural artifacts*

[🎯 Features](#-features) • [🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [🛠️ Tech Stack](#️-tech-stack) • [🌐 Deployment](#-deployment)

</div>

---

## 🎯 Features

### 🏛️ **Auction Management**
- **Real-time Bidding** - Live auction updates with WebSocket integration
- **Instant Purchase** - Buy-now option for immediate transactions
- **Auction Scheduling** - Automated auction lifecycle management
- **Bid History** - Complete bidding trail and analytics

### 👥 **User Experience**
- **Multi-role System** - Buyers, Sellers, and Admin dashboards
- **Secure Authentication** - JWT-based auth with role-based access
- **Profile Management** - Comprehensive user profiles and preferences
- **Balance Management** - Integrated wallet system for transactions

### 🎨 **Antique Showcase**
- **Rich Media Gallery** - High-quality image uploads with Cloudinary
- **Detailed Cataloging** - Comprehensive antique descriptions and metadata
- **Category Management** - Organized browsing by antique types
- **Search & Filter** - Advanced search capabilities

### 🔧 **Admin Features**
- **User Management** - Complete user administration panel
- **Auction Control** - Full auction lifecycle management
- **Transportation Tracking** - Post-auction logistics management
- **Analytics Dashboard** - Revenue and performance insights

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.x or 20.x
- **MongoDB** database
- **Cloudinary** account (for image storage)

### 🖥️ Frontend Setup

```bash
# Navigate to frontend directory
cd Bidding-Website-master

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will be available at `http://localhost:3000`

### ⚙️ Backend Setup

```bash
# Navigate to backend directory
cd Bid-Out-Backend-master

# Install dependencies
npm install

# Start development server
npm run dev
```

The API will be available at `http://localhost:5000`

### 🌍 Environment Configuration

Create `.env` files in both directories:

**Frontend (.env)**
```env
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WEBSOCKET_URL=http://localhost:5000
```

**Backend (.env)**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.2.3-764ABC?style=flat-square&logo=redux)](https://redux-toolkit.js.org/)
[![React Router](https://img.shields.io/badge/React_Router-6.30.1-CA4245?style=flat-square&logo=react-router)](https://reactrouter.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Socket.io Client](https://img.shields.io/badge/Socket.io-4.7.5-010101?style=flat-square&logo=socket.io)](https://socket.io/)

### Backend
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19.2-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.3.2-47A248?style=flat-square&logo=mongodb)](https://mongodb.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-8.3.2-880000?style=flat-square)](https://mongoosejs.com/)
[![JWT](https://img.shields.io/badge/JWT-9.0.2-000000?style=flat-square&logo=json-web-tokens)](https://jwt.io/)

### Cloud & Deployment
[![Vercel](https://img.shields.io/badge/Vercel-Deployment-000000?style=flat-square&logo=vercel)](https://vercel.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_Storage-3448C5?style=flat-square&logo=cloudinary)](https://cloudinary.com/)

</div>

---

## 📖 Documentation

### 🏗️ Project Structure

```
📦 Horn of Antiques
├── 🎨 Bidding-Website-master/     # React Frontend
│   ├── 📱 src/
│   │   ├── 🧩 components/         # Reusable UI components
│   │   ├── 📄 screens/            # Page components
│   │   ├── 🔧 admin/              # Admin panel components
│   │   ├── 🔄 redux/              # State management
│   │   ├── 🛣️ routes/             # Route definitions
│   │   └── 🔌 services/           # API integration
│   └── 📦 public/                 # Static assets
└── ⚙️ Bid-Out-Backend-master/     # Node.js Backend
    ├── 🛣️ routes/                 # API route handlers
    ├── 📊 controllers/            # Business logic
    ├── 🗃️ model/                  # Database models
    ├── 🔒 middleWare/             # Authentication & validation
    └── 🔧 services/               # External integrations
```

### 🔑 Key Features Implementation

- **🔐 Authentication**: JWT-based with role management (Buyer/Seller/Admin)
- **💰 Payment Integration**: Mock payment system with balance management
- **📸 Image Upload**: Cloudinary integration for antique photos
- **⚡ Real-time Updates**: WebSocket for live bidding
- **📱 Responsive Design**: Mobile-first approach with Tailwind CSS
- **🔍 Search & Filter**: Advanced product discovery
- **📊 Admin Dashboard**: Complete platform management

---

## 🌐 Deployment

### Production URLs
- **🌍 Frontend**: [https://bidding-9vw1.vercel.app/](https://bidding-9vw1.vercel.app/)
- **🔌 Backend API**: [https://bidding-sandy.vercel.app/](https://bidding-sandy.vercel.app/)

### Deployment Commands

**Frontend (Vercel)**
```bash
npm run build
# Automatically deployed via Vercel GitHub integration
```

**Backend (Vercel Serverless)**
```bash
# Deployed via vercel.json configuration
# API endpoints available at /api/*
```

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🔄 Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Ethiopian Cultural Heritage** - Preserving and celebrating Ethiopian antiques
- **Open Source Community** - For the amazing tools and libraries
- **Contributors** - Everyone who has contributed to this project

---

<div align="center">

**Made with ❤️ for Ethiopian Cultural Heritage**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/horn-of-antiques?style=social)](https://github.com/yourusername/horn-of-antiques)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/horn-of-antiques?style=social)](https://github.com/yourusername/horn-of-antiques)

</div>

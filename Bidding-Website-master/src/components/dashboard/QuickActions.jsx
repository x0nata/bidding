import React from 'react';
import { NavLink } from 'react-router-dom';
import { Title, Caption } from '../common/Design';
import { 
  FiShoppingBag, 
  FiHeart, 
  FiPlus, 
  FiAward,
  FiTrendingUp,
  FiEye,
  FiSettings,
  FiUser
} from 'react-icons/fi';
import { MdGavel, MdOutlineShoppingCart } from 'react-icons/md';

export const QuickActions = ({ userRole = 'user' }) => {
  const buyerActions = [
    {
      title: 'Browse Auctions',
      description: 'Discover amazing antiques',
      icon: FiShoppingBag,
      to: '/',
      color: 'blue',
      featured: true
    },
    {
      title: 'My Bids',
      description: 'Track your bidding activity',
      icon: MdGavel,
      to: '/my-bids',
      color: 'purple'
    },
    {
      title: 'Watchlist',
      description: 'Items you\'re watching',
      icon: FiHeart,
      to: '/', // Updated to home page until watchlist feature is implemented
      color: 'red'
    },
    {
      title: 'Won Items',
      description: 'Your successful bids',
      icon: FiAward,
      to: '/winning-products', // Updated to match actual route
      color: 'green'
    }
  ];

  const sellerActions = [
    {
      title: 'List Item',
      description: 'Add new auction item',
      icon: FiPlus,
      to: '/add-product',
      color: 'green',
      featured: true
    },
    {
      title: 'My Listings',
      description: 'Manage your auctions',
      icon: FiEye,
      to: '/product',
      color: 'blue'
    },
    {
      title: 'Sales History',
      description: 'View past sales',
      icon: FiTrendingUp,
      to: '/seller/sales-history', // Updated to match actual route
      color: 'purple'
    },
    {
      title: 'Analytics',
      description: 'Performance insights',
      icon: FiTrendingUp,
      to: '/dashboard', // Updated to dashboard until analytics is implemented
      color: 'orange'
    }
  ];

  const commonActions = [
    {
      title: 'Profile',
      description: 'Update your information',
      icon: FiUser,
      to: '/profile',
      color: 'gray'
    },
    {
      title: 'Settings',
      description: 'Account preferences',
      icon: FiSettings,
      to: '/profile', // Updated to profile page until settings is implemented
      color: 'gray'
    }
  ];

  const getColorClasses = (color, featured = false) => {
    const baseClasses = featured 
      ? 'bg-gradient-to-br text-white shadow-lg hover:shadow-xl transform hover:scale-105'
      : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md';

    const colorMap = {
      blue: featured 
        ? 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
        : 'hover:bg-blue-50 text-blue-700',
      green: featured 
        ? 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
        : 'hover:bg-green-50 text-green-700',
      purple: featured 
        ? 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
        : 'hover:bg-purple-50 text-purple-700',
      red: featured 
        ? 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
        : 'hover:bg-red-50 text-red-700',
      orange: featured 
        ? 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
        : 'hover:bg-orange-50 text-orange-700',
      gray: featured 
        ? 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
        : 'hover:bg-gray-50 text-gray-700'
    };

    return `${baseClasses} ${colorMap[color] || colorMap.blue}`;
  };

  const getIconColor = (color, featured = false) => {
    if (featured) return 'text-white';
    
    const colorMap = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      red: 'text-red-600',
      orange: 'text-orange-600',
      gray: 'text-gray-600'
    };

    return colorMap[color] || colorMap.blue;
  };

  const actions = userRole === 'seller' || userRole === 'admin' 
    ? [...buyerActions, ...sellerActions, ...commonActions]
    : [...buyerActions, ...commonActions];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <Title level={4} className="text-gray-800 mb-2">Quick Actions</Title>
        <Caption className="text-gray-600">
          Get things done faster with these shortcuts
        </Caption>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <NavLink
              key={index}
              to={action.to}
              className={`
                p-4 rounded-xl transition-all duration-300 group relative overflow-hidden
                ${getColorClasses(action.color, action.featured)}
              `}
            >
              {/* Background decoration for featured items */}
              {action.featured && (
                <div className="absolute top-0 right-0 w-20 h-20 opacity-20">
                  <Icon size={80} className="text-white" />
                </div>
              )}

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`
                    p-2 rounded-lg transition-colors
                    ${action.featured 
                      ? 'bg-white bg-opacity-20' 
                      : 'bg-gray-100 group-hover:bg-opacity-80'
                    }
                  `}>
                    <Icon 
                      size={20} 
                      className={getIconColor(action.color, action.featured)}
                    />
                  </div>
                  {action.featured && (
                    <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Popular
                    </span>
                  )}
                </div>

                <div>
                  <Title 
                    level={6} 
                    className={`
                      font-semibold mb-1 group-hover:text-opacity-90
                      ${action.featured ? 'text-white' : 'text-gray-800'}
                    `}
                  >
                    {action.title}
                  </Title>
                  <Caption 
                    className={`
                      text-sm
                      ${action.featured ? 'text-white text-opacity-90' : 'text-gray-600'}
                    `}
                  >
                    {action.description}
                  </Caption>
                </div>
              </div>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;

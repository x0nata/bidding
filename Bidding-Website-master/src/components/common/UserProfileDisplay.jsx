import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User1 } from '../../utils/userAvatars';

/**
 * Reusable component for displaying user profile information
 * Can be used in headers, sidebars, or any other location
 */
export const UserProfileDisplay = ({ 
  size = 'medium', 
  showRole = true, 
  showEmail = true,
  showOnlineStatus = true,
  className = '',
  onClick = null 
}) => {
  const { userDisplayData, isAuthenticated, getRoleDisplayName, getRoleBadgeClass } = useAuth();

  // Size configurations
  const sizeConfig = {
    small: {
      avatar: 'w-8 h-8',
      text: 'text-sm',
      badge: 'text-xs px-2 py-1'
    },
    medium: {
      avatar: 'w-12 h-12',
      text: 'text-base',
      badge: 'text-xs px-3 py-1'
    },
    large: {
      avatar: 'w-20 h-20',
      text: 'text-lg',
      badge: 'text-sm px-4 py-2'
    }
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  const handleClick = () => {
    if (onClick) {
      onClick(userDisplayData);
    }
  };

  return (
    <div 
      className={`flex items-center gap-3 ${className} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={handleClick}
    >
      {/* Avatar */}
      <div className="relative">
        <img
          src={userDisplayData.photo}
          alt={`${userDisplayData.name}'s Profile`}
          className={`${config.avatar} rounded-full object-cover border-2 border-white shadow-md`}
          onError={(e) => {
            e.target.src = User1; // Fallback to default avatar on error
          }}
        />
        {/* Online status indicator */}
        {showOnlineStatus && isAuthenticated && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white">
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-gray-900 truncate ${config.text}`}>
          {userDisplayData.name}
        </div>
        
        {showEmail && (
          <div className="text-sm text-gray-600 truncate">
            {userDisplayData.email}
          </div>
        )}
        
        {showRole && (
          <div className="mt-1">
            <span className={`inline-flex items-center rounded-full font-medium ${config.badge} ${getRoleBadgeClass(userDisplayData.role)}`}>
              {getRoleDisplayName(userDisplayData.role)}
            </span>
            {!isAuthenticated && (
              <span className="ml-2 inline-flex items-center rounded-full text-xs px-2 py-1 bg-gray-100 text-gray-600 font-medium">
                Not Logged In
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Compact version for headers and small spaces
 */
export const UserProfileCompact = ({ onClick = null }) => {
  return (
    <UserProfileDisplay 
      size="small"
      showEmail={false}
      showRole={false}
      showOnlineStatus={true}
      onClick={onClick}
    />
  );
};

/**
 * Full version for sidebars and profile pages
 */
export const UserProfileFull = ({ onClick = null }) => {
  return (
    <UserProfileDisplay 
      size="large"
      showEmail={true}
      showRole={true}
      showOnlineStatus={true}
      onClick={onClick}
    />
  );
};

export default UserProfileDisplay;

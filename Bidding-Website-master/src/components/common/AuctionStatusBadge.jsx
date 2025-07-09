import React from 'react';
import { FiClock, FiPlay, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { MdGavel } from 'react-icons/md';

export const AuctionStatusBadge = ({ status, size = 'medium', className = '' }) => {
  // Get status configuration
  const getStatusConfig = () => {
    switch (status) {
      case 'live':
        return {
          label: 'Live',
          icon: MdGavel,
          bgColor: 'bg-green-500',
          textColor: 'text-white',
          borderColor: 'border-green-500',
          pulse: true
        };
      case 'upcoming':
        return {
          label: 'Upcoming',
          icon: FiClock,
          bgColor: 'bg-blue-500',
          textColor: 'text-white',
          borderColor: 'border-blue-500',
          pulse: false
        };
      case 'ending-soon':
        return {
          label: 'Ending Soon',
          icon: FiAlertCircle,
          bgColor: 'bg-orange-500',
          textColor: 'text-white',
          borderColor: 'border-orange-500',
          pulse: true
        };
      case 'ended':
        return {
          label: 'Ended',
          icon: FiCheckCircle,
          bgColor: 'bg-gray-500',
          textColor: 'text-white',
          borderColor: 'border-gray-500',
          pulse: false
        };
      case 'sold':
        return {
          label: 'Sold',
          icon: FiCheckCircle,
          bgColor: 'bg-red-500',
          textColor: 'text-white',
          borderColor: 'border-red-500',
          pulse: false
        };
      case 'timed':
        return {
          label: 'Timed Auction',
          icon: FiClock,
          bgColor: 'bg-blue-400',
          textColor: 'text-white',
          borderColor: 'border-blue-400',
          pulse: false
        };
      default:
        return {
          label: 'Timed Auction',
          icon: FiClock,
          bgColor: 'bg-blue-400',
          textColor: 'text-white',
          borderColor: 'border-blue-400',
          pulse: false
        };
    }
  };

  // Get size configuration
  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          padding: 'px-2 py-1',
          text: 'text-xs',
          icon: 'text-xs'
        };
      case 'large':
        return {
          padding: 'px-4 py-2',
          text: 'text-sm',
          icon: 'text-sm'
        };
      default: // medium
        return {
          padding: 'px-3 py-1.5',
          text: 'text-xs',
          icon: 'text-xs'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const sizeConfig = getSizeConfig();
  const IconComponent = statusConfig.icon;

  return (
    <div className={`
      inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wide
      ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}
      ${sizeConfig.padding} ${sizeConfig.text}
      ${statusConfig.pulse ? 'animate-pulse' : ''}
      shadow-lg backdrop-blur-sm
      ${className}
    `}>
      <IconComponent className={sizeConfig.icon} />
      <span>{statusConfig.label}</span>
      
      {/* Live indicator dot */}
      {status === 'live' && (
        <div className="w-2 h-2 bg-white rounded-full animate-ping" />
      )}
      
      {/* Ending soon indicator */}
      {status === 'ending-soon' && (
        <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
      )}
    </div>
  );
};

export default AuctionStatusBadge;

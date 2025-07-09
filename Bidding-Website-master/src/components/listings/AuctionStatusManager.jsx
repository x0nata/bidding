import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiClock, 
  FiPlay, 
  FiPause, 
  FiStop, 
  FiEdit3, 
  FiEye,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiDollarSign
} from 'react-icons/fi';
import { MdGavel, MdSchedule } from 'react-icons/md';
import { BsLightning } from 'react-icons/bs';
import { formatETB } from '../../utils/currency';

const AuctionStatusManager = ({ listing, onStatusChange, className = '' }) => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);

  // Get status configuration
  const getStatusConfig = () => {
    const now = new Date();
    const endTime = listing.auctionEndDate ? new Date(listing.auctionEndDate) : null;
    const startTime = listing.auctionStartDate ? new Date(listing.auctionStartDate) : null;
    
    switch (listing.auctionStatus) {
      case 'active':
        const timeLeft = endTime ? endTime - now : 0;
        const isEndingSoon = timeLeft < 300000; // Less than 5 minutes
        
        return {
          status: 'active',
          label: isEndingSoon ? 'Ending Soon' : 'Active Auction',
          color: isEndingSoon ? 'red' : 'green',
          icon: isEndingSoon ? FiAlertTriangle : FiCheckCircle,
          bgColor: isEndingSoon ? 'bg-red-50' : 'bg-green-50',
          textColor: isEndingSoon ? 'text-red-700' : 'text-green-700',
          borderColor: isEndingSoon ? 'border-red-200' : 'border-green-200',
          actions: ['view', 'monitor', isEndingSoon ? 'extend' : null].filter(Boolean)
        };
        
      case 'ended':
        const hasWinner = listing.totalBids > 0;
        return {
          status: 'ended',
          label: hasWinner ? 'Auction Completed' : 'Auction Ended - No Bids',
          color: hasWinner ? 'blue' : 'gray',
          icon: hasWinner ? FiCheckCircle : FiXCircle,
          bgColor: hasWinner ? 'bg-blue-50' : 'bg-gray-50',
          textColor: hasWinner ? 'text-blue-700' : 'text-gray-700',
          borderColor: hasWinner ? 'border-blue-200' : 'border-gray-200',
          actions: hasWinner ? ['view', 'finalize'] : ['view', 'relist']
        };
        
      case 'upcoming':
        return {
          status: 'upcoming',
          label: 'Scheduled Auction',
          color: 'purple',
          icon: MdSchedule,
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-200',
          actions: ['view', 'edit', 'start_early']
        };
        
      default:
        return {
          status: 'timed',
          label: 'Timed Auction',
          color: 'blue',
          icon: FiClock,
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          actions: ['view']
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  // Format time remaining
  const formatTimeRemaining = (ms) => {
    if (ms <= 0) return 'Ended';
    
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  // Handle action clicks
  const handleAction = async (action) => {
    setIsUpdating(true);
    
    try {
      switch (action) {
        case 'view':
          navigate(`/product/${listing._id}`);
          break;
          
        case 'edit':
          navigate(`/product/edit/${listing._id}`);
          break;
          
        case 'monitor':
          navigate(`/auction/${listing._id}/monitor`);
          break;
          
        case 'extend':
          // Handle auction extension
          if (onStatusChange) {
            await onStatusChange(listing._id, 'extend', { hours: 1 });
          }
          break;
          
        case 'start_early':
          // Handle early start
          if (onStatusChange) {
            await onStatusChange(listing._id, 'start_early');
          }
          break;
          
        case 'finalize':
          navigate(`/auction/${listing._id}/finalize`);
          break;
          
        case 'relist':
          navigate(`/product/relist/${listing._id}`);
          break;
          
        default:
      }
    } catch (error) {
    } finally {
      setIsUpdating(false);
    }
  };

  // Get action button config
  const getActionButton = (action) => {
    const configs = {
      view: { label: 'View Details', icon: FiEye, variant: 'secondary' },
      edit: { label: 'Edit', icon: FiEdit3, variant: 'secondary' },
      monitor: { label: 'Monitor Live', icon: BsLightning, variant: 'primary' },
      extend: { label: 'Extend Time', icon: FiClock, variant: 'warning' },
      start_early: { label: 'Start Now', icon: FiPlay, variant: 'primary' },
      finalize: { label: 'Finalize Sale', icon: FiCheckCircle, variant: 'success' },
      relist: { label: 'Relist Item', icon: FiPlay, variant: 'primary' }
    };
    
    return configs[action] || { label: action, icon: FiClock, variant: 'secondary' };
  };

  const getButtonClasses = (variant) => {
    const base = "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50";
    
    switch (variant) {
      case 'primary':
        return `${base} bg-blue-600 text-white hover:bg-blue-700`;
      case 'secondary':
        return `${base} bg-gray-100 text-gray-700 hover:bg-gray-200`;
      case 'success':
        return `${base} bg-green-600 text-white hover:bg-green-700`;
      case 'warning':
        return `${base} bg-orange-600 text-white hover:bg-orange-700`;
      case 'danger':
        return `${base} bg-red-600 text-white hover:bg-red-700`;
      default:
        return `${base} bg-gray-100 text-gray-700 hover:bg-gray-200`;
    }
  };

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 ${className}`}>
      {/* Status Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-5 h-5 ${config.textColor}`} />
          <span className={`font-medium ${config.textColor}`}>
            {config.label}
          </span>
        </div>
        
        {listing.auctionStatus === 'active' && listing.timeRemaining > 0 && (
          <div className={`text-sm ${config.textColor}`}>
            {formatTimeRemaining(listing.timeRemaining)}
          </div>
        )}
      </div>

      {/* Status Details */}
      <div className="space-y-2 mb-4">
        {/* Bid Information */}
        {listing.totalBids > 0 ? (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <FiDollarSign className="w-4 h-4" />
              <span>Current: {formatETB(listing.currentBid || 0)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MdGavel className="w-4 h-4" />
              <span>{listing.totalBids} bid{listing.totalBids !== 1 ? 's' : ''}</span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            Starting bid: {formatETB(listing.startingBid || 0)}
          </div>
        )}

        {/* Schedule Information */}
        {listing.auctionStartDate && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <FiCalendar className="w-4 h-4" />
            <span>
              {listing.auctionStatus === 'upcoming' ? 'Starts' : 'Started'}: {' '}
              {new Date(listing.auctionStartDate).toLocaleDateString()}
            </span>
          </div>
        )}
        
        {listing.auctionEndDate && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <FiClock className="w-4 h-4" />
            <span>
              {listing.auctionStatus === 'ended' ? 'Ended' : 'Ends'}: {' '}
              {new Date(listing.auctionEndDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Reserve Price Status */}
        {listing.reservePrice > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Reserve: ${listing.reservePrice.toLocaleString()}
            </span>
            <span className={`font-medium ${
              listing.reserveMet ? 'text-green-600' : 'text-orange-600'
            }`}>
              {listing.reserveMet ? '✓ Met' : 'Not Met'}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {config.actions.map((action) => {
          const buttonConfig = getActionButton(action);
          const ButtonIcon = buttonConfig.icon;
          
          return (
            <button
              key={action}
              onClick={() => handleAction(action)}
              disabled={isUpdating}
              className={getButtonClasses(buttonConfig.variant)}
            >
              <ButtonIcon className="w-4 h-4" />
              {buttonConfig.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AuctionStatusManager;

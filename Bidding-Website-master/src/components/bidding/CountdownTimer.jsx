import React, { useState, useEffect } from 'react';
import { Body } from '../common/Design';
import { FiClock } from 'react-icons/fi';
import { MdWarning } from 'react-icons/md';

const CountdownTimer = ({ endDate, onTimeUp, className = '', showIcon = true, auctionType = 'Timed', hideForLive = true }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isUrgent, setIsUrgent] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  function calculateTimeLeft() {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const difference = end - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      total: difference
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      // Check if auction has ended
      if (newTimeLeft.total <= 0 && !hasEnded) {
        setHasEnded(true);
        if (onTimeUp) {
          onTimeUp();
        }
      }

      // Set urgent state for last hour
      setIsUrgent(newTimeLeft.total <= 3600000 && newTimeLeft.total > 0); // 1 hour in milliseconds
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, onTimeUp, hasEnded]);

  const formatTime = (time) => {
    if (hasEnded || timeLeft.total <= 0) {
      return 'Auction Ended';
    }

    const { days, hours, minutes, seconds } = time;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getTimeColor = () => {
    if (hasEnded || timeLeft.total <= 0) {
      return 'text-red-600';
    } else if (isUrgent) {
      return 'text-orange-600';
    } else if (timeLeft.total <= 86400000) { // 24 hours
      return 'text-yellow-600';
    } else {
      return 'text-gray-600';
    }
  };

  const getBackgroundColor = () => {
    if (hasEnded || timeLeft.total <= 0) {
      return 'bg-red-100';
    } else if (isUrgent) {
      return 'bg-orange-100';
    } else if (timeLeft.total <= 86400000) { // 24 hours
      return 'bg-yellow-100';
    } else {
      return 'bg-gray-100';
    }
  };

  // Don't render timer for live auctions if hideForLive is true
  if (auctionType === 'Live' && hideForLive) {
    return (
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg bg-green-100 ${className}`}>
        {showIcon && <FiClock className="text-green-600" />}
        <Body className="font-medium text-green-600">Live Auction</Body>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${getBackgroundColor()} ${className}`}>
      {showIcon && (
        <>
          {hasEnded || timeLeft.total <= 0 ? (
            <MdWarning className={getTimeColor()} />
          ) : (
            <FiClock className={getTimeColor()} />
          )}
        </>
      )}
      <Body className={`font-medium ${getTimeColor()}`}>
        {formatTime(timeLeft)}
      </Body>
    </div>
  );
};

// Compact version for smaller spaces
export const CompactCountdownTimer = ({ endDate, onTimeUp, className = '', auctionType = 'Timed', hideForLive = true }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [hasEnded, setHasEnded] = useState(false);

  function calculateTimeLeft() {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const difference = end - now;

    if (difference <= 0) {
      return { total: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      total: difference
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.total <= 0 && !hasEnded) {
        setHasEnded(true);
        if (onTimeUp) {
          onTimeUp();
        }
      }
    }, 60000); // Update every minute for compact version

    return () => clearInterval(timer);
  }, [endDate, onTimeUp, hasEnded]);

  const formatCompactTime = (time) => {
    if (hasEnded || time.total <= 0) {
      return 'Ended';
    }

    const { days, hours, minutes } = time;

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getCompactColor = () => {
    if (hasEnded || timeLeft.total <= 0) {
      return 'text-red-600';
    } else if (timeLeft.total <= 3600000) { // 1 hour
      return 'text-orange-600';
    } else if (timeLeft.total <= 86400000) { // 24 hours
      return 'text-yellow-600';
    } else {
      return 'text-gray-600';
    }
  };

  // Don't render timer for live auctions if hideForLive is true
  if (auctionType === 'Live' && hideForLive) {
    return (
      <span className={`text-sm font-medium text-green-600 ${className}`}>
        Live
      </span>
    );
  }

  return (
    <span className={`text-sm font-medium ${getCompactColor()} ${className}`}>
      {formatCompactTime(timeLeft)}
    </span>
  );
};

export default CountdownTimer;

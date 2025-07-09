import React, { useState, useEffect } from 'react';
import { Caption } from './Design';

export const CountdownTimer = ({ 
  endDate, 
  size = 'medium', 
  showLabels = true, 
  className = '',
  onExpire = null 
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false
  });

  // Calculate time remaining
  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const targetTime = new Date(endDate).getTime();
    const difference = targetTime - now;

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        expired: true
      };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      expired: false
    };
  };

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      // Call onExpire callback when timer expires
      if (newTimeLeft.expired && onExpire && !timeLeft.expired) {
        onExpire();
      }
    }, 1000);

    // Set initial time
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [endDate, onExpire]);

  // Size configurations
  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          container: 'text-sm',
          number: 'text-lg font-bold',
          label: 'text-xs',
          gap: 'gap-2'
        };
      case 'large':
        return {
          container: 'text-lg',
          number: 'text-3xl font-bold',
          label: 'text-sm',
          gap: 'gap-4'
        };
      default: // medium
        return {
          container: 'text-base',
          number: 'text-xl font-bold',
          label: 'text-xs',
          gap: 'gap-3'
        };
    }
  };

  const sizeConfig = getSizeConfig();

  // Format number with leading zero
  const formatNumber = (num) => {
    return num.toString().padStart(2, '0');
  };

  // Get urgency color based on time remaining
  const getUrgencyColor = () => {
    const totalMinutes = timeLeft.days * 24 * 60 + timeLeft.hours * 60 + timeLeft.minutes;
    
    if (totalMinutes <= 60) return 'text-red-600'; // Less than 1 hour
    if (totalMinutes <= 24 * 60) return 'text-orange-600'; // Less than 1 day
    return 'text-gray-700'; // More than 1 day
  };

  if (timeLeft.expired) {
    return (
      <div className={`text-center ${className}`}>
        <div className="text-red-600 font-semibold">
          Auction Ended
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeConfig.container} ${className}`}>
      <div className={`flex items-center justify-center ${sizeConfig.gap}`}>
        {/* Days */}
        {timeLeft.days > 0 && (
          <div className="text-center">
            <div className={`${sizeConfig.number} ${getUrgencyColor()}`}>
              {formatNumber(timeLeft.days)}
            </div>
            {showLabels && (
              <Caption className={`${sizeConfig.label} text-gray-500 uppercase tracking-wide`}>
                {timeLeft.days === 1 ? 'Day' : 'Days'}
              </Caption>
            )}
          </div>
        )}

        {/* Hours */}
        <div className="text-center">
          <div className={`${sizeConfig.number} ${getUrgencyColor()}`}>
            {formatNumber(timeLeft.hours)}
          </div>
          {showLabels && (
            <Caption className={`${sizeConfig.label} text-gray-500 uppercase tracking-wide`}>
              {timeLeft.hours === 1 ? 'Hour' : 'Hours'}
            </Caption>
          )}
        </div>

        {/* Separator */}
        <div className={`${sizeConfig.number} ${getUrgencyColor()}`}>:</div>

        {/* Minutes */}
        <div className="text-center">
          <div className={`${sizeConfig.number} ${getUrgencyColor()}`}>
            {formatNumber(timeLeft.minutes)}
          </div>
          {showLabels && (
            <Caption className={`${sizeConfig.label} text-gray-500 uppercase tracking-wide`}>
              {timeLeft.minutes === 1 ? 'Min' : 'Mins'}
            </Caption>
          )}
        </div>

        {/* Separator */}
        <div className={`${sizeConfig.number} ${getUrgencyColor()}`}>:</div>

        {/* Seconds */}
        <div className="text-center">
          <div className={`${sizeConfig.number} ${getUrgencyColor()}`}>
            {formatNumber(timeLeft.seconds)}
          </div>
          {showLabels && (
            <Caption className={`${sizeConfig.label} text-gray-500 uppercase tracking-wide`}>
              {timeLeft.seconds === 1 ? 'Sec' : 'Secs'}
            </Caption>
          )}
        </div>
      </div>

      {/* Urgency Message */}
      {timeLeft.days === 0 && timeLeft.hours < 24 && (
        <div className="text-center mt-2">
          <Caption className={`text-xs font-medium ${
            timeLeft.hours < 1 ? 'text-red-600' : 'text-orange-600'
          }`}>
            {timeLeft.hours < 1 ? 'Ending Very Soon!' : 'Ending Today!'}
          </Caption>
        </div>
      )}
    </div>
  );
};

export default CountdownTimer;

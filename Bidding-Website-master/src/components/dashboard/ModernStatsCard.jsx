import React from 'react';
import { Title, Caption } from '../common/Design';

export const ModernStatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendDirection = 'up',
  color = 'blue',
  subtitle,
  onClick,
  loading = false
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-800',
      subtitle: 'text-blue-600',
      trend: trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      text: 'text-green-800',
      subtitle: 'text-green-600',
      trend: trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      text: 'text-purple-800',
      subtitle: 'text-purple-600',
      trend: trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-600',
      text: 'text-orange-800',
      subtitle: 'text-orange-600',
      trend: trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      icon: 'text-indigo-600',
      text: 'text-indigo-800',
      subtitle: 'text-indigo-600',
      trend: trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
    }
  };

  const classes = colorClasses[color] || colorClasses.blue;

  return (
    <div 
      className={`
        ${classes.bg} ${classes.border} border rounded-xl p-6 
        transition-all duration-300 hover:shadow-lg hover:scale-105 
        ${onClick ? 'cursor-pointer' : ''}
        relative overflow-hidden
      `}
      onClick={onClick}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
        <Icon size={80} className={classes.icon} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${classes.bg} ${classes.border} border`}>
            <Icon size={24} className={classes.icon} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 ${classes.trend}`}>
              <span className="text-sm font-medium">{trend}</span>
              <svg 
                className={`w-4 h-4 ${trendDirection === 'up' ? 'rotate-0' : 'rotate-180'}`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-2">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ) : (
            <>
              <Title level={1} className={`${classes.text} font-bold text-3xl`}>
                {value}
              </Title>
              <Caption className={classes.subtitle}>
                {title}
              </Caption>
            </>
          )}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <Caption className="text-gray-500 text-sm">
            {subtitle}
          </Caption>
        )}
      </div>
    </div>
  );
};

export default ModernStatsCard;

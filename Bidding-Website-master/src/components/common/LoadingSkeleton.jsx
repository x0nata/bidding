import React from 'react';

export const SkeletonCard = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
    </div>
  </div>
);

export const SkeletonStatsCard = ({ className = '' }) => (
  <div className={`animate-pulse bg-white rounded-xl p-6 border border-gray-200 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
      <div className="w-16 h-6 bg-gray-200 rounded"></div>
    </div>
    <div className="space-y-2">
      <div className="h-8 bg-gray-200 rounded w-20"></div>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </div>
  </div>
);

export const SkeletonList = ({ items = 3, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {[...Array(items)].map((_, i) => (
      <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="w-20 h-6 bg-gray-200 rounded"></div>
      </div>
    ))}
  </div>
);

export const SkeletonGrid = ({ items = 6, columns = 3, className = '' }) => (
  <div className={`grid gap-6 ${
    columns === 2 ? 'grid-cols-1 md:grid-cols-2' :
    columns === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
    columns === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  } ${className}`}>
    {[...Array(items)].map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {[...Array(columns)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {[...Array(columns)].map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`animate-pulse space-y-2 ${className}`}>
    {[...Array(lines)].map((_, i) => (
      <div 
        key={i} 
        className={`h-4 bg-gray-200 rounded ${
          i === lines - 1 ? 'w-3/4' : 'w-full'
        }`}
      ></div>
    ))}
  </div>
);

export const SkeletonAvatar = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`animate-pulse bg-gray-200 rounded-full ${sizeClasses[size]} ${className}`}></div>
  );
};

export const SkeletonButton = ({ className = '' }) => (
  <div className={`animate-pulse h-10 bg-gray-200 rounded-lg ${className}`}></div>
);

export const SkeletonBadge = ({ className = '' }) => (
  <div className={`animate-pulse h-6 w-16 bg-gray-200 rounded-full ${className}`}></div>
);

// Dashboard specific skeletons
export const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Welcome Section */}
    <div className="animate-pulse bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-4"></div>
          <div className="flex gap-6">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
      </div>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <SkeletonStatsCard key={i} />
      ))}
    </div>

    {/* Quick Actions */}
    <div className="animate-pulse bg-white rounded-xl p-6 border border-gray-200">
      <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    </div>

    {/* Content Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="animate-pulse bg-white rounded-xl p-6 border border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <SkeletonList items={3} />
      </div>
      <div className="animate-pulse bg-white rounded-xl p-6 border border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <SkeletonList items={3} />
      </div>
    </div>
  </div>
);

export default {
  Card: SkeletonCard,
  StatsCard: SkeletonStatsCard,
  List: SkeletonList,
  Grid: SkeletonGrid,
  Table: SkeletonTable,
  Text: SkeletonText,
  Avatar: SkeletonAvatar,
  Button: SkeletonButton,
  Badge: SkeletonBadge,
  Dashboard: DashboardSkeleton
};

// Common date formatting and manipulation utilities

import moment from 'react-moment';

// Date formatting functions
export const formatDate = (date, format = 'D MMM YYYY') => {
  if (!date) return '';
  return moment(date).format(format);
};

export const formatDateTime = (date, format = 'D MMM YYYY, h:mm A') => {
  if (!date) return '';
  return moment(date).format(format);
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  return moment(date).fromNow();
};

export const formatTimeRemaining = (endDate) => {
  if (!endDate) return 'No end date';
  
  const now = moment();
  const end = moment(endDate);
  
  if (end.isBefore(now)) {
    return 'Auction ended';
  }
  
  const duration = moment.duration(end.diff(now));
  const days = Math.floor(duration.asDays());
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();
  
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

// Date validation functions
export const isValidDate = (date) => {
  return moment(date).isValid();
};

export const isFutureDate = (date) => {
  return moment(date).isAfter(moment());
};

export const isPastDate = (date) => {
  return moment(date).isBefore(moment());
};

export const isToday = (date) => {
  return moment(date).isSame(moment(), 'day');
};

export const isThisWeek = (date) => {
  return moment(date).isSame(moment(), 'week');
};

export const isThisMonth = (date) => {
  return moment(date).isSame(moment(), 'month');
};

// Date comparison functions
export const isDateBefore = (date1, date2) => {
  return moment(date1).isBefore(moment(date2));
};

export const isDateAfter = (date1, date2) => {
  return moment(date1).isAfter(moment(date2));
};

export const isDateSame = (date1, date2, unit = 'day') => {
  return moment(date1).isSame(moment(date2), unit);
};

export const getDateDifference = (date1, date2, unit = 'days') => {
  return moment(date1).diff(moment(date2), unit);
};

// Date manipulation functions
export const addTime = (date, amount, unit = 'days') => {
  return moment(date).add(amount, unit).toDate();
};

export const subtractTime = (date, amount, unit = 'days') => {
  return moment(date).subtract(amount, unit).toDate();
};

export const startOfDay = (date) => {
  return moment(date).startOf('day').toDate();
};

export const endOfDay = (date) => {
  return moment(date).endOf('day').toDate();
};

export const startOfWeek = (date) => {
  return moment(date).startOf('week').toDate();
};

export const endOfWeek = (date) => {
  return moment(date).endOf('week').toDate();
};

export const startOfMonth = (date) => {
  return moment(date).startOf('month').toDate();
};

export const endOfMonth = (date) => {
  return moment(date).endOf('month').toDate();
};

// Auction-specific date functions
export const getAuctionStatus = (startDate, endDate) => {
  const now = moment();
  const start = moment(startDate);
  const end = moment(endDate);
  
  if (now.isBefore(start)) {
    return 'upcoming';
  } else if (now.isBetween(start, end)) {
    return 'active';
  } else {
    return 'ended';
  }
};

export const getAuctionTimeRemaining = (endDate) => {
  if (!endDate) return null;
  
  const now = moment();
  const end = moment(endDate);
  
  if (end.isBefore(now)) {
    return null;
  }
  
  return {
    total: end.diff(now),
    days: Math.floor(moment.duration(end.diff(now)).asDays()),
    hours: moment.duration(end.diff(now)).hours(),
    minutes: moment.duration(end.diff(now)).minutes(),
    seconds: moment.duration(end.diff(now)).seconds()
  };
};

export const formatAuctionDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  
  const start = moment(startDate);
  const end = moment(endDate);
  const duration = moment.duration(end.diff(start));
  
  const days = Math.floor(duration.asDays());
  const hours = duration.hours();
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
};

// Input formatting for date inputs
export const formatDateForInput = (date, includeTime = false) => {
  if (!date) return '';
  
  const format = includeTime ? 'YYYY-MM-DDTHH:mm' : 'YYYY-MM-DD';
  return moment(date).format(format);
};

export const parseDateFromInput = (dateString) => {
  if (!dateString) return null;
  
  const parsed = moment(dateString);
  return parsed.isValid() ? parsed.toDate() : null;
};

// Timezone handling
export const convertToUserTimezone = (date, timezone) => {
  if (!date) return null;
  return moment(date).tz(timezone).toDate();
};

export const convertToUTC = (date) => {
  if (!date) return null;
  return moment(date).utc().toDate();
};

// Date range functions
export const isDateInRange = (date, startDate, endDate) => {
  const target = moment(date);
  const start = moment(startDate);
  const end = moment(endDate);
  
  return target.isBetween(start, end, null, '[]'); // inclusive
};

export const getDateRange = (startDate, days) => {
  const start = moment(startDate);
  const end = start.clone().add(days, 'days');
  
  return {
    start: start.toDate(),
    end: end.toDate()
  };
};

// Calendar helpers
export const getCalendarWeeks = (month, year) => {
  const startOfMonth = moment({ year, month }).startOf('month');
  const endOfMonth = moment({ year, month }).endOf('month');
  const startOfCalendar = startOfMonth.clone().startOf('week');
  const endOfCalendar = endOfMonth.clone().endOf('week');
  
  const weeks = [];
  let current = startOfCalendar.clone();
  
  while (current.isSameOrBefore(endOfCalendar)) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(current.clone().toDate());
      current.add(1, 'day');
    }
    weeks.push(week);
  }
  
  return weeks;
};

// Business day calculations
export const isBusinessDay = (date) => {
  const day = moment(date).day();
  return day >= 1 && day <= 5; // Monday to Friday
};

export const addBusinessDays = (date, days) => {
  let current = moment(date);
  let remaining = days;
  
  while (remaining > 0) {
    current.add(1, 'day');
    if (isBusinessDay(current)) {
      remaining--;
    }
  }
  
  return current.toDate();
};

export const getBusinessDaysBetween = (startDate, endDate) => {
  let current = moment(startDate);
  const end = moment(endDate);
  let count = 0;
  
  while (current.isBefore(end)) {
    if (isBusinessDay(current)) {
      count++;
    }
    current.add(1, 'day');
  }
  
  return count;
};

// Common date presets
export const getDatePresets = () => {
  const now = moment();
  
  return {
    today: {
      start: now.clone().startOf('day').toDate(),
      end: now.clone().endOf('day').toDate(),
      label: 'Today'
    },
    yesterday: {
      start: now.clone().subtract(1, 'day').startOf('day').toDate(),
      end: now.clone().subtract(1, 'day').endOf('day').toDate(),
      label: 'Yesterday'
    },
    thisWeek: {
      start: now.clone().startOf('week').toDate(),
      end: now.clone().endOf('week').toDate(),
      label: 'This Week'
    },
    lastWeek: {
      start: now.clone().subtract(1, 'week').startOf('week').toDate(),
      end: now.clone().subtract(1, 'week').endOf('week').toDate(),
      label: 'Last Week'
    },
    thisMonth: {
      start: now.clone().startOf('month').toDate(),
      end: now.clone().endOf('month').toDate(),
      label: 'This Month'
    },
    lastMonth: {
      start: now.clone().subtract(1, 'month').startOf('month').toDate(),
      end: now.clone().subtract(1, 'month').endOf('month').toDate(),
      label: 'Last Month'
    },
    last30Days: {
      start: now.clone().subtract(30, 'days').startOf('day').toDate(),
      end: now.clone().endOf('day').toDate(),
      label: 'Last 30 Days'
    },
    last90Days: {
      start: now.clone().subtract(90, 'days').startOf('day').toDate(),
      end: now.clone().endOf('day').toDate(),
      label: 'Last 90 Days'
    }
  };
};

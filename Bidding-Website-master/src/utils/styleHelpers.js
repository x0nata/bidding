// Common styling utilities and CSS class generators

// Color utilities
export const colors = {
  primary: '#204C41',
  green: '#5BBB7B',
  green_100: '#EEF8F2',
  gray_100: '#6C7278',
  text: '#222222',
  white: '#FFFFFF',
  black: '#000000',
  red: '#EF4444',
  yellow: '#F59E0B',
  blue: '#3B82F6',
  indigo: '#6366F1',
  purple: '#8B5CF6',
  pink: '#EC4899'
};

// Common CSS class combinations
export const commonClasses = {
  // Layout
  container: 'w-[85%] m-auto',
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexCol: 'flex flex-col',
  grid: 'grid',
  gridCols2: 'grid grid-cols-1 md:grid-cols-2',
  gridCols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  gridCols4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  
  // Spacing
  gap4: 'gap-4',
  gap6: 'gap-6',
  gap8: 'gap-8',
  p4: 'p-4',
  p6: 'p-6',
  p8: 'p-8',
  m4: 'm-4',
  m6: 'm-6',
  m8: 'm-8',
  
  // Typography
  textCenter: 'text-center',
  textLeft: 'text-left',
  textRight: 'text-right',
  fontBold: 'font-bold',
  fontSemibold: 'font-semibold',
  fontMedium: 'font-medium',
  textSm: 'text-sm',
  textBase: 'text-base',
  textLg: 'text-lg',
  textXl: 'text-xl',
  text2xl: 'text-2xl',
  text3xl: 'text-3xl',
  
  // Colors
  textPrimary: 'text-primary',
  textGreen: 'text-green',
  textGray: 'text-gray-600',
  textWhite: 'text-white',
  bgPrimary: 'bg-primary',
  bgGreen: 'bg-green',
  bgWhite: 'bg-white',
  bgGray: 'bg-gray-100',
  
  // Borders
  border: 'border border-gray-300',
  borderRounded: 'border border-gray-300 rounded-lg',
  rounded: 'rounded-lg',
  roundedFull: 'rounded-full',
  
  // Shadows
  shadow: 'shadow-md',
  shadowLg: 'shadow-lg',
  shadowS1: 'shadow-s1',
  
  // Transitions
  transition: 'transition-all duration-300 ease-in-out',
  transitionColors: 'transition-colors duration-200',
  transitionTransform: 'transition-transform duration-300',
  
  // Hover effects
  hoverScale: 'hover:scale-105',
  hoverShadow: 'hover:shadow-lg',
  hoverBg: 'hover:bg-gray-50',
  
  // Focus states
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
  
  // Disabled states
  disabled: 'opacity-50 cursor-not-allowed',
  
  // Responsive
  hiddenMd: 'hidden md:block',
  hiddenLg: 'hidden lg:block',
  blockMd: 'block md:hidden',
  
  // Positioning
  relative: 'relative',
  absolute: 'absolute',
  fixed: 'fixed',
  sticky: 'sticky',
  
  // Z-index
  z10: 'z-10',
  z20: 'z-20',
  z30: 'z-30',
  z40: 'z-40',
  z50: 'z-50'
};

// Button style generators
export const buttonStyles = {
  primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-300',
  success: 'bg-green text-white hover:bg-green-600 focus:ring-green',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
  info: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
  outline: 'border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
  ghost: 'text-primary hover:bg-primary hover:text-white focus:ring-primary',
  link: 'text-primary hover:underline focus:ring-primary'
};

export const buttonSizes = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl'
};

// Input style generators
export const inputStyles = {
  base: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
  error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
  success: 'border-green-500 focus:ring-green-500 focus:border-green-500',
  disabled: 'bg-gray-100 cursor-not-allowed opacity-50'
};

// Card style generators
export const cardStyles = {
  base: 'bg-white rounded-lg shadow-md p-6',
  hover: 'bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300',
  bordered: 'bg-white rounded-lg border border-gray-200 p-6',
  elevated: 'bg-white rounded-lg shadow-lg p-6'
};

// Badge/Status style generators
export const badgeStyles = {
  primary: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white',
  success: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
  warning: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
  danger: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800',
  info: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
  gray: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
};

// Animation classes
export const animations = {
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  slideIn: 'animate-slide-in',
  slideOut: 'animate-slide-out',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  ping: 'animate-ping',
  float: 'floating',
  vertMove: 'vert-move',
  horizMove: 'horiz-move'
};

// Utility functions
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const getButtonClass = (variant = 'primary', size = 'md', disabled = false, className = '') => {
  return cn(
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    buttonStyles[variant] || buttonStyles.primary,
    buttonSizes[size] || buttonSizes.md,
    disabled && commonClasses.disabled,
    className
  );
};

export const getInputClass = (error = false, success = false, disabled = false, className = '') => {
  return cn(
    inputStyles.base,
    error && inputStyles.error,
    success && inputStyles.success,
    disabled && inputStyles.disabled,
    className
  );
};

export const getCardClass = (variant = 'base', className = '') => {
  return cn(
    cardStyles[variant] || cardStyles.base,
    className
  );
};

export const getBadgeClass = (variant = 'primary', className = '') => {
  return cn(
    badgeStyles[variant] || badgeStyles.primary,
    className
  );
};

// Responsive utilities
export const responsive = {
  sm: (classes) => classes.split(' ').map(cls => `sm:${cls}`).join(' '),
  md: (classes) => classes.split(' ').map(cls => `md:${cls}`).join(' '),
  lg: (classes) => classes.split(' ').map(cls => `lg:${cls}`).join(' '),
  xl: (classes) => classes.split(' ').map(cls => `xl:${cls}`).join(' '),
  '2xl': (classes) => classes.split(' ').map(cls => `2xl:${cls}`).join(' ')
};

// Grid utilities
export const gridTemplates = {
  auto: 'grid-cols-auto',
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
  responsive2: 'grid-cols-1 md:grid-cols-2',
  responsive3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  responsive4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  responsive6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
};

// Flex utilities
export const flexUtils = {
  center: 'flex items-center justify-center',
  between: 'flex items-center justify-between',
  around: 'flex items-center justify-around',
  evenly: 'flex items-center justify-evenly',
  start: 'flex items-center justify-start',
  end: 'flex items-center justify-end',
  col: 'flex flex-col',
  colCenter: 'flex flex-col items-center justify-center',
  colBetween: 'flex flex-col justify-between',
  wrap: 'flex flex-wrap',
  nowrap: 'flex flex-nowrap'
};

// Text utilities
export const textUtils = {
  truncate: 'truncate',
  ellipsis: 'text-ellipsis overflow-hidden',
  clamp1: 'line-clamp-1',
  clamp2: 'line-clamp-2',
  clamp3: 'line-clamp-3',
  clamp4: 'line-clamp-4',
  uppercase: 'uppercase',
  lowercase: 'lowercase',
  capitalize: 'capitalize',
  normalCase: 'normal-case'
};

// Spacing utilities
export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
  '4xl': '6rem',
  '5xl': '8rem'
};

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Common layout patterns
export const layouts = {
  sidebar: 'flex min-h-screen',
  sidebarContent: 'flex-1 flex flex-col overflow-hidden',
  sidebarMain: 'flex-1 relative overflow-y-auto focus:outline-none',
  header: 'bg-white shadow-sm border-b border-gray-200',
  footer: 'bg-gray-50 border-t border-gray-200',
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-12 sm:py-16 lg:py-20',
  hero: 'relative bg-primary overflow-hidden',
  card: 'bg-white overflow-hidden shadow rounded-lg',
  modal: 'fixed inset-0 z-50 overflow-y-auto',
  modalOverlay: 'fixed inset-0 bg-black bg-opacity-50 transition-opacity',
  modalContent: 'relative bg-white rounded-lg shadow-xl transform transition-all'
};

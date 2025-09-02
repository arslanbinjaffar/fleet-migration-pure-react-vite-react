// Dashboard module constants

// API endpoints
export const DASHBOARD_ENDPOINTS = {
  DASHBOARD_DATA: '/api/dashboard',
  FLEET_UTILIZATION: '/api/dashboard/fleet-utilization',
  JOB_PROGRESS: '/api/dashboard/job-progress',
  PROJECT_OVERVIEW: '/api/dashboard/project-overview',
  FINANCIAL_STATS: '/api/dashboard/financial-stats',
  RECENT_JOBS: '/api/dashboard/recent-jobs',
  ALERTS: '/api/dashboard/alerts',
} as const;

// Refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  DASHBOARD_DATA: 30000, // 30 seconds
  REAL_TIME_DATA: 5000,  // 5 seconds
  ALERTS: 10000,         // 10 seconds
} as const;

// Chart colors
export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#06b6d4',
  SECONDARY: '#6b7280',
  
  // Fleet status colors
  FLEET_AVAILABLE: '#10b981',
  FLEET_IN_USE: '#3b82f6',
  FLEET_OUT_OF_SERVICE: '#ef4444',
  
  // Job status colors
  JOB_COMPLETED: '#10b981',
  JOB_IN_PROGRESS: '#f59e0b',
  JOB_PENDING: '#6b7280',
  JOB_CANCELLED: '#ef4444',
  
  // Project status colors
  PROJECT_ACTIVE: '#3b82f6',
  PROJECT_COMPLETED: '#10b981',
  PROJECT_PENDING: '#f59e0b',
  PROJECT_ON_HOLD: '#ef4444',
} as const;

// Gradient backgrounds for stat cards
export const GRADIENT_BACKGROUNDS = {
  COMPLETED_JOBS: 'linear-gradient(to right, #4158D0, #C850C0, #FFCC70)',
  REPAIR_JOBS: 'linear-gradient(to right, #0093E9, #80D0C7)',
  TOTAL_JOBS: 'linear-gradient(to right, #FF9A8B, #FF6A88)',
  REVENUE: 'linear-gradient(to right, #667eea, #764ba2)',
  EXPENSES: 'linear-gradient(to right, #f093fb, #f5576c)',
  PROFIT: 'linear-gradient(to right, #4facfe, #00f2fe)',
} as const;

// Job status options
export const JOB_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Job types
export const JOB_TYPES = {
  REPAIR: 'repair',
  MAINTENANCE: 'maintenance',
  INSPECTION: 'inspection',
} as const;

// Job priorities
export const JOB_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// Fleet status
export const FLEET_STATUS = {
  AVAILABLE: 'available',
  IN_USE: 'in_use',
  OUT_OF_SERVICE: 'out_of_service',
  MAINTENANCE: 'maintenance',
} as const;

// Project status
export const PROJECT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PENDING: 'pending',
  ON_HOLD: 'on_hold',
  CANCELLED: 'cancelled',
} as const;

// Time periods
export const TIME_PERIODS = {
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
} as const;

// Alert types
export const ALERT_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success',
} as const;

// Widget types
export const WIDGET_TYPES = {
  FLEET_UTILIZATION: 'fleet_utilization',
  PROJECT_OVERVIEW: 'project_overview',
  JOB_PROGRESS: 'job_progress',
  FINANCIAL_STATS: 'financial_stats',
  RECENT_JOBS: 'recent_jobs',
  ALERTS: 'alerts',
  MACHINE_HOURS: 'machine_hours',
  OPERATOR_HOURS: 'operator_hours',
} as const;

// Default dashboard layout
export const DEFAULT_DASHBOARD_LAYOUT = {
  widgets: [
    {
      id: 'financial-stats',
      type: WIDGET_TYPES.FINANCIAL_STATS,
      title: 'Financial Overview',
      position: { x: 0, y: 0, width: 12, height: 2 },
      isVisible: true,
    },
    {
      id: 'fleet-utilization',
      type: WIDGET_TYPES.FLEET_UTILIZATION,
      title: 'Fleet Utilization',
      position: { x: 0, y: 2, width: 8, height: 4 },
      isVisible: true,
    },
    {
      id: 'project-overview',
      type: WIDGET_TYPES.PROJECT_OVERVIEW,
      title: 'Projects Overview',
      position: { x: 8, y: 2, width: 4, height: 4 },
      isVisible: true,
    },
    {
      id: 'recent-jobs',
      type: WIDGET_TYPES.RECENT_JOBS,
      title: 'Recent Jobs',
      position: { x: 0, y: 6, width: 8, height: 4 },
      isVisible: true,
    },
    {
      id: 'job-progress',
      type: WIDGET_TYPES.JOB_PROGRESS,
      title: 'Job Progress',
      position: { x: 0, y: 10, width: 12, height: 3 },
      isVisible: true,
    },
  ],
  lastModified: new Date().toISOString(),
  version: 1,
} as const;

// Chart configuration
export const CHART_CONFIG = {
  DEFAULT_HEIGHT: 300,
  ANIMATION_DURATION: 300,
  TOOLTIP_ENABLED: true,
  LEGEND_ENABLED: true,
  RESPONSIVE: true,
} as const;

// Table configuration
export const TABLE_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  SHOW_PAGINATION: true,
  SHOW_SEARCH: true,
  SHOW_FILTERS: true,
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
  TIME: 'HH:mm',
  FULL: 'EEEE, MMMM dd, yyyy',
} as const;

// Currency settings
export const CURRENCY_SETTINGS = {
  DEFAULT_CURRENCY: 'USD',
  DECIMAL_PLACES: 2,
  SHOW_SYMBOL: true,
} as const;

// Loading states
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  DATA_NOT_FOUND: 'No data available.',
  UNAUTHORIZED: 'You are not authorized to view this data.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  DATA_LOADED: 'Dashboard data loaded successfully',
  DATA_REFRESHED: 'Dashboard data refreshed',
  SETTINGS_SAVED: 'Dashboard settings saved',
} as const;

// Animation durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Z-index values
export const Z_INDEX = {
  DROPDOWN: 1000,
  MODAL: 1050,
  TOOLTIP: 1070,
  NOTIFICATION: 1080,
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  DASHBOARD_LAYOUT: 'dashboard_layout',
  DASHBOARD_FILTERS: 'dashboard_filters',
  DASHBOARD_PREFERENCES: 'dashboard_preferences',
} as const;

// Default filters
export const DEFAULT_FILTERS = {
  dateRange: {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  },
  timePeriod: TIME_PERIODS.MONTH,
} as const;
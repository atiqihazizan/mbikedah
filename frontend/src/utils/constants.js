// utils/constants.js
/**
 * Application-wide constants and configuration
 */

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/login',
  LOGOUT: '/logout',
  REGISTER: '/register',
  CHANGE_PASSWORD: '/change-password',
  
  // Dashboard
  DASHBOARD: '/dashboard',
  USER_PROFILE: '/user/profile',
  
  // Billing
  BILLING: {
    LIST: '/billing',
    CREATE: '/billing',
    UPDATE: (id) => `/billing/${id}`,
    DELETE: (id) => `/billing/${id}`,
    SHOW: (id) => `/billing/${id}`,
    APPROVE: (id) => `/billing/${id}/approve`,
    REJECT: (id) => `/billing/${id}/reject`,
    PAYMENT: (id) => `/billing/${id}/payment`,
    VERIFY: (id) => `/billing/${id}/verify`
  },
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  MARK_READ: (id) => `/notifications/${id}/read`
};

// Role Types
export const ROLE_TYPES = {
  PEMOHON: 'Pemohon',
  KETUA_JABATAN: 'Ketua Jabatan',
  KEWANGAN: 'Kewangan',
  ADMIN: 'Admin'
};

// Role Colors
export const ROLE_COLORS = {
  PURPLE: 'purple',
  BLUE: 'blue',
  GREEN: 'green',
  RED: 'red',
  GRAY: 'gray'
};

// Badge Sizes
export const BADGE_SIZES = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl'
};

// Container Variants
export const CONTAINER_VARIANTS = {
  DEFAULT: 'default',
  COMPACT: 'compact',
  VERTICAL: 'vertical',
  GRID: 'grid',
  INLINE: 'inline'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Application Status
export const APPLICATION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

// Billing Status  
export const BILLING_STATUS = {
  // Pemohon statuses
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  INCOMPLETE: 'incomplete',
  
  // HOD statuses
  PENDING_HOD_APPROVAL: 'pending_hod_approval',
  HOD_APPROVED: 'hod_approved',
  HOD_REJECTED: 'hod_rejected',
  
  // Finance statuses
  PENDING_FINANCE_REVIEW: 'pending_finance_review',
  PENDING_VERIFICATION: 'pending_verification',
  PENDING_PAYMENT: 'pending_payment',
  PAID: 'paid',
  FINANCE_REJECTED: 'finance_rejected',
  
  // Final statuses
  COMPLETED: 'completed',
  ARCHIVED: 'archived'
};

// User Permissions
export const PERMISSIONS = {
  // Billing permissions
  BILLING_CREATE: 'billing.create',
  BILLING_VIEW: 'billing.view',
  BILLING_EDIT: 'billing.edit',
  BILLING_DELETE: 'billing.delete',
  BILLING_APPROVE: 'billing.approve',
  BILLING_REJECT: 'billing.reject',
  BILLING_PAYMENT: 'billing.payment',
  BILLING_VERIFY: 'billing.verify',
  
  // User permissions
  USER_MANAGE: 'user.manage',
  USER_VIEW: 'user.view',
  
  // Admin permissions
  ADMIN_ACCESS: 'admin.access',
  SYSTEM_SETTINGS: 'system.settings'
};

// Route Paths
export const ROUTES = {
  // Authentication
  LOGIN: '/login',
  SIGNUP: '/signup',
  LOGOUT: '/logout',
  
  // Dashboard
  DASHBOARD: '/',
  
  // Billing routes by role
  PEMOHON: {
    DASHBOARD: '/',
    INCOMPLETE: '/billing/dashboard',
    ARCHIVE: '/billing/archive',
    CREATE: '/billing/create',
    EDIT: (id) => `/billing/${id}/edit`,
    VIEW: (id) => `/billing/${id}/view`
  },
  
  HOD: {
    DASHBOARD: '/billing/hod',
    PENDING: '/billing/hod/pending',
    APPROVED: '/billing/hod/approved',
    REJECTED: '/billing/hod/rejected'
  },
  
  FINANCE: {
    DASHBOARD: '/billing/finance',
    REVIEW: '/billing/finance/review',
    VERIFY: '/billing/finance/verify',
    PAYMENT: '/billing/finance/payment',
    PAID: '/billing/finance/paid'
  },
  
  // Shared routes
  BILLING: {
    SHOW: (id, pageback) => `/billing/${id}/${pageback}/show`,
    PAYMENT: (id) => `/billing/${id}/payment`,
    CHECK: (id) => `/billing/${id}/check`,
    VERIFY: (id) => `/billing/${id}/verify`,
    PAPER: (id) => `/billing/${id}/paper`
  }
};

// UI Configuration
export const UI_CONFIG = {
  // Animation durations (in milliseconds)
  ANIMATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  
  // Breakpoints (Tailwind CSS breakpoints)
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px', 
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px'
  },
  
  // Z-index layers
  Z_INDEX: {
    DROPDOWN: 50,
    MODAL: 100,
    TOOLTIP: 200,
    NOTIFICATION: 300
  },
  
  // Default pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
  }
};

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 50,
    REQUIRE_SPECIAL_CHAR: true,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true
  },
  
  EMAIL: {
    MAX_LENGTH: 255,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100
  },
  
  BILLING: {
    TITLE_MAX_LENGTH: 200,
    DESCRIPTION_MAX_LENGTH: 1000,
    MAX_AMOUNT: 999999.99,
    MIN_AMOUNT: 0.01
  }
};

// File Upload Configuration
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  ALLOWED_EXTENSIONS: [
    '.jpg', '.jpeg', '.png', '.gif',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx'
  ]
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Masalah rangkaian. Sila cuba lagi.',
  UNAUTHORIZED: 'Anda tidak mempunyai kebenaran untuk akses ini.',
  FORBIDDEN: 'Akses ditolak.',
  NOT_FOUND: 'Halaman atau data tidak dijumpai.',
  SERVER_ERROR: 'Ralat sistem. Sila hubungi pentadbir.',
  VALIDATION_ERROR: 'Terdapat ralat dalam data yang dimasukkan.',
  
  // Form specific errors
  REQUIRED_FIELD: 'Medan ini diperlukan.',
  INVALID_EMAIL: 'Format emel tidak sah.',
  PASSWORD_TOO_SHORT: 'Kata laluan terlalu pendek.',
  PASSWORDS_NOT_MATCH: 'Kata laluan tidak sepadan.',
  FILE_TOO_LARGE: 'Fail terlalu besar.',
  INVALID_FILE_TYPE: 'Jenis fail tidak dibenarkan.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Berjaya log masuk.',
  LOGOUT_SUCCESS: 'Berjaya log keluar.',
  SAVED: 'Data berjaya disimpan.',
  UPDATED: 'Data berjaya dikemaskini.',
  DELETED: 'Data berjaya dipadamkan.',
  APPROVED: 'Permohonan berjaya diluluskan.',
  REJECTED: 'Permohonan berjaya ditolak.',
  PAYMENT_SUCCESS: 'Pembayaran berjaya diproses.',
  PASSWORD_CHANGED: 'Kata laluan berjaya dikemaskini.'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  PREFERENCES: 'user_preferences',
  THEME: 'theme_preference',
  LANGUAGE: 'language_preference'
};

// Default Values
export const DEFAULTS = {
  LANGUAGE: 'ms',
  THEME: 'light',
  PAGE_SIZE: 10,
  NOTIFICATION_TIMEOUT: 5000,
  AUTO_LOGOUT_TIMEOUT: 30 * 60 * 1000 // 30 minutes
};

export default {
  API_ENDPOINTS,
  ROLE_TYPES,
  ROLE_COLORS,
  BADGE_SIZES,
  CONTAINER_VARIANTS,
  NOTIFICATION_TYPES,
  APPLICATION_STATUS,
  BILLING_STATUS,
  PERMISSIONS,
  ROUTES,
  UI_CONFIG,
  VALIDATION_RULES,
  FILE_UPLOAD,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  DEFAULTS
};
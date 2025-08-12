// ===== UTILS INDEX FILE =====
// Central export file for all utility functions and modules

// Format utilities - export named object
export { formatUtils } from './formatUtils';

// Report utilities - export all functions
export * from './reportUtils';

// HTTP client utilities
export { default as apiClient } from './axios';

// Constants
export { default as constants } from './constants';

// Role utilities - export all functions
export * from './roleUtils';

// Default export for backward compatibility
export default {
  formatUtils: null,
  reportUtils: null,
  apiClient: null,
  constants: null,
  roleUtils: null
};

// Dynamic imports for backward compatibility
export const getFormatUtils = async () => {
  const module = await import('./formatUtils');
  return module.formatUtils;
};

export const getReportUtils = async () => {
  const module = await import('./reportUtils');
  return module;
};

export const getApiClient = async () => {
  const module = await import('./axios');
  return module.default;
};

export const getConstants = async () => {
  const module = await import('./constants');
  return module.default;
};

export const getRoleUtils = async () => {
  const module = await import('./roleUtils');
  return module;
};

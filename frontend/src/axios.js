import axios from "axios";
// import router from "./router";

// Konfigurasi default
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_BASE_URL = "/api"; // Fallback URL
const RETRY_COUNT = 3;

const apiClient = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL,
  baseURL: DEFAULT_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("MBI_TOKEN");
    if (token) {
      const _token = token.split("|")[1];
      config.headers.Authorization = `Bearer ${_token}`;
    }
    return config;
  },
  (error) => {
    console.log(error)
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Pastikan response ada data
    if (!response?.data) {
      return Promise.reject(new Error('Tiada data dari server'));
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem("MBI_TOKEN");
      window.location.href = '/login';
      return Promise.reject(new Error('Sesi anda telah tamat. Sila log masuk semula.'));
    }

    // Retry logic for network errors or 5xx errors
    if (
      (error.response?.status >= 500 || !error.response) &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest._retryCount < RETRY_COUNT
    ) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      // Exponential backoff delay
      const delay = Math.pow(2, originalRequest._retryCount) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));

      return apiClient(originalRequest);
    }

    // Handle other errors
    if (error.response?.status === 404) {
      // router.navigate("/404");
    } else if (error.response?.status >= 500) {
      // router.navigate("/error");
    } else if (error.code === "ECONNABORTED") {
      // Handle timeout
      console.error("Request timeout");
    } else if (!error.response) {
      // Handle network errors
      console.error("Network error");
    }

    return Promise.reject(error);
  }
);

// Global methods
apiClient.setToken = (token) => {
  if (token) {
    localStorage.setItem("MBI_TOKEN", token);
  } else {
    localStorage.removeItem("MBI_TOKEN");
  }
};

apiClient.clearToken = () => {
  localStorage.removeItem("MBI_TOKEN");
};

// HTTP Method Helpers dengan pengendalian ralat yang seragam
const handleRequest = async (method, endpoint, data = null, config = {}) => {
  try {
    const response = await apiClient(endpoint, {
      method,
      ...(data && { data }),
      ...config,
    });

    // Pastikan response ada dan ada data
    if (!response?.data) {
      throw new Error('Tiada data dari server');
    }

    return response.data;
  } catch (error) {
    console.error(`Error ${method} ${endpoint}:`, error);
    if (error.response?.data?.message) {
      console.log(error.response.data); 
    }
    throw error;
  }
};

// GET request
apiClient.get = async (endpoint, config = {}) => {
  return handleRequest('GET', endpoint, null, config);
};

// POST request
apiClient.post = async (endpoint, data = {}, config = {}) => {
  return handleRequest('POST', endpoint, data, config);
};

// PUT request
apiClient.put = async (endpoint, data = {}, config = {}) => {
  return handleRequest('PUT', endpoint, data, config);
};

// PATCH request
apiClient.patch = async (endpoint, data = {}, config = {}) => {
  return handleRequest('PATCH', endpoint, data, config);
};

// DELETE request
apiClient.delete = async (endpoint, config = {}) => {
  return handleRequest('DELETE', endpoint, null, config);
};

export default apiClient;

import axios from "axios";
// import router from "./router";

// Konfigurasi default
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_BASE_URL = "/api"; // Fallback URL
const RETRY_COUNT = 3;

const axiosClient = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL,
  baseURL: DEFAULT_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("MBI_TOKEN");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.log(error)
    return Promise.reject(error);
  }
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem("MBI_TOKEN");
      // router.navigate("/login");
      return Promise.reject(error);
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

      return axiosClient(originalRequest);
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
axiosClient.setToken = (token) => {
  if (token) {
    localStorage.setItem("MBI_TOKEN", token);
  } else {
    localStorage.removeItem("MBI_TOKEN");
  }
};

axiosClient.clearToken = () => {
  localStorage.removeItem("MBI_TOKEN");
};

// HTTP Method Helpers
axiosClient.get = async (endpoint, config = {}) => {
  try {
    const response = await axiosClient(endpoint, {
      method: 'GET',
      ...config,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

axiosClient.post = async (endpoint, data = {}, config = {}) => {
  try {
    const response = await axiosClient(endpoint, {
      method: 'POST',
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

axiosClient.put = async (endpoint, data = {}, config = {}) => {
  try {
    const response = await axiosClient(endpoint, {
      method: 'PUT',
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

axiosClient.patch = async (endpoint, data = {}, config = {}) => {
  try {
    const response = await axiosClient(endpoint, {
      method: 'PATCH',
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

axiosClient.delete = async (endpoint, config = {}) => {
  try {
    const response = await axiosClient(endpoint, {
      method: 'DELETE',
      ...config,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default axiosClient;

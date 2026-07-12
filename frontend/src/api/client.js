import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors (like 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => {
    return response.data; // Return the data portion directly (ApiResponse format: { success, data, message })
  },
  (error) => {
    // If token expired or unauthorized, clear storage and redirect
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // We can also trigger a redirect or context reset
    }
    return Promise.reject(error.response?.data || { message: 'Network error. Please try again.' });
  }
);

export default apiClient;

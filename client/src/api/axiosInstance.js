import axios from 'axios';
import { serverUrl } from '../config';

const axiosInstance = axios.create({
  baseURL: serverUrl,
  withCredentials: true,
});

// Add token to Authorization header if it exists
axiosInstance.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;

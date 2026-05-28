import axios from "axios";
import { serverUrl } from "../config";

const axiosInstance = axios.create({
  baseURL: serverUrl,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;

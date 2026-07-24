import axios from "axios";
import { useAuthStore } from "../store/authStore";

// In dev, VITE_API_URL is unset, so this falls back to "/api" which Vite's
// proxy (vite.config.js) forwards to your local backend.
// In production, set VITE_API_URL to your deployed backend's URL,
// e.g. https://studysphere-api.onrender.com/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes("/auth/")) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const { data } = await api.post("/auth/refresh");
        useAuthStore.getState().setAccessToken(data.accessToken);
        queue.forEach((p) => p.resolve());
        queue = [];
        return api(originalRequest);
      } catch (err) {
        queue.forEach((p) => p.reject(err));
        queue = [];
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
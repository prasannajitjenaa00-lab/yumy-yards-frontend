import axios from "axios";
import config from "../config";

const api = axios.create({
  baseURL: config.apiUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ye_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("ye_token");
      localStorage.removeItem("ye_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

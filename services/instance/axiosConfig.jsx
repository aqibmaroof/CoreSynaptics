import axios from "axios";
import axiosInstance from "./axiosInstance";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./tokenService";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// REQUEST INTERCEPTOR - Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Handle FormData - remove Content-Type to let browser set it
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR - Handle 401 and refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/auth/refresh-token")) {
        clearTokens();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          clearTokens();
          window.location.href = "/Auth/Login";
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}auth/refresh-token`,
          { refreshToken: String(refreshToken) }
        );

        const responseData = response.data?.data || response.data;
        const accessToken =
          responseData.accessToken || responseData.access_token;
        const newRefreshToken =
          responseData.refreshToken || responseData.refresh_token;

        if (!accessToken) {
          throw new Error("Invalid refresh response");
        }

        setTokens({
          accessToken,
          refreshToken: newRefreshToken || refreshToken,
        });

        axiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        clearTokens();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

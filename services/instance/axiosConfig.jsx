import axios from "axios";
import axiosInstance from "./axiosInstance";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./tokenService";
import { installCorrelation } from "./correlation";

// PR-1 (v6): attach X-Request-Id outbound, capture X-Trace-Id inbound.
// Idempotent — runs once even if axiosConfig is imported from multiple places.
installCorrelation(axiosInstance);

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

    // Handle FormData - remove Content-Type to let browser set it
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Unauthenticated auth endpoints must surface the backend's own 401 verbatim —
// never trigger the token-refresh flow for them. A failed login/register/reset
// is NOT an expired session; refreshing on its behalf (with no real token) used
// to fire a bogus /auth/refresh-token call whose "Invalid token" error then
// clobbered the real "Invalid credentials" message on the login form
// (LOGIN_007 / LOGIN_032 / LOGIN_031). These requests carry no Authorization,
// so there is nothing to refresh.
const NON_REFRESHABLE_AUTH_PATHS = [
  "/auth/login",
  "/auth/refresh-token",
  "/auth/register",
  "/auth/register-company",
  "/auth/forgot-password",
  "/auth/reset-password",
];
const isNonRefreshableAuthRequest = (url = "") =>
  NON_REFRESHABLE_AUTH_PATHS.some((p) => url.includes(p));

// RESPONSE INTERCEPTOR - Handle 401 and refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Login/refresh/register/reset 401s are real auth failures, not expired
      // sessions — reject with the original error so the caller sees the
      // backend's message and status, and no spurious refresh is attempted.
      if (isNonRefreshableAuthRequest(originalRequest.url)) {
        if (originalRequest.url?.includes("/auth/refresh-token")) {
          clearTokens();
        }
        return Promise.reject(error);
      }

      // No access token means there is no session to refresh (e.g. a 401 from a
      // public/anonymous request) — surface it as-is rather than attempting a
      // refresh with a missing/"null" refresh token.
      if (!getAccessToken()) {
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
        const token = getAccessToken();

        if (!refreshToken && token) {
          clearTokens();
          window.location.href = "/Auth/Login";
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
          { refreshToken: String(refreshToken) },
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
  },
);

export default axiosInstance;

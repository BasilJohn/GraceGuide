import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4001/";

// Log API base URL in development (remove trailing slash if present for cleaner logs)
const cleanBaseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
if (__DEV__) {
  console.log('API Base URL:', cleanBaseUrl);
}

let accessToken: string | null = null;
let refreshToken: string | null = null;

export async function setAccessToken(token: string) {
  accessToken = token;
  await SecureStore.setItemAsync("accessToken", token);
}

export async function loadAccessToken() {
  // Always load from SecureStore to ensure we have the latest token
  // (in case it was refreshed elsewhere)
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) {
    accessToken = token;
  }
  return accessToken;
}

export async function loadRefreshToken() {
  // Always load from SecureStore to ensure we have the latest token
  const token = await SecureStore.getItemAsync("refreshToken");
  if (token) {
    refreshToken = token;
  }
  return refreshToken;
}

async function saveTokens(newAccessToken: string, newRefreshToken: string) {
  // Update module-level variables to keep them in sync
  accessToken = newAccessToken;
  refreshToken = newRefreshToken;
  await SecureStore.setItemAsync("accessToken", newAccessToken);
  await SecureStore.setItemAsync("refreshToken", newRefreshToken);
}

export async function clearTokens() {
  accessToken = null;
  refreshToken = null;
  await SecureStore.deleteItemAsync("accessToken");
  await SecureStore.deleteItemAsync("refreshToken");
}

const api = axios.create({
  baseURL: API_BASE,
});

// Add skipAuth support
api.interceptors.request.use(
  async (config: any) => {
    // If request explicitly opts out of auth, skip
    if (config.skipAuth) {
      return config;
    }
    const token = await loadAccessToken();
    if (token) {
      if (config.headers) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Response interceptor — handle 401 with refresh flow
api.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;

    // If request failed due to unauthorized and we haven't retried yet
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry &&
      !(originalRequest as any).skipAuth
    ) {
      originalRequest._retry = true;

      const refreshTokenValue = await loadRefreshToken();
      if (!refreshTokenValue) {
        await clearTokens();
        // Use setTimeout to ensure state is cleared before redirect
        setTimeout(() => {
          router.replace("/signin");
        }, 100);
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/auth/refreshToken`,
          { token: refreshTokenValue },
          { skipAuth: true } // prevent infinite loop
        );

        // Update tokens in SecureStore and module state
        await saveTokens(data.accessToken, data.refreshToken);

        // re-fetch user and update in SecureStore
        // Note: We use the api instance which will automatically use the new token
        try {
            const meRes = await api.get("/auth/getUser"); 
            await SecureStore.setItemAsync("user", JSON.stringify(meRes.data));
        } catch (meErr) {
            console.warn("Could not refresh user:", meErr);
            // Don't fail the token refresh if user fetch fails
            // The user can still use the app with refreshed tokens
        }

        // Update the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }
        return api(originalRequest); // retry request
      } catch (refreshError: any) {
        console.error("Token refresh failed:", refreshError);
        await clearTokens();
        // Only redirect if refresh token is actually invalid (not network error)
        const isTokenInvalid = 
          refreshError?.response?.status === 401 || 
          refreshError?.response?.status === 403 ||
          refreshError?.response?.status === 400;
        
        if (isTokenInvalid) {
          // Use setTimeout to ensure state is cleared before redirect
          setTimeout(() => {
            router.replace("/signin");
          }, 100);
        }
        // If it's a network error, don't redirect - user might regain connectivity
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;


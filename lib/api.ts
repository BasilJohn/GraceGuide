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
  if (!accessToken) {
    accessToken = await SecureStore.getItemAsync("accessToken");
  }
  return accessToken;
}

export async function loadRefreshToken() {
  if (!refreshToken) {
    refreshToken = await SecureStore.getItemAsync("refreshToken");
  }
  return refreshToken;
}

async function saveTokens(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync("accessToken", accessToken);
  await SecureStore.setItemAsync("refreshToken", refreshToken);
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
      error.response?.status === 401 || error.response?.status === 403 &&
      !originalRequest._retry &&
      !(originalRequest as any).skipAuth
    ) {
      originalRequest._retry = true;

      const refreshToken = await loadRefreshToken();
      if (!refreshToken) {
        await clearTokens();
        router.replace("/signin"); // redirect to login
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/auth/refreshToken`,
          { token: refreshToken },
          { skipAuth: true } // prevent infinite loop
        );

        await saveTokens(data.accessToken, data.refreshToken);

        // re-fetch user and update in SecureStore
        try {
            const meRes = await api.get("/auth/getUser"); 
            await SecureStore.setItemAsync("user", JSON.stringify(meRes.data));
        } catch (meErr) {
            console.warn("Could not refresh user:", meErr);
        }

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest); // retry request
      } catch (refreshError: any) {
        await clearTokens();
        router.replace("/signin"); // redirect to login
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;


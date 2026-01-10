import { clearTokens } from "@/lib/api";
import { AuthContextType, AuthTokens, User } from "@/types/types";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(true);

  // Load stored auth data when the app starts
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const [storedAccessToken, storedRefreshToken, storedUser] =
          await Promise.all([
            SecureStore.getItemAsync("accessToken"),
            SecureStore.getItemAsync("refreshToken"),
            SecureStore.getItemAsync("user"),
          ]);

        if (storedAccessToken && storedRefreshToken && storedUser) {
          // On startup, just load the tokens and user
          // Token validation will happen naturally on first API call via interceptor
          // This avoids race conditions and double refresh attempts
          setTokens({
            accessToken: storedAccessToken,
            refreshToken: storedRefreshToken,
          });
          setUser(JSON.parse(storedUser));
        } else {
          // No tokens found, ensure state is clean
          setUser(null);
          setTokens(null);
        }
      } catch (error) {
        console.error("Error loading auth state:", error);
        setUser(null);
        setTokens(null);
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  // Listen for app state changes to sync tokens when app comes to foreground
  useEffect(() => {
    // Only set up listener after initial load is complete
    if (loading) return;

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        // App came to foreground, sync tokens from SecureStore
        // This ensures we have the latest tokens (in case they were refreshed while app was in background)
        try {
          const [storedAccessToken, storedRefreshToken, storedUser] =
            await Promise.all([
              SecureStore.getItemAsync("accessToken"),
              SecureStore.getItemAsync("refreshToken"),
              SecureStore.getItemAsync("user"),
            ]);

          if (storedAccessToken && storedRefreshToken && storedUser) {
            // Update state with latest tokens and user from SecureStore
            setTokens({
              accessToken: storedAccessToken,
              refreshToken: storedRefreshToken,
            });
            try {
              setUser(JSON.parse(storedUser));
            } catch (parseError) {
              console.error("Error parsing user data:", parseError);
            }
          } else {
            // Tokens were cleared while app was in background
            setUser(null);
            setTokens(null);
          }
        } catch (error) {
          console.error("Error syncing tokens on app focus:", error);
        }
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [loading]);

  // Sign in (save user + tokens)
  const signIn = useCallback(async (newUser: User, newTokens: AuthTokens) => {
    try {
      // Write everything at once before any re-render
      await Promise.all([
        SecureStore.setItemAsync("accessToken", newTokens.accessToken),
        SecureStore.setItemAsync("refreshToken", newTokens.refreshToken),
        SecureStore.setItemAsync("user", JSON.stringify(newUser)),
      ]);

      // Update state after storage completes
      setUser(newUser);
      setTokens(newTokens);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  }, []);

  // Sign out (clear all auth data)
  const signOut = useCallback(async () => {
    clearTokens();
    try {
      await Promise.all([SecureStore.deleteItemAsync("user")]);
      setUser(null);
      setTokens(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, tokens, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


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
          setTokens({
            accessToken: storedAccessToken,
            refreshToken: storedRefreshToken,
          });
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error loading auth state:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

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


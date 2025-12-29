import { loginWithApple, loginWithGoogle } from "@/lib/appApi";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useMutation } from "@tanstack/react-query";
import * as AppleAuthentication from "expo-apple-authentication";
import { useCallback, useEffect } from "react";
import { Alert } from "react-native";
import { useAuth } from "../context/AuthContext";

export function useSignInContainer() {
  const { signIn } = useAuth();

  // Mutation to call backend for Google
  const googleAuthMutation = useMutation<
    { accessToken: string; refreshToken: string; user: any },
    unknown,
    string
  >({
    mutationFn: loginWithGoogle,
    onSuccess: async (data: { accessToken: string; refreshToken: string; user: any }) => {
      const authTokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };
      // Store tokens + user securely via AuthContext
      await signIn(data.user, authTokens);
    },
    onError: (error: any) => {
      console.error("Google Auth backend error:", error);
      Alert.alert("Sign In Error", "Failed to authenticate with backend");
    },
  });

  // Mutation to call backend for Apple
  const appleAuthMutation = useMutation<
    { accessToken: string; refreshToken?: string; user: any },
    unknown,
    string
  >({
    mutationFn: loginWithApple,
    onSuccess: async (data: { accessToken: string; refreshToken?: string; user: any }) => {
      const authTokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken ?? "",
      };
      // Securely store tokens and user data
      await signIn(data.user, authTokens);
    },
    onError: (error: any) => {
      console.error("Apple Auth backend error:", error);
      Alert.alert("Sign In Error", "Failed to authenticate with Apple");
    },
  });

  const initializeGoogleSignIn = useCallback(async () => {
    try {
      const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;


      // Only configure if client IDs are provided
      if (!webClientId || !iosClientId) {
        return;
      }

      // Configure Google Sign-In
      GoogleSignin.configure({
        webClientId: webClientId,
        iosClientId: iosClientId,
        offlineAccess: true,
        forceCodeForRefreshToken: true,
      });
      
    } catch (error) {
      // Don't show alert on initialization - only show error when user tries to sign in
    }
  }, []);

  useEffect(() => {
    initializeGoogleSignIn();
  }, [initializeGoogleSignIn]);

  const handleSignIn = useCallback(async () => {
    try {
      // In Expo, environment variables are available via process.env
      // They must be prefixed with EXPO_PUBLIC_ and dev server must be restarted
      const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

      // Check if Google Sign-In is configured
      if (!webClientId || !iosClientId) {
        Alert.alert(
          "Google Sign-In Not Configured",
          "Please configure Google OAuth client IDs in your environment variables to use Google Sign-In."
        );
        return;
      }

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (userInfo?.data?.idToken) {
        googleAuthMutation.mutate(userInfo.data.idToken);
      } else {
        console.error("ID token is missing or invalid");
        Alert.alert("Sign In Error", "Failed to get authentication token from Google");
      }
    } catch (error: any) {
      console.error("Google Sign-In error:", error);
      
      // Handle specific error cases
      if (error.code === "SIGN_IN_CANCELLED") {
        // User cancelled, don't show error
        return;
      }
      
      Alert.alert(
        "Sign In Error",
        error.message || "Google Sign-In failed. Please try again."
      );
    }
  }, [googleAuthMutation]);

  const handleAppleSignIn = useCallback(async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        appleAuthMutation.mutate(credential.identityToken);
      } else {
        Alert.alert("Error", "Apple did not return a valid identity token");
      }
    } catch (err: any) {
      if (err.code === "ERR_CANCELED") return; // user cancelled
      console.error("Apple sign-in error:", err);
      Alert.alert("Sign In Error", "Apple sign-in failed");
    }
  }, [appleAuthMutation]);

  return {
    handleSignIn,
    handleAppleSignIn,
    isLoading: googleAuthMutation.isPending || appleAuthMutation.isPending,
    error: googleAuthMutation.error || appleAuthMutation.error,
  };
}


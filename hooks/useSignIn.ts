import { loginWithApple, loginWithGoogle } from "@/lib/appApi";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useMutation } from "@tanstack/react-query";
import * as AppleAuthentication from "expo-apple-authentication";
import { useCallback, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useAuth } from "../context/AuthContext";

export function useSignInContainer() {
  const { signIn } = useAuth();
  const isCancelledRef = useRef<{ google: boolean; apple: boolean }>({
    google: false,
    apple: false,
  });

  // Mutation to call backend for Google
  const googleAuthMutation = useMutation<
    { accessToken: string; refreshToken: string; user: any },
    unknown,
    string
  >({
    mutationFn: loginWithGoogle,
    onSuccess: async (data: { accessToken: string; refreshToken: string; user: any }) => {
      // Reset cancellation flag on success
      isCancelledRef.current.google = false;
      const authTokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };
      // Store tokens + user securely via AuthContext
      await signIn(data.user, authTokens);
    },
    onError: (error: any) => {
      // Don't show error if user cancelled the sign-in process
      if (isCancelledRef.current.google) {
        console.log("Google sign-in was cancelled by user");
        isCancelledRef.current.google = false;
        return;
      }

      // Check if error is a cancellation-related error
      const isCancellationError = 
        error?.code === "ERR_CANCELED" ||
        error?.code === "SIGN_IN_CANCELLED" ||
        error?.code === "ERR_REQUEST_CANCELLED" ||
        error?.code === "ERR_ABORTED" ||
        error?.name === "AbortError" ||
        error?.message?.toLowerCase().includes("cancel") ||
        error?.message?.toLowerCase().includes("cancelled") ||
        error?.message?.toLowerCase().includes("aborted");

      if (isCancellationError) {
        console.log("Google sign-in was cancelled");
        isCancelledRef.current.google = false; // Reset flag
        return;
      }

      // Check if it's a network timeout or connection error that might indicate cancellation
      const isNetworkError = 
        error?.code === "ERR_NETWORK" ||
        error?.message?.toLowerCase().includes("network request failed") ||
        error?.message?.toLowerCase().includes("timeout");

      // For network errors, only show alert if we're sure it's not a cancellation
      if (!isNetworkError) {
        console.error("Google Auth backend error:", error);
        Alert.alert("Sign In Error", "Failed to authenticate with backend");
      } else {
        console.log("Google sign-in network error (may have been cancelled):", error);
      }
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
      // Reset cancellation flag on success
      isCancelledRef.current.apple = false;
      const authTokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken ?? "",
      };
      // Securely store tokens and user data
      await signIn(data.user, authTokens);
    },
    onError: (error: any) => {
      // Don't show error if user cancelled the sign-in process
      if (isCancelledRef.current.apple) {
        console.log("Apple sign-in was cancelled by user");
        isCancelledRef.current.apple = false;
        return;
      }

      // Check if error is a cancellation-related error
      const isCancellationError = 
        error?.code === "ERR_CANCELED" ||
        error?.code === "ERR_REQUEST_CANCELLED" ||
        error?.code === "ERR_ABORTED" ||
        error?.name === "AbortError" ||
        error?.message?.toLowerCase().includes("cancel") ||
        error?.message?.toLowerCase().includes("cancelled") ||
        error?.message?.toLowerCase().includes("aborted");

      if (isCancellationError) {
        console.log("Apple sign-in was cancelled");
        isCancelledRef.current.apple = false; // Reset flag
        return;
      }

      // Check if it's a network timeout or connection error that might indicate cancellation
      const isNetworkError = 
        error?.code === "ERR_NETWORK" ||
        error?.message?.toLowerCase().includes("network request failed") ||
        error?.message?.toLowerCase().includes("timeout");

      // For network errors, only show alert if we're sure it's not a cancellation
      if (!isNetworkError) {
        console.error("Apple Auth backend error:", error);
        Alert.alert("Sign In Error", "Failed to authenticate with Apple");
      } else {
        console.log("Apple sign-in network error (may have been cancelled):", error);
      }
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
    // Reset cancellation flag when starting new sign-in
    isCancelledRef.current.google = false;

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
        // Check if this is due to cancellation
        if (userInfo === null || userInfo === undefined) {
          console.log("Google sign-in was cancelled by user");
          return;
        }
        console.error("ID token is missing or invalid");
        Alert.alert("Sign In Error", "Failed to get authentication token from Google");
      }
    } catch (error: any) {
      // Handle cancellation errors - don't show error to user
      if (
        error.code === "SIGN_IN_CANCELLED" ||
        error.code === "ERR_CANCELED" ||
        error.code === "ERR_REQUEST_CANCELLED" ||
        error.message?.toLowerCase().includes("cancel") ||
        error.message?.toLowerCase().includes("cancelled")
      ) {
        console.log("Google sign-in was cancelled by user");
        isCancelledRef.current.google = true;
        return;
      }

      // For other errors, show alert
      console.error("Google Sign-In error:", error);
      Alert.alert(
        "Sign In Error",
        error.message || "Google Sign-In failed. Please try again."
      );
    }
  }, [googleAuthMutation]);

  const handleAppleSignIn = useCallback(async () => {
    // Reset cancellation flag when starting new sign-in
    isCancelledRef.current.apple = false;

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential?.identityToken) {
        appleAuthMutation.mutate(credential.identityToken);
      } else {
        // This could indicate cancellation or missing token - don't show error
        console.log("Apple sign-in did not return identity token - may have been cancelled");
        return;
      }
    } catch (err: any) {
      // Handle all cancellation-related errors
      if (
        err.code === "ERR_CANCELED" ||
        err.code === "ERR_REQUEST_CANCELLED" ||
        err.message?.toLowerCase().includes("cancel") ||
        err.message?.toLowerCase().includes("cancelled")
      ) {
        console.log("Apple sign-in was cancelled by user");
        isCancelledRef.current.apple = true;
        return; // User cancelled, don't show error
      }

      // For actual errors, show alert
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


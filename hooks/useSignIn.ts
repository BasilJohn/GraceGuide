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
      GoogleSignin.configure({
        webClientId:
          process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "",
        iosClientId:
          process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || "",
        offlineAccess: true,
        forceCodeForRefreshToken: true,
      });
    } catch (error) {
      console.error("Google Sign-In initialization error:", error);
      Alert.alert(
        "Initialization Error",
        "Failed to initialize Google Sign-In"
      );
    }
  }, []);

  useEffect(() => {
    initializeGoogleSignIn();
  }, [initializeGoogleSignIn]);

  const handleSignIn = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (userInfo?.data?.idToken) {
        googleAuthMutation.mutate(userInfo.data.idToken);
      } else {
        console.error("ID token is missing or invalid");
      }
    } catch (error) {
      console.error("Google Sign-In error:", error);
      Alert.alert("Sign In Error", "Google Sign-In failed");
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


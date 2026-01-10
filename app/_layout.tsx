import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Redirect, Stack, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Platform, TouchableOpacity } from "react-native";
import LoadingScreen from "../components/LoadingScreen";
import CustomSplashScreen from "../components/SplashScreen";
import { AuthProvider, useAuth } from "../context/AuthContext";
import QueryProvider from "../providers/QueryProvider";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (user) {
        try {
          const completed = await SecureStore.getItemAsync("onboardingCompleted");
          setOnboardingCompleted(completed === "true");
        } catch (error) {
          setOnboardingCompleted(false);
        }
      } else {
        setOnboardingCompleted(null);
      }
      setCheckingOnboarding(false);
      
      // After first load, mark as no longer initial
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    };

    if (!loading) {
      checkOnboarding();
    }
  }, [user, loading, isInitialLoad]);

  // Handle programmatic navigation after state changes (post-sign-in)
  // This ensures immediate navigation when user signs in
  useEffect(() => {
    // Don't navigate while loading, checking onboarding, or on initial load (let Redirect handle that)
    if (loading || checkingOnboarding || isInitialLoad) {
      return;
    }

    // Use requestAnimationFrame + setTimeout to ensure state updates are processed
    // This ensures navigation happens after React has processed all state updates
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const frameId = requestAnimationFrame(() => {
      timeoutId = setTimeout(() => {
        try {
          if (!user) {
            // User is not signed in - navigate to sign in
            router.replace("/signin");
          } else if (onboardingCompleted === false) {
            // User is signed in but onboarding not completed
            router.replace("/onboarding/emotions");
          } else if (onboardingCompleted === true) {
            // User is signed in and onboarding completed
            router.replace("/(tabs)");
          }
        } catch (error) {
          console.error("Navigation error in AuthGate:", error);
        }
      }, 100); // Small delay to ensure state is stable
    });

    return () => {
      cancelAnimationFrame(frameId);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user, loading, onboardingCompleted, checkingOnboarding, isInitialLoad, router]);

  // Show loading while checking auth and onboarding
  if (loading || checkingOnboarding) {
    return <LoadingScreen />;
  }

  // Use Redirect for initial render and fallback
  // Programmatic navigation handles state changes after initial load
  if (!user) {
    return <Redirect href="/signin" />;
  }

  if (onboardingCompleted === false) {
    return <Redirect href="/onboarding/emotions" />;
  }

  if (onboardingCompleted === true) {
    return <Redirect href="/(tabs)" />;
  }

  return <LoadingScreen />;
}

function CustomBackButton() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const textColor = isDark ? COLORS.textDark : COLORS.textLight;
  const backgroundColor = isDark
    ? COLORS.elementDark + "80"
    : COLORS.elementLight + "80";
  
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // If no previous screen, navigate to home
      router.replace("/(tabs)");
    }
  };
  
  return (
    <TouchableOpacity
      onPress={handleBack}
      style={{
        justifyContent: "center",
        alignItems: "center",
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor,
        marginLeft: -8,
      }}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={22} color={textColor} />
    </TouchableOpacity>
  );
}

function StackWithHeaders() {
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? COLORS.textDark : COLORS.textLight;
  const headerBackgroundColor = colorScheme === "dark" ? COLORS.backgroundDark : COLORS.backgroundLight;
  const borderColor = colorScheme === "dark" ? COLORS.borderDark : COLORS.borderLight;

  return (
    <Stack 
      screenOptions={{ 
        headerShown: false 
      }}
    >
      <Stack.Screen name="signin" />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="checkin-modal" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="devotional-modal" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="chat" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen 
        name="modal" 
        options={{
          headerShown: true,
          title: "Modal",
          headerBackVisible: false,
          headerLeft: () => <CustomBackButton />,
          presentation: "card",
          headerTintColor: textColor,
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 18,
            letterSpacing: -0.15,
            fontFamily: FONTS.header,
          } as any,
          headerStyle: {
            backgroundColor: headerBackgroundColor,
            borderBottomWidth: 1,
            borderBottomColor: borderColor,
            ...Platform.select({
              ios: {
                shadowColor: COLORS.shadowBlack,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
              },
              android: {
                elevation: 2,
              },
            }),
          } as any,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  // Load custom fonts if they exist
  // To add fonts: Download from Google Fonts and place in assets/fonts/
  // Then uncomment and update the font paths below
  const [fontsLoaded, fontError] = useFonts({
    // Uncomment when fonts are added:
    // "PlayfairDisplay-Regular": require("../assets/fonts/PlayfairDisplay-Regular.ttf"),
    // "PlayfairDisplay-Bold": require("../assets/fonts/PlayfairDisplay-Bold.ttf"),
  });

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show custom splash for a minimum duration for better UX
    const hideSplash = async () => {
      // Minimum splash screen display time (1.5 seconds)
      const minDisplayTime = 1500;
      const startTime = Date.now();

      const hide = async () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDisplayTime - elapsed);

        setTimeout(async () => {
          setShowSplash(false);
          if (fontsLoaded || fontError) {
            await SplashScreen.hideAsync();
          } else {
            // Additional timeout if fonts aren't loaded
            setTimeout(async () => {
              await SplashScreen.hideAsync();
            }, 500);
          }
        }, remaining);
      };

      hide();
    };

    hideSplash();
  }, [fontsLoaded, fontError]);

  // Show custom splash screen initially
  if (showSplash) {
    return <CustomSplashScreen />;
  }

  // Always render the app - fonts will be used when available
  return (
    <QueryProvider>
      <AuthProvider>
        <StackWithHeaders />
        <AuthGate />
      </AuthProvider>
    </QueryProvider>
  );
}

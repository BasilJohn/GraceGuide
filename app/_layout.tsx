import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Stack, useNavigationContainerRef, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import {
  InteractionManager,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import LoadingScreen from "../components/LoadingScreen";
import CustomSplashScreen from "../components/SplashScreen";
import { AuthProvider, useAuth } from "../context/AuthContext";
import QueryProvider from "../providers/QueryProvider";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AuthGate({ splashDismissed }: { splashDismissed: boolean }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const navigationRef = useNavigationContainerRef();
  const lastNavTargetRef = useRef<string | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Check onboarding status
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
    };

    if (!loading) {
      checkOnboarding();
    } else {
      setCheckingOnboarding(true);
    }
  }, [user, loading]);

  // Wait for splash overlay to dismiss so linking can complete. Defer navigation until the
  // native stack has settled — replacing too early after splash can crash release builds.
  useEffect(() => {
    if (!splashDismissed || loading || checkingOnboarding) {
      return;
    }
    if (user && onboardingCompleted === null) {
      return;
    }

    let cancelled = false;
    let rafId: number | null = null;
    let cancelInteraction: (() => void) | undefined;

    const runNavigation = () => {
      if (cancelled) return;
      const target = !user
        ? "/signin"
        : onboardingCompleted === false
          ? "/onboarding"
          : "/(tabs)";
      if (lastNavTargetRef.current === target) return;
      lastNavTargetRef.current = target;
      try {
        router.replace(target as "/signin" | "/onboarding" | "/(tabs)");
      } catch {
        lastNavTargetRef.current = null;
      }
    };

    const afterReady = () => {
      if (cancelled) return;
      if (!navigationRef.isReady()) {
        rafId = requestAnimationFrame(afterReady);
        return;
      }
      const task = InteractionManager.runAfterInteractions(() => {
        if (cancelled) return;
        requestAnimationFrame(runNavigation);
      });
      cancelInteraction = () => task.cancel?.();
    };

    afterReady();

    return () => {
      cancelled = true;
      if (rafId != null) cancelAnimationFrame(rafId);
      cancelInteraction?.();
    };
  }, [
    splashDismissed,
    user,
    loading,
    checkingOnboarding,
    onboardingCompleted,
    router,
    navigationRef,
  ]);

  if (loading || checkingOnboarding) {
    return <LoadingScreen />;
  }

  return null;
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
      initialRouteName="signin"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="signin" />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="checkin-modal" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="devotional-modal" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="chat" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="paywall" options={{ headerShown: false }} />
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

  // Keep Stack + NavigationContainer mounted from the first frame. Returning only the splash
  // screen here used to unmount the navigator until the timer fired, which breaks linking /
  // isReady() timing and can crash release builds.
  return (
    <QueryProvider>
      <AuthProvider>
        <StackWithHeaders />
        <AuthGate splashDismissed={!showSplash} />
        {showSplash ? (
          <View
            style={[StyleSheet.absoluteFill, styles.splashOverlay]}
            pointerEvents="auto"
          >
            <CustomSplashScreen />
          </View>
        ) : null}
      </AuthProvider>
    </QueryProvider>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    zIndex: 9999,
    elevation: 9999,
  },
});

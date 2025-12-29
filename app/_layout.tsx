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
import { AuthProvider, useAuth } from "../context/AuthContext";
import QueryProvider from "../providers/QueryProvider";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const { user, loading } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (user) {
        try {
          const completed = await SecureStore.getItemAsync("onboardingCompleted");
          setOnboardingCompleted(completed === "true");
        } catch (error) {
          setOnboardingCompleted(false);
        }
      }
      setCheckingOnboarding(false);
    };

    if (!loading) {
      checkOnboarding();
    }
  }, [user, loading]);

  // Show loading while checking auth and onboarding
  if (loading || checkingOnboarding) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Redirect href="/signin" />;
  }

  // Redirect to onboarding if not completed
  if (!onboardingCompleted) {
    return <Redirect href="/onboarding/emotions" />;
  }

  return <Redirect href="/(tabs)" />;
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

  useEffect(() => {
    // Hide splash screen after fonts load or after timeout
    const hideSplash = async () => {
      if (fontsLoaded || fontError) {
        await SplashScreen.hideAsync();
      } else {
        // Timeout fallback - hide splash after 2 seconds even if fonts aren't loaded
        setTimeout(async () => {
          await SplashScreen.hideAsync();
        }, 2000);
      }
    };

    hideSplash();
  }, [fontsLoaded, fontError]);

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

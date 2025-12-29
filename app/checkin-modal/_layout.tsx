import { Stack } from "expo-router";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Platform } from "react-native";

export default function CheckInModalLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const textColor = isDark ? COLORS.textDark : COLORS.textLight;
  const headerBackgroundColor = isDark ? COLORS.backgroundDark : COLORS.backgroundLight;
  const borderColor = isDark ? COLORS.borderDark : COLORS.borderLight;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "modal",
        animation: "slide_from_bottom",
        contentStyle: {
          backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight,
        },
      }}
    >
      <Stack.Screen name="emotions" />
      <Stack.Screen name="tone" />
    </Stack>
  );
}



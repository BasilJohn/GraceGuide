import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        presentation: "card",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="emotions" />
      <Stack.Screen name="tone" />
    </Stack>
  );
}



import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";

interface Props {
  children: ReactNode;
  useSafeArea?: boolean; // default true
}

export default function GradientBackground({ children, useSafeArea = true }: Props) {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === "dark" ? COLORS.backgroundDark : COLORS.backgroundLight;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {useSafeArea ? (
        <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>{children}</SafeAreaView>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "visible" },
  safeArea: { flex: 1 },
});


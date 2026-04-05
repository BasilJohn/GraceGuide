/**
 * Custom splash — matches current app icon, restrained editorial feel.
 */

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const AnimatedView = Animated.createAnimatedComponent(View);

export default function CustomSplashScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const iconOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0.92);
  const haloOpacity = useSharedValue(0);
  const lineWidth = useSharedValue(0);

  const textColor = isDark ? COLORS.textDark : COLORS.textLight;
  const mutedColor = isDark ? COLORS.placeholderDark : COLORS.placeholderLight;

  useEffect(() => {
    haloOpacity.value = withDelay(
      100,
      withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) })
    );
    iconOpacity.value = withDelay(
      80,
      withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) })
    );
    iconScale.value = withDelay(
      80,
      withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) })
    );
    lineWidth.value = withDelay(
      500,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
  }, [haloOpacity, iconOpacity, iconScale, lineWidth]);

  const iconWrapStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: haloOpacity.value * 0.85,
  }));

  const ruleStyle = useAnimatedStyle(() => ({
    opacity: lineWidth.value,
    transform: [{ scaleX: lineWidth.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight }]}>
      {/* Base wash */}
      <LinearGradient
        colors={
          isDark
            ? [COLORS.backgroundDark, "#152030", COLORS.backgroundDark]
            : [COLORS.backgroundLight, "#F3F0EA", COLORS.backgroundLight]
        }
        locations={[0, 0.45, 1]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Soft radial highlight */}
      <LinearGradient
        colors={
          isDark
            ? ["transparent", COLORS.primaryDark + "18", "transparent"]
            : ["transparent", COLORS.gold + "12", "transparent"]
        }
        start={{ x: 0.5, y: 0.35 }}
        end={{ x: 0.5, y: 0.85 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Edge vignette */}
      <LinearGradient
        colors={
          isDark
            ? [COLORS.shadowBlack + "55", "transparent", COLORS.shadowBlack + "40"]
            : ["rgba(255,255,255,0.5)", "transparent", "rgba(0,0,0,0.04)"]
        }
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <Animated.View entering={FadeIn.duration(500)} style={styles.center}>
        <AnimatedView style={[styles.halo, haloStyle]}>
          <LinearGradient
            colors={[COLORS.primary + "35", COLORS.secondary + "18", COLORS.accent + "22"]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.haloGradient}
          />
        </AnimatedView>

        <AnimatedView style={[styles.iconShadow, iconWrapStyle]}>
          <View
            style={[
              styles.iconFrame,
              {
                borderColor: isDark ? COLORS.white20 : "rgba(255,255,255,0.85)",
                backgroundColor: isDark ? COLORS.elementDark : COLORS.surface,
              },
            ]}
          >
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.icon}
              contentFit="contain"
              transition={200}
            />
          </View>
        </AnimatedView>

        <Animated.Text
          entering={FadeInDown.delay(280).duration(700)}
          style={[styles.wordmark, { color: textColor }]}
        >
          GraceGuide
        </Animated.Text>

        <AnimatedView style={[styles.ruleWrap, ruleStyle]}>
          <LinearGradient
            colors={[COLORS.gold + "00", COLORS.gold, COLORS.gold + "00"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.rule}
          />
        </AnimatedView>

        <Animated.Text
          entering={FadeInDown.delay(420).duration(700)}
          style={[styles.tagline, { color: mutedColor }]}
        >
          Scripture · reflection · gentle guidance
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const ICON = 132;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    zIndex: 2,
  },
  halo: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    overflow: "hidden",
  },
  haloGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 140,
  },
  iconShadow: {
    marginBottom: 36,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 14,
  },
  iconFrame: {
    width: ICON + 8,
    height: ICON + 8,
    borderRadius: 36,
    borderWidth: StyleSheet.hairlineWidth * 2,
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: ICON,
    height: ICON,
    borderRadius: 28,
  },
  wordmark: {
    fontSize: 36,
    fontWeight: "600",
    letterSpacing: 2,
    fontFamily: FONTS.header,
    marginBottom: 16,
    textAlign: "center",
  },
  ruleWrap: {
    width: 120,
    height: 2,
    marginBottom: 18,
    overflow: "hidden",
  },
  rule: {
    flex: 1,
    borderRadius: 1,
  },
  tagline: {
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: 3.2,
    textTransform: "uppercase",
    textAlign: "center",
    lineHeight: 22,
  },
});

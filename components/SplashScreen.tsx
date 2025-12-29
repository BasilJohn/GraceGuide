/**
 * Custom Splash Screen Component
 * Inspired by the app icon - rose in a transparent cube
 * Features elegant animations and comforting design
 */

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    FadeIn,
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedImage = Animated.createAnimatedComponent(Image);

export default function CustomSplashScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Animation values
  const iconScale = useSharedValue(0.8);
  const iconOpacity = useSharedValue(0);
  const iconRotation = useSharedValue(0);
  const cubeScale = useSharedValue(1);
  const cubeRotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);
  const textOpacity = useSharedValue(0);
  const particles = useSharedValue(0);

  const textColor = isDark ? COLORS.textDark : COLORS.textLight;
  const placeholderColor = isDark ? COLORS.placeholderDark : COLORS.placeholderLight;

  useEffect(() => {
    // Icon entrance animation
    iconOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    iconScale.value = withSpring(1, { damping: 12, stiffness: 100 });

    // Gentle rotation for the cube effect
    cubeRotation.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-5, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Subtle pulse for the cube
    cubeScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Glow pulse
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Text fade in
    textOpacity.value = withTiming(1, { duration: 1000, delay: 400, easing: Easing.out(Easing.ease) });

    // Particles animation
    particles.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotation.value}deg` },
    ],
  }));

  const cubeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: cubeScale.value },
      { rotate: `${cubeRotation.value}deg` },
    ],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View style={[styles.container, { backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight }]}>
      {/* Background Gradient - Soft pastel colors matching the icon */}
      <LinearGradient
        colors={
          isDark
            ? [
                COLORS.backgroundDark,
                COLORS.primaryDark + "15",
                COLORS.accentDark + "10",
                COLORS.backgroundDark,
              ]
            : [
                COLORS.backgroundLight,
                "#FFE8E0", // Soft peach
                "#E8E0FF", // Soft lavender
                COLORS.backgroundLight,
              ]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative floating particles */}
      <AnimatedView style={styles.particlesContainer}>
        {[...Array(6)].map((_, i) => (
          <AnimatedView
            key={i}
            style={[
              styles.particle,
              {
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                backgroundColor: i % 2 === 0 ? COLORS.primary + "20" : COLORS.secondary + "20",
              },
            ]}
          />
        ))}
      </AnimatedView>

      {/* Main Content */}
      <Animated.View entering={FadeIn.duration(600)} style={styles.content}>
        {/* Glow effect behind icon */}
        <AnimatedView style={[styles.glowContainer, glowAnimatedStyle, cubeAnimatedStyle]}>
          <LinearGradient
            colors={[
              COLORS.primary + "30",
              COLORS.secondary + "20",
              COLORS.accent + "25",
            ]}
            style={styles.glow}
          />
        </AnimatedView>

        {/* Icon Container with Cube Effect */}
        <AnimatedView style={[styles.iconContainer, cubeAnimatedStyle]}>
          {/* Transparent cube border effect */}
          <AnimatedView style={[styles.cubeBorder, { borderColor: COLORS.gold + "40" }]} />
          
          {/* App Icon */}
          <AnimatedImage
            source={require("@/assets/images/icon.png")}
            style={[styles.icon, iconAnimatedStyle]}
            contentFit="contain"
            transition={300}
          />
        </AnimatedView>

        {/* App Name */}
        <Animated.Text
          entering={FadeInDown.delay(500).duration(800)}
          style={[styles.appName, { color: textColor }, textAnimatedStyle]}
        >
          GraceGuide
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text
          entering={FadeInDown.delay(700).duration(800)}
          style={[styles.tagline, { color: placeholderColor }, textAnimatedStyle]}
        >
          Your guide to grace and wisdom
        </Animated.Text>
      </Animated.View>

      {/* Bottom decorative elements */}
      <Animated.View
        entering={FadeIn.delay(1000).duration(1000)}
        style={styles.bottomDecorations}
      >
        <View style={[styles.decorativeCircle, { backgroundColor: COLORS.primary + "10" }]} />
        <View style={[styles.decorativeCircle, styles.decorativeCircle2, { backgroundColor: COLORS.secondary + "08" }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  particlesContainer: {
    position: "absolute",
    width: width,
    height: height,
    zIndex: 0,
  },
  particle: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.4,
  },
  glowContainer: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  glow: {
    width: "100%",
    height: "100%",
    borderRadius: 140,
  },
  iconContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    position: "relative",
    zIndex: 2,
  },
  cubeBorder: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 24,
    borderWidth: 2,
    opacity: 0.3,
  },
  icon: {
    width: 200,
    height: 200,
    borderRadius: 20,
  },
  appName: {
    fontSize: 42,
    fontWeight: "700",
    letterSpacing: -0.5,
    fontFamily: FONTS.header,
    marginBottom: 12,
    textAlign: "center",
  },
  tagline: {
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0.4,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  bottomDecorations: {
    position: "absolute",
    bottom: 60,
    width: width,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
  },
  decorativeCircle: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  decorativeCircle2: {
    width: 220,
    height: 220,
    borderRadius: 110,
  },
});

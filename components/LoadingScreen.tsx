import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const AnimatedView = Animated.createAnimatedComponent(View);

export default function LoadingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  
  // Animation values
  const logoScale = useSharedValue(1);
  const logoRotation = useSharedValue(0);
  const iconScale = useSharedValue(1);
  const iconRotation = useSharedValue(0);
  const progress = useSharedValue(0);
  const dot1Opacity = useSharedValue(0.3);
  const dot2Opacity = useSharedValue(0.3);
  const dot3Opacity = useSharedValue(0.3);

  const textColor = isDark ? COLORS.textDark : COLORS.textLight;
  const placeholderColor = isDark ? COLORS.placeholderDark : COLORS.placeholderLight;

  useEffect(() => {
    // Logo pulse animation
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Logo rotation
    logoRotation.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Icon bounce
    iconScale.value = withRepeat(
      withSequence(
        withSpring(1.2, { damping: 8, stiffness: 100 }),
        withSpring(1, { damping: 8, stiffness: 100 })
      ),
      -1,
      true
    );

    // Icon rotation
    iconRotation.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );

    // Progress bar animation
    progress.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Dots animation (staggered)
    dot1Opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0.3, { duration: 600 })
      ),
      -1,
      true
    );

    dot2Opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 200 }),
        withTiming(1, { duration: 600 }),
        withTiming(0.3, { duration: 600 })
      ),
      -1,
      true
    );

    dot3Opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 400 }),
        withTiming(1, { duration: 600 }),
        withTiming(0.3, { duration: 600 })
      ),
      -1,
      true
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` },
    ],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotation.value}deg` },
    ],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1Opacity.value,
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2Opacity.value,
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3Opacity.value,
  }));

  return (
    <View style={[styles.container, { backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight }]}>
      <LinearGradient
        colors={
          isDark
            ? [COLORS.backgroundDark, COLORS.primaryDark + "20", COLORS.backgroundDark]
            : [COLORS.backgroundLight, COLORS.primaryLight + "10", COLORS.backgroundLight]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Main Content */}
      <Animated.View
        entering={FadeIn.duration(400)}
        style={styles.content}
      >
        {/* Logo Section */}
        <AnimatedView style={[styles.logoContainer, logoAnimatedStyle]}>
          <AnimatedView style={iconAnimatedStyle}>
            <LinearGradient
              colors={[COLORS.primaryLight, COLORS.primary, COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <Ionicons name="sparkles" size={80} color={COLORS.white} />
            </LinearGradient>
          </AnimatedView>
        </AnimatedView>

        {/* App Name */}
        <Animated.Text
          entering={FadeInDown.delay(300).duration(600)}
          style={[styles.appName, { color: textColor }]}
        >
          GraceGuide
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text
          entering={FadeInDown.delay(500).duration(600)}
          style={[styles.tagline, { color: placeholderColor }]}
        >
          Your guide to grace and wisdom
        </Animated.Text>

        {/* Loading Dots */}
        <Animated.View
          entering={FadeInDown.delay(700).duration(600)}
          style={styles.dotsContainer}
        >
          <AnimatedView style={[styles.dot, dot1Style, { backgroundColor: COLORS.goldAccent }]} />
          <AnimatedView style={[styles.dot, dot2Style, { backgroundColor: COLORS.goldAccent }]} />
          <AnimatedView style={[styles.dot, dot3Style, { backgroundColor: COLORS.goldAccent }]} />
        </Animated.View>

        {/* Progress Bar */}
        <Animated.View
          entering={FadeInDown.delay(900).duration(600)}
          style={styles.progressContainer}
        >
          <View style={[styles.progressBarBackground, { backgroundColor: isDark ? COLORS.elementDark : COLORS.elementLight }]}>
            <AnimatedView
              style={[
                styles.progressBarFill,
                progressAnimatedStyle,
                {
                  backgroundColor: COLORS.goldAccent,
                },
              ]}
            />
          </View>
        </Animated.View>
      </Animated.View>

      {/* Decorative Elements */}
      <Animated.View
        entering={FadeIn.delay(1100).duration(800)}
        style={styles.decorativeContainer}
      >
        <View style={[styles.decorativeCircle, { backgroundColor: COLORS.primary + "15" }]} />
        <View style={[styles.decorativeCircle, styles.decorativeCircle2, { backgroundColor: COLORS.goldAccent + "10" }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.shadowBlack,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  appName: {
    fontSize: 48,
    fontWeight: "700",
    letterSpacing: -1,
    fontFamily: FONTS.header,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0.3,
    textAlign: "center",
    marginBottom: 48,
    paddingHorizontal: 40,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressContainer: {
    width: width * 0.6,
    maxWidth: 280,
  },
  progressBarBackground: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  decorativeContainer: {
    position: "absolute",
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
  },
  decorativeCircle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.3,
  },
  decorativeCircle2: {
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.2,
  },
});


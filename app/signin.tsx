import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/build/AntDesign";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import GradientBackground from "../components/GradientBackground";
import { useSignInContainer } from "../hooks/useSignIn";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

const { width } = Dimensions.get("window");

export default function SignInScreen() {
  const { handleSignIn, handleAppleSignIn, isLoading } = useSignInContainer();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  
  // Animation values
  const logoScale = useSharedValue(1);
  const logoRotation = useSharedValue(0);
  const logoGlow = useSharedValue(0.8);
  const sparkleRotation = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  
  const textColor = isDark ? COLORS.textDark : COLORS.textLight;
  const elementBg = isDark ? COLORS.elementDark : COLORS.elementLight;
  const borderColor = isDark ? COLORS.borderDark : COLORS.borderLight;
  const placeholderColor = isDark ? COLORS.placeholderDark : COLORS.placeholderLight;
  
  // Calming dark background with blue undertones
  const darkBackground = COLORS.backgroundDark; // Deep navy with blue undertones
  const accentColor = COLORS.goldAccent; // Vibrant coral accent

  useEffect(() => {
    // Logo pulse animation
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      true
    );

    // Logo gentle rotation
    logoRotation.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 4000 }),
        withTiming(-5, { duration: 4000 })
      ),
      -1,
      true
    );

    // Glow animation
    logoGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0.7, { duration: 2000 })
      ),
      -1,
      true
    );

    // Sparkle rotation
    sparkleRotation.value = withRepeat(
      withTiming(360, { duration: 8000 }),
      -1,
      false
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` },
    ],
    // Removed opacity to avoid conflict with FadeInDown layout animation
    // Opacity animation is handled by the outer glow instead
  }));

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotation.value}deg` }],
  }));

  const outerGlowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoGlow.value * 0.5,
  }));

  const handleButtonPress = (callback: () => void) => {
    if (isLoading) return;
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });
    callback();
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <GradientBackground useSafeArea={false}>
      <View style={[styles.container, { backgroundColor: darkBackground }]}>
        {/* Animated GraceGuide Logo */}
        <Animated.View
          entering={FadeInDown.delay(200).springify().damping(15)}
          style={styles.logoContainer}
        >
          {/* Wrapper to separate layout animation from style animation */}
          <AnimatedView style={logoAnimatedStyle}>
            {/* Outer glow ring */}
            <AnimatedView
              style={[
                styles.outerGlow,
                outerGlowAnimatedStyle,
                {
                  shadowColor: COLORS.goldAccent,
                },
              ]}
            />
            {/* Main logo gradient */}
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryLight, COLORS.accent, COLORS.goldAccent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}
            >
              <AnimatedView style={sparkleAnimatedStyle}>
                <Ionicons name="sparkles" size={64} color={COLORS.white} />
              </AnimatedView>
            </LinearGradient>
          </AnimatedView>
        </Animated.View>

        {/* Main Title */}
        <Animated.Text
          entering={FadeIn.delay(400).duration(600)}
          style={[styles.mainTitle, { color: accentColor }]}
        >
          Find Peace in God's{"\n"}Presence
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeIn.delay(600).duration(600)}
          style={[styles.subtitle, { color: placeholderColor }]}
        >
          A quiet place for reflection, healing, and hope.
        </Animated.Text>

        {/* Sign in buttons */}
        <Animated.View
          entering={FadeInUp.delay(800).springify().damping(15)}
          style={styles.buttonWrapper}
        >
          {Platform.OS === "ios" && (
            <>
              <AnimatedView style={buttonAnimatedStyle}>
                <TouchableOpacity
                  onPress={() => handleButtonPress(handleAppleSignIn)}
                  activeOpacity={0.85}
                  disabled={isLoading}
                  style={styles.appleButtonWrapper}
                >
                  <LinearGradient
                    colors={["#1A1A1A", "#2A2A2A", "#1A1A1A"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.appleButton}
                  >
                    <View style={styles.iconContainer}>
                      <Ionicons name="logo-apple" size={24} color={COLORS.white} />
                    </View>
                    <Text style={styles.appleButtonText}>Continue with Apple</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </AnimatedView>

              <Animated.View
                entering={FadeIn.delay(1000).duration(400)}
                style={styles.dividerContainer}
              >
                <View style={[styles.dividerLine, { backgroundColor: borderColor + "60" }]} />
                <View style={styles.orTextContainer}>
                  <Text style={[styles.orText, { color: placeholderColor }]}>or</Text>
                </View>
                <View style={[styles.dividerLine, { backgroundColor: borderColor + "60" }]} />
              </Animated.View>
            </>
          )}

          <AnimatedView style={buttonAnimatedStyle}>
            <TouchableOpacity
              onPress={() => handleButtonPress(handleSignIn)}
              activeOpacity={0.85}
              disabled={isLoading}
              style={styles.googleButtonWrapper}
            >
              <View style={styles.googleButton}>
                <View style={styles.iconContainer}>
                  <AntDesign
                    name="google"
                    size={20}
                    color={COLORS.white}
                  />
                </View>
                <Text style={styles.googleButtonText}>
                  Continue with Google
                </Text>
              </View>
            </TouchableOpacity>
          </AnimatedView>
        </Animated.View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    position: "relative",
    width: 140,
    height: 140,
  },
  outerGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "transparent",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.5,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 15,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: -0.5,
    fontFamily: FONTS.header,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0.2,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 60,
  },
  buttonWrapper: {
    width: "100%",
    maxWidth: 400,
    gap: 16,
  },
  appleButtonWrapper: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: COLORS.shadowBlack,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  appleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 18,
    minHeight: 60,
    gap: 12,
  },
  appleButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.3,
    fontFamily: FONTS.primary,
  },
  googleButtonWrapper: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: COLORS.shadowBlack,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 18,
    minHeight: 60,
    gap: 12,
    backgroundColor: "#243040",
  },
  googleButtonText: {
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.3,
    fontFamily: FONTS.primary,
    color: COLORS.white,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    width: "100%",
  },
  dividerLine: {
    flex: 1,
    height: 1.5,
  },
  orTextContainer: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  orText: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});


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
  const crossScale = useSharedValue(1);
  const crossRotation = useSharedValue(0);
  const crossGlow = useSharedValue(0.8);
  const buttonScale = useSharedValue(1);
  
  const textColor = isDark ? COLORS.textDark : COLORS.textLight;
  const elementBg = isDark ? COLORS.elementDark : COLORS.elementLight;
  const borderColor = isDark ? COLORS.borderDark : COLORS.borderLight;
  const placeholderColor = isDark ? COLORS.placeholderDark : COLORS.placeholderLight;
  
  // Dark blue background color matching the design
  const darkBlueBackground = "#0F1419"; // Deep dark blue
  const goldColor = COLORS.goldAccent;

  useEffect(() => {
    // Cross pulse animation
    crossScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      true
    );

    // Cross gentle rotation
    crossRotation.value = withRepeat(
      withSequence(
        withTiming(3, { duration: 3000 }),
        withTiming(-3, { duration: 3000 })
      ),
      -1,
      true
    );

    // Glow animation
    crossGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0.6, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const crossAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: crossScale.value },
      { rotate: `${crossRotation.value}deg` },
    ],
    opacity: crossGlow.value,
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
      <View style={[styles.container, { backgroundColor: darkBlueBackground }]}>
        {/* Animated Cross Icon */}
        <Animated.View
          entering={FadeInDown.delay(200).springify().damping(15)}
          style={[styles.crossContainer, crossAnimatedStyle]}
        >
          <Ionicons name="add" size={80} color={goldColor} style={styles.crossIcon} />
        </Animated.View>

        {/* Main Title */}
        <Animated.Text
          entering={FadeIn.delay(400).duration(600)}
          style={[styles.mainTitle, { color: goldColor }]}
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
                  activeOpacity={0.9}
                  disabled={isLoading}
                  style={styles.appleButtonWrapper}
                >
                  <LinearGradient
                    colors={["#000000", "#1A1A1A", "#000000"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.appleButton}
                  >
                    <Ionicons name="logo-apple" size={22} color={COLORS.white} style={styles.buttonIcon} />
                    <Text style={styles.appleButtonText}>Continue with Apple</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </AnimatedView>

              <Animated.View
                entering={FadeIn.delay(1000).duration(400)}
                style={styles.dividerContainer}
              >
                <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
                <Text style={[styles.orText, { color: placeholderColor }]}>or</Text>
                <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
              </Animated.View>
            </>
          )}

          <AnimatedView style={buttonAnimatedStyle}>
            <TouchableOpacity
              onPress={() => handleButtonPress(handleSignIn)}
              activeOpacity={0.9}
              disabled={isLoading}
              style={styles.googleButtonWrapper}
            >
              <View
                style={[
                  styles.googleButton,
                  {
                    backgroundColor: elementBg,
                    borderColor: goldColor,
                    shadowColor: COLORS.shadowBlack,
                  },
                ]}
              >
                <AntDesign
                  name="google"
                  size={22}
                  color={COLORS.googleBlue}
                  style={styles.buttonIcon}
                />
                <Text style={[styles.googleButtonText, { color: textColor }]}>
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
  crossContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  crossIcon: {
    shadowColor: COLORS.goldAccent,
    shadowOpacity: 0.8,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
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
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: COLORS.shadowBlack,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  appleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    minHeight: 56,
  },
  appleButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  googleButtonWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: COLORS.shadowBlack,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1.5,
    minHeight: 56,
  },
  googleButtonText: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  buttonIcon: {
    marginRight: 12,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  orText: {
    fontSize: 14,
    fontWeight: "500",
    marginHorizontal: 16,
    letterSpacing: 0.5,
  },
});


import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import GradientBackground from "@/components/GradientBackground";

export default function CheckInScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const textColor = isDark ? COLORS.textDark : COLORS.textLight;
  const placeholderColor = isDark ? COLORS.placeholderDark : COLORS.placeholderLight;
  const elementBg = isDark ? COLORS.elementDark : COLORS.elementLight;
  const borderColor = isDark ? COLORS.borderDark : COLORS.borderLight;

  const handleStartCheckIn = () => {
    router.push("/checkin-modal/emotions");
  };

  return (
    <GradientBackground useSafeArea={true}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Fixed Header */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={[
            styles.header,
            {
              backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight,
              borderBottomColor: borderColor + "30",
            },
          ]}
        >
          <Text style={[styles.headerTitle, { color: textColor }]}>Check In</Text>
          <Text style={[styles.headerSubtitle, { color: placeholderColor }]}>
            Take a moment to reflect
          </Text>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* Main Card */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(500)}
            style={styles.section}
          >
            <View
              style={[
                styles.mainCard,
                {
                  backgroundColor: elementBg,
                  borderColor: borderColor,
                },
              ]}
            >
              {/* Icon */}
              <Animated.View
                entering={FadeIn.delay(300).duration(400)}
                style={styles.iconContainer}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryLight, COLORS.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconGradient}
                >
                  <Ionicons name="heart" size={48} color={COLORS.white} />
                </LinearGradient>
              </Animated.View>

              {/* Title */}
              <Animated.Text
                entering={FadeInDown.delay(400).duration(500)}
                style={[styles.cardTitle, { color: textColor }]}
              >
                How are you feeling today?
              </Animated.Text>

              {/* Description */}
              <Animated.Text
                entering={FadeInDown.delay(500).duration(500)}
                style={[styles.cardDescription, { color: placeholderColor }]}
              >
                Share what's on your heart and let us guide you with personalized support and encouragement.
              </Animated.Text>

              {/* Benefits List */}
              <Animated.View
                entering={FadeInUp.delay(600).duration(500)}
                style={styles.benefitsContainer}
              >
                <View style={styles.benefitItem}>
                  <View style={[styles.benefitIcon, { backgroundColor: COLORS.tealAccent10 }]}>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  </View>
                  <Text style={[styles.benefitText, { color: textColor }]}>
                    Personalized guidance based on your needs
                  </Text>
                </View>
                <View style={styles.benefitItem}>
                  <View style={[styles.benefitIcon, { backgroundColor: COLORS.coralAccent10 }]}>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
                  </View>
                  <Text style={[styles.benefitText, { color: textColor }]}>
                    Scripture and encouragement tailored to you
                  </Text>
                </View>
                <View style={styles.benefitItem}>
                  <View style={[styles.benefitIcon, { backgroundColor: COLORS.lavenderAccent10 }]}>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.accent} />
                  </View>
                  <Text style={[styles.benefitText, { color: textColor }]}>
                    Track your journey and growth
                  </Text>
                </View>
              </Animated.View>
            </View>
          </Animated.View>

          {/* Start Button */}
          <Animated.View
            entering={FadeInUp.delay(700).duration(500)}
            style={styles.buttonSection}
          >
            <TouchableOpacity
              onPress={handleStartCheckIn}
              activeOpacity={0.85}
              style={styles.startButtonWrapper}
            >
              <LinearGradient
                colors={[COLORS.secondary, COLORS.goldAccent, COLORS.warmth]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.startButton}
              >
                <Ionicons name="arrow-forward" size={24} color={COLORS.white} />
                <Text style={styles.startButtonText}>Start Check In</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Info Card */}
          <Animated.View
            entering={FadeInUp.delay(800).duration(500)}
            style={styles.section}
          >
            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: elementBg,
                  borderColor: borderColor,
                },
              ]}
            >
              <View style={styles.infoRow}>
                <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoTitle, { color: textColor }]}>
                    Your privacy matters
                  </Text>
                  <Text style={[styles.infoDescription, { color: placeholderColor }]}>
                    Your check-in responses are private and help us provide better guidance.
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: FONTS.header,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0.2,
  },
  section: {
    marginBottom: 24,
  },
  mainCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: FONTS.header,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  cardDescription: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    letterSpacing: 0.2,
  },
  benefitsContainer: {
    width: "100%",
    gap: 16,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  benefitText: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
    lineHeight: 22,
  },
  buttonSection: {
    marginBottom: 24,
  },
  startButtonWrapper: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 32,
    gap: 12,
    minHeight: 64,
  },
  startButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
    fontFamily: FONTS.primary,
  },
  infoCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  infoDescription: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    letterSpacing: 0.1,
  },
});

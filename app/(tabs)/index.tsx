import GradientBackground from "@/components/GradientBackground";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDailyVerse } from "@/hooks/useDailyScripture";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuth();
  const router = useRouter();

  const textColor = isDark ? COLORS.textDark : COLORS.textLight;
  const elementBg = isDark ? COLORS.elementDark : COLORS.elementLight;
  const borderColor = isDark ? COLORS.borderDark : COLORS.borderLight;
  const placeholderColor = isDark ? COLORS.placeholderDark : COLORS.placeholderLight;

  // Fetch daily verse
  const { data: verseData, isLoading: verseLoading, error: verseError } = useDailyVerse();

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Use API data or fallback
  const scripture = verseData
    ? {
        verse: verseData.text,
        reference: verseData.reference,
      }
    : {
        verse: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
        reference: "John 3:16",
      };

  const handleTalkToGrace = () => {
    router.push("/chat");
  };

  const handleSettings = () => {
    // Navigate to settings
    // router.push("/settings");
  };

  return (
    <GradientBackground useSafeArea={true}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <View style={[styles.avatar, { backgroundColor: COLORS.primary + "20" }]}>
              <Ionicons name="person" size={20} color={COLORS.primary} />
            </View>
            <Text style={[styles.greeting, { color: textColor }]}>
              {getGreeting()}, {user?.name?.split(" ")[0] || "User"}
            </Text>
          </View>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Scripture of the Day */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(500)}
            style={styles.section}
          >
            <View
              style={[
                styles.scriptureCard,
                {
                  backgroundColor: isDark ? COLORS.backgroundDark : COLORS.elementLight,
                  borderColor: COLORS.gold,
                },
              ]}
            >
              <Text
                style={[
                  styles.scriptureTitle,
                  { color: placeholderColor },
                ]}
              >
                Scripture of the Day
              </Text>
              {verseLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.gold} />
                  <Text style={[styles.loadingText, { color: placeholderColor }]}>
                    Loading scripture...
                  </Text>
                </View>
              ) : verseError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color={COLORS.danger || COLORS.secondary} />
                  <Text style={[styles.errorText, { color: placeholderColor }]}>
                    Unable to load scripture. Showing default.
                  </Text>
                </View>
              ) : (
                <>
                  <Text
                    style={[
                      styles.scriptureVerse,
                      { color: textColor },
                    ]}
                  >
                    {scripture.verse}
                  </Text>
                  <Text
                    style={[
                      styles.scriptureReference,
                      { color: COLORS.gold },
                    ]}
                  >
                    {scripture.reference}
                  </Text>
                </>
              )}
            </View>
          </Animated.View>

          {/* Talk to Grace (AI) Button */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(500)}
            style={styles.section}
          >
            <TouchableOpacity
              onPress={handleTalkToGrace}
              activeOpacity={0.85}
              style={styles.aiButtonWrapper}
            >
              <LinearGradient
                colors={[COLORS.secondary, COLORS.goldAccent, COLORS.warmth]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.aiButton}
              >
                <View style={styles.aiIconContainer}>
                  <Ionicons name="sparkles" size={24} color={COLORS.white} />
                </View>
                <Text style={styles.aiButtonText}>Talk to Grace (AI)</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Quick Actions Section */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(500)}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Quick Actions
            </Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                onPress={() => router.push("/checkin-modal/emotions")}
                activeOpacity={0.8}
                style={[
                  styles.quickActionCard,
                  {
                    backgroundColor: elementBg,
                    borderColor: borderColor,
                  },
                ]}
              >
                <LinearGradient
                  colors={[COLORS.primary + "15", COLORS.accent + "10"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickActionIconContainer}
                >
                  <Ionicons name="heart" size={28} color={COLORS.primary} />
                </LinearGradient>
                <Text style={[styles.quickActionTitle, { color: textColor }]}>
                  Check In
                </Text>
                <Text style={[styles.quickActionSubtitle, { color: placeholderColor }]}>
                  Reflect & grow
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/devotional-modal")}
                activeOpacity={0.8}
                style={[
                  styles.quickActionCard,
                  {
                    backgroundColor: elementBg,
                    borderColor: borderColor,
                  },
                ]}
              >
                <LinearGradient
                  colors={[COLORS.secondary + "15", COLORS.warmth + "10"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickActionIconContainer}
                >
                  <Ionicons name="book" size={28} color={COLORS.secondary} />
                </LinearGradient>
                <Text style={[styles.quickActionTitle, { color: textColor }]}>
                  Devotional
                </Text>
                <Text style={[styles.quickActionSubtitle, { color: placeholderColor }]}>
                  Daily reading
                </Text>
              </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  greeting: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: FONTS.header,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  scriptureCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  scriptureTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scriptureVerse: {
    fontSize: 22,
    lineHeight: 32,
    marginBottom: 16,
    fontFamily: FONTS.header,
    fontWeight: "400",
  },
  scriptureReference: {
    fontSize: 16,
    fontWeight: "600",
    fontStyle: "italic",
  },
  aiButtonWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  aiIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  aiButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: FONTS.header,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: FONTS.header,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
    letterSpacing: 0.1,
  },
  quickActionSubtitle: {
    fontSize: 13,
    fontWeight: "400",
    textAlign: "center",
    letterSpacing: 0.1,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "400",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "400",
    flex: 1,
  },
});

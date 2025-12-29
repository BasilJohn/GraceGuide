import GradientBackground from "@/components/GradientBackground";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDailyScripture } from "@/hooks/useDailyScripture";
import { useMarkDailyComplete, useReadingStatus } from "@/hooks/useReadingStatus";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DevotionalModalScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Fetch daily scripture with devotional
  const { data: scriptureData, isLoading, error } = useDailyScripture();
  
  // Reading status
  const { data: readingStatus } = useReadingStatus();
  const markComplete = useMarkDailyComplete();
  
  // Auto-mark as complete when devotional is viewed
  React.useEffect(() => {
    if (scriptureData && !readingStatus?.completed && !markComplete.isPending) {
      markComplete.mutate();
    }
  }, [scriptureData, readingStatus?.completed]);

  const textColor = isDark ? COLORS.textDark : COLORS.textLight;
  const placeholderColor = isDark ? COLORS.placeholderDark : COLORS.placeholderLight;
  const elementBg = isDark ? COLORS.elementDark : COLORS.elementLight;
  const borderColor = isDark ? COLORS.borderDark : COLORS.borderLight;

  const handleClose = () => {
    router.dismiss();
    setTimeout(() => {
      router.replace("/(tabs)");
    }, 100);
  };

  // Use API data or fallback
  const devotional = scriptureData
    ? {
        verse: scriptureData.text,
        reference: scriptureData.reference,
        title: "Daily Devotional",
        explanation: scriptureData.devotional || "Today's devotional reflection.",
      }
    : {
        verse: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
        reference: "John 3:16",
        title: "God's Unconditional Love",
        explanation: `This verse, often called "the gospel in a nutshell," reveals the heart of Christianity. It speaks of God's profound love for humanity—a love so deep that He was willing to sacrifice His only Son for our salvation.

The phrase "so loved" emphasizes the magnitude and intensity of God's love. It's not a casual affection but a sacrificial, all-encompassing love that extends to the entire world—every person, regardless of background, status, or past mistakes.

The gift of Jesus Christ represents the ultimate expression of this love. Through His death and resurrection, we are offered eternal life—not as something we earn, but as a gift we receive through faith.

This verse reminds us that salvation is available to "whoever believes"—it's inclusive, accessible, and based on faith rather than works. It's an invitation to experience God's love and the promise of eternal life with Him.`,
      };

  return (
    <GradientBackground useSafeArea={false}>
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight }]} edges={['top']}>
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[
            styles.header,
            {
              backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight,
              borderBottomColor: borderColor + "30",
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleClose}
            style={[
              styles.closeButton,
              {
                backgroundColor: isDark
                  ? COLORS.elementDark + "80"
                  : COLORS.elementLight + "80",
              },
            ]}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={22} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Daily Devotional</Text>
          <View style={styles.closeButton} />
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.gold} />
              <Text style={[styles.loadingText, { color: placeholderColor }]}>
                Loading daily devotional...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color={COLORS.danger || COLORS.secondary} />
              <Text style={[styles.errorTitle, { color: textColor }]}>
                Unable to Load Devotional
              </Text>
              <Text style={[styles.errorText, { color: placeholderColor }]}>
                Please check your connection and try again.
              </Text>
            </View>
          ) : (
            <>
              {/* Verse Card */}
              <Animated.View
                entering={FadeInUp.delay(200).duration(500)}
                style={styles.section}
              >
                <View
                  style={[
                    styles.verseCard,
                    {
                      backgroundColor: elementBg,
                      borderColor: COLORS.gold,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.verseTitle,
                      { color: placeholderColor },
                    ]}
                  >
                    Scripture of the Day
                  </Text>
                  <Text
                    style={[
                      styles.verseText,
                      { color: textColor },
                    ]}
                  >
                    {devotional.verse}
                  </Text>
                  <Text
                    style={[
                      styles.verseReference,
                      { color: COLORS.gold },
                    ]}
                  >
                    {devotional.reference}
                  </Text>
                </View>
              </Animated.View>

              {/* Explanation Card */}
              <Animated.View
                entering={FadeInUp.delay(300).duration(500)}
                style={styles.section}
              >
                <View
                  style={[
                    styles.explanationCard,
                    {
                      backgroundColor: elementBg,
                      borderColor: borderColor,
                    },
                  ]}
                >
                  <View style={styles.explanationHeader}>
                    <LinearGradient
                      colors={[COLORS.primary + "15", COLORS.accent + "10"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.titleIconContainer}
                    >
                      <Ionicons name="book" size={24} color={COLORS.primary} />
                    </LinearGradient>
                    <Text style={[styles.explanationTitle, { color: textColor }]}>
                      {devotional.title}
                    </Text>
                  </View>
                  <Text style={[styles.explanationText, { color: textColor }]}>
                    {devotional.explanation}
                  </Text>
                </View>
              </Animated.View>
            </>
          )}
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: FONTS.header,
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  verseCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  verseTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 20,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  verseText: {
    fontSize: 24,
    lineHeight: 36,
    marginBottom: 20,
    fontFamily: FONTS.header,
    fontWeight: "400",
    letterSpacing: 0.2,
  },
  verseReference: {
    fontSize: 18,
    fontWeight: "600",
    fontStyle: "italic",
    letterSpacing: 0.2,
  },
  explanationCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  titleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  explanationTitle: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: FONTS.header,
    letterSpacing: -0.3,
    flex: 1,
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: "400",
    letterSpacing: 0.2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "400",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: FONTS.header,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});



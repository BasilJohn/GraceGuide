import GradientBackground from "@/components/GradientBackground";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface EmotionOption {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const emotions: EmotionOption[] = [
  { id: "loneliness", label: "Loneliness", icon: "person-outline" },
  { id: "fear", label: "Fear", icon: "warning-outline" },
  { id: "anxiety", label: "Anxiety", icon: "pulse-outline" },
  { id: "guilt", label: "Guilt", icon: "alert-circle-outline" },
  { id: "sadness", label: "Sadness", icon: "cloudy-outline" },
  { id: "anger", label: "Anger", icon: "flame-outline" },
  { id: "grief", label: "Grief", icon: "heart-outline" },
  { id: "relationships", label: "Relationships", icon: "people-outline" },
];

export default function CheckInEmotionsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);

  const backgroundColor = isDark ? COLORS.backgroundDark : COLORS.backgroundLight;
  const textColor = isDark ? COLORS.textDark : COLORS.textLight;
  const placeholderColor = isDark ? COLORS.placeholderDark : COLORS.placeholderLight;
  const borderColor = isDark ? COLORS.borderDark : COLORS.borderLight;

  const toggleEmotion = (id: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (selectedEmotions.length > 0) {
      try {
        // Save selected emotions (for check-in, not onboarding)
        await SecureStore.setItemAsync("checkInEmotions", JSON.stringify(selectedEmotions));
        router.push("/checkin-modal/tone");
      } catch (error) {
        router.push("/checkin-modal/tone");
      }
    }
  };

  const handleClose = () => {
    router.dismiss();
    // Navigate to home tab after dismissing
    setTimeout(() => {
      router.replace("/(tabs)");
    }, 100);
  };

  const handleSkip = () => {
    router.push("/checkin-modal/tone");
  };

  return (
    <GradientBackground useSafeArea={false}>
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.header}
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
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipButton}
            activeOpacity={0.6}
          >
            <Text style={[styles.skipText, { color: placeholderColor }]}>Skip</Text>
          </TouchableOpacity>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Question */}
          <Animated.Text
            entering={FadeInDown.delay(200).duration(600)}
            style={[styles.mainQuestion, { color: textColor }]}
          >
            What brings you here?
          </Animated.Text>

          {/* Instructions */}
          <Animated.Text
            entering={FadeInDown.delay(300).duration(600)}
            style={[styles.instructions, { color: placeholderColor }]}
          >
            Select one or more areas to begin your journey.
          </Animated.Text>

          {/* Emotion Grid */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(600)}
            style={styles.emotionGrid}
          >
            {emotions.map((emotion, index) => {
              const isSelected = selectedEmotions.includes(emotion.id);
              return (
                <AnimatedTouchableOpacity
                  key={emotion.id}
                  entering={FadeIn.delay(500 + index * 50).duration(400)}
                  onPress={() => toggleEmotion(emotion.id)}
                  activeOpacity={0.8}
                  style={styles.emotionButtonWrapper}
                >
                  <View
                    style={[
                      styles.emotionButton,
                      {
                        backgroundColor: isSelected
                          ? COLORS.secondary
                          : isDark
                          ? COLORS.elementDark
                          : COLORS.elementLight,
                        borderColor: isSelected
                          ? COLORS.secondary
                          : borderColor,
                        borderWidth: isSelected ? 2 : 1.5,
                      },
                    ]}
                  >
                    <Ionicons
                      name={emotion.icon}
                      size={32}
                      color={
                        isSelected
                          ? COLORS.white
                          : isDark
                          ? COLORS.primaryLight
                          : COLORS.primary
                      }
                    />
                    <Text
                      style={[
                        styles.emotionLabel,
                        {
                          color: isSelected
                            ? COLORS.white
                            : textColor,
                        },
                      ]}
                    >
                      {emotion.label}
                    </Text>
                  </View>
                </AnimatedTouchableOpacity>
              );
            })}
          </Animated.View>
        </ScrollView>

        {/* Continue Button */}
        <Animated.View
          entering={FadeInUp.delay(800).duration(600)}
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            onPress={handleContinue}
            disabled={selectedEmotions.length === 0}
            activeOpacity={0.85}
            style={[
              styles.continueButton,
              selectedEmotions.length === 0 && styles.continueButtonDisabled,
            ]}
          >
            <LinearGradient
              colors={
                selectedEmotions.length > 0
                  ? [COLORS.secondary, COLORS.goldAccent, COLORS.warmth]
                  : [COLORS.borderDark, COLORS.borderDark]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -4,
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100,
  },
  mainQuestion: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
    fontFamily: FONTS.header,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 40,
  },
  instructions: {
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0.2,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
  },
  emotionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  emotionButtonWrapper: {
    width: (width - 48 - 16) / 2, // 2 columns with gap
    marginBottom: 16,
  },
  emotionButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 20,
    minHeight: 120,
    shadowColor: COLORS.shadowBlack,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  emotionLabel: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
    marginTop: 12,
    textAlign: "center",
    fontFamily: FONTS.primary,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
  },
  continueButton: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: COLORS.shadowBlack,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.3,
    fontFamily: FONTS.primary,
  },
});


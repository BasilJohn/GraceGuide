import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import {
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
import GradientBackground from "@/components/GradientBackground";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface ToneOption {
  id: string;
  title: string;
  description: string;
}

const toneOptions: ToneOption[] = [
  {
    id: "biblical",
    title: "Deeply Biblical",
    description: "Scripture-first, classic Christian design.",
  },
  {
    id: "balanced",
    title: "Balanced Christian",
    description: "Mix of spiritual + emotional support.",
  },
  {
    id: "gentle",
    title: "Gentle Spiritual Comfort",
    description: "Soft encouragement, calm.",
  },
];

export default function ToneSelectorScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [selectedTone, setSelectedTone] = useState<string>("biblical");

  const backgroundColor = isDark ? COLORS.backgroundDark : COLORS.backgroundLight;
  const textColor = isDark ? COLORS.textDark : COLORS.textLight;
  const placeholderColor = isDark ? COLORS.placeholderDark : COLORS.placeholderLight;
  const borderColor = isDark ? COLORS.borderDark : COLORS.borderLight;

  const handleContinue = async () => {
    try {
      // Mark onboarding as completed
      await SecureStore.setItemAsync("onboardingCompleted", "true");
      // Store selected tone preference
      await SecureStore.setItemAsync("preferredTone", selectedTone);
      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      // Still navigate even if save fails
      router.replace("/(tabs)");
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // If no previous screen, navigate to home
      router.replace("/(tabs)");
    }
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
            onPress={handleBack}
            style={[
              styles.backButton,
              {
                backgroundColor: isDark
                  ? COLORS.elementDark + "80"
                  : COLORS.elementLight + "80",
              },
            ]}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: placeholderColor }]}>
            Choose preferred guidance tone
          </Text>
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
            How would you like your guidance?
          </Animated.Text>

          {/* Tone Options */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            style={styles.optionsContainer}
          >
            {toneOptions.map((option, index) => {
              const isSelected = selectedTone === option.id;
              return (
                <AnimatedTouchableOpacity
                  key={option.id}
                  entering={FadeIn.delay(400 + index * 100).duration(400)}
                  onPress={() => setSelectedTone(option.id)}
                  activeOpacity={0.8}
                  style={styles.optionWrapper}
                >
                  <View
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: isSelected
                          ? COLORS.coralAccent10
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
                    <View style={styles.optionContent}>
                      <View style={styles.optionTextContainer}>
                        <Text
                          style={[
                            styles.optionTitle,
                        {
                          color: isSelected
                            ? COLORS.secondary
                            : textColor,
                        },
                      ]}
                    >
                      {option.title}
                    </Text>
                    <Text
                      style={[
                        styles.optionDescription,
                        {
                          color: isSelected
                            ? COLORS.secondary
                            : placeholderColor,
                        },
                      ]}
                    >
                          {option.description}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.radioButton,
                          {
                            borderColor: isSelected
                              ? COLORS.secondary
                              : borderColor,
                            backgroundColor: isSelected
                              ? COLORS.secondary
                              : "transparent",
                          },
                        ]}
                      >
                        {isSelected && (
                          <View style={styles.radioButtonInner} />
                        )}
                      </View>
                    </View>
                  </View>
                </AnimatedTouchableOpacity>
              );
            })}
          </Animated.View>
        </ScrollView>

        {/* Continue Button */}
        <Animated.View
          entering={FadeInUp.delay(700).duration(600)}
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            onPress={handleContinue}
            activeOpacity={0.85}
            style={styles.continueButton}
          >
            <LinearGradient
              colors={[COLORS.secondary, COLORS.goldAccent, COLORS.warmth]}
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
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.3,
    flex: 1,
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
    marginBottom: 40,
    lineHeight: 40,
  },
  optionsContainer: {
    gap: 16,
  },
  optionWrapper: {
    marginBottom: 4,
  },
  optionButton: {
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.shadowBlack,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.2,
    marginBottom: 6,
    fontFamily: FONTS.primary,
  },
  optionDescription: {
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.white,
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


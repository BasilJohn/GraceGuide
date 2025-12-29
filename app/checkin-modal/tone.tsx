import GradientBackground from "@/components/GradientBackground";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useGraceGuideAPI } from "@/hooks/useGraceGuideAPI";
import { sendChatMessage } from "@/lib/appApi";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
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

export default function CheckInToneScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [selectedTone, setSelectedTone] = useState<string>("biblical");
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitCheckIn } = useGraceGuideAPI();

  const backgroundColor = isDark ? COLORS.backgroundDark : COLORS.backgroundLight;
  const textColor = isDark ? COLORS.textDark : COLORS.textLight;
  const placeholderColor = isDark ? COLORS.placeholderDark : COLORS.placeholderLight;
  const borderColor = isDark ? COLORS.borderDark : COLORS.borderLight;

  // Load emotions from previous screen
  useEffect(() => {
    const loadEmotions = async () => {
      try {
        const emotionsJson = await SecureStore.getItemAsync("checkInEmotions");
        if (emotionsJson) {
          const emotions = JSON.parse(emotionsJson);
          setSelectedEmotions(emotions);
        }
      } catch (error) {
        console.error("Failed to load emotions:", error);
      }
    };
    loadEmotions();
  }, []);

  const handleContinue = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    // Always save check-in data locally first
    try {
      await SecureStore.setItemAsync("checkInTone", selectedTone);
      if (selectedEmotions.length > 0) {
        await SecureStore.setItemAsync("checkInEmotions", JSON.stringify(selectedEmotions));
      }
    } catch (localError) {
      console.error("Failed to save check-in locally:", localError);
    }

    // Try to submit to API (but don't block if it fails)
    let apiSuccess = false;
    if (selectedEmotions.length > 0) {
      try {
        await submitCheckIn(
          selectedEmotions as any,
          selectedTone as any
        );
        apiSuccess = true;
      } catch (error: any) {
        console.error("Failed to submit check-in to API:", error);
        // Check if it's a network error
        const isNetworkError = error.message?.includes('Network Error') || 
                              error.code === 'ERR_NETWORK' ||
                              !error.response;
        
        if (isNetworkError) {
          // Network error - backend might not be running
          console.warn("Backend API not available. Check-in saved locally only.");
        } else {
          // Other API error
          console.warn("API error:", error.response?.status, error.response?.data);
        }
        // Continue anyway - data is saved locally
      }
    }

    // Fetch initial AI response based on check-in data
    // This will be displayed in the chat screen
    if (selectedEmotions.length > 0) {
      try {
        // Create a message that references the check-in
        const emotionLabels: { [key: string]: string } = {
          loneliness: "lonely",
          fear: "afraid",
          anxiety: "anxious",
          guilt: "guilty",
          sadness: "sad",
          anger: "angry",
          grief: "grieving",
          relationships: "struggling with relationships",
        };
        
        const emotionText = selectedEmotions
          .map((e) => emotionLabels[e] || e)
          .join(", ");
        
        const initialMessage = `I just completed my check-in. I'm feeling ${emotionText}. Can you help me?`;
        
        // Send message to API with context
        const chatResponse = await sendChatMessage({
          message: initialMessage,
          includeContext: true, // This will use the check-in data
        });
        
        // Store the response to display in chat screen (include the user message too)
        await SecureStore.setItemAsync(
          "pendingChatResponse",
          JSON.stringify({
            userMessage: initialMessage,
            response: chatResponse.response,
            conversationId: chatResponse.conversationId,
          })
        );
        
        // Store conversation ID for future messages
        if (chatResponse.conversationId) {
          await SecureStore.setItemAsync("currentConversationId", chatResponse.conversationId);
        }
      } catch (error: any) {
        console.error("Failed to fetch initial chat response:", error);
        // Continue anyway - user can still chat
      }
    }

    // Clear the emotions from SecureStore after processing
    await SecureStore.deleteItemAsync("checkInEmotions");

    // Navigate to chat regardless of API success/failure
    // Dismiss the check-in modal first
    router.dismiss();
    // Navigate to chat after modal dismisses
    setTimeout(() => {
      router.push("/chat");
    }, 500);
    
    setIsSubmitting(false);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.dismiss();
      // Navigate to home tab after dismissing
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 100);
    }
  };

  const handleClose = () => {
    router.dismiss();
    // Navigate to home tab after dismissing
    setTimeout(() => {
      router.replace("/(tabs)");
    }, 100);
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
            disabled={isSubmitting}
            activeOpacity={0.85}
            style={[styles.continueButton, isSubmitting && styles.continueButtonDisabled]}
          >
            <LinearGradient
              colors={
                isSubmitting
                  ? [COLORS.borderDark, COLORS.borderDark]
                  : [COLORS.secondary, COLORS.goldAccent, COLORS.warmth]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueButtonGradient}
            >
              {isSubmitting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.white} />
                  <Text style={styles.continueButtonText}>Saving...</Text>
                </View>
              ) : (
                <Text style={styles.continueButtonText}>Done</Text>
              )}
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
    justifyContent: "space-between",
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
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: -4,
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
  continueButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});


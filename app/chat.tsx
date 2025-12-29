import GradientBackground from "@/components/GradientBackground";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useGraceGuideAPI } from "@/hooks/useGraceGuideAPI";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  verse?: {
    reference: string;
    text: string;
    translation?: string;
  };
}

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

// Typing Dot Component with Animation
function TypingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 400 }),
        withTiming(1, { duration: 400 })
      ),
      -1,
      true
    );
    translateY.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 400 }),
        withTiming(0, { duration: 400 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.typingDot,
        {
          backgroundColor: COLORS.primary,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function ChatScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const { sendChatMessage } = useGraceGuideAPI();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isLoadingInitialMessage, setIsLoadingInitialMessage] = useState(true);
  const [suggestions, setSuggestions] = useState([
    "I'm feeling anxious",
    "I need encouragement",
    "Share a verse about hope",
    "Help me with forgiveness",
  ]);

  const textColor = isDark ? COLORS.textDark : COLORS.textLight;
  const placeholderColor = isDark ? COLORS.placeholderDark : COLORS.placeholderLight;
  const elementBg = isDark ? COLORS.elementDark : COLORS.elementLight;
  const borderColor = isDark ? COLORS.borderDark : COLORS.borderLight;
  const inputBg = isDark ? COLORS.elementDark : COLORS.elementLight;

  // Animation values
  const typingOpacity = useSharedValue(0);
  const inputScale = useSharedValue(1);
  const sendButtonScale = useSharedValue(1);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  // Load conversation ID and pending chat response on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load conversation ID
        const savedId = await SecureStore.getItemAsync("currentConversationId");
        if (savedId) {
          setConversationId(savedId);
        }

        // Check for pending chat response from check-in
        const pendingResponse = await SecureStore.getItemAsync("pendingChatResponse");
        if (pendingResponse) {
          const { userMessage: userMsgText, response, conversationId: convId } = JSON.parse(pendingResponse);
          
          // Set conversation ID if available
          if (convId) {
            setConversationId(convId);
            await SecureStore.setItemAsync("currentConversationId", convId);
          }

          // Create user message (the check-in message)
          const userMessage: Message = {
            id: `user_${Date.now()}`,
            text: userMsgText || "I just completed my check-in. Can you help me?",
            isUser: true,
            timestamp: new Date(),
          };

          // Create AI response message
          const aiMessage: Message = {
            id: response.id || `ai_${Date.now()}`,
            text: response.text,
            isUser: false,
            timestamp: new Date(response.timestamp),
            verse: response.verse,
          };

          // Set messages with both user and AI response
          setMessages([userMessage, aiMessage]);

          // Clear the pending response
          await SecureStore.deleteItemAsync("pendingChatResponse");
        } else {
          // No pending response - show default welcome message
          setMessages([
            {
              id: "1",
              text: "Hello! I'm Grace, your AI companion. I'm here to provide guidance, share scripture, and support you on your spiritual journey. How can I help you today?",
              isUser: false,
              timestamp: new Date(),
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
        // Fallback to default welcome message
        setMessages([
          {
            id: "1",
            text: "Hello! I'm Grace, your AI companion. I'm here to provide guidance, share scripture, and support you on your spiritual journey. How can I help you today?",
            isUser: false,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoadingInitialMessage(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    // Typing indicator animation
    if (isTyping) {
      typingOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.3, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      typingOpacity.value = withTiming(0);
    }
  }, [isTyping]);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputText.trim();
    setInputText("");
    setIsTyping(true);
    Keyboard.dismiss();

    try {
      // Send message to API
      const response = await sendChatMessage(
        messageToSend,
        conversationId,
        true // includeContext
      );

      // Update conversation ID if this is a new conversation
      if (response.conversationId && !conversationId) {
        setConversationId(response.conversationId);
        // Optionally save to SecureStore for persistence
        await SecureStore.setItemAsync("currentConversationId", response.conversationId);
      }

      // Add AI response to messages
      const aiResponse: Message = {
        id: response.response.id,
        text: response.response.text,
        isUser: false,
        timestamp: new Date(response.response.timestamp),
        verse: response.response.verse,
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error: any) {
      console.error("Failed to send message:", error);
      
      // Show error message to user
      const errorMessage = error.message || "Failed to send message. Please try again.";
      Alert.alert("Error", errorMessage, [{ text: "OK" }]);
      
      // Optionally remove the user message if sending failed
      // setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInputText(suggestion);
  };

  const handleBack = () => {
    router.dismiss();
    setTimeout(() => {
      router.replace("/(tabs)");
    }, 100);
  };

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
  }));

  const sendButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendButtonScale.value }],
  }));

  const typingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: typingOpacity.value,
  }));

  const handleInputFocus = () => {
    inputScale.value = withSpring(1.02);
  };

  const handleInputBlur = () => {
    inputScale.value = withSpring(1);
  };

  const handleSendPress = () => {
    if (!inputText.trim()) return;
    
    // Animate button press
    sendButtonScale.value = withSequence(
      withSpring(0.9, { duration: 100 }),
      withSpring(1, { duration: 100 })
    );
    
    // Call handleSend after a short delay to allow animation
    setTimeout(() => {
      handleSend();
    }, 150);
  };

  return (
    <GradientBackground useSafeArea={false}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
        >
          {/* Fixed Header */}
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

            <View style={styles.headerCenter}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryLight, COLORS.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerIcon}
              >
                <Ionicons name="sparkles" size={20} color={COLORS.white} />
              </LinearGradient>
              <View>
                <Text style={[styles.headerTitle, { color: textColor }]}>Grace</Text>
                <Text style={[styles.headerSubtitle, { color: placeholderColor }]}>
                  AI Companion
                </Text>
              </View>
            </View>

            <View style={styles.backButton} />
          </Animated.View>

          {/* Messages Area */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Welcome Message */}
            {messages.map((message, index) => (
              <Animated.View
                key={message.id}
                entering={FadeInUp.delay(index * 100).duration(400)}
                style={[
                  styles.messageWrapper,
                  message.isUser ? styles.userMessageWrapper : styles.aiMessageWrapper,
                ]}
              >
                {!message.isUser && (
                  <View style={styles.aiAvatar}>
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.primaryLight, COLORS.accent]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.avatarGradient}
                    >
                      <Ionicons name="sparkles" size={16} color={COLORS.white} />
                    </LinearGradient>
                  </View>
                )}

                <View
                  style={[
                    styles.messageBubble,
                    message.isUser
                      ? [styles.userBubble, { backgroundColor: COLORS.secondary }]
                      : [
                          styles.aiBubble,
                          {
                            backgroundColor: elementBg,
                            borderColor: borderColor,
                          },
                        ],
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      {
                        color: message.isUser ? COLORS.white : textColor,
                      },
                    ]}
                  >
                    {message.text}
                  </Text>

                  {message.verse && (
                    <Animated.View
                      entering={FadeIn.delay(300).duration(400)}
                      style={[
                        styles.verseCard,
                        {
                          backgroundColor: isDark
                            ? COLORS.backgroundDark
                            : COLORS.backgroundLight,
                          borderColor: COLORS.gold,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.verseText,
                          {
                            color: textColor,
                          },
                        ]}
                      >
                        {message.verse.text}
                      </Text>
                      <Text
                        style={[
                          styles.verseReference,
                          {
                            color: COLORS.gold,
                          },
                        ]}
                      >
                        {message.verse.reference}
                      </Text>
                    </Animated.View>
                  )}
                </View>
              </Animated.View>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <Animated.View
                style={[styles.typingIndicator, typingAnimatedStyle]}
                entering={FadeIn.duration(300)}
              >
                <View style={styles.aiAvatar}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryLight, COLORS.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.avatarGradient}
                  >
                    <Ionicons name="sparkles" size={16} color={COLORS.white} />
                  </LinearGradient>
                </View>
                <View
                  style={[
                    styles.typingBubble,
                    {
                      backgroundColor: elementBg,
                      borderColor: borderColor,
                    },
                  ]}
                >
                  <View style={styles.typingDots}>
                    {[0, 1, 2].map((i) => (
                      <TypingDot key={i} delay={i * 150} />
                    ))}
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Suggestions (only show if no messages beyond welcome and not loading initial) */}
            {messages.length === 1 && !isTyping && !isLoadingInitialMessage && (
              <Animated.View
                entering={FadeInUp.delay(500).duration(500)}
                style={styles.suggestionsContainer}
              >
                <Text style={[styles.suggestionsTitle, { color: placeholderColor }]}>
                  Try asking:
                </Text>
                <View style={styles.suggestionsGrid}>
                  {suggestions.map((suggestion, index) => (
                    <Animated.View
                      key={index}
                      entering={FadeIn.delay(600 + index * 100).duration(400)}
                    >
                      <TouchableOpacity
                        onPress={() => handleSuggestion(suggestion)}
                        style={[
                          styles.suggestionChip,
                          {
                            backgroundColor: elementBg,
                            borderColor: borderColor,
                          },
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.suggestionText, { color: textColor }]}>
                          {suggestion}
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>
              </Animated.View>
            )}
          </ScrollView>

          {/* Input Area */}
          <Animated.View
            style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight,
                borderTopColor: borderColor + "30",
                paddingBottom: Math.max(insets.bottom, 20),
              },
              inputAnimatedStyle,
            ]}
          >
            <Animated.View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: inputBg,
                  borderColor: borderColor,
                },
              ]}
            >
              <TextInput
                style={[styles.textInput, { color: textColor }]}
                placeholder="Type your message..."
                placeholderTextColor={placeholderColor}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onSubmitEditing={handleSend}
              />
              <Animated.View style={sendButtonAnimatedStyle}>
                <TouchableOpacity
                  onPress={handleSendPress}
                  disabled={!inputText.trim()}
                  activeOpacity={0.7}
                  style={[
                    styles.sendButton,
                    {
                      backgroundColor: inputText.trim()
                        ? COLORS.secondary
                        : borderColor,
                    },
                  ]}
                >
                  <Ionicons
                    name="send"
                    size={20}
                    color={inputText.trim() ? COLORS.white : placeholderColor}
                  />
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    justifyContent: "center",
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: FONTS.header,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "400",
    letterSpacing: 0.2,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  messageWrapper: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  userMessageWrapper: {
    justifyContent: "flex-end",
  },
  aiMessageWrapper: {
    justifyContent: "flex-start",
  },
  aiAvatar: {
    marginRight: 8,
    marginBottom: 4,
  },
  avatarGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 16,
    borderRadius: 20,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "400",
    letterSpacing: 0.2,
  },
  verseCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  verseText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: "italic",
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  verseReference: {
    fontSize: 14,
    fontWeight: "600",
    fontStyle: "italic",
    letterSpacing: 0.2,
  },
  typingIndicator: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  typingBubble: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  typingDots: {
    flexDirection: "row",
    gap: 6,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  suggestionsContainer: {
    marginTop: 24,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  suggestionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    minHeight: 56,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 96,
    letterSpacing: 0.1,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});


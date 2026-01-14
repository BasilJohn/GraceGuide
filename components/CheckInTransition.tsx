import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const inspirationalMessages = [
  "Preparing your personalized guidance...",
  "Grace is crafting something special for you...",
  "Connecting you with wisdom and comfort...",
  "Your journey of faith begins now...",
];

const verses = [
  {
    text: "For I know the plans I have for you, declares the Lord",
    reference: "Jeremiah 29:11",
  },
  {
    text: "Cast all your anxiety on him because he cares for you",
    reference: "1 Peter 5:7",
  },
  {
    text: "The Lord is close to the brokenhearted",
    reference: "Psalm 34:18",
  },
  {
    text: "Come to me, all you who are weary and burdened",
    reference: "Matthew 11:28",
  },
];

interface CheckInTransitionProps {
  onComplete: () => void;
}

export default function CheckInTransition({ onComplete }: CheckInTransitionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  
  const textColor = isDark ? COLORS.textDark : COLORS.textLight;
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [showVerse, setShowVerse] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let messageTimer: NodeJS.Timeout | null = null;
    let verseTimer: NodeJS.Timeout | null = null;
    let completeTimer: NodeJS.Timeout | null = null;

    try {
      // Cycle through messages
      let messageIndex = 0;
      const cycleMessages = () => {
        if (!isMounted) return;
        
        messageTimer = setTimeout(() => {
          if (isMounted) {
            messageIndex = (messageIndex + 1) % inspirationalMessages.length;
            setCurrentMessageIndex(messageIndex);
            cycleMessages();
          }
        }, 2000);
      };
      
      cycleMessages();

      // Show verse after 2 seconds
      verseTimer = setTimeout(() => {
        if (isMounted) {
          setShowVerse(true);
          // Cycle verse after showing
          setTimeout(() => {
            if (isMounted) {
              setCurrentVerseIndex((prev) => (prev + 1) % verses.length);
            }
          }, 2000);
        }
      }, 2000);

      // Complete after 5 seconds
      completeTimer = setTimeout(() => {
        if (isMounted) {
          try {
            onComplete();
          } catch (error) {
            console.error("Error in onComplete:", error);
          }
        }
      }, 5000);

      return () => {
        isMounted = false;
        if (messageTimer) {
          clearTimeout(messageTimer);
        }
        if (verseTimer) {
          clearTimeout(verseTimer);
        }
        if (completeTimer) {
          clearTimeout(completeTimer);
        }
      };
    } catch (error) {
      console.error("Error setting up transition:", error);
      // Fallback: complete after 1 second
      const fallbackTimer = setTimeout(() => {
        if (isMounted) {
          try {
            onComplete();
          } catch (err) {
            console.error("Error in fallback onComplete:", err);
          }
        }
      }, 1000);
      
      return () => {
        isMounted = false;
        clearTimeout(fallbackTimer);
      };
    }
  }, [onComplete]);

  const currentMessage = inspirationalMessages[currentMessageIndex] || inspirationalMessages[0];
  const currentVerse = verses[currentVerseIndex] || verses[0];

  try {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight }]}>
        <LinearGradient
          colors={
            isDark
              ? [COLORS.backgroundDark, COLORS.primaryDark + "20", COLORS.backgroundDark]
              : [COLORS.backgroundLight, COLORS.tealAccent10, COLORS.backgroundLight]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Sparkle Icon */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight, COLORS.accent, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Ionicons name="sparkles" size={64} color={COLORS.white} />
          </LinearGradient>
        </View>

        {/* Message */}
        <View style={styles.messageContainer}>
          <Text style={[styles.messageText, { color: textColor }]}>
            {currentMessage}
          </Text>
        </View>

        {/* Verse Display */}
        {showVerse && (
          <View style={styles.verseContainer}>
            <Text style={[styles.verseText, { color: textColor }]}>
              "{currentVerse.text}"
            </Text>
            <Text style={[styles.verseReference, { color: COLORS.secondary }]}>
              — {currentVerse.reference}
            </Text>
          </View>
        )}

        {/* Decorative Elements */}
        <View style={styles.decorativeContainer}>
          <View style={[styles.decorativeCircle, { backgroundColor: COLORS.primary + "15" }]} />
          <View style={[styles.decorativeCircle, styles.decorativeCircle2, { backgroundColor: COLORS.secondary + "10" }]} />
        </View>
      </View>
    );
  } catch (error) {
    console.error("Error rendering CheckInTransition:", error);
    // Return minimal fallback
    return (
      <View style={[styles.container, { backgroundColor: COLORS.backgroundDark }]}>
        <Text style={{ color: COLORS.textDark, fontSize: 18 }}>Loading...</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  messageContainer: {
    marginBottom: 32,
    minHeight: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  messageText: {
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.3,
    textAlign: "center",
    fontFamily: FONTS.primary,
  },
  verseContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    minHeight: 100,
  },
  verseText: {
    fontSize: 20,
    fontWeight: "500",
    letterSpacing: 0.2,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 12,
    lineHeight: 28,
    fontFamily: FONTS.primary,
  },
  verseReference: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
    textAlign: "center",
    fontFamily: FONTS.primary,
  },
  decorativeContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
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

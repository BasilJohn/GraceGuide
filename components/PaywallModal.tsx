import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

const DEFAULT_LIMIT = 3;

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  /** Used for title/copy when provided (from API) */
  used?: number;
  limit?: number;
  remaining?: number;
}

export function PaywallModal({
  visible,
  onClose,
  used,
  limit = DEFAULT_LIMIT,
  remaining = 0,
}: PaywallModalProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const textColor = isDark ? COLORS.textDark : COLORS.textLight;
  const placeholderColor = isDark ? COLORS.placeholderDark : COLORS.placeholderLight;
  const elementBg = isDark ? COLORS.elementDark : COLORS.elementLight;
  const borderColor = isDark ? COLORS.borderDark : COLORS.borderLight;

  const handleUpgrade = () => {
    onClose();
    router.dismiss();
    setTimeout(() => {
      router.push("/paywall");
    }, 150);
  };

  const title = `You've used your ${limit} free message${limit === 1 ? '' : 's'}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          entering={FadeInUp.duration(280)}
          style={[
            styles.card,
            {
              backgroundColor: elementBg,
              borderColor: borderColor,
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.iconRow}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryLight, COLORS.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <Ionicons name="sparkles" size={32} color={COLORS.white} />
            </LinearGradient>
          </View>
          <Text style={[styles.title, { color: textColor }]}>
            {title}
          </Text>
          <Text style={[styles.description, { color: placeholderColor }]}>
            Upgrade to Premium for unlimited conversations with Grace and full
            access to all features.
          </Text>

          <TouchableOpacity
            onPress={handleUpgrade}
            activeOpacity={0.85}
            style={styles.upgradeButton}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryLight, COLORS.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.upgradeGradient}
            >
              <Ionicons name="diamond-outline" size={20} color={COLORS.white} />
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            style={[styles.notNowButton, { borderColor: borderColor }]}
          >
            <Text style={[styles.notNowText, { color: placeholderColor }]}>
              Not now
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    alignItems: "center",
  },
  iconRow: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: FONTS.header,
    letterSpacing: -0.3,
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  upgradeButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  upgradeGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
    letterSpacing: 0.2,
  },
  notNowButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 12,
  },
  notNowText: {
    fontSize: 15,
    fontWeight: "500",
  },
});

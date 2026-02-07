import GradientBackground from "@/components/GradientBackground";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { PRICING } from "@/constants/pricing";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaywallScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [purchasing, setPurchasing] = useState<"monthly" | "yearly" | null>(null);

  const textColor = isDark ? COLORS.textDark : COLORS.textLight;
  const placeholderColor = isDark ? COLORS.placeholderDark : COLORS.placeholderLight;
  const elementBg = isDark ? COLORS.elementDark : COLORS.elementLight;
  const borderColor = isDark ? COLORS.borderDark : COLORS.borderLight;

  const handleSelectPlan = async (plan: "monthly" | "yearly") => {
    setPurchasing(plan);
    try {
      // TODO: Wire to your payment provider (Stripe, RevenueCat, in-app purchase)
      // Example: await purchaseSubscription(plan);
      await new Promise((r) => setTimeout(r, 800));
      Alert.alert(
        "Coming soon",
        `Premium ${plan === "monthly" ? "monthly" : "yearly"} purchase will be available here. Connect your payment provider to enable.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setPurchasing(null);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <GradientBackground useSafeArea={false}>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[styles.header, { borderBottomColor: borderColor + "30" }]}
        >
          <TouchableOpacity
            onPress={handleBack}
            style={[styles.backButton, { backgroundColor: elementBg + "CC" }]}
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
            <Text style={[styles.headerTitle, { color: textColor }]}>
              Premium
            </Text>
          </View>
          <View style={styles.backButton} />
        </Animated.View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInUp.delay(100).duration(400)}
            style={styles.hero}
          >
            <Text style={[styles.heroTitle, { color: textColor }]}>
              Unlock Grace
            </Text>
            <Text style={[styles.heroSubtitle, { color: placeholderColor }]}>
              Unlimited chat with Grace, daily scripture, devotionals, and full
              access to all features.
            </Text>
          </Animated.View>

          {/* Yearly plan - recommended */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(400)}
            style={styles.planCardWrapper}
          >
            <TouchableOpacity
              onPress={() => handleSelectPlan("yearly")}
              activeOpacity={0.85}
              disabled={!!purchasing}
              style={[
                styles.planCard,
                {
                  backgroundColor: elementBg,
                  borderColor: COLORS.primary,
                  borderWidth: 2,
                },
              ]}
            >
              <View style={styles.planRow}>
                <View style={styles.planLabelBlock}>
                  <View style={styles.planLabelRow}>
                    <Text style={[styles.planLabel, { color: textColor }]}>
                      {PRICING.yearly.label}
                    </Text>
                    {PRICING.yearly.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{PRICING.yearly.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.planPerMonth, { color: placeholderColor }]}>
                    {PRICING.yearly.perMonthLabel} · billed annually
                  </Text>
                </View>
                <View style={styles.planPriceBlock}>
                  <Text style={[styles.planPrice, { color: COLORS.primary }]}>
                    {PRICING.yearly.priceLabel}
                  </Text>
                  <Text style={[styles.planInterval, { color: placeholderColor }]}>
                    /year
                  </Text>
                </View>
              </View>
              {purchasing === "yearly" ? (
                <ActivityIndicator color={COLORS.primary} style={styles.planLoader} />
              ) : (
                <Text style={[styles.planCta, { color: COLORS.primary }]}>
                  Select plan
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Monthly plan */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(400)}
            style={styles.planCardWrapper}
          >
            <TouchableOpacity
              onPress={() => handleSelectPlan("monthly")}
              activeOpacity={0.85}
              disabled={!!purchasing}
              style={[
                styles.planCard,
                {
                  backgroundColor: elementBg,
                  borderColor: borderColor,
                },
              ]}
            >
              <View style={styles.planRow}>
                <View style={styles.planLabelBlock}>
                  <Text style={[styles.planLabel, { color: textColor }]}>
                    {PRICING.monthly.label}
                  </Text>
                  <Text style={[styles.planPerMonth, { color: placeholderColor }]}>
                    {PRICING.monthly.perMonthLabel}
                  </Text>
                </View>
                <View style={styles.planPriceBlock}>
                  <Text style={[styles.planPrice, { color: textColor }]}>
                    {PRICING.monthly.priceLabel}
                  </Text>
                  <Text style={[styles.planInterval, { color: placeholderColor }]}>
                    /month
                  </Text>
                </View>
              </View>
              {purchasing === "monthly" ? (
                <ActivityIndicator color={COLORS.primary} style={styles.planLoader} />
              ) : (
                <Text style={[styles.planCta, { color: textColor }]}>
                  Select plan
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Text style={[styles.footer, { color: placeholderColor }]}>
            Cancel anytime. Subscription renews automatically unless cancelled.
          </Text>

          <View style={styles.legalRow}>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://www.mygraceguide.app/terms")}
              activeOpacity={0.7}
            >
              <Text style={[styles.legalLink, { color: placeholderColor }]}>
                Terms of Use
              </Text>
            </TouchableOpacity>
            <Text style={[styles.legalBullet, { color: placeholderColor }]}>
              •
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://www.mygraceguide.app/privacy")}
              activeOpacity={0.7}
            >
              <Text style={[styles.legalLink, { color: placeholderColor }]}>
                Privacy Policy
              </Text>
            </TouchableOpacity>
          </View>
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
    gap: 10,
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
  },
  hero: {
    marginBottom: 28,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "700",
    fontFamily: FONTS.header,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  planCardWrapper: {
    marginBottom: 16,
  },
  planCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    minHeight: 100,
    justifyContent: "center",
  },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  planLabelBlock: {
    flex: 1,
  },
  planLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  planLabel: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: FONTS.header,
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: 0.2,
  },
  planPerMonth: {
    fontSize: 14,
    marginTop: 4,
  },
  planPriceBlock: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  planPrice: {
    fontSize: 22,
    fontWeight: "700",
  },
  planInterval: {
    fontSize: 14,
    marginLeft: 2,
  },
  planCta: {
    fontSize: 15,
    fontWeight: "600",
  },
  planLoader: {
    marginTop: 4,
  },
  footer: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 24,
    lineHeight: 20,
  },
  legalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 8,
    flexWrap: "wrap",
  },
  legalLink: {
    fontSize: 13,
    textDecorationLine: "underline",
    fontWeight: "500",
  },
  legalBullet: {
    fontSize: 13,
    fontWeight: "600",
  },
});

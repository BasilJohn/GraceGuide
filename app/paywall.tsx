import GradientBackground from "@/components/GradientBackground";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { PRICING } from "@/constants/pricing";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRevenueCat } from "@/hooks/useRevenueCat";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
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
  const {
    offerings,
    isLoading: rcLoading,
    purchasePackage: purchaseRC,
    restorePurchases: restoreRC,
    isConfigured: isRevenueCatConfigured,
  } = useRevenueCat();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [purchasing, setPurchasing] = useState<"monthly" | "yearly" | null>(null);
  const [restoring, setRestoring] = useState(false);

  const monthlyPkg = offerings?.monthly ?? null;
  const annualPkg = offerings?.annual ?? null;

  const textColor = isDark ? COLORS.textDark : COLORS.textLight;
  const placeholderColor = isDark ? COLORS.placeholderDark : COLORS.placeholderLight;
  const elementBg = isDark ? COLORS.elementDark : COLORS.elementLight;
  const borderColor = isDark ? COLORS.borderDark : COLORS.borderLight;

  const loadingOfferings =
    Platform.OS !== "web" &&
    isRevenueCatConfigured &&
    !offerings &&
    rcLoading;

  const handleSelectPlan = async (plan: "monthly" | "yearly") => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Mobile only",
        "Subscriptions are purchased through the App Store or Google Play. Open GraceGuide on your phone to subscribe."
      );
      return;
    }

    const pkg = plan === "monthly" ? monthlyPkg : annualPkg;
    if (!pkg) {
      Alert.alert(
        "Unavailable",
        "Could not load subscription options. Check your connection, RevenueCat offering (monthly & annual packages), and try again."
      );
      return;
    }

    setPurchasing(plan);
    try {
      const result = await purchaseRC(pkg);
      if (result.success) {
        Alert.alert("Welcome to Premium", "Thank you for supporting GraceGuide.", [
          {
            text: "OK",
            onPress: () => {
              if (router.canGoBack()) router.back();
              else router.replace("/(tabs)");
            },
          },
        ]);
      } else if (result.error !== "Purchase cancelled") {
        Alert.alert("Purchase failed", result.error ?? "Something went wrong. Please try again.");
      }
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Mobile only",
        "Restore purchases is available in the iOS or Android app."
      );
      return;
    }
    setRestoring(true);
    try {
      const result = await restoreRC();
      if (result.success) {
        Alert.alert("Restored", "Your Premium access is active.", [
          {
            text: "OK",
            onPress: () => {
              if (router.canGoBack()) router.back();
              else router.replace("/(tabs)");
            },
          },
        ]);
      } else {
        Alert.alert(
          "No subscription found",
          result.error ?? "We could not find an active subscription for this store account."
        );
      }
    } finally {
      setRestoring(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const yearlyPriceLabel = annualPkg?.product.priceString ?? PRICING.yearly.priceLabel;
  const monthlyPriceLabel = monthlyPkg?.product.priceString ?? PRICING.monthly.priceLabel;
  const plansBusy = loadingOfferings || !!purchasing || restoring;

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
            {Platform.OS === "web" ? (
              <Text style={[styles.webNotice, { color: placeholderColor }]}>
                In-app subscriptions are available on the iOS and Android apps.
              </Text>
            ) : null}
          </Animated.View>

          {/* Yearly plan - recommended */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(400)}
            style={styles.planCardWrapper}
          >
            <TouchableOpacity
              onPress={() => handleSelectPlan("yearly")}
              activeOpacity={0.85}
              disabled={plansBusy}
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
                    {yearlyPriceLabel}
                  </Text>
                  <Text style={[styles.planInterval, { color: placeholderColor }]}>
                    /year
                  </Text>
                </View>
              </View>
              {loadingOfferings ? (
                <ActivityIndicator color={COLORS.primary} style={styles.planLoader} />
              ) : purchasing === "yearly" ? (
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
              disabled={plansBusy}
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
                    {monthlyPriceLabel}
                  </Text>
                  <Text style={[styles.planInterval, { color: placeholderColor }]}>
                    /month
                  </Text>
                </View>
              </View>
              {loadingOfferings ? (
                <ActivityIndicator color={COLORS.primary} style={styles.planLoader} />
              ) : purchasing === "monthly" ? (
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

          {Platform.OS !== "web" ? (
            <TouchableOpacity
              onPress={handleRestore}
              activeOpacity={0.7}
              disabled={plansBusy}
              style={styles.restoreWrap}
            >
              {restoring ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : (
                <Text style={[styles.restoreLink, { color: COLORS.primary }]}>
                  Restore purchases
                </Text>
              )}
            </TouchableOpacity>
          ) : null}
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
  webNotice: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
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
  restoreWrap: {
    alignItems: "center",
    marginTop: 20,
    minHeight: 24,
    justifyContent: "center",
  },
  restoreLink: {
    fontSize: 15,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

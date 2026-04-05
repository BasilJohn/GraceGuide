import GradientBackground from "@/components/GradientBackground";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Slide = {
  id: string;
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly [string, string];
};

const SLIDES: Slide[] = [
  {
    id: "welcome",
    title: "Welcome to GraceGuide",
    body: "A calm space for Scripture, prayerful reflection, and guidance that meets you where you are.",
    icon: "sparkles",
    gradient: [COLORS.primary, COLORS.primaryLight],
  },
  {
    id: "scripture",
    title: "Daily Scripture & devotion",
    body: "Start each day with verse and devotional content designed to encourage and ground you.",
    icon: "book",
    gradient: [COLORS.secondary, COLORS.goldAccent],
  },
  {
    id: "grace",
    title: "Talk to Grace",
    body: "Ask questions and explore faith with Grace—supportive, biblical conversation in your pocket.",
    icon: "chatbubbles",
    gradient: [COLORS.accent, COLORS.accentLight],
  },
  {
    id: "checkin",
    title: "Heart check-ins",
    body: "Name what you feel and reflect with guided prompts that help you grow emotionally and spiritually.",
    icon: "heart",
    gradient: [COLORS.calm, COLORS.primary],
  },
  {
    id: "ready",
    title: "You’re all set",
    body: "Your home screen has Scripture, Grace, and quick actions. Tap continue whenever you’re ready.",
    icon: "home",
    gradient: [COLORS.warmth, COLORS.secondary],
  },
];

export default function OnboardingIntroScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [page, setPage] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const backgroundColor = isDark ? COLORS.backgroundDark : COLORS.backgroundLight;
  const textColor = isDark ? COLORS.textDark : COLORS.textLight;
  const placeholderColor = isDark ? COLORS.placeholderDark : COLORS.placeholderLight;
  const borderColor = isDark ? COLORS.borderDark : COLORS.borderLight;

  const finishIntroAndGoHome = useCallback(async () => {
    try {
      await SecureStore.setItemAsync("onboardingCompleted", "true");
      await SecureStore.setItemAsync("preferredTone", "biblical");
    } catch {
      // Still navigate; AuthGate may re-show onboarding if save failed
    }
    router.replace("/(tabs)");
  }, [router]);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const next = Math.round(x / SCREEN_WIDTH);
      setPage(Math.min(Math.max(next, 0), SLIDES.length - 1));
    },
    []
  );

  const goNext = useCallback(() => {
    if (page >= SLIDES.length - 1) {
      void finishIntroAndGoHome();
      return;
    }
    listRef.current?.scrollToIndex({
      index: page + 1,
      animated: true,
    });
  }, [page, finishIntroAndGoHome]);

  const renderSlide = useCallback(
    ({ item }: ListRenderItemInfo<Slide>) => (
      <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconRing}
        >
          <View
            style={[
              styles.iconInner,
              { backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight },
            ]}
          >
            <Ionicons name={item.icon} size={44} color={COLORS.secondary} />
          </View>
        </LinearGradient>
        <Text style={[styles.title, { color: textColor }]}>{item.title}</Text>
        <Text style={[styles.body, { color: placeholderColor }]}>{item.body}</Text>
      </View>
    ),
    [isDark, placeholderColor, textColor]
  );

  const keyExtractor = useCallback((item: Slide) => item.id, []);

  const getItemLayout = useCallback(
    (_data: ArrayLike<Slide> | null | undefined, index: number) => ({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * index,
      index,
    }),
    []
  );

  const onScrollToIndexFailed = useCallback(
    (info: { index: number; averageItemLength: number }) => {
      setTimeout(() => {
        listRef.current?.scrollToIndex({ index: info.index, animated: true });
      }, 100);
    },
    []
  );

  const isLast = page === SLIDES.length - 1;

  return (
    <GradientBackground useSafeArea={false}>
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={["top"]}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.topBar}>
          <View style={styles.topSpacer} />
          <TouchableOpacity onPress={() => void finishIntroAndGoHome()} style={styles.skipBtn} activeOpacity={0.65}>
            <Text style={[styles.skipText, { color: placeholderColor }]}>Skip</Text>
          </TouchableOpacity>
        </Animated.View>

        <FlatList
          ref={listRef}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={SLIDES}
          keyExtractor={keyExtractor}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          getItemLayout={getItemLayout}
          onScrollToIndexFailed={onScrollToIndexFailed}
          initialNumToRender={SLIDES.length}
          windowSize={3}
          maxToRenderPerBatch={SLIDES.length}
          removeClippedSubviews
        />

        <View style={styles.footer}>
          <View style={styles.dots}>
            {SLIDES.map((s, i) => (
              <View
                key={s.id}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === page ? COLORS.secondary : borderColor,
                    width: i === page ? 22 : 8,
                  },
                ]}
              />
            ))}
          </View>

          <TouchableOpacity onPress={goNext} activeOpacity={0.88} style={styles.ctaWrap}>
            <LinearGradient
              colors={[COLORS.secondary, COLORS.goldAccent, COLORS.warmth]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>{isLast ? "Continue" : "Next"}</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  topSpacer: {
    flex: 1,
  },
  skipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  slide: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  iconRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    padding: 4,
    marginBottom: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  iconInner: {
    width: "100%",
    height: "100%",
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.4,
    fontFamily: FONTS.header,
    textAlign: "center",
    marginBottom: 14,
    lineHeight: 34,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    letterSpacing: 0.15,
    maxWidth: 340,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 8,
    gap: 20,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  ctaWrap: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: COLORS.shadowBlack,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 28,
    minHeight: 56,
  },
  ctaText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.25,
    fontFamily: FONTS.primary,
  },
});

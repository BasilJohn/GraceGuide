import Constants from "expo-constants";
import { Platform } from "react-native";
import Purchases, { type CustomerInfo } from "react-native-purchases";

let isConfigured = false;

function getApiKeyFromEnv(): string {
  return (
    Platform.select({
      ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || "",
      android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || "",
      default: "",
    }) || ""
  );
}

function getApiKeyFromExtra(): string {
  const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;
  if (Platform.OS === "ios") return extra.revenueCatIosApiKey || "";
  if (Platform.OS === "android") return extra.revenueCatAndroidApiKey || "";
  return "";
}

/** Matches ShelfScan: env first, then `app.config.js` extra (EAS / prebuild). */
export function getRevenueCatApiKey(): string {
  return getApiKeyFromEnv() || getApiKeyFromExtra();
}

export function getRevenueCatEntitlementId(): string {
  const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;
  return (
    extra.revenueCatEntitlementId ||
    process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID ||
    "premium"
  );
}

export function hasActivePremiumEntitlement(info: CustomerInfo): boolean {
  const id = getRevenueCatEntitlementId();
  return info.entitlements.active[id] != null;
}

async function configureOnce(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  if (isConfigured) return true;

  const apiKey = getRevenueCatApiKey();
  if (!apiKey) return false;
  if (typeof Purchases === "undefined" || !Purchases.configure) return false;

  await Purchases.configure({ apiKey });
  isConfigured = true;

  try {
    await Purchases.setLogLevel(Purchases.LOG_LEVEL.ERROR);
  } catch {
    // ignore
  }

  return true;
}

/**
 * ShelfScan-style init: configure once, then optional `logIn`. Called from root layout when `user.id` exists.
 */
export async function initializeRevenueCat(userId?: string): Promise<boolean> {
  try {
    const ok = await configureOnce();
    if (!ok) return false;

    if (userId && Purchases.logIn) {
      try {
        await Purchases.logIn(userId);
      } catch {
        // optional — linking can fail without blocking the app
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Reset RevenueCat to an anonymous user on sign-out (only if the SDK was configured this session).
 */
export async function syncRevenueCatAppUser(appUserId: string | null): Promise<void> {
  if (Platform.OS === "web") return;
  if (!isConfigured) return;

  try {
    if (appUserId) {
      await Purchases.logIn(appUserId);
    } else {
      const anonymous = await Purchases.isAnonymous();
      if (!anonymous) {
        await Purchases.logOut();
      }
    }
  } catch (e) {
    console.warn("[RevenueCat] sync app user failed", e);
  }
}

export async function ensureRevenueCatReady(): Promise<boolean> {
  return configureOnce();
}

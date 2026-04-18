import { useAuth } from "@/context/AuthContext";
import { dailyScriptureKeys } from "@/hooks/useDailyScripture";
import { readingStatusKeys } from "@/hooks/useReadingStatus";
import {
  getRevenueCatApiKey,
  getRevenueCatEntitlementId,
} from "@/lib/revenuecat";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";

export { initializeRevenueCat } from "@/lib/revenuecat";

function entitlementActive(info: CustomerInfo | null | undefined): boolean {
  if (!info?.entitlements) return false;
  const id = getRevenueCatEntitlementId();
  return info.entitlements.active[id] !== undefined;
}

/**
 * GraceGuide variant of ShelfScan’s hook: same offerings / purchase / restore flow,
 * but no backend `purchaseSubscription` — premium state comes from `refreshUser()` → `auth/getUser`.
 */
export function useRevenueCat() {
  const { refreshUser, user } = useAuth();
  const queryClient = useQueryClient();
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const apiKey = getRevenueCatApiKey();
    if (apiKey) {
      setIsConfigured(true);
      const t = setTimeout(() => {
        void loadOfferings();
        void loadCustomerInfo();
      }, 1000);
      return () => clearTimeout(t);
    }
    setIsLoading(false);
    return undefined;
  }, []);

  const loadOfferings = async () => {
    const apiKey = getRevenueCatApiKey();
    if (!apiKey || !Purchases?.getOfferings) return;
    try {
      setIsLoading(true);
      const all = await Purchases.getOfferings();
      if (all?.current != null) {
        setOfferings(all.current);
      }
    } catch (error: unknown) {
      const err = error as { message?: string; code?: number };
      const errorMessage = err?.message || "";
      const errorCode = err?.code;
      if (
        errorMessage.includes("couldn't be fetched") ||
        errorMessage.includes("configuration") ||
        errorMessage.includes("App Store Connect") ||
        errorMessage.includes("StoreKit Configuration") ||
        errorCode === 1
      ) {
        // products may be waiting for review
      } else {
        console.error("Error loading offerings:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomerInfo = async () => {
    const apiKey = getRevenueCatApiKey();
    if (!apiKey || !Purchases?.getCustomerInfo) return;
    try {
      const info = await Purchases.getCustomerInfo();
      if (info?.entitlements) {
        setCustomerInfo(info);
        setIsPremium(entitlementActive(info));
      }
    } catch (error) {
      console.error("Error loading customer info:", error);
    }
  };

  const invalidatePremiumRelatedQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: readingStatusKeys.status() }),
      queryClient.invalidateQueries({ queryKey: dailyScriptureKeys.scripture() }),
      queryClient.invalidateQueries({ queryKey: dailyScriptureKeys.verse() }),
      queryClient.invalidateQueries({ queryKey: dailyScriptureKeys.devotional() }),
    ]);
  };

  const purchasePackage = async (
    pkg: PurchasesPackage
  ): Promise<{ success: boolean; error?: string }> => {
    const apiKey = getRevenueCatApiKey();
    if (!apiKey || !Purchases?.purchasePackage) {
      return { success: false, error: "RevenueCat is not configured" };
    }

    try {
      if (user?.id && Purchases.logIn) {
        const currentUser = await Purchases.getCustomerInfo();
        if (currentUser?.originalAppUserId !== user.id) {
          await Purchases.logIn(user.id);
        }
      }
    } catch (loginError) {
      console.log("RevenueCat login check (non-blocking):", loginError);
    }

    try {
      setIsLoading(true);
      const { customerInfo: nextInfo } = await Purchases.purchasePackage(pkg);

      if (!nextInfo?.entitlements) {
        return { success: false, error: "Invalid purchase response" };
      }

      if (Platform.OS === "android") {
        try {
          if (Purchases.syncPurchases) {
            await Purchases.syncPurchases();
          }
        } catch {
          // optional per SDK version
        }
        await new Promise((r) => setTimeout(r, 3000));

        let retries = 3;
        const entitlementId = getRevenueCatEntitlementId();
        while (retries > 0) {
          try {
            const freshInfo = await Purchases.getCustomerInfo();
            if (freshInfo?.entitlements?.active?.[entitlementId]) {
              break;
            }
            await new Promise((r) => setTimeout(r, 1000));
            retries -= 1;
          } catch {
            retries -= 1;
            if (retries > 0) await new Promise((r) => setTimeout(r, 1000));
          }
        }
      }

      try {
        await refreshUser();
        await invalidatePremiumRelatedQueries();
      } catch (refreshUserError) {
        console.error("Error refreshing user data:", refreshUserError);
      }

      try {
        const freshCustomerInfo = await Purchases.getCustomerInfo();
        if (freshCustomerInfo?.entitlements) {
          setCustomerInfo(freshCustomerInfo);
          const hasPremium = entitlementActive(freshCustomerInfo);
          setIsPremium(hasPremium);
          if (hasPremium) return { success: true };
        }
      } catch (refreshError) {
        console.error("Error refreshing customer info:", refreshError);
      }

      const hasPremium = entitlementActive(nextInfo);
      setIsPremium(hasPremium);
      setCustomerInfo(nextInfo);
      return { success: true };
    } catch (error: unknown) {
      const err = error as { userCancelled?: boolean; message?: string };
      console.error("Purchase error:", error);
      if (err.userCancelled) {
        return { success: false, error: "Purchase cancelled" };
      }
      return { success: false, error: err?.message || "Purchase failed" };
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async (): Promise<{ success: boolean; error?: string }> => {
    const apiKey = getRevenueCatApiKey();
    if (!apiKey || !Purchases?.restorePurchases) {
      return { success: false, error: "RevenueCat is not configured" };
    }

    try {
      setIsLoading(true);

      if (Platform.OS === "android" && Purchases.syncPurchases) {
        try {
          await Purchases.syncPurchases();
          await new Promise((r) => setTimeout(r, 1000));
        } catch {
          // optional
        }
      }

      const restored = await Purchases.restorePurchases();
      if (!restored?.entitlements) {
        return { success: false, error: "Invalid restore response" };
      }

      const hasPremium = entitlementActive(restored);
      setIsPremium(hasPremium);
      setCustomerInfo(restored);

      try {
        await refreshUser();
        await invalidatePremiumRelatedQueries();
      } catch (refreshError) {
        console.error("Error refreshing user data after restore:", refreshError);
      }

      if (hasPremium) {
        return { success: true };
      }
      return { success: false, error: "No active purchases found" };
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Restore error:", error);
      return { success: false, error: err?.message || "Failed to restore purchases" };
    } finally {
      setIsLoading(false);
    }
  };

  const getSubscriptionPlan = () => {
    if (!customerInfo?.entitlements) return null;
    const entitlementId = getRevenueCatEntitlementId();
    const premiumEntitlement = customerInfo.entitlements.active[entitlementId];
    if (!premiumEntitlement) return null;

    const productIdentifier = premiumEntitlement.productIdentifier;
    const expirationDate = premiumEntitlement.expirationDate;

    let planName = "Premium";
    if (productIdentifier?.includes("monthly")) {
      planName = "Premium Monthly";
    } else if (
      productIdentifier?.includes("yearly") ||
      productIdentifier?.includes("annual")
    ) {
      planName = "Premium Yearly";
    }

    return {
      productIdentifier,
      planName,
      expirationDate: expirationDate || null,
      willRenew: premiumEntitlement.willRenew || false,
      periodType: productIdentifier?.includes("monthly") ? "monthly" : "yearly",
    };
  };

  return {
    offerings,
    customerInfo,
    isLoading,
    isPremium,
    isConfigured,
    purchasePackage,
    restorePurchases,
    refreshCustomerInfo: loadCustomerInfo,
    getSubscriptionPlan,
  };
}

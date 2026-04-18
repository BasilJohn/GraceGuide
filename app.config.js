/**
 * Strips `expo-dev-client` from native plugins for store (production) EAS builds.
 * Keeping the dev client in production binaries is a common source of launch issues.
 *
 * The `config` argument is the resolved Expo config object (contents of `expo` in app.json).
 */
module.exports = ({ config }) => {
  const plugins = (config.plugins ?? []).filter((p) => {
    const name = typeof p === "string" ? p : p[0];
    if (name === "expo-dev-client" && process.env.EAS_BUILD_PROFILE === "production") {
      return false;
    }
    return true;
  });

  return {
    ...config,
    plugins,
    extra: {
      ...(config.extra ?? {}),
      revenueCatIosApiKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? "",
      revenueCatAndroidApiKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? "",
      revenueCatEntitlementId: process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID ?? "premium",
    },
  };
};

import GradientBackground from "@/components/GradientBackground";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useReadingStatus } from "@/hooks/useReadingStatus";
import { deleteUserAccount } from "@/lib/appApi";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Reading status
  const { data: readingStatus } = useReadingStatus();

  const textColor = isDark ? COLORS.textDark : COLORS.textLight;
  const placeholderColor = isDark ? COLORS.placeholderDark : COLORS.placeholderLight;
  const elementBg = isDark ? COLORS.elementDark : COLORS.elementLight;
  const borderColor = isDark ? COLORS.borderDark : COLORS.borderLight;

  const handleLogout = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              // Clear auth state - AuthGate will handle navigation automatically
              await signOut();
              // Small delay to ensure sign-out completes and auth state is fully cleared
              // This prevents "authorization attempt failed" errors when user immediately tries to sign in again
              await new Promise(resolve => setTimeout(resolve, 300));
              // Keep loading state visible briefly for smooth transition
              // AuthGate will navigate to signin when user becomes null
            } catch (error) {
              setIsLoggingOut(false);
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted. Are you absolutely sure?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            Alert.alert(
              "Final Confirmation",
              "This is your last chance. Your account and all data will be permanently deleted.",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Delete Forever",
                  style: "destructive",
                  onPress: async () => {
                    setIsDeleting(true);
                    try {
                      await deleteUserAccount();
                      await signOut();
                      Alert.alert(
                        "Account Deleted",
                        "Your account has been permanently deleted.",
                        [
                          {
                            text: "OK",
                            onPress: () => router.replace("/signin"),
                          },
                        ]
                      );
                    } catch (error) {
                      Alert.alert(
                        "Error",
                        "Failed to delete account. Please try again."
                      );
                    } finally {
                      setIsDeleting(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <GradientBackground useSafeArea={true}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Fixed Header */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={[
            styles.header,
            {
              backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight,
              borderBottomColor: borderColor + "30",
            },
          ]}
        >
          <Text style={[styles.headerTitle, { color: textColor }]}>Profile</Text>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* Premium User Card with Gradient Background */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={styles.section}
          >
            <LinearGradient
              colors={
                isDark
                  ? [COLORS.primaryDark + "40", COLORS.accentDark + "30", COLORS.backgroundDark]
                  : [COLORS.primary + "15", COLORS.accent + "10", COLORS.backgroundLight]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.userCardGradient}
            >
              <View
                style={[
                  styles.userCard,
                  {
                    backgroundColor: isDark ? COLORS.elementDark + "90" : COLORS.elementLight + "95",
                    borderColor: borderColor,
                  },
                ]}
              >
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                  {user?.avatarUrl && !imageError ? (
                    <Image
                      source={{ uri: user.avatarUrl }}
                      style={[styles.avatarImage, { backgroundColor: COLORS.primary + "20" }]}
                      contentFit="cover"
                      transition={200}
                      onError={() => {
                        setImageError(true);
                      }}
                    />
                  ) : (
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.primaryLight, COLORS.accent]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.avatarGradient}
                    >
                      <Text style={styles.avatarText}>
                        {getInitials(user?.name)}
                      </Text>
                    </LinearGradient>
                  )}
                </View>

                {/* User Name */}
                <Text style={[styles.userName, { color: textColor }]}>
                  {user?.name || "User"}
                </Text>

                {/* User Email */}
                <Text style={[styles.userEmail, { color: placeholderColor }]}>
                  {user?.email || ""}
                </Text>

                {/* Premium Badge with Enhanced Design */}
                {user?.isPremium && (
                  <Animated.View
                    entering={FadeIn.delay(400).duration(400)}
                    style={styles.premiumBadge}
                  >
                    <LinearGradient
                      colors={[COLORS.secondary, COLORS.goldAccent, COLORS.warmth]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.premiumBadgeGradient}
                    >
                      <Ionicons name="star" size={18} color={COLORS.white} />
                      <Text style={styles.premiumBadgeText}>Premium Member</Text>
                    </LinearGradient>
                  </Animated.View>
                )}
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Account Details Section */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(400)}
            style={styles.section}
          >
            <View
              style={[
                styles.detailsCard,
                {
                  backgroundColor: elementBg,
                  borderColor: borderColor,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Account Details
              </Text>
              
              <View style={styles.detailRow}>
                <View style={[styles.detailIconContainer, { backgroundColor: COLORS.tealAccent10 }]}>
                  <Ionicons name="mail" size={22} color={COLORS.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: placeholderColor }]}>
                    Email Address
                  </Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>
                    {user?.email || "N/A"}
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: borderColor }]} />

              <View style={styles.detailRow}>
                <View style={[styles.detailIconContainer, { backgroundColor: COLORS.coralAccent10 }]}>
                  <Ionicons name="diamond" size={22} color={COLORS.secondary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: placeholderColor }]}>
                    Membership
                  </Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>
                    {user?.subscriptionTier === "premium" ? "Premium" : "Free"}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Reading Status Section */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(400)}
            style={styles.section}
          >
            <View
              style={[
                styles.detailsCard,
                {
                  backgroundColor: elementBg,
                  borderColor: borderColor,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Daily Reading Status
              </Text>
              
              <View style={styles.detailRow}>
                <View style={[styles.detailIconContainer, { backgroundColor: COLORS.tealAccent10 }]}>
                  <Ionicons 
                    name={readingStatus?.scriptureRead ? "checkmark-circle" : "ellipse-outline"} 
                    size={22} 
                    color={readingStatus?.scriptureRead ? COLORS.primary : placeholderColor} 
                  />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: placeholderColor }]}>
                    Scripture
                  </Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>
                    {readingStatus?.scriptureRead ? "Read" : "Not Read"}
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: borderColor }]} />

              <View style={styles.detailRow}>
                <View style={[styles.detailIconContainer, { backgroundColor: COLORS.coralAccent10 }]}>
                  <Ionicons 
                    name={readingStatus?.devotionalRead ? "checkmark-circle" : "ellipse-outline"} 
                    size={22} 
                    color={readingStatus?.devotionalRead ? COLORS.secondary : placeholderColor} 
                  />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: placeholderColor }]}>
                    Devotional
                  </Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>
                    {readingStatus?.devotionalRead ? "Read" : "Not Read"}
                  </Text>
                </View>
              </View>

            </View>
          </Animated.View>

          {/* Actions Section */}
          <Animated.View
            entering={FadeInDown.delay(450).duration(400)}
            style={styles.section}
          >
            <View
              style={[
                styles.actionsCard,
                {
                  backgroundColor: elementBg,
                  borderColor: borderColor,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Account Actions
              </Text>

              <TouchableOpacity
                onPress={handleLogout}
                disabled={isLoggingOut || isDeleting}
                style={styles.actionButton}
                activeOpacity={0.7}
              >
                <View style={styles.actionLeft}>
                  <View style={[styles.actionIconContainer, { backgroundColor: COLORS.tealAccent10 }]}>
                    <Ionicons name="log-out" size={22} color={COLORS.primary} />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={[styles.actionTitle, { color: textColor }]}>
                      Sign Out
                    </Text>
                    <Text style={[styles.actionSubtitle, { color: placeholderColor }]}>
                      Sign out of your account
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={placeholderColor} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: borderColor }]} />

              <TouchableOpacity
                onPress={handleDeleteAccount}
                disabled={isLoggingOut || isDeleting}
                style={styles.actionButton}
                activeOpacity={0.7}
              >
                <View style={styles.actionLeft}>
                  <View style={[styles.actionIconContainer, { backgroundColor: COLORS.danger + "15" }]}>
                    <Ionicons name="trash" size={22} color={COLORS.danger} />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={[styles.actionTitle, { color: COLORS.danger }]}>
                      Delete Account
                    </Text>
                    <Text style={[styles.actionSubtitle, { color: placeholderColor }]}>
                      Permanently delete your account
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={placeholderColor} />
              </TouchableOpacity>
            </View>
          </Animated.View>

        </ScrollView>

        {/* Loading Overlay - Outside ScrollView to cover entire screen */}
        {(isLoggingOut || isDeleting) && (
          <View style={[
            styles.loadingOverlay,
            { backgroundColor: isDark ? "rgba(0, 0, 0, 0.85)" : "rgba(0, 0, 0, 0.75)" }
          ]}>
            <Animated.View
              entering={FadeIn.duration(200)}
              style={[
                styles.loadingContent,
                {
                  backgroundColor: isDark ? COLORS.elementDark : COLORS.elementLight,
                  borderColor: borderColor,
                }
              ]}
            >
              <Text style={[styles.loadingText, { color: textColor }]}>
                {isDeleting ? "Deleting account..." : "Signing out..."}
              </Text>
            </Animated.View>
          </View>
        )}
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: "700",
    fontFamily: FONTS.header,
    letterSpacing: -0.8,
  },
  section: {
    marginBottom: 24,
  },
  userCardGradient: {
    borderRadius: 28,
    padding: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  userCard: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: FONTS.header,
  },
  userName: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: FONTS.header,
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  premiumBadge: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  premiumBadgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  premiumBadgeText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  detailsCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: FONTS.header,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 16,
  },
  detailIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  detailSubtitle: {
    fontSize: 13,
    fontWeight: "400",
    marginTop: 2,
    letterSpacing: 0.1,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  actionsCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    marginVertical: 4,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  actionSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: 0.1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingContent: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    minWidth: 200,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});

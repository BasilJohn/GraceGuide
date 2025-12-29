export const COLORS = {
  background: "#F8F7F5",   // refined warm cream background
  surface: "#FFFFFF",      // pure white (cards, inputs) - light mode
  textPrimary: "#1F1F1F",   // refined dark charcoal
  textSecondary: "#6B7280",
  border: "#E5E3E0",       // refined warm border

  // Primary colors - Refined teal/aqua (calming, sophisticated)
  primary: "#4A9DB8",      // refined teal blue (calming, peaceful)
  primaryLight: "#6BB3C8", // lighter teal for gradients
  primaryDark: "#3D8BA3",  // deeper teal for depth
  secondary: "#FF8A7A",   // refined coral/salmon (uplifting, positive)
  
  // Accent colors - Soft and elegant
  accent: "#A89BC9",      // refined lavender (spiritual, calming)
  accentLight: "#C4B8DD", // lighter lavender
  accentDark: "#8B7DB0",  // deeper lavender
  
  // Gold accent colors - Elegant rose gold
  gold: "#E5A890",         // refined rose gold
  goldLight: "#F2C4B0",   // light rose gold
  goldDark: "#D18F75",    // deep rose gold
  goldAccent: "#FF8A7A",  // refined coral (matches secondary)
  
  // Mood-enhancing colors - Refined pastels
  calm: "#9FD1E0",        // refined sky blue (calming)
  peace: "#B8D9C8",       // refined mint green (serenity)
  hope: "#FFA8B5",        // refined pink (gentle, hopeful)
  warmth: "#FFB894",      // refined peach (comforting)
  
  white: "#FFFFFF",        // white text on colored backgrounds

  // Element colors - Premium surfaces
  elementLight: "#FFFFFF",  // pure white for light mode
  elementDark: "#1E2835",  // refined dark grey for dark mode

  // Text colors - Premium typography
  textLight: "#1F1F1F",    // refined dark charcoal for light mode
  textDark: "#F5F3F0",     // warm white for dark mode

  // Border colors - Refined borders
  borderLight: "#E5E3E0",  // refined warm border for light mode
  borderDark: "#374151",  // refined dark border

  // Background colors - Mood-enhancing backgrounds
  backgroundLight: "#F8F7F5",  // refined warm cream
  backgroundDark: "#1A2332",  // refined deep navy with teal undertones

  // Shadow colors
  shadowBlack: "#000000",      // black for shadows
  shadowDark: "rgba(0, 0, 0, 0.15)",  // dark shadow with opacity

  // Button border colors
  buttonBorderLight: "rgba(255, 255, 255, 0.2)",  // subtle white border for buttons

  // Placeholder colors with opacity
  placeholderLight: "rgba(31, 31, 31, 0.5)",   // textLight with 50% opacity
  placeholderDark: "rgba(245, 243, 240, 0.5)", // textDark with 50% opacity

  // Tab bar colors with opacity
  tabBarBackgroundLight: "rgba(248, 247, 245, 0.95)", // background-light/95
  tabBarBackgroundDark: "rgba(26, 35, 50, 0.95)",     // background-dark/95
  tabBarInactiveLight: "rgba(31, 31, 31, 0.6)",      // text-light/60
  tabBarInactiveDark: "rgba(245, 243, 240, 0.6)",    // text-dark/60

  // Icon background colors with opacity
  iconBgLight: "rgba(74, 157, 184, 0.1)",   // primary/10
  iconBgDark: "rgba(107, 179, 200, 0.15)",   // primaryLight/15

  // Legacy / Filters / primary action
  muted: "#E5E3E0",        // refined muted color

  // Shadow colors with opacity
  shadowBlack30: "rgba(0, 0, 0, 0.3)",
  shadowBlack20: "rgba(0, 0, 0, 0.2)",
  shadowBlack15: "rgba(0, 0, 0, 0.15)",
  shadowBlack10: "rgba(0, 0, 0, 0.1)",
  shadowBlack05: "rgba(0, 0, 0, 0.05)",

  // White with opacity
  white20: "rgba(255, 255, 255, 0.2)",
  white30: "rgba(255, 255, 255, 0.3)",

  // Coral accent with opacity
  coralAccent10: "rgba(255, 138, 122, 0.1)",  // coral with 10% opacity
  coralAccent30: "rgba(255, 138, 122, 0.3)",  // coral with 30% opacity
  coralAccent50: "rgba(255, 138, 122, 0.5)",  // coral with 50% opacity

  // Teal accent with opacity
  tealAccent10: "rgba(74, 157, 184, 0.1)",  // primary with 10% opacity
  tealAccent20: "rgba(74, 157, 184, 0.2)",  // primary with 20% opacity
  tealAccent30: "rgba(74, 157, 184, 0.3)",  // primary with 30% opacity

  // Lavender accent with opacity
  lavenderAccent10: "rgba(168, 155, 201, 0.1)",  // accent with 10% opacity
  lavenderAccent20: "rgba(168, 155, 201, 0.2)",  // accent with 20% opacity

  // Danger
  danger: "#EF4444",       // vibrant red
  lightRed: "#F87171",
  dangerGradient1: "#DC2626",  // red-600
  dangerGradient2: "#B91C1C",  // red-700
  dangerGradient3: "#991B1B",  // red-800

  // Additional colors
  googleBlue: "#4285F4",   // Google brand blue
  blue: "#2563eb",         // Standard blue
  black50: "rgba(0,0,0,0.5)", // Black with 50% opacity
  black88: "#00000088",    // Black with ~54% opacity (hex)

  // Tab bar liquid glass colors
  tabBarGlassDark: "rgba(26, 35, 50, 0.85)",      // iOS dark blur overlay
  tabBarGlassLight: "rgba(255, 255, 255, 0.85)",  // iOS light blur overlay
  tabBarAndroidDark: "rgba(26, 35, 50, 0.98)",   // Android dark background
  tabBarAndroidLight: "rgba(248, 247, 245, 0.98)", // Android light background
  tabBarBorderDark: "rgba(255, 255, 255, 0.1)",  // Dark mode border
  tabBarBorderLight: "rgba(0, 0, 0, 0.06)",       // Light mode border
  tabBarBorderAndroidDark: "rgba(255, 255, 255, 0.08)", // Android dark border

  // Premium gradient colors for backgrounds
  gradientTeal1: "#4A9DB8",    // primary
  gradientTeal2: "#6BB3C8",    // primaryLight
  gradientTeal3: "#9FD1E0",    // calm
  gradientCoral1: "#FF8A7A",    // secondary/coral
  gradientCoral2: "#FFA8B5",   // hope
  gradientCoral3: "#FFB894",   // warmth
  gradientLavender1: "#A89BC9", // accent
  gradientLavender2: "#C4B8DD", // accentLight
  gradientLavender3: "#E0D5F0", // lighter lavender
};

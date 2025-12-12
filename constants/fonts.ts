import { Platform } from "react-native";

/**
 * Premium font configuration
 * 
 * RECOMMENDED PREMIUM FONTS (Free via Google Fonts):
 * 
 * 1. **Playfair Display** - Elegant serif, perfect for headers
 *    - Very classy, sophisticated, literary feel
 *    - Best for: Headers, titles, book names
 *    - Download: https://fonts.google.com/specimen/Playfair+Display
 * 
 * 2. **Cormorant Garamond** - Classic, elegant serif
 *    - Traditional book typography, very refined
 *    - Best for: Headers, elegant text
 *    - Download: https://fonts.google.com/specimen/Cormorant+Garamond
 * 
 * 3. **Lora** - Beautiful serif with great readability
 *    - Modern yet classic, perfect for body text
 *    - Best for: Body text, descriptions
 *    - Download: https://fonts.google.com/specimen/Lora
 * 
 * 4. **Merriweather** - Premium serif, excellent readability
 *    - Designed for reading, elegant and clear
 *    - Best for: Body text, long-form content
 *    - Download: https://fonts.google.com/specimen/Merriweather
 * 
 * 5. **Libre Baskerville** - Traditional, elegant serif
 *    - Classic book font, timeless elegance
 *    - Best for: Headers and body text
 *    - Download: https://fonts.google.com/specimen/Libre+Baskerville
 * 
 * 6. **EB Garamond** - Very classy, traditional serif
 *    - Sophisticated, literary, premium feel
 *    - Best for: Headers, elegant displays
 *    - Download: https://fonts.google.com/specimen/EB+Garamond
 * 
 * SETUP INSTRUCTIONS:
 * 1. Install expo-font: npx expo install expo-font
 * 2. Download font files (.ttf or .otf) from Google Fonts
 * 3. Create assets/fonts/ directory
 * 4. Add font files to assets/fonts/
 * 5. Load fonts in app/_layout.tsx using useFonts hook
 * 6. Update FONTS.header or FONTS.primary to use the font name
 * 
 * EXAMPLE (Playfair Display):
 * - Download: PlayfairDisplay-Regular.ttf, PlayfairDisplay-Bold.ttf
 * - Add to assets/fonts/
 * - In app/_layout.tsx:
 *   const [fontsLoaded] = useFonts({
 *     'PlayfairDisplay-Regular': require('./assets/fonts/PlayfairDisplay-Regular.ttf'),
 *     'PlayfairDisplay-Bold': require('./assets/fonts/PlayfairDisplay-Bold.ttf'),
 *   });
 * - Update: header: 'PlayfairDisplay-Regular'
 */

export const FONTS = {
  // Premium system fonts (no setup required)
  primary: Platform.select({
    ios: "SF Pro Display", // Premium iOS font
    android: "Roboto", // Clean Android font
    default: "System",
  }),
  
  // Header font - Premium typography
  // Using Playfair Display for elegant, classy headers
  // Falls back to system fonts if custom fonts aren't loaded
  header: Platform.select({
    ios: "PlayfairDisplay-Regular", // Try custom font first
    android: "PlayfairDisplay-Regular",
    default: Platform.select({
      ios: "SF Pro Display", // Fallback to system font
      android: "sans-serif-medium",
      default: "System",
    }),
  }) || Platform.select({
    ios: "SF Pro Display",
    android: "sans-serif-medium",
    default: "System",
  }),
  headerBold: "PlayfairDisplay-Bold", // Bold variant for emphasis
  
  // Alternative premium fonts (requires setup)
  // These are suggestions - add your downloaded fonts here
  playfairDisplay: "PlayfairDisplay-Regular", // Elegant serif - BEST FOR HEADERS
  playfairDisplayBold: "PlayfairDisplay-Bold",
  cormorantGaramond: "CormorantGaramond-Regular", // Classic elegant serif
  lora: "Lora-Regular", // Beautiful readable serif - BEST FOR BODY
  merriweather: "Merriweather-Regular", // Premium readable serif
  libreBaskerville: "LibreBaskerville-Regular", // Traditional elegant
  ebGaramond: "EBGaramond-Regular", // Very classy traditional
  
  // Existing alternatives
  inter: "Inter",
  poppins: "Poppins",
  montserrat: "Montserrat",
  
  // Fallback
  system: Platform.select({
    ios: "System",
    android: "Roboto",
    default: "System",
  }),
};

// Font weights
export const FONT_WEIGHTS = {
  light: "300",
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
  black: "900",
} as const;


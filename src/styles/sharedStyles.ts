import { StyleSheet, Dimensions, Platform} from "react-native";


// ==================== RESPONSIVE UTILITIES ====================
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Base dimensions
const BASE_WIDTH = 428;
const BASE_HEIGHT = 926;

// Scaling functions
const scaleWidth = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const scaleHeight = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;
const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// ==================== COLOR CONSTANTS ====================
export const Colors = {
  primary: "#D4B75F",
  background: "#F5F5F5",
  white: "#FFF",
  black: "#000",
  text: "#333",
  textMedium: "#666",
  textLight: "#999",
  textLighter: "#9e9e9e",
  placeholder: "#999",
  border: "#E0E0E0",
  borderDark: "#cacaca",
  shadow: "#000",
  error: "#FF4D4D",
  disabled: "#ccc",
  inputBg: "#F0F0F0",
  badgeBg: "#E8E8E8",
  profileBg: "#aeaeae",
  linkBlue: "#007AFF",
};

// ==================== SPACING CONSTANTS (ADAPTIVE) ====================
export const Spacing = {
  xs: moderateScale(5),
  sm: moderateScale(8),
  md: moderateScale(10),
  base: moderateScale(12),
  lg: moderateScale(15),
  xl: moderateScale(20),
  xxl: moderateScale(30),
  xxxl: moderateScale(40),
};

// ==================== BORDER RADIUS CONSTANTS (ADAPTIVE) ====================
export const BorderRadius = {
  xs: moderateScale(5),
  sm: moderateScale(8),
  md: moderateScale(10),
  lg: moderateScale(12),
  xl: moderateScale(15),
  round: moderateScale(20),
  circle: moderateScale(25),
  full: moderateScale(50),
};

// ==================== FONT SIZES (ADAPTIVE) ====================
export const FontSizes = {
  xs: moderateScale(12),
  sm: moderateScale(14),
  base: moderateScale(16),
  md: moderateScale(18),
  lg: moderateScale(20),
  xl: moderateScale(28),
  xxl: moderateScale(40),
  xxxl: moderateScale(42),
};

// ==================== SHADOWS ====================
export const Shadows = {
  small: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  card: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  large: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
  },
};

// ==================== TYPOGRAPHY ====================
export const Typography = StyleSheet.create({
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: Colors.white,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: "700",
    fontFamily: "System",
    color: Colors.black,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: Colors.textLight,
  },
  bodyText: {
    fontSize: FontSizes.base,
    color: Colors.text,
  },
  smallText: {
    fontSize: FontSizes.sm,
    color: Colors.textMedium,
  },
  label: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
  },
  userName: {
    fontSize: FontSizes.xxxl,
    fontWeight: "700",
    fontFamily: "System",
    color: Colors.black,
    textAlign: "center",
  },
});

// ==================== SHARED COMPONENT STYLES ====================
export const SharedStyles = StyleSheet.create({
  // ========== Containers ==========
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  modalScreenWrapper: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
    backgroundColor: Colors.background,
    // Adds extra padding on iOS to avoid the status bar/notch
    paddingTop: Platform.OS === "ios" ? Spacing.xxl : Spacing.lg, 
  },

  safeAreaContainer: {
    flex: 1,
    backgroundColor: Colors.white, // or Colors.background depending on preference
    paddingTop: Platform.OS === "android" ? 30 : 0, // Handle Android status bar
  },

  // ========== Floating Card Container (NEW) ==========
  floatingCardContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: 1152,
    width: "100%",
    height: "80%",        // Forces the card to be tall
    maxHeight: "90%",     // Prevents it from touching the screen edges
    flexShrink: 1,        // Allows it to shrink when keyboard opens
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    overflow: "hidden",
  },

  // ========== Flex Container (NEW) ==========
  flexContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  bottomModalWrapper: {
    flex: 1,
    width: "100%",
    // 👇 CHANGE THIS: from "flex-end" to "center"
    justifyContent: "center", 
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.OS === "ios" ? 40 : 20, 
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === "ios" ? Spacing.xxl : Spacing.lg, 
  },

  // ========== Headers ==========
  header: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopRightRadius: BorderRadius.md,
    borderTopLeftRadius: BorderRadius.md,
  },
  headerWithBorder: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  // ========== Navigation Bar (ADAPTIVE) ==========
  floatingNav: {
    position: "absolute",
    bottom: moderateScale(30),
    alignSelf: "center",
    height: moderateScale(70),
    width: Math.min(scaleWidth(390), SCREEN_WIDTH * 0.95),
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    ...Shadows.large,
    zIndex: 1000,
  },
  nav_button: {
    width: moderateScale(60),
    height: moderateScale(60),
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  navCircle: {
    position: "absolute",
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: BorderRadius.circle,
    backgroundColor: Colors.white,
  },
  nav_icon_image: {
    width: moderateScale(32),
    height: moderateScale(32),
    zIndex: 1,
  },

  // ========== Buttons ==========
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.circle,
    ...Shadows.small,
  },
  primaryButtonText: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: Colors.white,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.primary,
    ...Shadows.small,
    marginBottom: moderateScale(15),
  },
  secondaryButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: Colors.primary,
  },
  closeButton: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(15),
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: FontSizes.lg,
    color: Colors.primary,
    fontWeight: "600",
  },
  backButton: {
    padding: Spacing.xs,
  },
  backText: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: "600",
  },

  // ========== Form Elements ==========
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  iconText: {
    fontSize: FontSizes.xl,
  },
  inputField: {
    flex: 1,
    height: moderateScale(50),
    backgroundColor: Colors.inputBg,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    justifyContent: "center",
  },

  // ========== Dropdowns ==========
  dropdownWrapper: {
    flex: 1,
    position: "relative",
    zIndex: 1000,
  },
  dropdownButton: {
    height: moderateScale(50),
    backgroundColor: Colors.inputBg,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownButtonText: {
    fontSize: FontSizes.base,
    color: Colors.text,
  },
  placeholderText: {
    color: Colors.placeholder,
  },
  dropdownArrow: {
    fontSize: FontSizes.xs,
    color: Colors.textMedium,
  },
  dropdownMenu: {
    position: "absolute",
    top: moderateScale(55),
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    maxHeight: moderateScale(200),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
  },
  dropdownScroll: {
    maxHeight: moderateScale(200),
  },
  dropdownItem: {
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.inputBg,
  },
  dropdownItemText: {
    fontSize: FontSizes.base,
    color: Colors.text,
  },

  // ========== Date/Time Buttons ==========
  dateButton: {
    flex: 1,
    height: moderateScale(50),
    backgroundColor: Colors.inputBg,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    justifyContent: "center",
  },
  dateLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    fontWeight: "500",
  },

  // ========== ScrollViews ==========
  scroller: {
    backgroundColor: Colors.background,
    position: "absolute",
    width: "100%",
    top: moderateScale(75),
    bottom: 0,
  },
  scrollContent: {
    paddingTop: Spacing.md,
    paddingBottom: moderateScale(100),
  },

  // ========== Cards (ADAPTIVE) ==========
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    ...Shadows.card,
  },
  profileCard: {
    width: "90%",
    maxWidth: moderateScale(360),
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.xxl,
    alignItems: "center",
    ...Shadows.card,
    marginBottom: moderateScale(10),
    marginTop: moderateScale(-40),
  },

  // ========== Post Card ==========
  postCard: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    ...Shadows.card,
  },
  postContainer: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
  },

  // ========== Modals ==========
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    ...Shadows.large,
  },
  timePickerModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.0)",
  },
  timePickerModal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.round,
    borderTopRightRadius: BorderRadius.round,
    paddingBottom: Spacing.xl,
  },
  timePickerHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  timePickerDone: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: Colors.primary,
  },

  // ========== Profile Elements (ADAPTIVE) ==========
  profilePictureContainer: {
    marginBottom: Spacing.xl,
  },
  profilePicture: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.profileBg,
    alignItems: "center",
    justifyContent: "center",
  },
  profileIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  profileIconImage: {
    width: moderateScale(16),
    height: moderateScale(16),
    tintColor: Colors.textLight,
  },
  profileIconLarge: {
    width: moderateScale(75),
    height: moderateScale(75),
    tintColor: Colors.white,
  },

  // ========== User Badge (ADAPTIVE) ==========
  userBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.badgeBg,
    borderRadius: BorderRadius.md,
    paddingVertical: moderateScale(6),
    paddingLeft: moderateScale(6),
    paddingRight: Spacing.base,
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
  },
  username: {
    fontSize: moderateScale(17),
    fontWeight: "500",
    fontFamily: "System",
    color: Colors.textMedium,
  },

  // ========== Switch Container ==========
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
    marginHorizontal: Spacing.xl,
    backgroundColor: Colors.inputBg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  switchLabel: {
    fontSize: FontSizes.base,
    fontWeight: "600",
    color: Colors.text,
  },

  // ========== Photo Upload (ADAPTIVE) ==========
  photoUploadContainer: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    width: "100%",
  },
  photoUploadButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    width: "50%",
    alignItems: "center",
    alignSelf: "center",
  },
  photoUploadButtonDisabled: {
    backgroundColor: Colors.disabled,
    opacity: 0.6,
  },
  photoUploadButtonText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: FontSizes.base,
  },
  photoScrollContainer: {
    marginBottom: Spacing.lg,
    width: "100%",
    maxHeight: moderateScale(220),
  },
  photoWrapper: {
    marginRight: Spacing.md,
    alignItems: "center",
  },
  imagePreview: {
    width: moderateScale(150),
    height: moderateScale(150),
    borderRadius: BorderRadius.lg,
    resizeMode: "cover",
    marginBottom: Spacing.sm,
  },
  removeImageButton: {
    backgroundColor: Colors.error,
    paddingVertical: moderateScale(6),
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.xs,
    alignSelf: "center",
  },
  removeImageButtonText: {
    color: Colors.white,
    fontSize: FontSizes.sm,
    fontWeight: "600",
  },

  // ========== Post Images (ADAPTIVE) ==========
  postImage: {
    flex: 1,
    height: moderateScale(150),
    borderRadius: BorderRadius.md,
    resizeMode: "cover",
  },
  postPhotoContainer: {
    width: "100%",
    height: moderateScale(150),
    marginBottom: Spacing.sm,
    //marginTop: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    overflow: "hidden",
  },
  postPhotoScrollContainer: {
    height: moderateScale(200),
  },

  // ========== Placeholder ==========
  placeholder: {
    width: moderateScale(50),
  },

  // ========== Empty States ==========
  noPostsText: {
    color: "#888",
    fontSize: FontSizes.base,
    textAlign: "center",
    fontStyle: "italic",
  },
});

// Export responsive utilities for use in other components
export const ResponsiveUtils = {
  scaleWidth,
  scaleHeight,
  scale,
  moderateScale,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
};

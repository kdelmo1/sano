import { StyleSheet } from "react-native";

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

// ==================== SPACING CONSTANTS ====================
export const Spacing = {
  xs: 5,
  sm: 8,
  md: 10,
  base: 12,
  lg: 15,
  xl: 20,
  xxl: 30,
  xxxl: 40,
};

// ==================== BORDER RADIUS CONSTANTS ====================
export const BorderRadius = {
  xs: 5,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 15,
  round: 20,
  circle: 25,
  full: 50,
};

// ==================== FONT SIZES ====================
export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 20,
  xl: 28,
  xxl: 40,
  xxxl: 42,
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

  // ========== Navigation Bar ==========
  floatingNav: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    height: 70,
    width: 390,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    ...Shadows.large,
    zIndex: 1000,
  },
  nav_button: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  navCircle: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: BorderRadius.circle,
    backgroundColor: Colors.white,
  },
  nav_icon_image: {
    width: 32,
    height: 32,
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
    marginBottom: 15,
  },
  secondaryButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: Colors.primary,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  iconText: {
    fontSize: FontSizes.xl,
  },
  inputField: {
    flex: 1,
    height: 50,
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
    height: 50,
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
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    maxHeight: 200,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
  },
  dropdownScroll: {
    maxHeight: 200,
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
    height: 50,
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
    top: 75,
    bottom: 0,
  },
  scrollContent: {
    paddingTop: Spacing.md,
    paddingBottom: 100,
  },

  // ========== Cards ==========
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    ...Shadows.card,
  },
  profileCard: {
    width: "90%",
    maxWidth: 360,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.xxl,
    alignItems: "center",
    ...Shadows.card,
    marginBottom: 30,
    marginTop: -40,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
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

  // ========== Profile Elements ==========
  profilePictureContainer: {
    marginBottom: Spacing.xl,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.profileBg,
    alignItems: "center",
    justifyContent: "center",
  },
  profileIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  profileIconImage: {
    width: 16,
    height: 16,
    tintColor: Colors.textLight,
  },
  profileIconLarge: {
    width: 75,
    height: 75,
    tintColor: Colors.white,
  },

  // ========== User Badge ==========
  userBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.badgeBg,
    borderRadius: BorderRadius.md,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: Spacing.base,
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
  },
  username: {
    fontSize: 17,
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

  // ========== Photo Upload ==========
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
    maxHeight: 220,
  },
  photoWrapper: {
    marginRight: Spacing.md,
    alignItems: "center",
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: BorderRadius.lg,
    resizeMode: "cover",
    marginBottom: Spacing.sm,
  },
  removeImageButton: {
    backgroundColor: Colors.error,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.xs,
    alignSelf: "center",
  },
  removeImageButtonText: {
    color: Colors.white,
    fontSize: FontSizes.sm,
    fontWeight: "600",
  },

  // ========== Post Images ==========
  postImage: {
    width: 200,
    height: 150,
    borderRadius: BorderRadius.sm,
    resizeMode: "cover",
    marginRight: Spacing.md,
  },
  postPhotoContainer: {
    width: "100%",
    marginBottom: Spacing.xxl,
    overflow: "hidden",
  },
  postPhotoScrollContainer: {
    height: 170,
  },

  // ========== Placeholder ==========
  placeholder: {
    width: 50,
  },

  // ========== Empty States ==========
  noPostsText: {
    color: "#888",
    fontSize: FontSizes.base,
  },
});
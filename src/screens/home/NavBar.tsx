import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  Platform,
  ScrollView,
  Animated,
  Image,
  Switch,
} from "react-native";
import React, { useEffect, useState, useContext } from "react";

interface NavBarProps {
  homeAnim: any;
  postAnim: any;
  profileAnim: any;
  onNavPress: (button: "home" | "post" | "profile") => void;
}

export default function NavBar({
  homeAnim,
  postAnim,
  profileAnim,
  onNavPress,
}: NavBarProps) {
  return (
    <View style={styles.floatingNav}>
      <Pressable style={styles.nav_button} onPress={() => onNavPress("post")}>
        <Animated.View
          style={[
            styles.navCircle,
            {
              opacity: postAnim,
              transform: [{ scale: postAnim }],
            },
          ]}
        />
        <Animated.Image
          source={require("../../assets/images/icon-post.png")}
          style={[
            styles.nav_icon_image,
            {
              tintColor: postAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["#FFF", "#D4B75F"],
              }),
            },
          ]}
        />
      </Pressable>

      <Pressable style={styles.nav_button} onPress={() => onNavPress("home")}>
        <Animated.View
          style={[
            styles.navCircle,
            {
              opacity: homeAnim,
              transform: [{ scale: homeAnim }],
            },
          ]}
        />
        <Animated.Image
          source={require("../../assets/images/icon-home.png")}
          style={[
            styles.nav_icon_image,
            {
              tintColor: homeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["#FFF", "#D4B75F"],
              }),
            },
          ]}
        />
      </Pressable>

      <Pressable
        style={styles.nav_button}
        onPress={() => onNavPress("profile")}
      >
        <Animated.View
          style={[
            styles.navCircle,
            {
              opacity: profileAnim,
              transform: [{ scale: profileAnim }],
            },
          ]}
        />
        <Animated.Image
          source={require("../../assets/images/profile-icon.png")}
          style={[
            styles.nav_icon_image,
            {
              tintColor: profileAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["#FFF", "#D4B75F"],
              }),
            },
          ]}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  screenOverlay: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  screenContent: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    overflow: "hidden",
    maxHeight: "90%",
  },
  header: {
    backgroundColor: "#D4B75F",
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFF",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 20,
    color: "#D4B75F",
    fontWeight: "600",
  },
  formContent: {
    padding: 20,
    zIndex: 1,
  },
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  iconText: {
    fontSize: 28,
  },
  dropdownWrapper: {
    flex: 1,
    position: "relative",
    zIndex: 1000,
  },
  dropdownButton: {
    height: 50,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    color: "#999",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#666",
  },
  dropdownMenu: {
    position: "absolute",
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    borderRadius: 12,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#333",
  },
  dateButton: {
    flex: 1,
    height: 50,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    paddingHorizontal: 15,
    justifyContent: "center",
  },
  dateLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  timeRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  timeFieldContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  timeButton: {
    flex: 1,
    height: 50,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  timeLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  postButtonContainer: {
    padding: 20,
    alignItems: "center",
  },
  postButton: {
    backgroundColor: "#D4B75F",
    marginTop: -15,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  postButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
  },
  timePickerModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.0)",
  },
  timePickerModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  timePickerHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  timePickerDone: {
    fontSize: 18,
    fontWeight: "600",
    color: "#D4B75F",
  },
  timePicker: {
    height: 200,
  },
  floatingNav: {
    position: "absolute" as const,
    bottom: 10,
    alignSelf: "center",
    height: 70,
    width: 390,
    backgroundColor: "#D4B75F",
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
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
    borderRadius: 25,
    backgroundColor: "#FFF",
  },
  nav_icon_image: {
    width: 32,
    height: 32,
    zIndex: 1,
  },
  giveawayText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  giveawayTextSelected: {
    color: "#FFF",
  },
  photoUploadContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "100%",
  },
  photoUploadButton: {
    backgroundColor: "#D4B75F",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: "50%",
    alignItems: "center",
    alignSelf: "center",
  },
  photoUploadButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  photoUploadButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
  photoScrollContainer: {
    marginBottom: 15,
    width: "100%",
    maxHeight: 220,
  },
  photoScrollContent: {
    flexDirection: "row",
    paddingHorizontal: 5,
  },
  photoWrapper: {
    marginRight: 10,
    alignItems: "center",
  },
  photoScrollView: {
    width: "100%",
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 12,
    resizeMode: "cover",
    marginBottom: 8,
  },
  removeImageButton: {
    backgroundColor: "#FF4D4D",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: "center",
  },
  removeImageButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    marginHorizontal: 20,
    backgroundColor: "#F0F0F0",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});

import React from "react";
import { 
  View, 
  Pressable, 
  Animated, 
  StyleSheet, 
  Image 
} from "react-native";
import { SharedStyles, Colors } from "../../styles/sharedStyles";

// Define the specific type for navigation buttons
export type NavButton = "home" | "post" | "profile";

interface NavBarProps {
  onNavPress: (button: NavButton) => void;
  unreadMessages: boolean;
  // We pass the animated values from Home so Home can control the transition logic
  homeAnim: Animated.Value;
  postAnim: Animated.Value;
  profileAnim: Animated.Value;
}

const NavBar = ({ 
  onNavPress, 
  unreadMessages, 
  homeAnim, 
  postAnim, 
  profileAnim 
}: NavBarProps) => {
  return (
    <View style={SharedStyles.floatingNav}>
      {/* POST BUTTON */}
      <Pressable
        style={SharedStyles.nav_button}
        onPress={() => onNavPress("post")}
      >
        <Animated.View
          style={[
            SharedStyles.navCircle,
            {
              opacity: postAnim,
              transform: [{ scale: postAnim }],
            },
          ]}
        />
        <Animated.Image
          source={require("../../assets/images/icon-post.png")}
          style={[
            SharedStyles.nav_icon_image,
            {
              tintColor: postAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [Colors.white, Colors.primary],
              }),
            },
          ]}
        />
      </Pressable>

      {/* HOME BUTTON */}
      <Pressable
        style={SharedStyles.nav_button}
        onPress={() => onNavPress("home")}
      >
        <Animated.View
          style={[
            SharedStyles.navCircle,
            {
              opacity: homeAnim,
              transform: [{ scale: homeAnim }],
            },
          ]}
        />
        <Animated.Image
          source={require("../../assets/images/icon-home.png")}
          style={[
            SharedStyles.nav_icon_image,
            {
              tintColor: homeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [Colors.white, Colors.primary],
              }),
            },
          ]}
        />
      </Pressable>

      {/* PROFILE BUTTON */}
      <Pressable
        style={SharedStyles.nav_button}
        onPress={() => onNavPress("profile")}
      >
        {unreadMessages && (
          <View style={styles.notificationBadge}>
            <View style={styles.redDot} />
          </View>
        )}
        <Animated.View
          style={[
            SharedStyles.navCircle,
            {
              opacity: profileAnim,
              transform: [{ scale: profileAnim }],
            },
          ]}
        />
        <Animated.Image
          source={require("../../assets/images/profile-icon.png")}
          style={[
            SharedStyles.nav_icon_image,
            {
              tintColor: profileAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [Colors.white, Colors.primary],
              }),
            },
          ]}
        />
      </Pressable>
    </View>
  );
};

// Local styles specifically for the badge (moved from Home.tsx)
const styles = StyleSheet.create({
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: Colors.error,
  },
});

export default NavBar;
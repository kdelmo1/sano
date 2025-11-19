import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  Animated,
} from "react-native";
import { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

interface ProfileScreenProps {
  user: User | null;
  goBack: () => void;
  onInboxPress: () => void; // New prop
  homeAnim: Animated.Value;
  postAnim: Animated.Value;
  profileAnim: Animated.Value;
  onNavPress: (button: "home" | "post" | "profile") => void;
  activeNav: "home" | "post" | "profile";
}

export default function ProfileScreen({
  user,
  goBack,
  onInboxPress,
  homeAnim,
  postAnim,
  profileAnim,
  onNavPress,
  activeNav,
}: ProfileScreenProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Extract user's name or email
  const displayName = user?.email?.split("@")[0] || user?.user_metadata?.name;

  return (
    <View style={styles.container}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        {/* Profile Picture */}
        <View style={styles.profilePictureContainer}>
          <View style={styles.profilePicture}>
            <Image
              source={require("../../assets/images/profile-icon.png")}
              style={styles.profileIcon}
            />
          </View>
        </View>

        {/* User Name */}
        <Text style={styles.userName}>{displayName}</Text>
      </View>

      {/* Inbox Button */}
      <Pressable style={styles.inboxButton} onPress={onInboxPress}>
        <Text style={styles.inboxButtonText}>Inbox</Text>
      </Pressable>

      {/* Logout Button */}
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>log-out</Text>
      </Pressable>

      {/* Navigation Bar */}
      <View style={styles.floatingNav}>
        <Pressable
          style={styles.nav_button}
          onPress={() => onNavPress("post")}
        >
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
                  outputRange: ['#FFF', '#D4B75F']
                }),
              },
            ]}
          />
        </Pressable>

        <Pressable
          style={styles.nav_button}
          onPress={() => onNavPress("home")}
        >
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
                  outputRange: ['#FFF', '#D4B75F']
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
                  outputRange: ['#FFF', '#D4B75F']
                }),
              },
            ]}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    paddingTop: 60,
  },
  profileCard: {
    width: "90%",
    maxWidth: 360,
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 30,
    marginTop: -40,
  },
  profilePictureContainer: {
    marginBottom: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#aeaeae",
    alignItems: "center",
    justifyContent: "center",
  },
  profileIcon: {
    width: 75,
    height: 75,
    tintColor: "#ffffffff",
  },
  userName: {
    fontSize: 42,
    fontWeight: "700",
    fontFamily: "System",
    color: "#000",
    marginBottom: -10,
    marginTop: -10,
    textAlign: "center",
  },
  inboxButton: {
    backgroundColor: "#FFF",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#D4B75F",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inboxButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#D4B75F",
  },
  logoutButton: {
    backgroundColor: "#D4B75F",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFF",
  },
  floatingNav: {
    position: "absolute",
    bottom: 10,
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
});
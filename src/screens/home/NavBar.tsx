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
import React, { useEffect, useState, useContext, useRef } from "react";

type NavButton = "home" | "post" | "profile";

interface NavBarProps {
  onNavPress: (button: "home" | "post" | "profile") => void;
  button: NavButton;
}

export default function NavBar({ onNavPress, button }: NavBarProps) {
  const homeAnim = useRef(new Animated.Value(1)).current;
  const postAnim = useRef(new Animated.Value(0)).current;
  const profileAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animations = {
      home: homeAnim,
      post: postAnim,
      profile: profileAnim,
    };

    Object.entries(animations).forEach(([key, anim]) => {
      Animated.timing(anim, {
        toValue: key === button ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [button]);

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
  floatingNav: {
    position: "absolute",
    bottom: "5%",
    alignSelf: "center",
    height: 70,
    width: "90%",
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
});

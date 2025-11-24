import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useState, useRef, useContext, useEffect } from "react";
import Form from "./form";
import ProfileScreen from "../profile/ProfileScreen";
import InboxScreen from "../profile/InboxScreen";
import NavBar from "./NavBar";
import Feed from "./Feed";

declare global {
  type NavButton = "feed" | "profile" | "form";
}
type Screen = "feed" | "profile" | "form" | "inbox";

export default function Home() {
  const [activeNav, setActiveNav] = useState<NavButton>("feed");
  const [screen, setScreen] = useState<Screen>("feed");

  const insets = useSafeAreaInsets();

  //dont know what this for
  function combineDateAndTime(date: Date, time: Date) {
    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return combined;
  }

  const handleNavPress = (button: NavButton) => {
    if (button === "feed") {
      setScreen("feed");
    } else if (button === "form") {
      setScreen("form");
    } else if (button === "profile") {
      setScreen("profile");
    }
  };

  useEffect(() => {
    if (screen !== "inbox") {
      setActiveNav(screen);
    }
  }, [screen]);

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingBottom: insets.bottom,
        paddingRight: insets.right,
        backgroundColor: "#F5F5F5",
        flex: 1,
      }}
    >
      <Rendering screen={screen} setScreen={setScreen} />
      <NavBar onNavPress={handleNavPress} button={activeNav} />
    </View>
  );
}

function Rendering({
  screen,
  setScreen,
}: {
  screen: string;
  setScreen: React.Dispatch<React.SetStateAction<Screen>>;
}) {
  const [getPost, setGetPost] = useState(false);

  if (screen === "feed") {
    return (
      <View style={styles.container}>
        <Feed refresh={getPost} />
        <StatusBar style="auto" />
      </View>
    );
  }
  if (screen === "form") {
    return (
      <Form
        onPostSuccess={() => {
          setGetPost((prev) => !prev);
        }}
        onClose={() => {
          setScreen("feed");
        }}
      />
    );
  }

  if (screen === "inbox") {
    return (
      <InboxScreen
        goBack={() => {
          setScreen("profile");
        }}
      />
    );
  }

  if (screen === "profile") {
    return (
      <ProfileScreen
        goBack={() => {
          setScreen("feed");
        }}
        onInboxPress={() => {
          setScreen("inbox");
        }}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
});

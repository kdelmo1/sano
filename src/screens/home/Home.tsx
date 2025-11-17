import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  RefreshControl,
  TextInput,
  Animated,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useEffect, useState, useRef, useContext } from "react";
import Post from "./post";
import Form from "./form";
import ProfileScreen from "../profile/ProfileScreen";
import InboxScreen from "../profile/InboxScreen";
import { supabase } from "../../lib/supabase";
import AuthContext from "../../../src/context/AuthContext";

type NavButton = "home" | "post" | "profile";
type Screen = "feed" | "chat" | "profile" | "inbox";

export default function Home() {
  const [posts, setPosts] = useState<
    {
      id: string;
      title: string;
      startTime: string;
      endTime: string;
      name: string;
      content: string;
    }[]
  >([]);

  const [activeNav, setActiveNav] = useState<NavButton>("home");
  const [toPost, setToPost] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [getPost, setGetPost] = React.useState(false);
  const [screen, setScreen] = useState<Screen>("feed");

  const homeAnim = useRef(new Animated.Value(1)).current;
  const postAnim = useRef(new Animated.Value(0)).current;
  const profileAnim = useRef(new Animated.Value(0)).current;

  const onRefresh = () => {
    setGetPost(!getPost);
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const insets = useSafeAreaInsets();

  useEffect(() => {
    async function getFromDB() {
      const { data, error } = await supabase
        .from("Posts")
        .select(`*`)
        .order("startTime", { ascending: true });

      setPosts([]);
      if (error) {
        console.log("err", error);
      } else {
        setPosts(
          data.map((val) => {
            return {
              id: val["postID"],
              title: val["title"] || "Untitled Post",
              startTime: val["startTime"],
              endTime: val["endTime"] || val["startTime"],
              name: val["name"],
              content: val["content"],
            };
          })
        );
      }
    }
    getFromDB();
  }, [getPost]);

  const animateNavButton = (button: NavButton) => {
    const animations = {
      home: homeAnim,
      post: postAnim,
      profile: profileAnim,
    };

    Object.entries(animations).forEach(([key, anim]) => {
      Animated.spring(anim, {
        toValue: key === button ? 1 : 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    });

    setActiveNav(button);
  };

  const handleNavPress = (button: NavButton) => {
    animateNavButton(button);

    if (button === "home") {
      onRefresh();
      setScreen("feed");
    } else if (button === "post") {
      setToPost(true);
    } else if (button === "profile") {
      setScreen("profile");
    }
  };

  if (screen === "inbox") {
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
        <InboxScreen
          goBack={() => {
            setScreen("profile");
          }}
          homeAnim={homeAnim}
          postAnim={postAnim}
          profileAnim={profileAnim}
          onNavPress={handleNavPress}
          activeNav={activeNav}
        />
      </View>
    );
  }

  if (screen === "profile") {
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
        <ProfileScreen
          goBack={() => {
            setScreen("feed");
            animateNavButton("home");
          }}
          onInboxPress={() => {
            setScreen("inbox");
          }}
          homeAnim={homeAnim}
          postAnim={postAnim}
          profileAnim={profileAnim}
          onNavPress={handleNavPress}
          activeNav={activeNav}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingBottom: insets.bottom,
        paddingRight: insets.right,
        backgroundColor: "#F5F5F5",
      }}
    >
      <View style={styles.container}>
        <View style={styles.floatingSearchBar}>
          <TextInput
            style={styles.search_input}
            placeholder="type something..."
            placeholderTextColor="#999"
          />
          <Pressable style={styles.searchButton}>
            <Image
              source={require("../../assets/images/icon-search.png")}
              style={styles.searchIcon}
            />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroller}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {posts.map((post) => {
            return (
              <Post
                key={post.id}
                id={post.id}
                title={post.title}
                startTime={post.startTime}
                endTime={post.endTime}
                name={post.name}
                isPoster={false}
                from={"feed"}
              />
            );
          })}
        </ScrollView>

        <Form
          toPost={toPost}
          setToPost={setToPost}
          onPostSuccess={() => setGetPost((prev) => !prev)}
          onClose={() => animateNavButton("home")}
        />

        <View style={styles.floatingNav}>
          <Pressable
            style={styles.nav_button}
            onPress={() => handleNavPress("post")}
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
            <Image
              source={require("../../assets/images/icon-post.png")}
              style={[
                styles.nav_icon_image,
                {
                  tintColor: activeNav === "post" ? "#D4B75F" : "#FFF",
                },
              ]}
            />
          </Pressable>

          <Pressable
            style={styles.nav_button}
            onPress={() => handleNavPress("home")}
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
            <Image
              source={require("../../assets/images/icon-home.png")}
              style={[
                styles.nav_icon_image,
                {
                  tintColor: activeNav === "home" ? "#D4B75F" : "#FFF",
                },
              ]}
            />
          </Pressable>

          <Pressable
            style={styles.nav_button}
            onPress={() => handleNavPress("profile")}
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
            <Image
              source={require("../../assets/images/profile-icon.png")}
              style={[
                styles.nav_icon_image,
                {
                  tintColor: activeNav === "profile" ? "#D4B75F" : "#FFF",
                },
              ]}
            />
          </Pressable>
        </View>
        <StatusBar style="auto" />
      </View>
    </View>
  );
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
  floatingSearchBar: {
    position: "absolute" as const,
    top: 17,
    width: 350,
    height: 45,
    backgroundColor: "#E8E8E8",
    borderColor: "#cacaca",
    borderWidth: 2,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  search_input: {
    flex: 1,
    fontSize: 20,
    color: "#333",
    paddingLeft: 15,
  },
  searchButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  searchIcon: {
    width: 24,
    height: 24,
    tintColor: "#999",
    paddingRight: 5,
  },
  scroller: {
    backgroundColor: "#F5F5F5",
    position: "absolute" as const,
    width: "100%",
    top: 75,
    bottom: 0,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 100,
  },
  floatingNav: {
    position: "absolute" as const,
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

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
import React, { useEffect, useState, useRef } from "react";
import Post from "./post";
import Form from "./form";
import ChatScreen from "../chat/chatScreen";
import { supabase } from "../../lib/supabase";
import { User } from "@supabase/supabase-js";

type NavButton = "home" | "post" | "signout";
type Screen = "feed" | "chat";

export default function Home(data: { user: User | null }) {
  const [posts, setPosts] = React.useState<
    { id: string; title: string; startTime: string; endTime: string; name: string; content: string }[]
  >([]);

  const [activeNav, setActiveNav] = useState<NavButton>("home");
  const [toPost, setToPost] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [getPost, setGetPost] = React.useState(false);
  const [openPost, setOpenPost] = React.useState("");
  const [screen, setScreen] = useState<Screen>("feed");
  const [selectedPost, setSelectedPost] = useState<{ id: string; title: string; name: string } | null>(null);

  // Animation values for each button
  const homeAnim = useRef(new Animated.Value(1)).current;
  const postAnim = useRef(new Animated.Value(0)).current;
  const signoutAnim = useRef(new Animated.Value(0)).current;

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
        .order("startTime", { ascending: false });

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

  // Animate nav button selection
  const animateNavButton = (button: NavButton) => {
    const animations = {
      home: homeAnim,
      post: postAnim,
      signout: signoutAnim,
    };

    // Animate all buttons
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
    } else if (button === "post") {
      setToPost(true);
    } else if (button === "signout") {
      supabase.auth.signOut();
    }
  };
  if (screen === "chat") {
    return (
      <View
        style={{
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingBottom: insets.bottom,
          paddingRight: insets.right,
          backgroundColor: "#FFFFFF",
          flex: 1,
        }}
      >
        <ChatScreen 
        goBack={() => setScreen("feed")}
        postName={selectedPost?.name ?? ""}/>
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
        <View style={styles.navbar}>
          <View style={styles.search_bar_container}>
            <TextInput
              style={styles.search_input}
              placeholder="type something..."
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <ScrollView
          style={styles.scroller}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {posts.map((post) => (
            <Post
              key={post.id}
              id={post.id}
              title={post.title}
              startTime={post.startTime}
              endTime={post.endTime}
              name={post.name}
              openPost={openPost}
              setOpenPost={setOpenPost}
              onOpen={() => {
                  setSelectedPost({ id: post.id, title: post.title, name: post.name });
                  setScreen("chat");
                  }}
            />
          ))}
        </ScrollView>

        <Form
          user={data.user}
          toPost={toPost}
          setToPost={setToPost}
          onPostSuccess={() => setGetPost((prev) => !prev)}
        />

        {/* Floating Navigation Bar */}
        <View style={styles.floatingNav}>
          {/* Post Button */}
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

          {/* Home Button */}
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

          {/* Sign Out Button */}
          <Pressable
            style={styles.nav_button}
            onPress={() => handleNavPress("signout")}
          >
            <Animated.View
              style={[
                styles.navCircle,
                {
                  opacity: signoutAnim,
                  transform: [{ scale: signoutAnim }],
                },
              ]}
            />
            <Image
              source={require("../../assets/images/icon-signout.png")}
              style={[
                styles.nav_icon_image,
                {
                  tintColor: activeNav === "signout" ? "#D4B75F" : "#FFF",
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
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  navbar: {
    backgroundColor: "#F5F5F5",
    position: "absolute" as const,
    top: 0,
    width: "100%",
    paddingTop: 10,
    zIndex: 10,
  },
  search_bar_container: {
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 15,
    paddingTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  search_input: {
    width: "85%",
    height: 45,
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#333",
  },
  scroller: {
    backgroundColor: "#F5F5F5",
    position: "absolute" as const,
    width: "100%",
    top: 80,
    bottom: 100,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 20,
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
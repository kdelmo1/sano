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
type Screen = "feed" | "chat" | "profile" | "inbox" | "form";

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

  // Filter values
  const [showFilter, setShowFilter] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedTime, setSelectedTime] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [tempLocation, setTempLocation] = useState(selectedLocation);
  const [tempTime, setTempTime] = useState(selectedTime);
  const [tempTag, setTempTag] = useState(selectedTag);
  const openFilterModal = () => {
    setTempLocation(selectedLocation);
    setTempTime(selectedTime);
    setShowFilter(true);
  };


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
      let query = supabase.from("Posts").select("*").order("startTime", { ascending: true });

      // Filter by location
      if (selectedLocation !== "all") {
        query = query.eq("location", selectedLocation);
      }

      // Filter by time
      if (selectedTime !== "all") {
        const now = new Date();
        let since = new Date();
        if (selectedTime === "24h") since.setDate(now.getDate() - 1);
        if (selectedTime === "7d") since.setDate(now.getDate() - 7);
        if (selectedTime === "30d") since.setDate(now.getDate() - 30);
        query = query.gte("startTime", since.toISOString());
      }

      // Do smth for tags...cuz i see no tags on supabase

      const { data, error } = await query;


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
  }, [getPost, selectedLocation, selectedTime]);

  const animateNavButton = (button: NavButton) => {
    const animations = {
      home: homeAnim,
      post: postAnim,
      profile: profileAnim,
    };

    setActiveNav(button);

    Object.entries(animations).forEach(([key, anim]) => {
      Animated.timing(anim, {
        toValue: key === button ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };


  const handleNavPress = (button: NavButton) => {
    animateNavButton(button);

    if (button === "home") {
      onRefresh();
      setScreen("feed");
    } else if (button === "post") {
      setToPost(true);
      setScreen("form");
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
        <View style={styles.navbar}>
          <View style={styles.search_bar_container}>

            {/* Filter Open Button */}
            <Pressable
              style={{
                backgroundColor: "#E8E8E8",
                padding: 10,
                marginTop: 10,
                marginHorizontal: 15,
                borderRadius: 8,
                alignItems: "center",
              }}
              onPress={() => setShowFilter(!showFilter)}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>
                {showFilter ? "Hide Filters ▲" : "Show Filters ▼"}
              </Text>
            </Pressable>
            {/* Filter Screen */}
            <Modal
              visible={showFilter}
              animationType="slide"
              transparent={false} // false means it takes full screen
              onRequestClose={() => setShowFilter(false)}
            >
              <View style={{ flex: 1, backgroundColor: "#fff" }}>
                {/* Header Title and Buttons */}
                <View
                  style={styles.filterHeader}
                >
                  <Pressable onPress={() => setShowFilter(false)}>
                    <Text style={{ fontSize: 18, color: "#007AFF" }}>Cancel</Text>
                  </Pressable>
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>Filter Posts</Text>
                  <Pressable
                    onPress={() => {
                      setSelectedLocation(tempLocation);
                      setSelectedTime(tempTime);
                      setShowFilter(false);
                    }}>
                    <Text style={{ fontSize: 18, color: "#007AFF" }}>Done</Text>
                  </Pressable>
                </View>
                {/* Scrollable filter options */}
                <ScrollView
                  style={{ flex: 1, padding: 15 }}
                  contentContainerStyle={{ paddingBottom: 50 }}
                >
                  <Filter
                    selectedLocation={tempLocation}
                    setSelectedLocation={setTempLocation}
                    selectedTime={tempTime}
                    setSelectedTime={setTempTime}
                    selectedTag={tempTag}
                    setSelectedTag={setTempTag}
                  />
                </ScrollView>
              </View>
            </Modal>
          </View>
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

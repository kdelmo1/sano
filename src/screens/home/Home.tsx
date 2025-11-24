import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  RefreshControl,
  Animated,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useEffect, useState, useRef, useContext } from "react";
import { supabase } from "../../lib/supabase";
import AuthContext from "../../../src/context/AuthContext";
import Post from "./post";
import Form from "./form";
import Filter from "./filter";
import getFromDB from "../GetFromDB";
import ProfileScreen from "../profile/ProfileScreen";
import InboxScreen from "../profile/InboxScreen";

// Import shared styles
import { 
  Colors, 
  Spacing, 
  BorderRadius, 
  Shadows, 
  SharedStyles 
} from "../../styles/sharedStyles";

type NavButton = "home" | "post" | "profile";
type Screen = "feed" | "chat" | "profile" | "inbox" | "form";

export default function Home() {
  const { user, emailHandle } = useContext(AuthContext);

  const [posts, setPosts] = useState<PostProps[]>([]);
  const [activeNav, setActiveNav] = useState<NavButton>("home");
  const [toPost, setToPost] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [getPost, setGetPost] = useState(false);
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

  const onRefresh = () => {
    setGetPost(!getPost);
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const insets = useSafeAreaInsets();

  useEffect(() => {
    getFromDB("feed", emailHandle, selectedLocation, selectedTime, setPosts);
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
      setToPost(false);
    } else if (button === "post") {
      setToPost(true);
      setScreen("form");
    } else if (button === "profile") {
      setScreen("profile");
    }
  };

  // Single NavBar Component using SharedStyles
  const renderNavBar = () => (
    <View style={SharedStyles.floatingNav}>
      <Pressable
        style={SharedStyles.nav_button}
        onPress={() => handleNavPress("post")}
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

      <Pressable
        style={SharedStyles.nav_button}
        onPress={() => handleNavPress("home")}
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

      <Pressable
        style={SharedStyles.nav_button}
        onPress={() => handleNavPress("profile")}
      >
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

  // Render different screens based on state
  const renderScreen = () => {
    switch (screen) {
      case "form":
        return (
          <Form
            toPost={toPost}
            setToPost={setToPost}
            onPostSuccess={() => {
              setGetPost((prev) => !prev);
            }}
            onClose={() => {
              setToPost(false);
              setScreen("feed");
              animateNavButton("home");
            }}
          />
        );

      case "inbox":
        return (
          <InboxScreen
            goBack={() => {
              setScreen("profile");
            }}
          />
        );

      case "profile":
        return (
          <ProfileScreen
            goBack={() => {
              setScreen("feed");
              animateNavButton("home");
            }}
            onInboxPress={() => {
              setScreen("inbox");
            }}
          />
        );

      case "feed":
      default:
        return (
          <View style={styles.container}>
            <View style={styles.navbar}>
              <View style={styles.search_bar_container}>
                <Pressable style={styles.filterButton} onPress={() => setShowFilter(!showFilter)}>
                  <Text style={styles.filterButtonText}>
                    {showFilter ? "Hide Filters ▲" : "Show Filters ▼"}
                  </Text>
                </Pressable>

                <Modal
                  visible={showFilter}
                  animationType="slide"
                  transparent={false}
                  onRequestClose={() => setShowFilter(false)}
                >
                  <View style={{ flex: 1, backgroundColor: Colors.white }}>
                    <View style={styles.filterHeader}>
                      <Pressable onPress={() => setShowFilter(false)}>
                        <Text style={styles.filterActionText}>Cancel</Text>
                      </Pressable>
                      <Text style={styles.filterTitle}>Filter Posts</Text>
                      <Pressable
                        onPress={() => {
                          setSelectedLocation(tempLocation);
                          setSelectedTime(tempTime);
                          setShowFilter(false);
                        }}
                      >
                        <Text style={styles.filterActionText}>Done</Text>
                      </Pressable>
                    </View>
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
              style={SharedStyles.scroller}
              contentContainerStyle={SharedStyles.scrollContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {posts.map((post) => {
                return (
                  <Post
                    key={post.id}
                    id={post.id}
                    location={post.location}
                    startTime={post.startTime}
                    endTime={post.endTime}
                    name={post.name}
                    isPoster={false}
                    fromScreen={"feed"}
                    isFoodGiveaway={post.isFoodGiveaway}
                    photoUrls={post.photoUrls}
                  />
                );
              })}
            </ScrollView>
          </View>
        );
    }
  };

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingBottom: insets.bottom,
        paddingRight: insets.right,
        backgroundColor: Colors.background,
        flex: 1,
      }}
    >
      {renderScreen()}
      {renderNavBar()}
      <StatusBar style="auto" />
    </View>
  );
}

// Component-specific styles with overrides to match original
const styles = StyleSheet.create({
  container: {
    display: "flex",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  navbar: {
    backgroundColor: Colors.background,
    position: "absolute" as const,
    top: 0,
    width: "100%",
    paddingTop: Spacing.sm,
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
  filterButton: {
    backgroundColor: "#E8E8E8",
    padding: 10,
    marginTop: 10,
    marginHorizontal: 15,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  filterHeader: {
    paddingTop: 60,
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterActionText: {
    fontSize: 18,
    color: "#007AFF",
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
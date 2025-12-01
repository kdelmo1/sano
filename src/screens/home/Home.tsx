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
  SharedStyles,
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

  const [unreadMessages, setUnreadMessages] = useState(false);

  // Filter values
  const [showFilter, setShowFilter] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<Date | null>(null);
  const [selectedTag, setSelectedTag] = useState("all");

  const onRefresh = () => {
    setGetPost(!getPost);
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleApplyFilter = (
    selectedLocation: string,
    selectedDate: Date | null,
    selectedStartTime: Date | null,
    selectedEndTime: Date | null,
    selectedTag: string
  ) => {
    setShowFilter(false);
    setSelectedLocation(selectedLocation);
    setSelectedDate(selectedDate);
    setSelectedStartTime(selectedStartTime);
    setSelectedEndTime(selectedEndTime);
    setSelectedTag(selectedTag);
  };

  const handleCloseFilter = () => {
    setShowFilter(false);
    setSelectedLocation("");
    setSelectedDate(null);
    setSelectedStartTime(null);
    setSelectedEndTime(null);
    setSelectedTag("");
  };

  const insets = useSafeAreaInsets();

  useEffect(() => {
    getFromDB(
      "feed",
      emailHandle,
      setPosts,
      selectedLocation,
      selectedDate,
      selectedStartTime,
      selectedEndTime,
      selectedTag
    );
  }, [
    getPost,
    selectedLocation,
    selectedDate,
    selectedStartTime,
    selectedEndTime,
    selectedTag,
  ]);

  useEffect(() => {
    const channelName = `notification:${emailHandle}`;
    const room = supabase.channel(channelName, {
      config: {
        broadcast: {
          self: true,
        },
        presence: {
          key: user?.id,
        },
      },
    });
    const initNotification = async () => {
      const { data, error } = await supabase
        .from("chat")
        .select()
        .eq("receiver", emailHandle)
        .eq("read", false);
      if (error) {
        console.log("error notification");
      } else if (data.length !== 0) {
        setUnreadMessages(true);
      }
    };

    initNotification();

    room.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat",
        filter: `receiver=eq.${emailHandle}`,
      },
      (payload) => {
        console.log(payload);
        setUnreadMessages(true);
      }
    );

    room.subscribe(async (status) => {
      console.log(status);
      if (status === "SUBSCRIBED") {
        await room.track({
          id: user?.id,
        });
      }
    });

    return () => {
      room.unsubscribe();
    };
  }, []);

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
      setToPost(false);
      setScreen("feed");
      setToPost(false);
    } else if (button === "post") {
      setToPost(true);
      setScreen("form");
    } else if (button === "profile") {
      setToPost(false);
      setScreen("profile");
    }
    /*else if (button === "filter") {
      setScreen("filter");
    }*/
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
        {unreadMessages && <Text>Notification</Text>}
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

      default:
        return (
          <View style={styles.container}>
            <View style={styles.navbar}>
              <View style={styles.search_bar_container}>
                <Pressable
                  style={styles.filterButton}
                  onPress={() => setShowFilter(!showFilter)}
                >
                  <Text style={styles.filterButtonText}>
                    {showFilter ? "Hide Filters ▲" : "Show Filters ▼"}
                  </Text>
                </Pressable>
                <Filter
                  showFilter={showFilter}
                  selectedLocation={selectedLocation}
                  selectedDate={selectedDate}
                  selectedStartTime={selectedStartTime}
                  selectedEndTime={selectedEndTime}
                  selectedTag={selectedTag}
                  onClose={handleCloseFilter}
                  onApplyFilter={handleApplyFilter}
                />
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
                    slots={post.slots}
                    isPoster={false}
                    fromScreen={"feed"}
                    isFoodGiveaway={post.isFoodGiveaway}
                    photoUrls={post.photoUrls}
                    posterRating={post.posterRating}
                    reservePostInit={post.reservePostInit}
                    refreshHome={onRefresh}
                  />
                );
              })}
            </ScrollView>
          </View>
        );
    }
  };

  function combineDateAndTime(date: Date, time: Date) {
    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return combined;
  }

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
    backgroundColor: "#D4B75F",
    paddingVertical: 15,
    paddingHorizontal: 20,
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

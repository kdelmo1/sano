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
  
  const [selectedLocation, setSelectedLocation] = useState("");
  const [tempLocation, setTempLocation] = useState(selectedLocation);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tempDate, setTempDate] = useState<Date | null>(selectedDate);
  const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null);
  const [tempStartTime, setTempStartTime] = useState<Date | null>(selectedStartTime);
  const [selectedEndTime, setSelectedEndTime] = useState<Date | null>(null);
  const [tempEndTime, setTempEndTime] = useState<Date | null>(selectedEndTime);

  const [selectedTag, setSelectedTag] = useState("all");
  const [tempTag, setTempTag] = useState(selectedTag);

  const openFilterModal = () => {
    setTempLocation(selectedLocation);
    setTempStartTime(selectedStartTime);
    setShowFilter(true);
  };

  const onRefresh = () => {
    setGetPost(!getPost);
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const insets = useSafeAreaInsets();

  useEffect(() => {
    getFromDB("feed", emailHandle, selectedLocation, selectedDate, selectedStartTime, selectedEndTime, setPosts);
  }, [getPost, selectedLocation, selectedDate, selectedStartTime, selectedEndTime]);

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
    /*else if (button === "filter") {
      setScreen("filter");
    }*/
  };

  if (screen === "form") {
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
          homeAnim={homeAnim}
          postAnim={postAnim}
          profileAnim={profileAnim}
          onNavPress={handleNavPress}
        />
      </View>
    );
  }

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

  /*if (screen === "filter") {
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
        <Filter
          selectedLocation={tempLocation}
          setSelectedLocation={setTempLocation}
          selectedTime={tempTime}
          setSelectedTime={setTempTime}
          selectedTag={tempTag}
          setSelectedTag={setTempTag}
        />
      </View>
    );
  }*/

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
              //onPress={() => handleNavPress("filter")}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>
                {showFilter ? "Hide Filters ▲" : "Show Filters ▼"}
              </Text>
            </Pressable>
            {/* Filter Screen */}
            <Modal
              visible={showFilter}
              animationType="fade"
              transparent={true}
              onRequestClose={() => setShowFilter(false)}
            >
              <View style={styles.modalOverlay}>
                {/* Header Title and Buttons */}
                <View style={styles.modalContent}>
                  <View style={styles.filterHeader}>
                    <Pressable
                      style={styles.closeButton}
                      onPress={() => {
                        setSelectedLocation("");
                        setSelectedDate(null);
                        setSelectedStartTime(null);
                        setSelectedEndTime(null);
                        setSelectedTag("");
                        setShowFilter(false);
                      }}
                    >
                      <Text style={styles.closeButtonText}>x</Text>
                    </Pressable>
                    <Text style={styles.headerTitle}>Filter Posts</Text>
                    <Pressable
                      style={styles.applyButton}
                      onPress={() => {
                        setSelectedLocation(tempLocation);
                        setSelectedDate(tempDate);
                        if (tempDate && tempStartTime) {
                          setSelectedStartTime(combineDateAndTime(tempDate, tempStartTime));
                        } else {
                          setSelectedStartTime(null);
                        }
                        if (tempDate && tempEndTime) {
                          setSelectedEndTime(combineDateAndTime(tempDate, tempEndTime));
                        } else {
                          setSelectedEndTime(null);
                        }
                        //setSelectedTag(tempTag); // Tags not implemented yet
                        setShowFilter(false);
                      }}
                    >
                      <Text style={styles.applyButtonText}>Apply</Text>
                    </Pressable>
                  </View>

                  {/* Scrollable filter options */}
                  <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
                  >
                    <Filter
                      selectedLocation={tempLocation}
                      setSelectedLocation={setTempLocation}
                      selectedDate={tempDate}
                      setSelectedDate={setTempDate}
                      selectedStartTime={tempStartTime}
                      setSelectedStartTime={setTempEndTime}
                      selectedEndTime={tempStartTime}
                      setSelectedEndTime={setTempEndTime}
                      selectedTag={tempTag}
                      setSelectedTag={setTempTag}
                    />
                  </ScrollView>
                </View>
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
                location={post.location}
                startTime={post.startTime}
                endTime={post.endTime}
                name={post.name}
                isPoster={false}
                fromScreen={"feed"}
              />
            );
          })}
        </ScrollView>

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
                    outputRange: ["#FFF", "#D4B75F"],
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
                    outputRange: ["#FFF", "#D4B75F"],
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
                    outputRange: ["#FFF", "#D4B75F"],
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
  /*filterHeader: {
    paddingTop: 60,
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },*/
  filterHeader: {
    backgroundColor: "#D4B75F",
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    width: "90%",
    height: "80%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: "hidden",
  },
  headerTitle: {
    fontSize: 20,
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
    lineHeight: 20
  },
  applyButton: {
    backgroundColor: "#FFF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#D4B75F",
  },
});

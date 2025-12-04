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
  const [filteredPosts, setFilteredPosts] = useState<PostProps[]>([]);

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

  const onRefresh = () => {
    setGetPost(!getPost);
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const toLocalISOWithTimezone = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");

    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? "+" : "-";
    const absOffset = Math.abs(offset);

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds()
    )}${sign}${pad(Math.floor(absOffset / 60))}:${pad(absOffset % 60)}`;
  };

  const handleApplyFilter = (
    selectedLocation: string,
    selectedDate: Date | null,
    selectedStartTime: Date | null,
    selectedTag: string
  ) => {
    setFilteredPosts(posts);
    if (selectedLocation && selectedLocation !== "All Location") {
      setFilteredPosts((prev) =>
        prev.filter((post) => post.location === selectedLocation)
      );
    }

    // Filter by specific date time
    if (selectedDate && selectedStartTime) {
      const selectedDateTime = new Date(
        `${selectedDate.toISOString().split("T")[0]}T${
          selectedStartTime.toISOString().split("T")[1]
        }`
      );
      setFilteredPosts((prev) =>
        prev.filter((post) => {
          const postStartDate = new Date(post.startTime);
          const postEndDate = new Date(post.endTime);
          return (
            postStartDate <= selectedDate && postEndDate >= selectedDateTime
          );
        })
      );
    }
    // Filter by specific date
    else if (selectedDate) {
      const localSelectedDate =
        toLocalISOWithTimezone(selectedDate).split("T")[0];
      setFilteredPosts((prev) =>
        prev.filter((post) => {
          const postStartDate = toLocalISOWithTimezone(
            new Date(post.startTime)
          ).split("T")[0];
          const postEndDate = toLocalISOWithTimezone(
            new Date(post.endTime)
          ).split("T")[0];
          return (
            localSelectedDate === postStartDate ||
            localSelectedDate === postEndDate
          );
        })
      );
      //eq("date", toLocalISOWithTimezone(selectedDate).split("T"));
    }

    /*
12/3T1:38am-5:08pm
12/3T2:38am-3:08pm
12/3T3:38am-5:08pm
12/4T2:38am-3:08pm
*/

    // Filter with times
    else if (selectedStartTime) {
      const selectedHour = selectedStartTime.getHours();
      const selectedMinute = selectedStartTime.getMinutes();
      const selectedTimeInMinutes = selectedHour * 60 + selectedMinute;
      setFilteredPosts((prev) =>
        prev.filter((post) => {
          const postStartTime = new Date(post.startTime);
          const postEndTime = new Date(post.endTime);

          const startHours = postStartTime.getHours();
          const startMinutes = postStartTime.getMinutes();
          const startTimeInMinutes = startHours * 60 + startMinutes;

          const differenceInMinutes =
            (postEndTime.getTime() - postStartTime.getTime()) / 60000;

          return (
            selectedTimeInMinutes >= startTimeInMinutes &&
            selectedTimeInMinutes <= startTimeInMinutes + differenceInMinutes
          );
        })
      );
    }

    if (selectedTag && selectedTag !== "All Tags") {
      setFilteredPosts((prev) =>
        prev.filter(
          (post) => (selectedTag === "Food Giveaway") === post.isFoodGiveaway
        )
      );
    }

    setShowFilter(false);
  };

  const handleCloseFilter = () => {
    setShowFilter(false);
  };

  const insets = useSafeAreaInsets();

  useEffect(() => {
    getFromDB("feed", emailHandle, setPosts);
  }, [getPost]);

  useEffect(() => {
    setFilteredPosts(posts);
  }, [posts]);

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
        setUnreadMessages(true);
      }
    );

    room.subscribe(async (status) => {
      //console.log("status", status);
      if (status === "SUBSCRIBED") {
        await room.track({
          id: user?.id,
        });
      }
    });

    return () => {
      room.unsubscribe();
    };
  }, [screen]);

  useEffect(() => {
    if (screen === "profile") {
      const markRead = async () => {
        const { data, error } = await supabase
          .from("chat")
          .update({ read: true })
          .eq("receiver", emailHandle);
        if (error) {
          console.log("error on read message");
        } else {
          setUnreadMessages(false);
        }
      };
      markRead();
    }
  }, [screen]);

  useEffect(() => {
    const channelName = `notification:${emailHandle}`;
    const room = supabase.channel(channelName, {
      config: {
        broadcast: {
          self: true,
        },
        presence: {
          key: user?.id,
        }
      }
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
    }

    initNotification();

    room.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat",
        filter: `receiver=eq.${emailHandle}`,
      }, (payload) => {
        console.log(payload);
        setUnreadMessages(true);
      });

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
    }
  }, []);

  useEffect(() => {
    if (screen === 'profile') {
      const markRead = async () => {
        const { data, error } = await supabase
          .from("chat")
          .update({ read: true })
          .eq("receiver", emailHandle)
        if (error) {
          console.log("error on read message");
        } else {
          setUnreadMessages(false);
        }
      }
      markRead();
    }
  }, [screen]);

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
              {filteredPosts.map((post) => {
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

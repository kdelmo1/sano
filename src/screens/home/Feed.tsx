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
import Post from "./post";
import Filter from "./filter";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../../../src/context/AuthContext";
import getFromDB from "../GetFromDB";

interface FeedProps {
  refresh: boolean;
}

export default function Feed({ refresh }: FeedProps) {
  const { user, emailHandle } = useContext(AuthContext);

  const [posts, setPosts] = useState<PostProps[]>([]);

  const [refreshing, setRefreshing] = useState(false);
  const [getPost, setGetPost] = useState(false);

  // filter components
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

  useEffect(() => {
    onRefresh();
  }, [refresh]);

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

  return (
    <>
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
              isFoodGiveaway={post.isFoodGiveaway}
              photoUrls={post.photoUrls}
              posterRating={post.posterRating}
              reservePostInit={post.reservePostInit}
              refreshHome={onRefresh}
            />
          );
        })}
      </ScrollView>
    </>
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
    height: "43%",
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
    lineHeight: 20,
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

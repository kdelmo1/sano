import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  RefreshControl,
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
});

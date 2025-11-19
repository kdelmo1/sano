import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  ScrollView,
} from "react-native";

export default function Post(data: {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  name: string;
  isFoodGiveaway: boolean;
  photoUrls: string[];
  openPost: string;
  setOpenPost: React.Dispatch<React.SetStateAction<string>>;
  onOpen: () => void;
}) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date
      .toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const isOpen = data.openPost === data.id;

  const now = new Date();
  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);

  const isCurrentlyActive = now >= startTime && now <= endTime;

  if (now > endTime) {
    return null;
  }

  return (
    <View style={styles.post_container}>
      <Pressable onPress={data.onOpen}>
        <View style={styles.post}>
          <Text style={styles.title}>{data.title}</Text>

          <Text style={styles.date}>{formatDate(data.startTime)}</Text>

          <Text style={styles.timeRange}>
            @ {formatTime(data.startTime)} - {formatTime(data.endTime)}
            {isCurrentlyActive && (
              <Text style={styles.nowIndicator}> (now)</Text>
            )}
          </Text>

          <View style={styles.userBadgeContainer}>
            <View style={styles.userBadge}>
              <View style={styles.profileIcon}>
                <Image
                  source={require("../../assets/images/profile-icon.png")}
                  style={styles.profileIconImage}
                />
              </View>
              <Text style={styles.username}>{data.name}</Text>
            </View>
          </View>
        </View>
      </Pressable>
      {data.isFoodGiveaway && data.photoUrls.length > 0 && (
        <View style={styles.photoContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            style={styles.photoScrollContainer}
          >
            {data.photoUrls.map((photoUrl, index) => (
              <Image
                key={index}
                source={{ uri: photoUrl }}
                style={styles.postImage}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  post_container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  post: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
    fontFamily: "System",
    color: "#000",
    marginTop: -10,
    marginLeft: -5,
  },
  date: {
    fontSize: 20,
    fontWeight: "600",
    fontStyle: "italic",
    color: "#999",
    marginTop: 0,
    marginLeft: -5,
    marginBottom: 4,
  },
  timeRange: {
    fontSize: 20,
    fontWeight: "500",
    fontStyle: "italic",
    color: "#9e9e9e",
    marginBottom: 50,
    marginTop: -3,
    marginLeft: -5,
  },
  nowIndicator: {
    color: "#D4B75F",
    fontWeight: "600",
  },
  userBadgeContainer: {
    alignItems: "flex-end",
    marginRight: -10,
    marginBottom: -10,
  },
  userBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8E8E8",
    borderRadius: 10,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 12,
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#cacaca",
  },
  profileIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  profileIconImage: {
    width: 16,
    height: 16,
    tintColor: "#999",
  },
  username: {
    fontSize: 17,
    fontWeight: "500",
    fontFamily: "System",
    color: "#666",
  },
  postImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    resizeMode: "cover",
    marginRight: 10,
  },
  photoContainer: {
    width: "100%",
    marginBottom: 30,
    overflow: "hidden",
  },
  photoScrollContainer: {
    height: 170,
  },
});

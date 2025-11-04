import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";

export default function Post(data: {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  name: string;
  openPost: string;
  setOpenPost: React.Dispatch<React.SetStateAction<string>>;
}) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).toLowerCase();
  };

  const isOpen = data.openPost === data.id;

  return (
    <Pressable
      onPress={() => {
        if (isOpen) {
          data.setOpenPost("");
        } else {
          data.setOpenPost(data.id);
        }
      }}
    >
      <View style={styles.post_container}>
        <View style={styles.post}>
          {/* Title */}
          <Text style={styles.title}>{data.title}</Text>
          
          {/* Time Range */}
          <Text style={styles.timeRange}>
            {formatTime(data.startTime)} - {formatTime(data.endTime)} (now)
          </Text>
          
          {/* Username in bottom right */}
          <View style={styles.userContainer}>
            <Text style={styles.username}>{data.name}</Text>
          </View>
        </View>
      </View>
    </Pressable>
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
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "700", // Bold
    fontFamily: "System", // SF Pro on iOS
    color: "#000",
    marginBottom: 8,
  },
  timeRange: {
    fontSize: 16,
    fontWeight: "400", // Regular
    fontStyle: "italic",
    fontFamily: "System",
    color: "#888",
    marginBottom: 16,
  },
  userContainer: {
    alignItems: "flex-end",
  },
  username: {
    fontSize: 14,
    fontWeight: "400",
    fontFamily: "System",
    color: "#666",
  },
});
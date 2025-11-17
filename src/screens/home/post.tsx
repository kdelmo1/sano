import React, { useState, useContext, useEffect } from "react";
import { StyleSheet, Text, View, Pressable, Image, Modal } from "react-native";
import ChatScreen from "../chat/chatScreen";
import PosterView from "../chat/posterView";
import AuthContext from "../../../src/context/AuthContext";
import { supabase } from "../../lib/supabase";

interface PostProps {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  name: string;
  isPoster: boolean;
  from: "feed" | "inbox";
}

export default function Post({
  id,
  title,
  startTime,
  endTime,
  name,
  isPoster,
  from,
}: PostProps) {
  const { emailHandle } = useContext(AuthContext);

  const [openChat, setOpenChat] = useState(false);

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

  const now = new Date();
  const startDataTime = new Date(startTime);
  const endDataTime = new Date(endTime);

  const isCurrentlyActive = now >= startDataTime && now <= endDataTime;

  useEffect(() => {
    const reserve = async (id: string, select: boolean) => {
      const func = "append_array";
      const { error } = await supabase.rpc(func, {
        post_id: id,
        applicant_name: emailHandle,
      });
      // if (func === "decrement" && error) {
      //   refresh or something...?
      // }
      return error ? false : true;
    };
    if (openChat && from === "feed") {
      reserve(id, false);
    }
  }, [openChat]);

  return (
    <Pressable
      onPress={() => {
        setOpenChat(true);
      }}
    >
      {isPoster ? (
        <PosterView
          id={id}
          showOpt={openChat}
          goBack={() => setOpenChat(false)}
        />
      ) : (
        <ChatScreen
          goBack={() => setOpenChat(false)}
          openChat={openChat}
          postID={id}
          posterName={name}
          applicantName={emailHandle}
          isPoster={false}
          fromScreen={from}
        />
      )}
      <View style={styles.post_container}>
        <View style={styles.post}>
          <Text style={styles.title}>{title}</Text>

          <Text style={styles.date}>{formatDate(startTime)}</Text>

          <Text style={styles.timeRange}>
            @ {formatTime(startTime)} - {formatTime(endTime)}
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
              <Text style={styles.username}>{name}</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // will delete later
  screen: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  container: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    maxWidth: 1152,
    width: "100%",
    minHeight: 600,
    borderRadius: 12,
    backgroundColor: "#FFF",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  // stops here
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
});

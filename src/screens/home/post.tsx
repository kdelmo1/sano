import React, { useState, useContext, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import ChatScreen from "../chat/chatScreen";
import PosterView from "../chat/posterView";
import RateUser from "./RateUser";
import AuthContext from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

declare global {
  interface PostProps {
    id: string;
    location: string;
    startTime: string;
    endTime: string;
    name: string;
    isPoster: boolean;
    fromScreen: "feed" | "inbox" | "profile";
    isFoodGiveaway: boolean;
    photoUrls: string[];
    posterRating: number | "X";
    reservePostInit: boolean;
    refreshHome: () => void;
  }
}

Post.defaultProps = {
  refreshHome: () => {},
};

export default function Post({
  id,
  location,
  startTime,
  endTime,
  name,
  isPoster,
  fromScreen,
  isFoodGiveaway,
  photoUrls,
  posterRating,
  reservePostInit,
  refreshHome,
}: PostProps) {
  const { emailHandle } = useContext(AuthContext);

  const [openChat, setOpenChat] = useState(false);
  const [reservePost, setReservePost] = useState(reservePostInit);

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
        poster_name: name,
        applicant_name: emailHandle,
      });
      if (error) {
        console.error(error);
        setReservePost(false);
        refreshHome();
        alert("Offer is already full");
      }
      // if (func === "decrement" && error) {
      //   refresh or something...?
      // }
    };
    if (reservePost && fromScreen === "feed") {
      reserve(id, false);
    }
  }, [reservePost]);

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
          fromScreen={fromScreen}
        />
      )}
      <View style={styles.post_container}>
        <View style={styles.post}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.title}>{location}</Text>

            {fromScreen === "feed" && (
              <Pressable
                style={{ justifyContent: "center", alignItems: "center" }}
                onPress={() => setReservePost(true)}
              >
                {reservePost ? (
                  <Text style={{ fontSize: 30 }}>✔️</Text>
                ) : (
                  <Text style={{ fontSize: 30 }}>➕</Text>
                )}
              </Pressable>
            )}
          </View>

          <Text style={styles.date}>{formatDate(startTime)}</Text>

          <Text style={styles.timeRange}>
            @ {formatTime(startTime)} - {formatTime(endTime)}
            {isCurrentlyActive && (
              <Text style={styles.nowIndicator}> (now)</Text>
            )}
          </Text>

          <View
            style={[
              styles.userBadgeContainer,
              { flexDirection: "row-reverse", justifyContent: "space-between" },
            ]}
          >
            <View style={styles.userBadge}>
              <View style={styles.profileIcon}>
                <Image
                  source={require("../../assets/images/profile-icon.png")}
                  style={styles.profileIconImage}
                />
              </View>
              <Text style={styles.username}>{name}</Text>
              {fromScreen !== "profile" && typeof posterRating === "number" && (
                <Text>{posterRating.toFixed(1)}</Text>
              )}
              {fromScreen !== "profile" && typeof posterRating === "string" && (
                <Text>{posterRating}</Text>
              )}
            </View>
            {fromScreen === "inbox" && (
              <RateUser id={id} ratedEmailHandle={name} />
            )}
          </View>
        </View>
        {isFoodGiveaway && photoUrls.length > 0 && (
          <View style={styles.photoContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              style={styles.photoScrollContainer}
            >
              {photoUrls.map((photoUrl, index) => (
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

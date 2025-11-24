import React, { useState, useContext, useEffect } from "react";
import { StyleSheet, Text, View, Pressable, Image, ScrollView } from "react-native";
import ChatScreen from "../chat/chatScreen";
import PosterView from "../chat/posterView";
import AuthContext from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  SharedStyles,
  Colors,
  Spacing,
  FontSizes,
  Typography,
} from "../../styles/sharedStyles";

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
  }
}

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
}: PostProps) {
  const { emailHandle } = useContext(AuthContext);

  const [openChat, setOpenChat] = useState(false);
  const [reservePost, setReservePost] = useState(false);

  useEffect(() => {
  const checkReservationStatus = async () => {
    // Fetch the post data to check if current user has reserved
    const { data, error } = await supabase
      .from('Posts') // Your table is named 'Posts'
      .select('reservation')
      .eq('postID', id) // Using postID as the primary key
      .single();
    
    if (data && !error) {
      // Check if the reservation field contains the current user's email
      const isReserved = data.reservation?.includes(emailHandle);
      setReservePost(isReserved || false);
    }
  };
  
  checkReservationStatus();
  }, [id, emailHandle]);

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
        poster_name: name,
      });
      return error ? false : true;
    };
    if (reservePost && fromScreen === "feed") {
      reserve(id, false);
    }
  }, [reservePost]);

  return (
    <Pressable onPress={() => setOpenChat(true)}>
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
      <View style={SharedStyles.postContainer}>
        <View style={SharedStyles.postCard}>
          <View style={styles.headerRow}>
            <Text style={[Typography.title, styles.title]}>{location}</Text>

            {fromScreen === "feed" && (
              <Pressable
                style={styles.reserveButton}
                onPress={() => setReservePost(true)}
              >
                {reservePost ? (
                  <Text style={styles.iconLarge}>✔️</Text>
                ) : (
                  <Text style={styles.iconLarge}>➕</Text>
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

          <View style={styles.userBadgeContainer}>
            <View style={SharedStyles.userBadge}>
              <View style={SharedStyles.profileIcon}>
                <Image
                  source={require("../../assets/images/profile-icon.png")}
                  style={SharedStyles.profileIconImage}
                />
              </View>
              <Text style={SharedStyles.username}>{name}</Text>
            </View>
          </View>
        </View>
        {isFoodGiveaway && photoUrls.length > 0 && (
          <View style={SharedStyles.postPhotoContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              style={SharedStyles.postPhotoScrollContainer}
            >
              {photoUrls.map((photoUrl, index) => (
                <Image
                  key={index}
                  source={{ uri: photoUrl }}
                  style={SharedStyles.postImage}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </Pressable>
  );
}

// Only unique post-specific styles
const styles = StyleSheet.create({
  // headerRow: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   justifyContent: "space-between",
  // },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start", // Changed from "center" to align at top
    justifyContent: "space-between",
    gap: Spacing.md, // Add spacing between title and button
  },
  date: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    fontStyle: "italic",
    color: Colors.textLight,
    marginTop: 0,
    marginLeft: -5,
    marginBottom: 4,
  },
  timeRange: {
    fontSize: FontSizes.lg,
    fontWeight: "500",
    fontStyle: "italic",
    color: Colors.textLighter,
    marginBottom: 50,
    marginTop: -3,
    marginLeft: -5,
  },
  nowIndicator: {
    color: Colors.primary,
    fontWeight: "600",
  },
  userBadgeContainer: {
    alignItems: "flex-end",
    marginRight: -10,
    marginBottom: -10,
  },
  reserveButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconLarge: {
    fontSize: 30,
  },
  // title: {
  //   marginTop: -10,
  //   marginLeft: -5,
  // }
  title: {
    marginTop: -10,
    marginLeft: -5,
    flex: 1, // Add this to allow text to wrap and not push button
    flexShrink: 1, // Add this to allow text to shrink if needed
  },
});
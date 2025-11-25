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
    slots: number;
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
  slots,
  isPoster,
  fromScreen,
  isFoodGiveaway,
  photoUrls,
}: PostProps) {
  const { emailHandle } = useContext(AuthContext);

  const [openChat, setOpenChat] = useState(false);
  const [reservePost, setReservePost] = useState(false);
  const [currentApplicants, setCurrentApplicants] = useState<string[]>([]);
  const [maxSlots, setMaxSlots] = useState<number>(slots);

  useEffect(() => {
  const checkReservationStatus = async () => {
    // Fetch the post data to check if current user has reserved
    const { data, error } = await supabase
      .from('Posts') // Your table is named 'Posts'
      .select('reservation, slots')
      .eq('postID', id) // Using postID as the primary key
      .single();
    
    if (data && !error) {
      // Check if the reservation field contains the current user's email
      const reservationArray: string[] = data.reservation || [];
      const isReserved = reservationArray.includes(emailHandle);
      setCurrentApplicants(reservationArray);
      setMaxSlots(data.slots ?? slots);
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
  /*
  useEffect(() => {
    // Reservation is handled explicitly when the user presses the reserve button.
  }, []);
  */
  const toggleReservation = async () => {
    try {
      const { data, error } = await supabase
        .from("Posts")
        .select("reservation, slots")
        .eq("postID", id)
        .single();

      if (error) {
        console.log("Error fetching reservation:", error);
        return;
      }

      const reservationArray: string[] = data?.reservation || [];
      const slotsFromDB: number = data?.slots ?? slots;
      const isReserved = reservationArray.includes(emailHandle);

      if (isReserved) {
        // Try RPC unreserve first
        try {
          const { error: rpcErr } = await supabase.rpc("unreserve_spot", {
            post_id: id,
            applicant_name: emailHandle,
          });
          if (!rpcErr) {
            const newArray = reservationArray.filter((r) => r !== emailHandle);
            setReservePost(false);
            setCurrentApplicants(newArray);
            setMaxSlots(slotsFromDB);
            return;
          }
        } catch (rpcErr) {
          // fallthrough to non-RPC fallback
        }

        // Fallback: update array directly
        const newArray = reservationArray.filter((r) => r !== emailHandle);
        const { error: updateErr } = await supabase
          .from("Posts")
          .update({ reservation: newArray })
          .eq("postID", id);
        if (!updateErr) {
          setReservePost(false);
          setCurrentApplicants(newArray);
          setMaxSlots(slotsFromDB);
        } else {
          console.log("Failed to unreserve:", updateErr);
        }
      } else {
        // Reserve only if not full
        if (reservationArray.length >= slotsFromDB) {
          alert("This post is full.");
          return;
        }

        // Try RPC reserve first for atomic operation
        try {
          const { data: rpcData, error: rpcErr } = await supabase.rpc(
            "reserve_spot",
            {
              post_id: id,
              applicant_name: emailHandle,
            }
          );
          if (!rpcErr) {
            // If RPC returns updated reservation list, use it; otherwise append locally
            const newArray: string[] = rpcData?.reservation || [
              ...reservationArray,
              emailHandle,
            ];
            setReservePost(true);
            setCurrentApplicants(newArray);
            setMaxSlots(slotsFromDB);
            return;
          }
        } catch (rpcErr) {
          // fallthrough to non-RPC fallback
        }

        // Fallback: update array directly
        const newArray = [...reservationArray, emailHandle];
        const { error: updateErr } = await supabase
          .from("Posts")
          .update({ reservation: newArray })
          .eq("postID", id);
        if (!updateErr) {
          setReservePost(true);
          setCurrentApplicants(newArray);
          setMaxSlots(slotsFromDB);
        } else {
          console.log("Failed to reserve:", updateErr);
        }
      }
    } catch (err) {
      console.log("toggleReservation error:", err);
    }
  };

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
                style={[
                  styles.reserveButton,
                  currentApplicants.length >= maxSlots && !reservePost
                    ? styles.reserveButtonDisabled
                    : null,
                ]}
                onPress={() => toggleReservation()}
                disabled={currentApplicants.length >= maxSlots && !reservePost}
              >
                <Text
                  style={[
                    styles.iconLarge,
                    currentApplicants.length >= maxSlots && !reservePost
                      ? styles.iconDisabled
                      : null,
                  ]}
                >
                  {reservePost ? (
                  <Text style={styles.iconLarge}>✔️</Text>
                  ) : (
                    <Text style={styles.iconLarge}>➕</Text>
                  )}
                </Text>
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

          <Text style={styles.spotsText}>
            {currentApplicants.length} / {maxSlots} spots filled • {Math.max(
              0,
              maxSlots - currentApplicants.length
            )} left
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
  spotsText: {
    fontSize: FontSizes.md,
    color: Colors.textLighter,
    marginLeft: -5,
    marginBottom: 8,
    fontWeight: "600",
  },
  reserveButtonDisabled: {
    opacity: 0.5,
  },
  iconDisabled: {
    color: Colors.textLighter,
    opacity: 0.6,
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
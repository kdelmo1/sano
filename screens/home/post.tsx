import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, Modal } from "react-native";
import { supabase } from "./supabaseClient";

export default function Post(data: {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  name: string;
  studentEmail?: string;
  maxRSVP?: number;
  rsvpCount?: number;
  currentUserEmail?: string | null;
  openPost: string;
  setOpenPost: React.Dispatch<React.SetStateAction<string>>;
  onReserve?: () => void;
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isOwner = data.currentUserEmail === data.studentEmail;
  const capacityReached = (data.maxRSVP || 0) > 0 && (data.rsvpCount || 0) >= (data.maxRSVP || 0);

  const handleConfirmReserve = async () => {
    // increment rsvpCount atomically
    try {
      const newCount = (data.rsvpCount || 0) + 1;
      const { error } = await supabase
        .from("Posts")
        .update({ rsvpCount: newCount })
        .eq("postID", data.id);

      if (error) {
        console.error("Failed to reserve:", error);
        alert("Failed to reserve: " + error.message);
      } else {
        setConfirmOpen(false);
        if (data.onReserve) data.onReserve();
      }
    } catch (err) {
      console.error(err);
      alert("Error reserving");
    }
  };

  return (
    <>
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
            {formatTime(data.startTime)} - {formatTime(data.endTime)}
          </Text>
          
          {/* Username in bottom right */}
          <View style={styles.userContainer}>
            <Text style={styles.username}>{data.name}</Text>
          </View>

          {/* RSVP Info and Button */}
          <View style={{ marginTop: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: "#666" }}>
              RSVPs: {data.rsvpCount || 0} / {data.maxRSVP || "—"}
            </Text>
            {!isOwner ? (
              <Pressable
                style={[styles.reserveButton, capacityReached ? styles.reserveButtonDisabled : null]}
                onPress={() => {
                  if (capacityReached) return;
                  setConfirmOpen(true);
                }}
                disabled={capacityReached}
              >
                <Text style={styles.reserveButtonText}>{capacityReached ? "Full" : "Reserve"}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>

      <Modal transparent={true} visible={confirmOpen} animationType="fade">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: "85%", backgroundColor: "#fff", padding: 20, borderRadius: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>Confirm Reservation</Text>
          <Text style={{ marginBottom: 20 }}>Reserve a spot for "{data.title}"?</Text>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <Pressable onPress={() => setConfirmOpen(false)} style={{ marginRight: 12 }}>
              <Text style={{ color: "#666" }}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleConfirmReserve} style={{ backgroundColor: "#D4B75F", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 }}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Confirm</Text>
            </Pressable>
          </View>
        </View>
      </View>
      </Modal>
    </>
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
  reserveButton: {
    backgroundColor: "#D4B75F",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reserveButtonDisabled: {
    backgroundColor: "#CCC",
  },
  reserveButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
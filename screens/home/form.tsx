import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { User } from "@supabase/supabase-js";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function popup(data: {
  user: User | null;
  toPost: boolean;
  setToPost: React.Dispatch<React.SetStateAction<boolean>>;
  onPostSuccess: () => void;
}) {
  const toPost = data.toPost;
  const setToPost = data.setToPost;
  const onPostSuccess = data.onPostSuccess;

  const [location, setLocation] = React.useState("");
  const [startTime, setStartTime] = React.useState(new Date());
  const [endTime, setEndTime] = React.useState(new Date());
  const [showStartPicker, setShowStartPicker] = React.useState(false);
  const [showEndPicker, setShowEndPicker] = React.useState(false);

  const resetForm = () => {
    setLocation("");
    setStartTime(new Date());
    setEndTime(new Date());
  };

  useEffect(() => {
    if (toPost) {
      resetForm();
    }
  }, [toPost]);

  const handlePost = () => {
    insertToDB();
  };

  const onStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === "ios");
    if (selectedDate) {
      setStartTime(selectedDate);
    }
  };

  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === "ios");
    if (selectedDate) {
      setEndTime(selectedDate);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  async function insertToDB() {
    if (!location.trim()) {
      alert("Location is required.");
      return;
    }

    if (endTime <= startTime) {
      alert("End time must be after start time.");
      return;
    }

    // const userName = data.user?.user_metadata?.full_name || 
    //                  data.user?.email?.split("@")[0] || 
    //                  "Anonymous";
    const userName = data.user?.email?.split("@")[0] || 
                     "Anonymous";

    const newPost = {
      title: location,
      name: userName,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      location: location,
      studentEmail: data.user?.email,
      studentID: 2,
    };

    const { error } = await supabase.from("Posts").insert(newPost);

    if (error) {
      console.error("Supabase Insert Error:", error);
      alert("Failed to post: " + error.message);
    } else {
      console.log("Post created successfully:", newPost);
      resetForm();
      setToPost(false);
      onPostSuccess();
    }
  }

  return (
    <Modal transparent={true} visible={toPost} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>new post</Text>
            <Pressable
              style={styles.closeButton}
              onPress={() => {
                setToPost(false);
                resetForm();
              }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>

          {/* Form Content */}
          <View style={styles.formContent}>
            {/* Location Field */}
            <View style={styles.fieldContainer}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>📍</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="location"
                placeholderTextColor="#999"
                value={location}
                onChangeText={setLocation}
              />
            </View>

            {/* Start Time Field */}
            <View style={styles.fieldContainer}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>🕐</Text>
              </View>
              <Pressable
                style={styles.timeButton}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={styles.timeButtonText}>
                  Start: {formatTime(startTime)}
                </Text>
              </Pressable>
            </View>

            {showStartPicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                is24Hour={false}
                display="default"
                onChange={onStartTimeChange}
              />
            )}

            {/* End Time Field */}
            <View style={styles.fieldContainer}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>🕐</Text>
              </View>
              <Pressable
                style={styles.timeButton}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={styles.timeButtonText}>
                  End: {formatTime(endTime)}
                </Text>
              </Pressable>
            </View>

            {showEndPicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                is24Hour={false}
                display="default"
                onChange={onEndTimeChange}
              />
            )}
          </View>

          {/* Post Button */}
          <View style={styles.postButtonContainer}>
            <Pressable style={styles.postButton} onPress={handlePost}>
              <Text style={styles.postButtonText}>post ✓</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#D4B75F",
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
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
  },
  formContent: {
    padding: 20,
  },
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  iconText: {
    fontSize: 28,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#333",
  },
  timeButton: {
    flex: 1,
    height: 50,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    paddingHorizontal: 15,
    justifyContent: "center",
  },
  timeButtonText: {
    fontSize: 16,
    color: "#333",
  },
  postButtonContainer: {
    padding: 20,
    alignItems: "flex-end",
  },
  postButton: {
    backgroundColor: "#D4B75F",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  postButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
  },
});
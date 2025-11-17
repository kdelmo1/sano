import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  Platform,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { User } from "@supabase/supabase-js";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function popup(data: {
  user: User | null;
  toPost: boolean;
  setToPost: React.Dispatch<React.SetStateAction<boolean>>;
  onPostSuccess: () => void;
  onClose?: () => void;
}) {
  const toPost = data.toPost;
  const setToPost = data.setToPost;
  const onPostSuccess = data.onPostSuccess;

  const [location, setLocation] = React.useState("");
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [startTime, setStartTime] = React.useState(new Date());
  const [endTime, setEndTime] = React.useState(new Date());
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [showStartPicker, setShowStartPicker] = React.useState(false);
  const [showEndPicker, setShowEndPicker] = React.useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = React.useState(false);

  const locationOptions = [
    "JRL/C9 DH",
    "Cowell/Stevenson DH",
    "Crown/Merrill DH",
    "Porter/Kresge DH",
    "RCC/Oakes DH",
    "GVC",
    "Slug Stop",
    "Porter Market",
    "Merill Market",
  ];

  const resetForm = () => {
    setLocation("");
    setSelectedDate(new Date());
    const now = new Date();
    setStartTime(now);
    const thirtyMinsLater = new Date(now.getTime() + 30 * 60000);
    setEndTime(thirtyMinsLater);
  };

  useEffect(() => {
    if (toPost) {
      resetForm();
    }
  }, [toPost]);

  const handlePost = () => {
    insertToDB();
  };

  const onDateChange = (event: any, selectedDateValue?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDateValue) {
      setSelectedDate(selectedDateValue);
    }
  };

  const onStartTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowStartPicker(false);
    }
    if (selectedDate) {
      setStartTime(selectedDate);
    }
  };

  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowEndPicker(false);
    }
    if (selectedDate) {
      setEndTime(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleLocationSelect = (selectedLocation: string) => {
    setLocation(selectedLocation);
    setShowLocationDropdown(false);
  };

  const getTodayMidnight = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
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

    const userName = data.user?.email?.split("@")[0] || "Anonymous";

    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

    const endDateTime = new Date(selectedDate);
    endDateTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

    const newPost = {
      title: location,
      name: userName,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      location: location,
      studentEmail: data.user?.email,
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
      <Pressable
        style={styles.modalOverlay}
        onPress={() => {
          setShowLocationDropdown(false);
        }}
      >
        <Pressable
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>new post</Text>
            <Pressable
              style={styles.closeButton}
              onPress={() => {
                setToPost(false);
                resetForm();
                data.onClose?.();
              }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.formContent}>
            <View style={styles.fieldContainer}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>📍</Text>
              </View>
              <View style={styles.dropdownWrapper}>
                <Pressable
                  style={styles.dropdownButton}
                  onPress={() => setShowLocationDropdown(!showLocationDropdown)}
                >
                  <Text style={[
                    styles.dropdownButtonText,
                    !location && styles.placeholderText
                  ]}>
                    {location || "select location"}
                  </Text>
                  <Text style={styles.dropdownArrow}>
                    {showLocationDropdown ? "▲" : "▼"}
                  </Text>
                </Pressable>

                {showLocationDropdown && (
                  <View style={styles.dropdownMenu}>
                    <ScrollView style={styles.dropdownScroll}>
                      {locationOptions.map((option, index) => (
                        <Pressable
                          key={index}
                          style={styles.dropdownItem}
                          onPress={() => handleLocationSelect(option)}
                        >
                          <Text style={styles.dropdownItemText}>{option}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>📅</Text>
              </View>
              <Pressable
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateLabel}>Date</Text>
                <Text style={styles.dateValue}>{formatDate(selectedDate)}</Text>
              </Pressable>
            </View>

            <View style={styles.timeRowContainer}>
              <View style={styles.timeFieldContainer}>
                <View style={styles.iconContainer}>
                  <Text style={styles.iconText}>🕐</Text>
                </View>
                <Pressable
                  style={styles.timeButton}
                  onPress={() => setShowStartPicker(true)}
                >
                  <Text style={styles.timeLabel}>Start</Text>
                  <Text style={styles.timeValue}>{formatTime(startTime)}</Text>
                </Pressable>
              </View>

              <View style={styles.timeFieldContainer}>
                <View style={styles.iconContainer}>
                  <Text style={styles.iconText}>🕑</Text>
                </View>
                <Pressable
                  style={styles.timeButton}
                  onPress={() => setShowEndPicker(true)}
                >
                  <Text style={styles.timeLabel}>End</Text>
                  <Text style={styles.timeValue}>{formatTime(endTime)}</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.postButtonContainer}>
            <Pressable style={styles.postButton} onPress={handlePost}>
              <Text style={styles.postButtonText}>post ✓</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>

      {showDatePicker && (
        <Modal
          transparent={true}
          visible={showDatePicker}
          animationType="slide"
        >
          <Pressable
            style={styles.timePickerModalOverlay}
            onPress={() => setShowDatePicker(false)}
          >
            <Pressable
              style={styles.timePickerModal}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.timePickerHeader}>
                <Pressable onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.timePickerDone}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                style={styles.timePicker}
                textColor="#000000"
                themeVariant="light"
                minimumDate={getTodayMidnight()}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {showStartPicker && (
        <Modal
          transparent={true}
          visible={showStartPicker}
          animationType="slide"
        >
          <Pressable
            style={styles.timePickerModalOverlay}
            onPress={() => setShowStartPicker(false)}
          >
            <Pressable
              style={styles.timePickerModal}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.timePickerHeader}>
                <Pressable onPress={() => setShowStartPicker(false)}>
                  <Text style={styles.timePickerDone}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={startTime}
                mode="time"
                display="spinner"
                onChange={onStartTimeChange}
                style={styles.timePicker}
                textColor="#000000"
                themeVariant="light"
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {showEndPicker && (
        <Modal
          transparent={true}
          visible={showEndPicker}
          animationType="slide"
        >
          <Pressable
            style={styles.timePickerModalOverlay}
            onPress={() => setShowEndPicker(false)}
          >
            <Pressable
              style={styles.timePickerModal}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.timePickerHeader}>
                <Pressable onPress={() => setShowEndPicker(false)}>
                  <Text style={styles.timePickerDone}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={endTime}
                mode="time"
                display="spinner"
                onChange={onEndTimeChange}
                style={styles.timePicker}
                textColor="#000000"
                themeVariant="light"
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}
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
    borderRadius: 10,
    overflow: "visible",
  },
  header: {
    backgroundColor: "#D4B75F",
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
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
    zIndex: 1,
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
  dropdownWrapper: {
    flex: 1,
    position: "relative",
    zIndex: 1000,
  },
  dropdownButton: {
    height: 50,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    color: "#999",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#666",
  },
  dropdownMenu: {
    position: "absolute",
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    borderRadius: 12,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#333",
  },
  dateButton: {
    flex: 1,
    height: 50,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    paddingHorizontal: 15,
    justifyContent: "center",
  },
  dateLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  timeRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    // marginBottom: 5,
    gap: 10,
  },
  timeFieldContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  timeButton: {
    flex: 1,
    height: 50,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  timeLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  postButtonContainer: {
    padding: 20,
    alignItems: "center",
  },
  postButton: {
    backgroundColor: "#D4B75F",
    marginTop: -15,
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
  timePickerModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.0)",
  },
  timePickerModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  timePickerHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  timePickerDone: {
    fontSize: 18,
    fontWeight: "600",
    color: "#D4B75F",
  },
  timePicker: {
    height: 200,
  },
});
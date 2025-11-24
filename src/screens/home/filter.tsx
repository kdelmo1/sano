import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "../../lib/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";

interface FormProps {
  selectedLocation: string;
  setSelectedLocation: (val: string) => void;
  selectedDate: Date | null;
  setSelectedDate: (val: Date | null) => void;
  selectedStartTime: Date | null;
  setSelectedStartTime: (val: Date | null) => void;
  selectedEndTime: Date | null;
  setSelectedEndTime: (val: Date | null) => void;

  tempStartTime: Date | null;
  setTempStartTime: (val: Date | null) => void;

  tempEndTime: Date | null;
  setTempEndTime: (val: Date | null) => void;

  selectedTag: string;
  setSelectedTag: (val: string) => void;
}

export default function Filter({
  selectedLocation,
  setSelectedLocation,
  selectedDate,
  setSelectedDate,
  tempStartTime,
  setTempStartTime,
  tempEndTime,
  setTempEndTime,
  selectedTag,
  setSelectedTag,
}: FormProps) {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [showTagPicker, setShowTagPicker] = useState(false);
  const tagOptions = ["All Tags", "Slug Points", "Food Giveaway"];

  useEffect(() => {
    async function getLocationFromDB() {
      const { data, error } = await supabase.from("location").select("*");

      if (error) {
      } else {
        setLocationOptions(data.map((loc) => loc["location"]));
      }
    }
    getLocationFromDB();
  }, []);

  const handleLocationSelect = (option: string) => {
    setSelectedLocation(option);
    setShowLocationDropdown(false);
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag);
    setShowTagPicker(false);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Select date";
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (time: Date | null) => {
    if (!time) return "Select Time";
    return time.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View>
      {/*Location*/}
      <View style={styles.fieldContainer}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>📍</Text>
        </View>
        <View style={styles.dropdownWrapper}>
          <Pressable
            style={styles.dropdownButton}
            onPress={() => setShowLocationDropdown(!showLocationDropdown)}
          >
            <Text
              style={[
                styles.dropdownButtonText,
                !selectedLocation && styles.placeholderText,
              ]}
            >
              {selectedLocation === "All"
                ? "All Locations"
                : selectedLocation || "select location"}
            </Text>
            <Text style={styles.dropdownArrow}>
              {showLocationDropdown ? "▲" : "▼"}
            </Text>
          </Pressable>

          {showLocationDropdown && (
            <View style={styles.dropdownMenu}>
              <ScrollView style={styles.dropdownScroll}>
                <Pressable onPress={() => handleLocationSelect("All")}>
                  <Text style={styles.dropdownItemText}>All Locations</Text>
                </Pressable>
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

      {/* Date Pick */}
      <View style={styles.fieldContainer}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>📅</Text>
        </View>
        <Pressable
          style={styles.dateButton}
          onPress={() => setShowDatePicker(!showDatePicker)}
        >
          <Text style={styles.dateValue}>{formatDate(selectedDate)}</Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            mode="date"
            value={selectedDate || new Date()}
            onChange={(event, date) => {
              setShowDatePicker(Platform.OS === "ios");
              if (date) setSelectedDate(date);
            }}
          />
        )}
      </View>

      {/* Time Pick */}
      <View style={styles.timeRowContainer}>
        {/* Start Time */}
        <View style={styles.timeFieldContainer}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>🕐</Text>
          </View>
          <Pressable
            style={styles.timeButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.timeLabel}>Start</Text>
            <Text style={styles.timeValue}>{formatTime(tempStartTime)}</Text>
          </Pressable>
          {showStartPicker && (
            <DateTimePicker
              mode="time"
              value={tempStartTime || new Date()}
              onChange={(event, time) => {
                if (time) setTempStartTime(time);
                if (Platform.OS !== "ios") setShowStartPicker(false);
              }}
            />
          )}
        </View>

        {/* End Time */}
        <View style={styles.timeFieldContainer}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>🕐</Text>
          </View>
          <Pressable
            style={styles.timeButton}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={styles.timeLabel}>End</Text>
            <Text style={styles.timeValue}>{formatTime(tempEndTime)}</Text>
          </Pressable>
          {showEndPicker && (
            <DateTimePicker
              mode="time"
              value={tempEndTime || new Date()}
              onChange={(event, time) => {
                if (time) setTempEndTime(time);
                if (Platform.OS !== "ios") setShowEndPicker(false);
              }}
            />
          )}
        </View>
      </View>

      {/*Tags*/}
      <View style={[styles.fieldContainer, { marginTop: 20 }]}>
        <View style={styles.iconContainer}>
          <Text>🏷️</Text>
        </View>
        <View style={styles.dropdownWrapper}>
          <Pressable
            style={styles.dropdownButton}
            onPress={() => setShowTagPicker(!showTagPicker)}
          >
            <Text
              style={[
                styles.dropdownButtonText,
                !selectedTag && styles.placeholderText,
              ]}
            >
              {selectedTag === "All" ? "All Tags" : selectedTag || "Select tag"}
            </Text>
            <Text style={styles.dropdownArrow}>
              {showTagPicker ? "▲" : "▼"}
            </Text>
          </Pressable>

          {showTagPicker && (
            <View style={styles.dropdownMenu}>
              <ScrollView style={styles.dropdownScroll}>
                {tagOptions.map((option, index) => (
                  <Pressable
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => handleTagSelect(option)}
                  >
                    <Text style={styles.dropdownItemText}>{option}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  dateValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  timeRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    marginTop: 15,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
});

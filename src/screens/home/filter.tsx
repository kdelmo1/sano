import React, { useEffect, useState } from "react";
import { 
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Platform
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
  selectedTag: string;
  setSelectedTag: (val: string) => void;
}

export default function Filter({
  selectedLocation,
  setSelectedLocation,
  selectedDate,
  setSelectedDate,
  selectedStartTime,
  setSelectedStartTime,
  selectedEndTime,
  setSelectedEndTime,
  selectedTag,
  setSelectedTag,
}: FormProps) {

  //const [location, setLocation] = useState("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  //const [showSlotsDropdown, setShowSlotsDropdown] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  //const [showTimePicker, setShowTimePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  //const [startTime, setStartTime] = React.useState(new Date());
  //const [endTime, setEndTime] = React.useState(new Date());

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
      //hour12: true,
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
              {selectedLocation === "All" ? "All Locations" : selectedLocation || "select location"}
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
        <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(!showDatePicker)}>
          {/*<Text style={styles.dateLabel}>Date</Text>*/}
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
          <Pressable style={styles.timeButton} onPress={() => setShowStartPicker(true)}>
            <Text style={styles.timeLabel}>Start</Text>
            <Text style={styles.timeValue}>{formatTime(selectedStartTime)}</Text>
          </Pressable>
          {showStartPicker && (
            <DateTimePicker
              mode="time"
              value={selectedStartTime || new Date()}
              onChange={(event, time) => {
                //if (time) setSelectedStartTime(time);
                //setShowStartPicker(Platform.OS === "ios");
                //if (time) setSelectedStartTime(time);
                if (time) {
                  setSelectedStartTime(time);
                }
                if (Platform.OS !== "ios") {
                  setShowStartPicker(false);
                }
              }}
            />
          )}
        </View>

        {/* End Time */}
        <View style={styles.timeFieldContainer}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>🕐</Text>
          </View>
          <Pressable style={styles.timeButton} onPress={() => setShowEndPicker(true)}>
            <Text style={styles.timeLabel}>End</Text>
            <Text style={styles.timeValue}>{formatTime(selectedEndTime)}</Text>
          </Pressable>
          {showEndPicker && (
            <DateTimePicker
              mode="time"
              value={selectedEndTime || new Date()}
              onChange={(event, time) => {
                if (time) setSelectedEndTime(time);
                setShowEndPicker(Platform.OS === "ios");
              }}
            />
          )}
        </View>
      </View>
      
      {/*Tags*/}
      <View style={styles.fieldContainer}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>Tags</Text>
        </View>
        <Picker
          selectedValue={selectedTag}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedTag(itemValue)}
        >
          <Picker.Item label="All tags" value="all" />
          <Picker.Item label="Slug Points" value="24h" />
          <Picker.Item label="Packaged Food" value="7d" />
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  picker: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
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

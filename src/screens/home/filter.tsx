import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
  Modal,
  Image,
} from "react-native";
import { supabase } from "../../lib/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  SharedStyles,
  Colors,
  Spacing,
  ResponsiveUtils,
} from "../../styles/sharedStyles";

const locationIcon = require("../../assets/images/form-location.png");
const calendarIcon = require("../../assets/images/form-calendar.png");
const timeIcon = require("../../assets/images/form-time.png");
const tagIcon = require("../../assets/images/filter-tag.png");

interface FormProps {
  showFilter: boolean;
  onClose: () => void;
  onApplyFilter: (
    selectedLocation: string,
    selectedDate: Date | null,
    selectedStartTime: Date | null,
    selectedTag: string
  ) => void;
}

export default function Filter({
  showFilter,
  onClose,
  onApplyFilter,
}: FormProps) {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);

  const [showTagPicker, setShowTagPicker] = useState(false);
  const tagOptions = ["All Tags", "Slug Points", "Food Giveaway"];

  const [tempLocation, setTempLocation] = useState("");

  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [tempStartTime, setTempStartTime] = useState<Date | null>(null);

  const [tempTag, setTempTag] = useState("");

  useEffect(() => {
    async function getLocationFromDB() {
      const { data, error } = await supabase.from("location").select("*");

      if (!error) {
        setLocationOptions([
          "All Location",
          ...data.map((loc) => loc["location"]),
        ]);
      }
    }
    getLocationFromDB();
  }, []);

  const handleLocationSelect = (option: string) => {
    setTempLocation(option);
    setShowLocationDropdown(false);
  };

  const handleTagSelect = (tag: string) => {
    setTempTag(tag);
    setShowTagPicker(false);
  };

  const getTodayMidnight = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Select Date";
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

  const resetFilter = () => {
    setTempLocation("");
    setTempTag("");
    setTempDate(null);
    setTempStartTime(null);
  };

  const oneHotOpen = (openPicker: string) => {
    setShowLocationDropdown(false);
    setShowTagPicker(false);
    setShowDatePicker(false);
    setShowStartPicker(false);

    switch (openPicker) {
      case "Location":
        setShowLocationDropdown(true);
        return;
      case "Tag":
        setShowTagPicker(true);
        return;
      case "Date":
        setShowDatePicker(true);
        return;
      case "Start":
        setShowStartPicker(true);
        return;
      default:
        return;
    }
  };

  return (
    <Modal
      key="filter"
      visible={showFilter}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        {/* Header Title and Buttons */}
        <View style={styles.modalContent}>
          <View style={styles.filterHeader}>
            <Pressable
              style={styles.closeButton}
              onPress={() => {
                onClose();
              }}
            >
              <Text style={styles.closeButtonText}>x</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Filter Posts</Text>
            {/* Swapped: Clear button is now in the header */}
            <Pressable
              style={styles.applyButton}
              onPress={resetFilter}
            >
              <Text style={styles.applyButtonText}>Clear</Text>
            </Pressable>
          </View>

          {/* Scrollable filter options */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
          >
            <View>
              {/*Location*/}
              <View style={styles.fieldContainer}>
                <View style={styles.iconContainer}>
                  <Image source={locationIcon} style={styles.filterIcon} />
                </View>
                <View style={styles.dropdownWrapper}>
                  <Pressable
                    style={styles.dropdownButton}
                    onPress={() => {
                      if (showLocationDropdown) oneHotOpen("");
                      else oneHotOpen("Location");
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownButtonText,
                        !tempLocation && styles.placeholderText,
                      ]}
                    >
                      {tempLocation === "" ? "Select Location" : tempLocation}
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
                            <Text style={styles.dropdownItemText}>
                              {option}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>

              {/*Tags*/}
              <View style={styles.fieldContainer}>
                <View style={styles.iconContainer}>
                  <Image source={tagIcon} style={styles.filterIcon} />
                </View>
                <View style={styles.dropdownWrapper}>
                  <Pressable
                    style={styles.dropdownButton}
                    onPress={() => {
                      if (showTagPicker) oneHotOpen("");
                      else oneHotOpen("Tag");
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownButtonText,
                        !tempTag && styles.placeholderText,
                      ]}
                    >
                      {tempTag === "All" ? "All Tags" : tempTag || "Select Tag"}
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
                            <Text style={styles.dropdownItemText}>
                              {option}
                            </Text>
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
                  <Image source={calendarIcon} style={styles.filterIcon} />
                </View>
                <Pressable
                  style={styles.dateButton}
                  onPress={() => {
                    if (showDatePicker) oneHotOpen("");
                    else oneHotOpen("Date");
                  }}
                >
                  <Text
                    style={[
                      styles.dateValue,
                      !tempDate && styles.placeholderText,
                    ]}
                  >
                    {formatDate(tempDate)}
                  </Text>
                </Pressable>
              </View>

              {/* Start Time */}
              <View style={styles.fieldContainer}>
                <View style={styles.iconContainer}>
                  <Image source={timeIcon} style={styles.filterIcon} />
                </View>
                <Pressable
                  style={styles.dateButton}
                  onPress={() => {
                    if (showStartPicker) oneHotOpen("");
                    else oneHotOpen("Start");
                  }}
                >
                  <Text
                    style={[
                      styles.timeValue,
                      !tempStartTime && styles.placeholderText,
                    ]}
                  >
                    {formatTime(tempStartTime)}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
          {/* Swapped: Apply button is now at the bottom */}
          <View style={styles.postButtonContainer}>
            <Pressable
              style={[SharedStyles.primaryButton, styles.primaryButton]}
              onPress={() => {
                onApplyFilter(tempLocation, tempDate, tempStartTime, tempTag);
              }}
            >
              <Text style={SharedStyles.primaryButtonText}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {showDatePicker && (
        <Modal
          key="date filter"
          transparent={true}
          visible={showDatePicker}
          animationType="slide"
        >
          <Pressable
            style={SharedStyles.timePickerModalOverlay}
            onPress={() => setShowDatePicker(false)}
          >
            <Pressable
              style={SharedStyles.timePickerModal}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={SharedStyles.timePickerHeader}>
                <Pressable
                  onPress={() => {
                    setShowDatePicker(false);
                    if (!tempDate) {
                      setTempDate(new Date());
                    }
                  }}
                >
                  <Text style={SharedStyles.timePickerDone}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={tempDate || new Date()}
                mode="date"
                display="spinner"
                onChange={(event, date) => {
                  if (date) setTempDate(date);
                }}
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
          key="start time filter"
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
                <Pressable
                  onPress={() => {
                    setShowStartPicker(false);
                    if (!tempStartTime) {
                      setTempStartTime(new Date());
                    }
                  }}
                >
                  <Text style={styles.timePickerDone}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={tempStartTime || new Date()}
                mode="time"
                display="spinner"
                onChange={(event, date) => {
                  setShowStartPicker(Platform.OS === "ios");
                  if (date) setTempStartTime(date);
                }}
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
  // Replaced iconText with filterIcon image style
  filterIcon: {
    width: ResponsiveUtils.moderateScale(28),
    height: ResponsiveUtils.moderateScale(28),
    resizeMode: "contain",
    tintColor: Colors.primary,
  },
  postButtonContainer: {
    marginTop: 10,
    padding: Spacing.xl,
    alignItems: "flex-end",
  },
  primaryButton: {
    marginTop: -15,
    paddingVertical: 12,
  },
  dropdownWrapper: {
    flex: 1,
    position: "relative",
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
    zIndex: 1,
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
    fontSize: 16,
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
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    width: "90%",
    height: "50%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: "hidden",
  },
  filterHeader: {
    backgroundColor: "#D4B75F",
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    lineHeight: 20,
  },
  applyButton: {
    backgroundColor: "#FFF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#D4B75F",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
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
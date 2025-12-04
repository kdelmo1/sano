import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  Platform,
  ScrollView,
  Image,
  Switch,
} from "react-native";
import React, { useEffect, useState, useContext } from "react";
import { supabase } from "../../lib/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";
import AuthContext from "../../context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import {
  SharedStyles,
  Colors,
  Spacing,
  BorderRadius,
  Typography,
} from "../../styles/sharedStyles";

const MAX_PHOTOS = 3;

interface FormProps {
  toPost: boolean;
  setToPost: React.Dispatch<React.SetStateAction<boolean>>;
  onPostSuccess: () => void;
  onClose: () => void;
}

export default function Form({
  toPost,
  setToPost,
  onPostSuccess,
  onClose,
}: FormProps) {
  const { user, emailHandle } = useContext(AuthContext);

  const [location, setLocation] = useState("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);

  const [slots, setSlots] = useState(1);
  const [showSlotsDropdown, setShowSlotsDropdown] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [isFoodGiveaway, setIsFoodGiveaway] = useState(false);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  const [slotsOptions, setSlotsOptions] = useState([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  ]);

  useEffect(() => {
    async function getLocationFromDB() {
      const { data, error } = await supabase.from("location").select("*");
      if (!error) {
        setLocationOptions(data.map((loc) => loc["location"]));
      }
    }
    getLocationFromDB();
  }, []);

  useEffect(() => {
    if (toPost) {
      const now = new Date();
      setStartTime(now);
      const thirtyMinsLater = new Date(now.getTime() + 30 * 60000);
      setEndTime(thirtyMinsLater);
    }
  }, [toPost]);

  const resetForm = () => {
    setLocation("");
    setSlots(1);
    setSelectedDate(new Date());
    const now = new Date();
    setStartTime(now);
    const thirtyMinsLater = new Date(now.getTime() + 30 * 60000);
    setEndTime(thirtyMinsLater);
    setIsFoodGiveaway(false);
    setImageUris([]);
  };

  const onTimeChange = (
    setTime: React.Dispatch<React.SetStateAction<Date>>,
    setShowTime: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    const onDateChange = (event: any, selectedDateValue?: Date) => {
      if (Platform.OS === "android") {
        setShowTime(false);
      }
      if (selectedDateValue) {
        setTime(selectedDateValue);
      }
    };
    return onDateChange;
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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access media library is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
      selectionLimit: MAX_PHOTOS,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((asset) => asset.uri);
      setImageUris((prev) => {
        const combined = [...prev, ...newUris];
        return combined.slice(0, MAX_PHOTOS);
      });
    }
  };

  const handleLocationSelect = (selectedLocation: string) => {
    setLocation(selectedLocation);
    setShowLocationDropdown(false);
  };

  const handleSlotsSelect = (selectedSlot: number) => {
    setSlots(selectedSlot);
    setShowSlotsDropdown(false);
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

    // Prevent multiple submissions
    if (isPosting) {
      return;
    }

    setIsPosting(true);

    const postSlots = isFoodGiveaway ? 1 : slots;

    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

    let endDateTime = new Date(selectedDate);
    endDateTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

    if (endTime < startTime) {
      alert("End time cannot be less than start time.");
      setIsPosting(false);
      return;
    }

    const currentTime = new Date();
    if (endDateTime <= currentTime) {
      alert("Cannot post an expired post.");
      setIsPosting(false);
      return;
    }

    let photoUrls: string[] = [];
    if (imageUris.length > 0) {
      if (!user?.id) {
        alert("User not authenticated for upload.");
        return;
      }

      for (const uri of imageUris) {
        try {
          const userFolder = user?.id;
          const fileId = Date.now() + "-" + Math.random();
          const fileName = `${fileId}.jpg`;
          const filePath = `${userFolder}/${fileName}`;

          const response = await fetch(uri);
          const arrayBuffer = await response.arrayBuffer();

          const { error: uploadError } = await supabase.storage
            .from("post-photos")
            .upload(filePath, new Uint8Array(arrayBuffer), {
              contentType: "image/jpeg",
              upsert: false,
            });

          if (uploadError) {
            alert("Failed to upload image: " + uploadError.message);
            setIsPosting(false);
            return;
          }

          const { data: urlData } = supabase.storage
            .from("post-photos")
            .getPublicUrl(filePath);

          photoUrls.push(urlData.publicUrl);
        } catch (err) {
          alert("Failed to upload image");
          setIsPosting(false);
          return;
        }
      }
    }

    const newPost = {
      location: location,
      name: emailHandle,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      studentEmail: user?.email,
      slots: slots,
      is_food_giveaway: isFoodGiveaway,
      photo_url: isFoodGiveaway ? JSON.stringify(photoUrls) : null,
    };

    const { error } = await supabase.from("Posts").insert(newPost);

    if (error) {
      console.error("Supabase Insert Error:", error);
      alert("Failed to post: " + error.message);
      setIsPosting(false);
    } else {
      console.log("Post created successfully:", newPost);
      resetForm();
      setToPost(false);
      onPostSuccess();
      onClose();
      setIsPosting(false);
    }
  }

  if (!toPost) return null;

  return (
    <View style={SharedStyles.fullScreenContainer}>
      <View style={styles.screenOverlay}>
        <View style={styles.screenContent}>
          <View style={SharedStyles.header}>
            <Text style={Typography.headerTitle}>new post</Text>
            <Pressable
              style={SharedStyles.closeButton}
              onPress={() => {
                resetForm();
                onClose();
              }}
            >
              <Text style={SharedStyles.closeButtonText}>✕</Text>
            </Pressable>
          </View>
          <ScrollView>
            <View style={styles.formContent}>
              {/* Location Dropdown */}
              <View style={SharedStyles.fieldContainer}>
                <View style={SharedStyles.iconContainer}>
                  <Text style={SharedStyles.iconText}>📍</Text>
                </View>
                <View style={SharedStyles.dropdownWrapper}>
                  <Pressable
                    style={SharedStyles.dropdownButton}
                    onPress={() =>
                      setShowLocationDropdown(!showLocationDropdown)
                    }
                  >
                    <Text
                      style={[
                        SharedStyles.dropdownButtonText,
                        !location && SharedStyles.placeholderText,
                      ]}
                    >
                      {location || "select location"}
                    </Text>
                    <Text style={SharedStyles.dropdownArrow}>
                      {showLocationDropdown ? "▲" : "▼"}
                    </Text>
                  </Pressable>

                  {showLocationDropdown && (
                    <View style={SharedStyles.dropdownMenu}>
                      <ScrollView
                        style={SharedStyles.dropdownScroll}
                        nestedScrollEnabled={true}
                        scrollEventThrottle={16}
                        showsVerticalScrollIndicator={false}
                      >
                        {locationOptions.map((option, index) => (
                          <Pressable
                            key={index}
                            style={SharedStyles.dropdownItem}
                            onPress={() => handleLocationSelect(option)}
                          >
                            <Text style={SharedStyles.dropdownItemText}>
                              {option}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>

              {/* Slots Dropdown (Only if it is not a food giveaway*/}
              {!isFoodGiveaway && (
                <View style={SharedStyles.fieldContainer}>
                  <View style={SharedStyles.iconContainer}>
                    <Text style={SharedStyles.iconText}>#</Text>
                  </View>
                  <View style={[SharedStyles.dropdownWrapper, { zIndex: 998 }]}>
                    <Pressable
                      style={SharedStyles.dropdownButton}
                      onPress={() => setShowSlotsDropdown(!showSlotsDropdown)}
                    >
                      <Text
                        style={[
                          SharedStyles.dropdownButtonText,
                          !slots && SharedStyles.placeholderText,
                        ]}
                      >
                        {slots || "select number"}
                      </Text>
                      <Text style={SharedStyles.dropdownArrow}>
                        {showSlotsDropdown ? "▲" : "▼"}
                      </Text>
                    </Pressable>

                    {showSlotsDropdown && (
                      <View style={SharedStyles.dropdownMenu}>
                        <ScrollView style={SharedStyles.dropdownScroll}>
                          {slotsOptions.map((option, index) => (
                            <Pressable
                              key={index}
                              style={SharedStyles.dropdownItem}
                              onPress={() => handleSlotsSelect(option)}
                            >
                              <Text style={SharedStyles.dropdownItemText}>
                                {option}
                              </Text>
                            </Pressable>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Date Picker */}
              <View style={SharedStyles.fieldContainer}>
                <View style={SharedStyles.iconContainer}>
                  <Text style={SharedStyles.iconText}>📅</Text>
                </View>
                <Pressable
                  style={SharedStyles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={SharedStyles.dateLabel}>Date</Text>
                  <Text style={SharedStyles.dateValue}>
                    {formatDate(selectedDate)}
                  </Text>
                </Pressable>
              </View>

              {/* Time Pickers */}
              <View style={styles.timeRowContainer}>
                <View style={styles.timeFieldContainer}>
                  <View style={SharedStyles.iconContainer}>
                    <Text style={SharedStyles.iconText}>🕐</Text>
                  </View>
                  <Pressable
                    style={SharedStyles.dateButton}
                    onPress={() => setShowStartPicker(true)}
                  >
                    <Text style={SharedStyles.dateLabel}>Start</Text>
                    <Text style={SharedStyles.dateValue}>
                      {formatTime(startTime)}
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.timeFieldContainer}>
                  <View style={SharedStyles.iconContainer}>
                    <Text style={SharedStyles.iconText}>🕑</Text>
                  </View>
                  <Pressable
                    style={SharedStyles.dateButton}
                    onPress={() => setShowEndPicker(true)}
                  >
                    <Text style={SharedStyles.dateLabel}>End</Text>
                    <Text style={SharedStyles.dateValue}>
                      {formatTime(endTime)}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Food Giveaway Switch */}
            <View style={SharedStyles.switchContainer}>
              <Text style={SharedStyles.switchLabel}>Food Giveaway?</Text>
              <Switch
                value={isFoodGiveaway}
                onValueChange={(value) => {
                  setIsFoodGiveaway(value);
                  if (value) {
                    setSlots(1);
                  } else {
                    setImageUris([]);
                  }
                }}
                trackColor={{ false: Colors.disabled, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>

            {/* Photo Upload */}
            {isFoodGiveaway && (
              <View style={SharedStyles.photoUploadContainer}>
                <Pressable
                  style={[
                    SharedStyles.photoUploadButton,
                    imageUris.length >= MAX_PHOTOS &&
                      SharedStyles.photoUploadButtonDisabled,
                  ]}
                  onPress={pickImage}
                  disabled={imageUris.length >= MAX_PHOTOS}
                >
                  <Text style={SharedStyles.photoUploadButtonText}>
                    {imageUris.length === 0
                      ? "Upload Photos"
                      : `Add Photos (${imageUris.length}/${MAX_PHOTOS})`}
                  </Text>
                </Pressable>
                {imageUris.length > 0 && (
                  <View style={SharedStyles.photoScrollContainer}>
                    <ScrollView
                      horizontal={true}
                      nestedScrollEnabled={true}
                      showsHorizontalScrollIndicator={false}
                      scrollEventThrottle={16}
                      contentContainerStyle={styles.photoScrollContent}
                    >
                      {imageUris.map((uri, index) => (
                        <View key={index} style={SharedStyles.photoWrapper}>
                          <Image
                            source={{ uri }}
                            style={SharedStyles.imagePreview}
                          />
                          <Pressable
                            onPress={() =>
                              setImageUris((prev) =>
                                prev.filter((_, i) => i !== index)
                              )
                            }
                            style={SharedStyles.removeImageButton}
                          >
                            <Text style={SharedStyles.removeImageButtonText}>
                              ✕
                            </Text>
                          </Pressable>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}

            {/* Post Button */}
            <View style={styles.postButtonContainer}>
              <Pressable
                style={[SharedStyles.primaryButton, styles.primaryButton, isPosting && { opacity: 0.5 }]}
                onPress={insertToDB}
                disabled={isPosting}
              >
                <Text style={SharedStyles.primaryButtonText}>
                  {isPosting ? "posting..." : "post ✓"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
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
                <Pressable onPress={() => setShowDatePicker(false)}>
                  <Text style={SharedStyles.timePickerDone}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={onTimeChange(setSelectedDate, setShowDatePicker)}
                style={styles.timePicker}
                textColor="#000000"
                themeVariant="light"
                minimumDate={getTodayMidnight()}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* Start Time Picker Modal */}
      {showStartPicker && (
        <Modal
          transparent={true}
          visible={showStartPicker}
          animationType="slide"
        >
          <Pressable
            style={SharedStyles.timePickerModalOverlay}
            onPress={() => setShowStartPicker(false)}
          >
            <Pressable
              style={SharedStyles.timePickerModal}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={SharedStyles.timePickerHeader}>
                <Pressable onPress={() => setShowStartPicker(false)}>
                  <Text style={SharedStyles.timePickerDone}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={startTime}
                mode="time"
                display="spinner"
                onChange={onTimeChange(setStartTime, setShowStartPicker)}
                style={styles.timePicker}
                textColor="#000000"
                themeVariant="light"
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* End Time Picker Modal */}
      {showEndPicker && (
        <Modal transparent={true} visible={showEndPicker} animationType="slide">
          <Pressable
            style={SharedStyles.timePickerModalOverlay}
            onPress={() => setShowEndPicker(false)}
          >
            <Pressable
              style={SharedStyles.timePickerModal}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={SharedStyles.timePickerHeader}>
                <Pressable onPress={() => setShowEndPicker(false)}>
                  <Text style={SharedStyles.timePickerDone}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={endTime}
                mode="time"
                display="spinner"
                onChange={onTimeChange(setEndTime, setShowEndPicker)}
                style={styles.timePicker}
                textColor="#000000"
                themeVariant="light"
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

// Only form-specific layout styles
const styles = StyleSheet.create({
  screenOverlay: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  screenContent: {
    width: "90%",
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    maxHeight: "90%",
  },
  formContent: {
    padding: Spacing.xl,
    zIndex: 1,
  },
  timeRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  timeFieldContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  postButtonContainer: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  photoScrollContent: {
    flexDirection: "row",
    paddingHorizontal: 5,
  },
  timePicker: {
    height: 200,
  },
  primaryButton: {
    marginTop: -15,
    paddingVertical: 12,
  },
});

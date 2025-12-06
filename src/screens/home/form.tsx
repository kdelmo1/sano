import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
  ScrollView,
  Image,
  Switch,
  Modal, 
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
  ResponsiveUtils,
  FontSizes,
  Shadows,
} from "../../styles/sharedStyles";

const MAX_PHOTOS = 3;

const locationIcon = require("../../assets/images/form-location.png");
const profileIcon = require("../../assets/images/form-profile.png");
const calendarIcon = require("../../assets/images/form-calendar.png");
const timeIcon = require("../../assets/images/form-time.png");

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

    if (isPosting) {
      return;
    }

    setIsPosting(true);

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
      alert("Failed to post: " + error.message);
      setIsPosting(false);
    } else {
      resetForm();
      setToPost(false);
      onPostSuccess(); 
      setIsPosting(false);
    }
  }

  return (
    <View style={styles.fullScreenContainer}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerPlaceholder} />
        <Text style={styles.headerTitle}>New Post</Text>
        <Pressable
          style={styles.closeButton}
          onPress={() => {
            resetForm();
            onClose();
          }}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContent}>
          {/* Location Dropdown */}
          <View style={SharedStyles.fieldContainer}>
            <View style={SharedStyles.iconContainer}>
              <Image source={locationIcon} style={styles.formIcon} />
            </View>
            <View style={SharedStyles.dropdownWrapper}>
              <Pressable
                style={SharedStyles.dropdownButton}
                onPress={() => setShowLocationDropdown(!showLocationDropdown)}
              >
                <Text
                  style={[
                    SharedStyles.dropdownButtonText,
                    !location && SharedStyles.placeholderText,
                  ]}
                >
                  {location || "Select Location"}
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

          {/* Slots Dropdown */}
          {!isFoodGiveaway && (
            <View style={SharedStyles.fieldContainer}>
              <View style={SharedStyles.iconContainer}>
                <Image source={profileIcon} style={styles.formIcon} />
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
                    {slots || "Select Number"}
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
              <Image source={calendarIcon} style={styles.formIcon} />
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
                <Image
                  source={timeIcon}
                  style={[styles.formIcon, { tintColor: "#4CAF50" }]}
                />
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
                <Image
                  source={timeIcon}
                  style={[styles.formIcon, { tintColor: Colors.error }]}
                />
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
            style={[
              SharedStyles.primaryButton,
              styles.primaryButton,
              isPosting && { opacity: 0.5 },
            ]}
            onPress={insertToDB}
            disabled={isPosting}
          >
            <Text style={SharedStyles.primaryButtonText}>
              {isPosting ? "Posting..." : "Post ✓"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <React.Fragment>
          <PlatformSpecificDatePicker
            value={selectedDate}
            onChange={onTimeChange(setSelectedDate, setShowDatePicker)}
            onClose={() => setShowDatePicker(false)}
            mode="date"
            minimumDate={getTodayMidnight()}
          />
        </React.Fragment>
      )}

      {showStartPicker && (
        <PlatformSpecificDatePicker
          value={startTime}
          onChange={onTimeChange(setStartTime, setShowStartPicker)}
          onClose={() => setShowStartPicker(false)}
          mode="time"
        />
      )}

      {showEndPicker && (
        <PlatformSpecificDatePicker
          value={endTime}
          onChange={onTimeChange(setEndTime, setShowEndPicker)}
          onClose={() => setShowEndPicker(false)}
          mode="time"
        />
      )}
    </View>
  );
}

const PlatformSpecificDatePicker = ({
  value,
  onChange,
  onClose,
  mode,
  minimumDate,
}: any) => {
  return (
    <Modal transparent={true} visible={true} animationType="slide">
      <Pressable style={SharedStyles.timePickerModalOverlay} onPress={onClose}>
        <Pressable
          style={SharedStyles.timePickerModal}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={SharedStyles.timePickerHeader}>
            <Pressable onPress={onClose}>
              <Text style={SharedStyles.timePickerDone}>Done</Text>
            </Pressable>
          </View>
          <DateTimePicker
            value={value}
            mode={mode}
            display="spinner"
            onChange={onChange}
            style={styles.timePicker}
            textColor="#000000"
            themeVariant="light"
            minimumDate={minimumDate}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginTop: Platform.OS === "android" ? 0 : 0, 
  },
  headerPlaceholder: {
    width: 30,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: Colors.black,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.medium, 
  },
  closeButtonText: {
    fontSize: FontSizes.lg,
    color: Colors.white,
    fontWeight: "600",
    lineHeight: Platform.OS === "android" ? 22 : undefined,
    marginTop: Platform.OS === "ios" ? 1 : 0, 
  },
  scrollContent: {
    paddingBottom: 100, 
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
  formIcon: {
    width: ResponsiveUtils.moderateScale(24),
    height: ResponsiveUtils.moderateScale(24),
    resizeMode: "contain",
    tintColor: Colors.textMedium,
  },
});
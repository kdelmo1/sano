import React, { useContext, useEffect, useState } from "react";
import { View, Pressable, Image, StyleSheet } from "react-native";
import AuthContext from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { Colors, BorderRadius, ResponsiveUtils } from "../../styles/sharedStyles";

// Import local assets
const thumbsUpIcon = require("../../assets/images/icon-thumbs-up.png");
const thumbsDownIcon = require("../../assets/images/icon-thumbs-down.png");

export default function RateUser({
  id,
  ratedEmailHandle,
}: {
  id: string;
  ratedEmailHandle: string;
}) {
  const { emailHandle } = useContext(AuthContext);

  const [isRated, setIsRated] = useState(false);
  // rating: true = thumbs up (1), false = thumbs down (0)
  const [rating, setRating] = useState<boolean | null>(null);

  useEffect(() => {
    const getInitRating = async () => {
      const { data, error } = await supabase
        .from("ratings")
        .select()
        .eq("post_id", id)
        .eq("rater_email_handle", emailHandle)
        .eq("rated_email", ratedEmailHandle + "@ucsc.edu")
        .maybeSingle();
      if (error) {}
      else {
        if (data) {
          setIsRated(true);
          setRating(data["rating"] === 1);
        }
      }
    };
    getInitRating();
  }, []);

  const handleRating = async (newRatingVal: number) => {
    const isUp = newRatingVal === 1;
    
    // Optimistic update
    setIsRated(true);
    setRating(isUp);

    const { error } = await supabase.from("ratings").upsert({
      post_id: id,
      rater_email_handle: emailHandle,
      rated_email: ratedEmailHandle + "@ucsc.edu",
      rating: newRatingVal,
    }, { onConflict: 'post_id, rater_email_handle, rated_email' }); 

  };

  const cancelRating = async () => {
    // Optimistic update
    setIsRated(false);
    setRating(null);

    const { error } = await supabase
      .from("ratings")
      .delete()
      .eq("post_id", id)
      .eq("rater_email_handle", emailHandle)
      .eq("rated_email", `${ratedEmailHandle}@ucsc.edu`);
  };

  // Helper to determine styles based on current state
  const getButtonStyle = (isThumbsUp: boolean) => {
    const isActive = isRated && rating === isThumbsUp;
    
    return {
      container: [
        styles.iconButton,
        isActive && styles.iconButtonSelected,
      ],
      tint: isActive ? Colors.white : Colors.primary,
    };
  };

  const upStyle = getButtonStyle(true);
  const downStyle = getButtonStyle(false);

  return (
    <View style={styles.container}>
      {/* Thumbs Up */}
      <Pressable
        onPress={() => {
          if (isRated && rating === true) {
            cancelRating();
          } else {
            handleRating(1);
          }
        }}
        style={upStyle.container}
      >
        <Image 
          source={thumbsUpIcon} 
          style={[styles.icon, { tintColor: upStyle.tint }]} 
        />
      </Pressable>

      {/* Thumbs Down */}
      <Pressable
        onPress={() => {
          if (isRated && rating === false) {
            cancelRating();
          } else {
            handleRating(0);
          }
        }}
        style={downStyle.container}
      >
        <Image 
          source={thumbsDownIcon} 
          style={[styles.icon, { tintColor: downStyle.tint }]} 
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    // Decreased gap to bring them closer (was 15)
    gap: ResponsiveUtils.moderateScale(8), 
    alignItems: "center",
    // Align content to the left
    justifyContent: "flex-start",
    // Override any parent alignment (like center) to force this container to the left
    alignSelf: "flex-start", 
  },
  iconButton: {
    // Increased button size (was 44)
    width: ResponsiveUtils.moderateScale(52),
    height: ResponsiveUtils.moderateScale(52),
    borderRadius: BorderRadius.circle,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  iconButtonSelected: {
    backgroundColor: Colors.primary,
  },
  icon: {
    // Increased icon size (was 24)
    width: ResponsiveUtils.moderateScale(32),
    height: ResponsiveUtils.moderateScale(32),
    resizeMode: "contain",
  },
});
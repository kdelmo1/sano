import React, { useContext, useEffect, useState } from "react";
import { Text, View, Pressable } from "react-native";
import AuthContext from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

export default function RateUser({
  id,
  ratedEmailHandle,
}: {
  id: string;
  ratedEmailHandle: string;
}) {
  const { emailHandle } = useContext(AuthContext);

  const [isRated, setIsRated] = useState(false);
  const [rating, setRating] = useState(false);

  useEffect(() => {
    const getInitRating = async () => {
      const { data, error } = await supabase
        .from("ratings")
        .select()
        .eq("post_id", id)
        .eq("rater_email_handle", emailHandle)
        .eq("rated_email", ratedEmailHandle + "@ucsc.edu")
        .maybeSingle();
      if (error) console.error(error);
      else {
        if (data) {
          setIsRated(true);
          setRating(data["rating"] === 1);
        }
      }
    };
    getInitRating();
  }, []);

  const handleRating = async (rating: number) => {
    setIsRated(true);
    setRating(rating === 1);
    const { error } = await supabase.from("ratings").insert({
      post_id: id,
      rater_email_handle: emailHandle,
      rated_email: ratedEmailHandle + "@ucsc.edu",
      rating: rating,
    });

    if (error) console.error(error);
  };

  const cancelRating = async () => {
    setIsRated(false);
    const { error } = await supabase
      .from("ratings")
      .delete()
      .eq("post_id", id)
      .eq("rater_email_handle", emailHandle)
      .eq("rated_email", `${ratedEmailHandle}@ucsc.edu`);
    if (error) console.error(error);
  };

  return (
    <View style={{ flexDirection: "row" }}>
      {isRated ? (
        <Pressable onPress={cancelRating}>
          <Text style={{ fontSize: 30 }}>{rating ? "👍" : "👎"}</Text>
        </Pressable>
      ) : (
        <>
          <Pressable
            onPress={() => {
              handleRating(1);
            }}
          >
            <Text style={{ fontSize: 30 }}>👍</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              handleRating(0);
            }}
          >
            <Text style={{ fontSize: 30 }}>👎</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

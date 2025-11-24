import React, { useContext } from "react";
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

  const handleRating = async (rating: number) => {
    console.log({
      id: id,
      rater_handle: emailHandle,
      rated_email: ratedEmailHandle + "@ucsc.edu",
      new_rating: rating,
    });
    const { error } = await supabase.rpc("rate", {
      id: id,
      rater_handle: emailHandle,
      rated_email: ratedEmailHandle + "@ucsc.edu",
      new_rating: rating,
    });
    if (error) console.error(error);
  };
  return (
    <View style={{ flexDirection: "row" }}>
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
    </View>
  );
}

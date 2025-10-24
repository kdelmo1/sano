import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { StyleSheet, View, Alert } from "react-native";
import { Button, Input } from "@rneui/themed";
import { Session } from "@supabase/supabase-js";

export default function Avatar() {
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    downloadImage();
  });
  async function downloadImage() {
    try {
      const { data, error } = await supabase.from("Posts").select("id");
      //console.log(data, error);
      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log("Error downloading image: ", error.message);
      }
    }
  }
  return (
    <View>
      <View>
        <Button
          title={uploading ? "Uploading ..." : "Upload"}
          onPress={() => {}}
        />
      </View>
    </View>
  );
}

import React, { useState, useContext, useEffect } from "react";
import { StyleSheet, Text, View, Pressable, Image, Modal } from "react-native";
import ChatScreen from "./chatScreen";
import AuthContext from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

export default function PosterView({
  id,
  showOpt,
  goBack,
}: {
  id: string;
  showOpt: boolean;
  goBack: () => void;
}) {
  const { emailHandle } = useContext(AuthContext);

  const [applicants, setApplicants] = useState<string[]>([]);
  useEffect(() => {
    const getFromDB = async () => {
      const { error, data } = await supabase
        .from("Posts")
        .select("reservation")
        .eq("postID", id)
        .single();
      if (error) {
      } else {
        setApplicants(data["reservation"] || []);
      }
    };
    getFromDB();
  }, []);

  const RenderApplicant = ({ applicant }: { applicant: string }) => {
    const [openChat, setOpenChat] = useState(false);
    return (
      <Pressable
        onPress={() => {
          setOpenChat(true);
        }}
      >
        <View style={{ padding: 10 }}>
          <Text>{applicant}</Text>
        </View>
        <ChatScreen
          goBack={() => setOpenChat(false)}
          openChat={openChat}
          postID={id}
          receiver={applicant}
          fromScreen={"inbox"}
        />
      </Pressable>
    );
  };

  return (
    <Modal visible={showOpt}>
      <View style={styles.screen}>
        <View style={styles.container}>
          <Pressable
            onPress={goBack}
            style={{ borderWidth: 1, borderColor: "#000" }}
          >
            <Text>Back</Text>
          </Pressable>
          {applicants.map((applicant) => (
            <RenderApplicant key={applicant} applicant={applicant} />
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // will delete later
  screen: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  container: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    maxWidth: 1152,
    width: "100%",
    minHeight: 600,
    borderRadius: 12,
    backgroundColor: "#FFF",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
});

import React, { useState, useContext, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import ChatScreen from "./chatScreen";
import AuthContext from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  SharedStyles,
  Colors,
  Spacing,
  FontSizes,
  BorderRadius,
  Typography,
} from "../../styles/sharedStyles";
import RateUser from "../home/RateUser";

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
        console.log("Error fetching applicants:", error);
      } else {
        setApplicants(data["reservation"] || []);
      }
    };
    getFromDB();
  }, [id]);

  const RenderApplicant = ({ applicant }: { applicant: string }) => {
    const [openChat, setOpenChat] = useState(false);
    return (
      <>
        <Pressable
          style={styles.applicantItem}
          onPress={() => setOpenChat(true)}
        >
          <View style={SharedStyles.userBadge}>
            <View style={SharedStyles.profileIcon}>
              <Text style={styles.profileIconText}>👤</Text>
            </View>
            <Text style={SharedStyles.username}>{applicant}</Text>
          </View>
          <RateUser id={id} ratedEmailHandle={applicant} />
        </Pressable>
        <ChatScreen
          goBack={() => setOpenChat(false)}
          openChat={openChat}
          postID={id}
          receiver={applicant}
          fromScreen={"inbox"}
        />
      </>
    );
  };

  return (
    <Modal visible={showOpt}>
      <View style={styles.screen}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={goBack} style={SharedStyles.backButton}>
              <Text style={SharedStyles.backText}>← Back</Text>
            </Pressable>
            <Text style={[Typography.sectionTitle]}>Applicants</Text>
            <View style={SharedStyles.placeholder} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {applicants.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={SharedStyles.noPostsText}>No applicants yet</Text>
              </View>
            ) : (
              applicants.map((applicant) => (
                <RenderApplicant key={applicant} applicant={applicant} />
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
    backgroundColor: Colors.background,
  },
  container: {
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: 1152,
    width: "100%",
    minHeight: 600,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  applicantItem: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileIconText: {
    fontSize: FontSizes.xs,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxxl,
  },
});

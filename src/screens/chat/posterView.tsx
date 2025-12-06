import React, { useState, useContext, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  ScrollView,
  Image,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatScreen from "./chatScreen";
import AuthContext from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  SharedStyles,
  Colors,
  Spacing,
  Typography,
  BorderRadius,
} from "../../styles/sharedStyles";
import RateUser from "../home/RateUser";

const profileIconImg = require("../../assets/images/form-profile.png");

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
  const insets = useSafeAreaInsets();

  const [applicants, setApplicants] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApplicants = async () => {
    const { error, data } = await supabase
      .from("Posts")
      .select("reservation")
      .eq("postID", id)
      .maybeSingle();

    if (!data) {
      return;
    }

    if (error) {
    } else {
      setApplicants(data["reservation"] || []);
    }
  };

  useEffect(() => {
    if (showOpt) {
      fetchApplicants();
    }
  }, [id, showOpt]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchApplicants();
    setRefreshing(false);
  }, [id]);

  const RenderApplicant = ({ applicant }: { applicant: string }) => {
    const [openChat, setOpenChat] = useState(false);
    const [applicantRating, setApplicantRating] = useState<number | null>(null);

    useEffect(() => {
      const fetchRating = async () => {
        const { data, error } = await supabase
          .from("ratings")
          .select("rating") 
          .eq("rated_email", applicant);

        if (!error && data && data.length > 0) {
          const total = data.reduce((acc, curr) => acc + (curr.rating || 0), 0);
          setApplicantRating(total / data.length);
        }
      };

      fetchRating();
    }, [applicant]);

    return (
      <>
        <Pressable
          style={styles.applicantItem}
          onPress={() => setOpenChat(true)}
        >
          <View style={SharedStyles.userBadge}>
            <View style={SharedStyles.profileIcon}>
              <Image
                source={profileIconImg}
                style={SharedStyles.profileIconImage}
              />
            </View>
            <Text style={SharedStyles.username}>{applicant}</Text>
            
            {/* Display rating */}
            {applicantRating !== null && (
              <Text style={styles.ratingText}>
                {applicantRating.toFixed(1)}
              </Text>
            )}
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
    <Modal visible={showOpt} animationType="none">
      {/* 4. FIXED: Layout structure for white status bar */}
      <View style={{ flex: 1, backgroundColor: Colors.white }}>
        {/* Spacer View: fills the status bar area with white */}
        <View style={{ height: insets.top, backgroundColor: Colors.white }} />
        
        {/* Main Container */}
        <View style={SharedStyles.container}>
          <View style={SharedStyles.headerWithBorder}>
            <Pressable onPress={goBack} style={SharedStyles.backButton}>
              <Text style={SharedStyles.backText}>← Back</Text>
            </Pressable>
            <Text style={[Typography.sectionTitle]}>Applicants</Text>
            <View style={SharedStyles.placeholder} />
          </View>

          <ScrollView
            style={SharedStyles.scroller}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "400",
    color: Colors.black, 
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: Spacing.xl,
    marginTop: Spacing.xl,
  },
});
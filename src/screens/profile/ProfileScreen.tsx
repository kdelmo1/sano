import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View, Pressable, Image, ScrollView } from "react-native";
import { supabase } from "../../lib/supabase";
import AuthContext from "../../context/AuthContext";
import Post from "../home/post";
import getFromDB from "../GetFromDB";
import {
  SharedStyles,
  Colors,
  Spacing,
  BorderRadius,
  Typography,
} from "../../styles/sharedStyles";

interface ProfileScreenProps {
  goBack: () => void;
  onInboxPress: () => void;
}

export default function ProfileScreen({
  goBack,
  onInboxPress,
}: ProfileScreenProps) {
  const { isLoggedIn, user, emailHandle } = useContext(AuthContext);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const [yourPosts, setYourPosts] = useState<PostProps[]>([]);

  useEffect(() => {
    getFromDB("profile", emailHandle, "", "", setYourPosts);
  }, []);

  const displayName = user?.user_metadata?.name;

  return (
    <View style={styles.container}>
      {/* Profile Card */}
      <View style={SharedStyles.profileCard}>
        <View style={SharedStyles.profilePictureContainer}>
          <View style={SharedStyles.profilePicture}>
            <Image
              source={require("../../assets/images/profile-icon.png")}
              style={SharedStyles.profileIconLarge}
            />
          </View>
        </View>
        <Text style={[Typography.userName, styles.userName]}>{displayName}</Text>
      </View>

      {/* Your Posts Section */}
      <View style={styles.yourPostsContainer}>
        <Text style={[Typography.sectionTitle, styles.sectionTitle]}>Your posts</Text>
        <ScrollView style={styles.yourPostsList}>
          {yourPosts.length === 0 ? (
            <Text style={SharedStyles.noPostsText}>You have no posts</Text>
          ) : (
            yourPosts.map((p) => (
              <Post
                key={p.id}
                id={p.id}
                location={p.location}
                startTime={p.startTime}
                endTime={p.endTime}
                name={p.name}
                slots={p.slots}
                isPoster={true}
                fromScreen={"profile"}
                isFoodGiveaway={p.isFoodGiveaway}
                photoUrls={p.photoUrls}
              />
            ))
          )}
        </ScrollView>
      </View>

      {/* Inbox Button */}
      <Pressable style={SharedStyles.secondaryButton} onPress={onInboxPress}>
        <Text style={SharedStyles.secondaryButtonText}>Inbox</Text>
      </Pressable>

      {/* Logout Button */}
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={SharedStyles.primaryButtonText}>log-out</Text>
      </Pressable>
    </View>
  );
}

// Only component-specific styles remain
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    paddingTop: 60,
  },
  yourPostsContainer: {
    width: "90%",
    maxWidth: 360,
    marginTop: Spacing.md,
    marginBottom: Spacing.base,
  },
  yourPostsList: {
    maxHeight: 260,
  },
  logoutButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  userName: {
    marginBottom: -10,
    marginTop: -10,
  }
});
import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  ScrollView,
  RefreshControl, // Add this
  ActivityIndicator, // Add this for loading spinner
} from "react-native";
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
  const [yourRating, setYourRating] = useState<number | "X">("X");
  const [refreshingRating, setRefreshingRating] = useState(false); // Add this

  useEffect(() => {
    getFromDB("profile", emailHandle, setYourPosts);
  }, []);

  const displayName = user?.user_metadata?.name;

  useEffect(() => {
    async function getRating() {
      const { data, error } = await supabase
        .from("student")
        .select("rating, number_of_raters")
        .eq("email", user?.email)
        .maybeSingle();

      if (!data) {
        console.log("Post not found");
        return;
      }

      if (error) console.error(error);
      else {
        if (data["number_of_raters"] >= 5)
          setYourRating((data["rating"] / data["number_of_raters"]) * 10);
      }
    }
    getRating();
  }, []);

  const onRefreshRating = async () => {
    setRefreshingRating(true);

    const { data, error } = await supabase
      .from("student")
      .select("rating, number_of_raters")
      .eq("email", user?.email)
      .maybeSingle();

    if (data && !error) {
      if (data["number_of_raters"] >= 5) {
        setYourRating((data["rating"] / data["number_of_raters"]) * 10);
      } else {
        setYourRating("X");
      }
    }

    setRefreshingRating(false);
  };

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

        {/* User Name */}
        <Text style={[Typography.userName, styles.userName]}>
          {displayName}
        </Text>

        <View style={styles.ratingContainer}>
          <Text style={{ fontSize: 20, padding: 10 }}>
            Rating:{" "}
            {typeof yourRating === "string" ? yourRating : yourRating.toFixed(1)}
          </Text>

          <Pressable
            style={styles.refreshButton}
            onPress={onRefreshRating}
            disabled={refreshingRating}
          >
            {refreshingRating ? (
              <ActivityIndicator size="small" color={Colors.text} />
            ) : (
              <Text style={styles.refreshIcon}>↻</Text>
            )}
          </Pressable>
        </View>
      </View>

      {/* Your Posts Section */}
      <View style={styles.yourPostsContainer}>
        <Text style={[Typography.sectionTitle, styles.sectionTitle]}>
          Your posts
        </Text>
        <ScrollView style={styles.yourPostsList}>
          {yourPosts.length === 0 ? (
            <Text style={SharedStyles.noPostsText}>You have no posts</Text>
          ) : (
            yourPosts.map((post) => (
              <Post
                key={post.id}
                id={post.id}
                location={post.location}
                startTime={post.startTime}
                endTime={post.endTime}
                name={post.name}
                slots={post.slots}
                isPoster={true}
                fromScreen={"profile"}
                isFoodGiveaway={post.isFoodGiveaway}
                photoUrls={post.photoUrls}
                posterRating={post.posterRating}
                reservePostInit={false}
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
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.inputBg,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -5,
  },
  refreshIcon: {
    fontSize: 20,
    color: Colors.text,
    fontWeight: "bold",
  },
});
import React, { useEffect, useState, useContext, useCallback } from "react";
import { 
  View, 
  Text, 
  Pressable, 
  ScrollView, 
  RefreshControl // 1. Import RefreshControl
} from "react-native";
import Post from "../home/post";
import getFromDB from "../GetFromDB";
import AuthContext from "../../../src/context/AuthContext";
import {
  SharedStyles,
  Colors,
  Typography,
} from "../../styles/sharedStyles";

interface InboxScreenProps {
  goBack: () => void;
}

export default function InboxScreen({ goBack }: InboxScreenProps) {
  const [posts, setPosts] = useState<PostProps[]>([]);
  const { emailHandle } = useContext(AuthContext);

  // 2. Add refreshing state
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getFromDB("inbox", emailHandle, setPosts);
  }, []);

  // 3. Add refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Re-fetch data
    await getFromDB("inbox", emailHandle, setPosts);
    setRefreshing(false);
  }, [emailHandle]);

  return (
    <View style={SharedStyles.container}>
      {/* Header remains exactly the same */}
      <View style={SharedStyles.headerWithBorder}>
        <Pressable onPress={goBack} style={SharedStyles.backButton}>
          <Text style={SharedStyles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={[Typography.sectionTitle]}>Inbox</Text>
        <View style={SharedStyles.placeholder} />
      </View>

      <ScrollView
        style={SharedStyles.scroller}
        contentContainerStyle={SharedStyles.scrollContent}
        // 4. Attach RefreshControl
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={Colors.primary} // Optional: Matches your app theme on iOS
          />
        }
      >
        {posts.map((post) => {
          return (
            <Post
              key={post.id}
              id={post.id}
              location={post.location}
              startTime={post.startTime}
              endTime={post.endTime}
              name={post.name}
              slots={post.slots}
              isPoster={post.isPoster}
              fromScreen={"inbox"}
              isFoodGiveaway={post.isFoodGiveaway}
              photoUrls={post.photoUrls}
              posterRating={post.posterRating}
              reservePostInit={true}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}
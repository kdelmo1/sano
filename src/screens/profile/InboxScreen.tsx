import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import Post from "../home/post";
import getFromDB from "../GetFromDB";
import AuthContext from "../../../src/context/AuthContext";
import { SharedStyles, Colors, Spacing, Typography } from "../../styles/sharedStyles";

interface InboxScreenProps {
  goBack: () => void;
}

export default function InboxScreen({ goBack }: InboxScreenProps) {
  const [posts, setPosts] = useState<PostProps[]>([]);
  const { emailHandle } = useContext(AuthContext);

  useEffect(() => {
    getFromDB("inbox", emailHandle, "", "", setPosts);
  }, []);

  return (
    <View style={SharedStyles.container}>
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
            />
          );
        })}
      </ScrollView>
    </View>
  );
}
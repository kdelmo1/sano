import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  RefreshControl,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import Post from "./post";
import Search from "./filter";
import Form from "./form";
import { supabase } from "./supabaseClient";
import { User } from "@supabase/supabase-js";

export default function Home(data: { user: User | null }) {
  const [posts, setPosts] = React.useState<
    { id: number; name: string; date: string; content: string }[]
  >([]);

  const [openPost, setOpenPost] = React.useState<number>(-1);
  const [toPost, setToPost] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [getPost, setGetPost] = React.useState(false);

  const onRefresh = () => {
    setGetPost(!getPost);
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const insets = useSafeAreaInsets();

  useEffect(() => {
    async function getFromDB() {
      const { data, error } = await supabase
        .from("Posts")
        .select(`*`)
        .order("startTime", { ascending: false });

      setPosts([]);
      if (error) {
        console.log("err", error);
      } else {
        setPosts(
          data.map((val) => {
            return {
              id: val["postID"],
              name: val["name"],
              date: val["startTime"],
              content: val["content"],
            };
          })
        );
      }
    }
    getFromDB();
  }, [getPost]);

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingBottom: insets.bottom,
        paddingRight: insets.right,
      }}
    >
      <View style={styles.container}>
        <View style={styles.navbar}>
          <View style={styles.search_bar_container}>
            <TextInput
              style={styles.search_input}
              placeholder="Search for posts"
              editable={false}
            />
          </View>
        </View>
        <ScrollView
          style={styles.scroller}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {posts.map((post, index) => (
            <Post
              key={index}
              id={index}
              name={post.name}
              date={post.date}
              content={post.content}
              openPost={openPost}
              setOpenPost={setOpenPost}
            />
          ))}
        </ScrollView>
        <Form
          user={data.user}
          toPost={toPost}
          setToPost={setToPost}
          onPostSuccess={() => setGetPost((prev) => !prev)}
        />
        <View style={styles.footer}>
          {/* Post button */}
          <Pressable
            style={styles.nav_button}
            onPress={() => {
              setToPost(true);
            }}
          >
            <Text style={styles.plus_text}>+</Text>
          </Pressable>

          {/* main feed button */}
          <Pressable style={styles.nav_button} onPress={onRefresh}>
            <Text style={styles.nav_text}>🏠</Text>
          </Pressable>

          {/* profile page button */}
          <Pressable
            style={styles.nav_button}
            onPress={() => {
              console.log("Navigating to Profile Page...");
            }}
          >
            <Text style={styles.nav_text}>👤</Text>
          </Pressable>
        </View>

        <StatusBar style="auto" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  navbar: {
    backgroundColor: "#FFF",
    position: "absolute" as const,
    top: 0,
    width: "100%",
    height: "10%",
    borderColor: "#000",
    borderWidth: 0,
    // borderBottomWidth: 1,
    justifyContent: "flex-end",
  },
  // logo: {
  //   top: 0,
  //   height: "50%",
  //   width: "100%",
  //   alignItems: "center" as const,
  //   justifyContent: "center" as const,
  // },
  search_bar_container: {
    width: "100%",
    paddingHorizontal: "5%",
    paddingBottom: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  search_input: {
    width: "100%",
    height: 40,
    backgroundColor: "#EEEEEE",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#CCCCCC",
  },
  scroller: {
    backgroundColor: "#FFF",
    position: "absolute" as const,
    width: "100%",
    height: "80%",
    top: "10%",
  },
  footer: {
    width: "100%",
    position: "absolute" as const,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderColor: "#000",
    zIndex: 100,
  },
  nav_button: {
    height: 40,
    width: 80, // Set a specific width
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  nav_text: {
    fontSize: 24, // Size for emoji icons
  },

  // button: {
  //   height: "100%",
  //   aspectRatio: 1,
  //   borderColor: "#000",
  //   borderWidth: 1,
  //   borderRadius: "100%",
  // },

  plus_text: {
    fontSize: 30,
    lineHeight: 30,
    color: "rgba(48, 48, 255, 1)", // Use the original blue color for the plus icon
    fontWeight: "bold",
  },
});

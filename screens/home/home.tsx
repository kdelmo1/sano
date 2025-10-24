import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  RefreshControl,
  Button,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import Post from "./post";
import Search from "./filter";
import { supabase } from "./supabaseClient";

export default function Home() {
  const [posts, setPosts] = React.useState<
    { id: number; name: string; date: string; content: string }[]
  >([]);

  const [openPost, setOpenPost] = React.useState<number>(-1);
  const [toPost, setToPost] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [getPost, setGetPost] = React.useState(false);
  const [myID, setMyID] = React.useState("");
  const [myContent, setMyContent] = React.useState("");
  const [newPost, setNewPost] = React.useState(false);

  const onRefresh = () => {
    setGetPost(!getPost);
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  function onChangeNumber(
    text: string,
    setState: React.Dispatch<React.SetStateAction<string>>
  ) {
    for (let i of text) {
      const isNum = i.charCodeAt(0) - "0".charCodeAt(0);
      if (isNum < 0 || isNum > 9) {
        return;
      }
    }
    setState(text);
  }

  const insets = useSafeAreaInsets();

  const handlePost = () => {
    setNewPost(!newPost);
  };

  useEffect(() => {
    async function getFromDB() {
      const { data, error } = await supabase.from("Posts").select(`*`);
      setPosts([]);
      console.log(data, error);
      if (error) {
        console.log("err");
      } else {
        setPosts(
          data.map((val) => {
            return {
              id: val["id"],
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

  useEffect(() => {
    async function insertToDB() {
      // check if post is valid
      const time = new Date();
      const { error } = await supabase.from("Posts").insert({
        postID: Number(myID),
        id: 0,
        name: "John Doe",
        startTime: time.toISOString(),
        content: myContent,
      });
      console.log("Posted");
      if (error) {
        console.log(error);
      } else {
        setMyID("");
        setMyContent("");
        setToPost(false);
      }
    }
    insertToDB();
  }, [newPost]);

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
          <View style={styles.logo}>
            <Text>Sano</Text>
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
        <View style={styles.footer}>
          <Pressable
            style={styles.button}
            onPress={() => {
              setToPost(true);
            }}
          ></Pressable>
        </View>
        <Modal transparent={true} visible={toPost}>
          <View
            style={{
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: "95%",
                height: "60%",
                position: "absolute",
                alignItems: "center",
                backgroundColor: "#FFF",
                borderRadius: 5,
                borderWidth: 1,
                borderColor: "#000",
              }}
            >
              <View
                style={{
                  alignItems: "flex-end",
                  width: "100%",
                  height: "7%",
                  padding: "2%",
                }}
              >
                <Pressable
                  style={{
                    height: "100%",
                    aspectRatio: 1,
                    borderRadius: "100%",
                    backgroundColor: "#FFF",
                    borderWidth: 1,
                    borderColor: "#000",
                  }}
                  onPress={() => {
                    setToPost(false);
                  }}
                ></Pressable>
              </View>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#000",
                  backgroundColor: "#888",
                  width: "90%",
                  padding: "2%",
                  marginTop: "5%",
                }}
                onChangeText={(text) => onChangeNumber(text, setMyID)}
                value={myID}
              ></TextInput>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#000",
                  backgroundColor: "#888",
                  width: "90%",
                  height: "60%",
                  padding: "2%",
                  marginTop: "5%",
                }}
                multiline
                numberOfLines={4}
                onChangeText={(text) => {
                  setMyContent(text);
                }}
                value={myContent}
              ></TextInput>
              <Pressable
                style={{
                  margin: "5%",
                  backgroundColor: "rgba(48, 48, 255, 1)",
                  padding: "2%",
                  borderRadius: 10,
                }}
                onPress={() => {
                  handlePost();
                }}
              >
                <Text style={{ fontSize: 20, color: "#FFF" }}>Post</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
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
    borderWidth: 1,
  },
  logo: {
    top: 0,
    height: "50%",
    width: "100%",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  scroller: {
    backgroundColor: "#FFF",
    position: "absolute" as const,
    width: "100%",
    height: "85%",
    top: "10%",
  },
  footer: {
    width: "100%",
    height: "5%",
    top: "47.5%",
    borderColor: "#000",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    height: "100%",
    aspectRatio: 1,
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: "100%",
  },
});

import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import Post from "./post";
import Search from "./filter";
import Avatar from "./accessDB";
import { supabase } from "./supabaseClient";

export default function Home() {
  const posts = [
    { id: 1, name: "john", date: Date(), content: "null" },
    { id: 2, name: "ethan", date: Date(), content: "null" },
    { id: 3, name: "mark", date: Date(), content: "null" },
    { id: 1, name: "john", date: Date(), content: "null" },
    { id: 2, name: "ethan", date: Date(), content: "null" },
    { id: 3, name: "mark", date: Date(), content: "null" },
    { id: 1, name: "john", date: Date(), content: "null" },
    { id: 2, name: "ethan", date: Date(), content: "null" },
    { id: 3, name: "mark", date: Date(), content: "null" },
    { id: 1, name: "john", date: Date(), content: "null" },
    { id: 2, name: "ethan", date: Date(), content: "null" },
    { id: 3, name: "mark", date: Date(), content: "null" },
    { id: 1, name: "john", date: Date(), content: "null" },
    { id: 2, name: "ethan", date: Date(), content: "null" },
    { id: 3, name: "mark", date: Date(), content: "null" },
  ]; // delete later for post data

  const [openPost, setOpenPost] = React.useState<number>(-1);
  const [toPost, setToPost] = React.useState(false);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    let ignore = false;
    console.log(123);
    async function getProfile() {
      const { data, error } = await supabase.from("Posts").select(`*`);
      console.log(data, error);
      if (!ignore) {
        if (error) {
        } else if (data) {
        }
      }
    }
    getProfile();
    return () => {
      ignore = true;
    };
  }, [openPost]);

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
        <ScrollView style={styles.scroller}>
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
                  height: "8%",
                  width: "90%",
                  marginTop: "5%",
                }}
              ></TextInput>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#000",
                  height: "50%",
                  width: "90%",
                  marginTop: "5%",
                }}
              ></TextInput>
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

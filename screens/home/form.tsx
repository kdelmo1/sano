import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { User } from "@supabase/supabase-js";

// Maybe for later feature including time slots
// import RNDateTimePicker from "@react-native-community/datetimepicker";
// import DateTimePickerEvent from "@react-native-community/datetimepicker";

export default function popup(data: {
  user: User | null;
  toPost: boolean;
  setToPost: React.Dispatch<React.SetStateAction<boolean>>;
  onPostSuccess: () => void;
}) {
  const toPost = data.toPost;
  const setToPost = data.setToPost;
  const [myID, setMyID] = React.useState("");
  const onPostSuccess = data.onPostSuccess;

  const [myContent, setMyContent] = React.useState("");
  // const [startDate, setStartDate] = React.useState(new Date());
  // const [endDate, setEndDate] = React.useState(new Date());

  const resetForm = () => {
    setMyContent("");
  };

  useEffect(() => {
    if (toPost) {
      resetForm();
    }
  }, [toPost]);

  // function onChangeNumber(
  //   text: string,
  //   setState: React.Dispatch<React.SetStateAction<string>>
  // ) {
  //   for (let i of text) {
  //     const isNum = i.charCodeAt(0) - "0".charCodeAt(0);
  //     if (isNum < 0 || isNum > 9) {
  //       return;
  //     }
  //   }
  //   setState(text);
  // }

  const handlePost = () => {
    insertToDB();
  };

  // function setDateFunc(setDate: React.Dispatch<React.SetStateAction<Date>>) {
  //   const handleSetDate = (event: any, date: Date | undefined) => {
  //     const {
  //       type,
  //       nativeEvent: { timestamp, utcOffset },
  //     } = event;
  //     setDate(new Date(timestamp));
  //   };
  //   return handleSetDate;
  // }

  async function insertToDB() {
    // // add check to see if post is valid
    // const time = new Date();
    // // uncomment to flood supabase
    // const { data: userData, error: authError } = await supabase.auth.getUser(){
    // //   postID: Number(myID),
    //   id: 0,
    //   name: "John Doe",
    //   startTime: time.toISOString(),
    //   content: myContent,
    if (!myContent.trim()) {
      console.log("Post cannot be empty.");
      return;
    }

    // const { data: userData, error: authError } = await supabase.auth.getUser();

    // if (authError || !userData?.user) {
    //   console.error("Authentication Error: User is not logged in.", authError);
    //   alert("You must log in to create a post.");
    //   return;
    // }
    // const userId = userData.user.id;

    const postId = 1003;

    const newPost = {
      postID: postId,
      studentID: 2,
      name: "John Doe",
      content: myContent,
      studentEmail: data.user?.email,
    };

    const { error } = await supabase.from("Posts").insert(newPost);

    if (error) {
      console.error("Supabase Insert Error:", error);
      alert("Failed to post: " + error.message);
    } else {
      console.log("Post created successfully:", newPost);

      resetForm();
      setToPost(false);
      onPostSuccess();
    }
  }

  //   const sendJSON = {
  //     postID: 100,
  //     id: 0,
  //     name: "John Doe",
  //     startTime: startDate,
  //     endTime: endDate,
  //     content: myContent,
  //   };
  //   const error = null;
  //   console.log("Post:", sendJSON);
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     setMyID("");
  //     setMyContent("");
  //     setToPost(false);
  //   }
  // }

  return (
    <Modal transparent={true} visible={toPost}>
      <View
        style={{
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#606070",
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
                resetForm();
              }}
            ></Pressable>
          </View>
          {/* <View
            style={{
              width: "100%",
              paddingHorizontal: "5%",
              paddingVertical: "3%",
              //borderColor: "#000",
              //borderWidth: 1,
            }}
          >
            <Text style={{ fontSize: 20 }}>From</Text>
            <RNDateTimePicker
              value={startDate}
              onChange={setDateFunc(setStartDate)}
              mode="datetime"
            ></RNDateTimePicker>
          </View>

          <View
            style={{
              width: "100%",
              paddingHorizontal: "5%",
              paddingVertical: "3%",
              //borderColor: "#000",
              //borderWidth: 1,
            }}
          >
            <Text style={{ fontSize: 20 }}>To</Text>
            <RNDateTimePicker
              value={endDate}
              onChange={setDateFunc(setEndDate)}
              mode="datetime"
            ></RNDateTimePicker>
          </View> */}
          {/* <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#000",
              backgroundColor: "#888",
              width: "90%",
              padding: "2%",
              marginTop: "5%",
              borderRadius: 5,
            }}
            onChangeText={(text) => onChangeNumber(text, setMyID)}
            value={myID}
          ></TextInput> */}
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#000",
              width: "90%",
              height: "40%",
              padding: "4%",
              marginTop: "5%",
              borderRadius: 5,
              fontSize: 20,
            }}
            multiline
            numberOfLines={4}
            onChangeText={(text) => {
              setMyContent(text);
            }}
            value={myContent}
          ></TextInput>
          <View
            style={{
              //borderColor: "#000",
              //borderWidth: 1,
              width: "100%",
              padding: "5%",
              direction: "rtl",
            }}
          >
            <Pressable
              style={{
                backgroundColor: "rgba(48, 48, 255, 1)",
                padding: "2%",
                borderRadius: 10,
                width: "20%",
                alignItems: "center",
              }}
              onPress={() => {
                handlePost();
              }}
            >
              <Text style={{ fontSize: 20, color: "#FFF" }}>Post</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

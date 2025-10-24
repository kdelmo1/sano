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
import RNDateTimePicker from "@react-native-community/datetimepicker";
import DateTimePickerEvent from "@react-native-community/datetimepicker";

export default function popup(data: {
  toPost: boolean;
  setToPost: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const toPost = data.toPost;
  const setToPost = data.setToPost;
  const [myID, setMyID] = React.useState("");
  const [myContent, setMyContent] = React.useState("");
  const [startDate, setStartDate] = React.useState(new Date());
  const [endDate, setEndDate] = React.useState(new Date());

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

  const handlePost = () => {
    insertToDB();
  };

  function setDateFunc(setDate: React.Dispatch<React.SetStateAction<Date>>) {
    const handleSetDate = (event: any, date: Date | undefined) => {
      const {
        type,
        nativeEvent: { timestamp, utcOffset },
      } = event;
      setDate(new Date(timestamp));
    };
    return handleSetDate;
  }

  async function insertToDB() {
    // add check to see if post is valid
    const time = new Date();
    // uncomment to flood supabase
    // const { error } = await supabase.from("Posts").insert({
    //   postID: Number(myID),
    //   id: 0,
    //   name: "John Doe",
    //   startTime: time.toISOString(),
    //   content: myContent,
    // });
    const sendJSON = {
      postID: 100,
      id: 0,
      name: "John Doe",
      startTime: startDate,
      endTime: endDate,
      content: myContent,
    };
    const error = null;
    console.log("Post:", sendJSON);
    if (error) {
      console.log(error);
    } else {
      setMyID("");
      setMyContent("");
      setToPost(false);
    }
  }

  return (
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

          <View style={{ width: "100%" }}>
            <Text>From</Text>
          </View>
          <RNDateTimePicker
            value={startDate}
            onChange={setDateFunc(setStartDate)}
            mode="datetime"
          ></RNDateTimePicker>
          <View style={{ width: "100%" }}>
            <Text>To</Text>
          </View>
          <RNDateTimePicker
            value={endDate}
            onChange={setDateFunc(setEndDate)}
            mode="datetime"
          ></RNDateTimePicker>

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
  );
}

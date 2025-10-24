import { Header } from "@rneui/themed";
import React, { useRef, useEffect, useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";

export default function Post(data: {
  id: number;
  name: string;
  date: string;
  content: string;
  openPost: number;
  setOpenPost: React.Dispatch<React.SetStateAction<number>>;
}) {
  const date = new Date(data.date);
  return (
    <Pressable
      onPress={() => {
        if (data.openPost == data.id) {
          data.setOpenPost(-1);
        } else {
          data.setOpenPost(data.id);
        }
      }}
    >
      {() => {
        if (data.openPost == data.id) {
          return (
            <DisplayView
              id={data.id}
              name={data.name}
              date={date}
              content={data.content}
            />
          );
        } else {
          return (
            <View style={styles.post_container}>
              <View style={styles.post}>
                <HeaderView
                  id={data.id}
                  name={data.name}
                  date={date}
                  content={data.content}
                />
              </View>
            </View>
          );
        }
      }}
    </Pressable>
  );
}

function HeaderView(data: {
  id: number;
  name: string;
  date: Date;
  content: string;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.header_name}>
        <Text>{data.name}</Text>
      </View>
      <View style={styles.header_time}>
        <GetTime date={data.date} />
      </View>
    </View>
  );
}

function DisplayView(data: {
  id: number;
  name: string;
  date: Date;
  content: string;
}) {
  return (
    <View style={styles.post_container}>
      <View style={styles.post}>
        <HeaderView
          id={data.id}
          name={data.name}
          date={data.date}
          content={data.content}
        />
        <View style={styles.post_divider}></View>
        <View style={styles.post_content}>
          <Text style={{ color: "#000" }}>NULL</Text>
        </View>
      </View>
    </View>
  );
}

function GetTime(data: { date: Date }) {
  const year = data.date.getFullYear();
  const month = data.date.getMonth();
  const day = data.date.getDay();
  const hr = data.date.getHours();
  const min = data.date.getMinutes();
  return (
    <Text>
      {month}/{day}/{year % 100} {hr}:{min}
    </Text>
  );
}

const styles = StyleSheet.create({
  post_container: {
    paddingHorizontal: "3%",
    paddingVertical: "1%",
  },
  post: {
    justifyContent: "center",
    display: "flex",
    width: "100%",
    borderWidth: 1, // Add border to see it
    borderColor: "#000",
    borderRadius: 5,
    overflow: "hidden" as const,
  },
  header: {
    flexDirection: "row",
    width: "100%",
    transform: "",
  },
  header_name: {
    width: "33%",
    backgroundColor: "#FFF",
    paddingHorizontal: "5%",
    paddingVertical: "4%",
    //borderWidth: 1,
    borderColor: "#00F",
  },
  header_time: {
    width: "67%",
    alignItems: "flex-end",
    backgroundColor: "#FFF",
    paddingHorizontal: "5%",
    paddingVertical: "4%",
    //borderWidth: 1,
    borderColor: "#F00",
  },
  post_divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#000",
  },
  post_content: {
    width: "100%",
    height: 100,
    backgroundColor: "#FFF",
    justifyContent: "center" as const,
    padding: "5%",
    borderColor: "#000",
  },
});

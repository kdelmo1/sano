import React from "react";
import { StyleSheet, Text, View, TextInput } from "react-native";

export default function search() {
  const [text, onChangeText] = React.useState("");
  const [number, onChangeNumber] = React.useState("");

  return (
    <View
      style={{
        justifyContent: "center" as const,
        alignItems: "center" as const,
        width: "100%",
        height: "50%",
      }}
    >
      <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        value={text}
        placeholder="Search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {},
});

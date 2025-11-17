import React, { useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";

export default function Filter({
  selectedLocation,
  setSelectedLocation,
  selectedTime,
  setSelectedTime,
  selectedTag,
  setSelectedTag,
}: {
  selectedLocation: string;
  setSelectedLocation: (val: string) => void;
  selectedTime: string;
  setSelectedTime: (val: string) => void;
  selectedTag: string;
  setSelectedTag: (val: string) => void;
}) {
  return (
    <View style={styles.filterContainer}>
      {/*Location*/}
      <View style={styles.filterGroup}>
        <Text style={styles.label}>Location:</Text>
        <Picker
          selectedValue={selectedLocation}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedLocation(itemValue)}
        >
          <Picker.Item label="All" value="all" />
          <Picker.Item label="New York" value="New York" />
          <Picker.Item label="Los Angeles" value="Los Angeles" />
          <Picker.Item label="Chicago" value="Chicago" />
          <Picker.Item label="San Francisco" value="San Francisco" />
        </Picker>
      </View>
      {/*Time*/}
      <View style={styles.filterGroup}>
        <Text style={styles.label}>Time:</Text>
        <Picker
          selectedValue={selectedTime}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedTime(itemValue)}
        >
          <Picker.Item label="All time" value="all" />
          <Picker.Item label="Last 24 hours" value="24h" />
          <Picker.Item label="Last 7 days" value="7d" />
          <Picker.Item label="Last 30 days" value="30d" />
        </Picker>
      </View>
      {/*Tags*/}
      <View style={styles.filterGroup}>
        <Text style={styles.label}>Tags:</Text>
        <Picker
          selectedValue={selectedTag}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedTag(itemValue)}
        >
          <Picker.Item label="All tags" value="all" />
          <Picker.Item label="Slug Points" value="24h" />
          <Picker.Item label="Packaged Food" value="7d" />
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    width: "100%",
    backgroundColor: "#D4B75F",
    borderBottomWidth: 1,
    borderColor: "#DDD",
    paddingVertical: 10,
  },
  filterGroup: {
    paddingHorizontal: 15,
    marginBottom: 8,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  picker: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
  },
});

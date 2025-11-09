import { View, Pressable, Text, StyleSheet } from "react-native";

export default function chatScreen ({ goBack }: { goBack: () => void }){
    return (
    <View style={styles.container}>
        <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.backButton}>
            <Text style={styles.backText}>Back to homescreen</Text>
        </Pressable>
        </View>
      <Text style={styles.title}>welcome to chat</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 20,
    color: "#000000",
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 16,
    color: "#000000",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  }
});
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  ListRenderItemInfo,
  Alert,
} from "react-native";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../../../src/context/AuthContext";
import { supabase } from "../../lib/supabase";
import { v4 as uuidv4 } from "uuid";
import "react-native-get-random-values";

interface Message {
  message: string;
  id: string;
  sender: string;
}

export default function chatScreen({
  goBack,
  postID,
  posterName,
}: {
  goBack: () => void;
  postID: string;
  posterName: string;
}) {
  const { isLoggedIn, user } = useContext(AuthContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const applicantName = user?.email?.split("@")[0];

  useEffect(() => {
    const initChat = async () => {
      const { data, error } = await supabase
        .from("chat")
        .select("id,poster,message")
        .eq("postID", postID)
        .eq("poster", posterName)
        .eq("applicant", applicantName);

      if (error) {
      } else {
        setMessages(
          data.map((val) => {
            return {
              message: val["message"],
              id: val["id"],
              sender: val["poster"],
            };
          })
        );
      }
    };
    initChat();

    const roomOne = supabase.channel("room_one", {
      config: {
        broadcast: {
          self: true,
        },
        presence: {
          key: user?.id,
        },
      },
    });
    roomOne.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat",
        filter: `postID=eq.${postID}`,
      },
      (payload) => {
        if (
          payload.new.poster === posterName &&
          payload.new.applicant === applicantName
        ) {
          console.log(payload);
          setMessages((prev) => {
            const newMess = {
              message: payload.new["message"],
              id: payload.new["id"],
              sender: payload.new["poster"],
            };
            return [...prev, newMess];
          });
        }
      }
    );

    roomOne.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await roomOne.track({
          id: user?.id,
        });
      }
    });

    return () => {
      roomOne.unsubscribe();
    };
  }, [isLoggedIn]);

  const sendMessage = async () => {
    if (!newMessage) {
      return;
    }
    const { error } = await supabase.from("chat").insert({
      postID: postID,
      poster: posterName,
      applicant: applicantName,
      message: newMessage,
    });
    if (error) console.log(error);
    setNewMessage("");
  };

  const renderMessage = ({ item }: ListRenderItemInfo<Message>) => (
    <View style={styles.messageBubble}>
      <Text style={styles.text}>{item.message}</Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <Text style={styles.text}>Press to go back</Text>
          </Pressable>
          <Text style={styles.text}>Chatting in {postID}</Text>
        </View>
        <FlatList
          style={styles.mainChat}
          contentContainerStyle={styles.contentMainChat}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => item.id || index.toString()}
        />
        <View style={styles.input}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="#A1A1AA"
            value={newMessage}
            onChangeText={(text) => setNewMessage(text)}
          />
          <Pressable style={styles.button} onPress={sendMessage}>
            <Text style={styles.text}>Press to Send</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  container: {
    borderWidth: 1,
    borderColor: "#374151",
    maxWidth: 1152,
    width: "100%",
    minHeight: 600,
    borderRadius: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 80,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  input: {
    flexDirection: "column",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  text: {
    fontSize: 16,
    color: "#000000",
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  button: {
    marginTop: 16,
    maxHeight: 48,
  },
  mainChat: {
    height: 500,
  },
  contentMainChat: {
    padding: 16,
  },
  messageBubble: {
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 15,
    marginVertical: 4,
  },
  textInput: {
    padding: 8,
    width: "100%",
    backgroundColor: "#00000040",
    borderRadius: 8,
    color: "#FFFFFF",
  },
});

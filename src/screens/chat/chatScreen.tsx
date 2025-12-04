import {
  View,
  Pressable,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  ListRenderItemInfo,
  Modal,
} from "react-native";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  SharedStyles,
  Colors,
  Spacing,
  FontSizes,
  BorderRadius,
  Shadows,
} from "../../styles/sharedStyles";

interface Message {
  message: string;
  id: string;
  sender: string;
}

interface ChatScreenProps {
  goBack: () => void;
  openChat: boolean;
  postID: string;
  receiver: string;
  fromScreen?: "feed" | "inbox" | "profile";
}

export default function ChatScreen({
  goBack,
  openChat,
  postID,
  fromScreen,
  receiver,
}: ChatScreenProps) {
  const { user, emailHandle } = useContext(AuthContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const channelName = `chat:${postID}`;

    const roomOne = supabase.channel(channelName, {
      config: {
        broadcast: {
          self: true,
        },
        presence: {
          key: user?.id,
        },
      },
    });
    if (openChat) {
      const initChat = async () => {
        const { data, error } = await supabase
          .from("chat")
          .select("id,sender,receiver,message")
          .eq("postID", postID)
          .or(`sender.eq.${receiver},sender.eq.${emailHandle}`)
          .or(`receiver.eq.${receiver},receiver.eq.${emailHandle}`)
          .order("created_at", { ascending: true });
        if (error) {
          console.log("Error fetching messages:", error);
        } else {
          setMessages(
            data.map((val) => {
              return {
                message: val["message"],
                id: val["id"],
                sender: val["sender"],
              };
            })
          );
        }
      };

      initChat();

      roomOne.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat",
          filter: `postID=eq.${postID}`,
        },
        (payload) => {
          console.log(
            payload.new["receiver"],
            payload.new["sender"],
            emailHandle
          );
          if (
            (payload.new["receiver"] === emailHandle &&
              payload.new["sender"] === receiver) ||
            (payload.new["receiver"] === receiver &&
              payload.new["sender"] === emailHandle)
          ) {
            setMessages((prev) => {
              const newMess = {
                message: payload.new["message"],
                id: payload.new["id"],
                sender: payload.new["sender"],
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
    }
    return () => {
      roomOne.unsubscribe();
    };
  }, [openChat]);

  const sendMessage = async () => {
    // Don't send if message is empty or only whitespace
    if (!newMessage.trim()) {
      return;
    }

    const currentUsername = user?.email?.split("@")[0];
    const { error } = await supabase.from("chat").insert({
      postID: postID,
      receiver: receiver,
      sender: emailHandle,
      message: newMessage,
    });
    if (error) console.log(error);
    setNewMessage("");
  };

  const renderMessage = ({ item }: ListRenderItemInfo<Message>) => {
    const currentUsername = user?.email?.split("@")[0];
    const isMyMessage = item.sender === currentUsername;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage
            ? styles.myMessageContainer
            : styles.theirMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.theirMessageText,
            ]}
          >
            {item.message}
          </Text>
        </View>
      </View>
    );
  };

  const backButtonText = `Back to ${fromScreen}`;

  return (
    <Modal visible={openChat}>
      <View style={styles.screen}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={goBack} style={SharedStyles.backButton}>
              <Text style={SharedStyles.backText}>{backButtonText}</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Chat with {receiver}</Text>
            <View style={SharedStyles.placeholder} />
          </View>
          <FlatList
            style={styles.mainChat}
            contentContainerStyle={styles.contentMainChat}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => item.id || index.toString()}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={Colors.placeholder}
              value={newMessage}
              onChangeText={(text) => setNewMessage(text)}
            />
            <Pressable style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>Send</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
    backgroundColor: Colors.background,
  },
  container: {
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: 1152,
    width: "100%",
    minHeight: 600,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 70,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.inputBg,
  },
  headerTitle: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: Colors.text,
    flex: 1,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: "center",
    gap: Spacing.base,
    backgroundColor: Colors.inputBg,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.sm,
  },
  sendButtonText: {
    fontSize: FontSizes.base,
    fontWeight: "600",
    color: Colors.white,
  },
  mainChat: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  contentMainChat: {
    padding: Spacing.lg,
  },
  messageContainer: {
    width: "100%",
    marginVertical: 4,
  },
  myMessageContainer: {
    alignItems: "flex-end",
  },
  theirMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    maxWidth: "80%",
  },
  myMessageBubble: {
    backgroundColor: "#D4B75F",
  },
  theirMessageBubble: {
    backgroundColor: "#E5E5E5",
  },
  messageText: {
    fontSize: FontSizes.base,
  },
  myMessageText: {
    color: Colors.white,
  },
  theirMessageText: {
    color: "#000",
  },
  textInput: {
    flex: 1,
    padding: Spacing.base,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: FontSizes.base,
  },
});

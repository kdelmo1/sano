import {
  View,
  Pressable,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  ListRenderItemInfo,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Keyboard,
} from "react-native";
import { useContext, useEffect, useState, useRef } from "react";
import AuthContext from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  SharedStyles,
  Colors,
  Spacing,
  FontSizes,
  BorderRadius,
  ResponsiveUtils,
} from "../../styles/sharedStyles";

const { moderateScale } = ResponsiveUtils;

interface Message {
  message: string;
  id: string;
  sender: string;
  created_at?: string;
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
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

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
          .select("id,sender,receiver,message,created_at")
          .eq("postID", postID)
          .or(`sender.eq.${receiver},sender.eq.${emailHandle}`)
          .or(`receiver.eq.${receiver},receiver.eq.${emailHandle}`)
          .order("created_at", { ascending: true });
        if (error) {
        } else {
          setMessages(
            data.map((val) => {
              return {
                message: val["message"],
                id: val["id"],
                sender: val["sender"],
                created_at: val["created_at"],
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
                created_at: payload.new["created_at"],
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
    if (!newMessage.trim()) {
      return;
    }

    const msg = newMessage;
    setNewMessage("");

    const { error } = await supabase.from("chat").insert({
      postID: postID,
      receiver: receiver,
      sender: emailHandle,
      message: msg,
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
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
        
        {item.created_at && (
          <Text style={[
            styles.timestamp, 
            { textAlign: isMyMessage ? 'right' : 'left' }
          ]}>
            {formatTime(item.created_at)}
          </Text>
        )}
      </View>
    );
  };

  const backButtonText = `Back to ${fromScreen}`;

  return (
    <Modal
      visible={openChat}
      animationType="none" 
      transparent={false}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
      >
        <View style={styles.chatContainer}>
          <View style={styles.header}>
            <View style={styles.headerSideContainer}>
              <Pressable onPress={goBack} style={SharedStyles.backButton}>
                <Text style={SharedStyles.backText}>{backButtonText}</Text>
              </Pressable>
            </View>

            <Text style={styles.headerTitle} numberOfLines={1}>
              Chat with {receiver}
            </Text>

            <View style={styles.headerSideContainer} />
          </View>
          
          <FlatList
            ref={flatListRef}
            style={styles.messageList}
            contentContainerStyle={styles.contentMainChat}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => item.id || index.toString()}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            // onLayout handles resizing of the container itself
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
          />
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={Colors.placeholder}
              value={newMessage}
              onChangeText={(text) => setNewMessage(text)}
              multiline
              maxLength={500}
            />
            <Pressable 
              style={styles.sendButton} 
              onPressIn={sendMessage}
              hitSlop={10}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 0;

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 60 + STATUSBAR_HEIGHT, 
    paddingTop: STATUSBAR_HEIGHT,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.white, 
    zIndex: 10, 
    shadowColor: Colors.shadow || "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, 
  },
  headerSideContainer: {
    width: 120, 
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: FontSizes.md,
    fontWeight: "700",
    color: Colors.text,
    flex: 1,
    textAlign: "center",
  },
  messageList: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  contentMainChat: {
    padding: Spacing.lg,
    paddingBottom: Spacing.base,
  },
  inputContainer: {
    flexDirection: "row",
    paddingVertical: Spacing.base, 
    paddingHorizontal: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: "flex-end", 
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    paddingBottom: Platform.OS === 'ios' ? 35 : Spacing.base,
  },
  textInput: {
    flex: 1,
    minHeight: 40, 
    maxHeight: 120,
    padding: Spacing.base,
    paddingTop: 10, 
    backgroundColor: Colors.inputBg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: FontSizes.base,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    height: 40, 
    
    shadowColor: Colors.shadow || "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  sendButtonText: {
    fontSize: FontSizes.base,
    fontWeight: "600",
    color: Colors.white,
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
  timestamp: {
    fontSize: 11,
    color: Colors.textLight || "#999",
    marginTop: 4,
    marginHorizontal: 2,
    fontStyle: "italic",
  }
});
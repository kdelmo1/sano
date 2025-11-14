import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  Animated,
} from "react-native";
import { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

interface Chat {
  id: string;
  postID: string;
  otherParty: string;
  lastMessage: string;
  timestamp: string;
}

interface InboxScreenProps {
  user: User | null;
  goBack: () => void;
  onChatSelect: (postID: string, posterName: string) => void;
  homeAnim: Animated.Value;
  postAnim: Animated.Value;
  profileAnim: Animated.Value;
  onNavPress: (button: "home" | "post" | "profile") => void;
  activeNav: "home" | "post" | "profile";
}

export default function InboxScreen({
  user,
  goBack,
  onChatSelect,
  homeAnim,
  postAnim,
  profileAnim,
  onNavPress,
  activeNav,
}: InboxScreenProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const userName = user?.email?.split("@")[0];

  useEffect(() => {
    const fetchChats = async () => {
      if (!userName) return;

      // Get all chats where user is either poster or applicant
      const { data, error } = await supabase
        .from("chat")
        .select("*")
        .or(`poster.eq.${userName},applicant.eq.${userName}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Error fetching chats:", error);
        return;
      }

      // Group chats by postID and get the most recent message for each
      const chatMap = new Map<string, Chat>();

      data?.forEach((chat) => {
        const key = `${chat.postID}-${chat.poster}-${chat.applicant}`;
        const otherParty = chat.poster === userName ? chat.applicant : chat.poster;

        if (!chatMap.has(key)) {
          chatMap.set(key, {
            id: key,
            postID: chat.postID,
            otherParty: otherParty,
            lastMessage: chat.message,
            timestamp: chat.created_at || "",
          });
        }
      });

      setChats(Array.from(chatMap.values()));
    };

    fetchChats();

    // Subscribe to new messages
    const channel = supabase
      .channel("inbox_updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat",
        },
        (payload) => {
          if (
            payload.new.poster === userName ||
            payload.new.applicant === userName
          ) {
            fetchChats();
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userName]);

  const renderChat = ({ item }: { item: Chat }) => (
    <Pressable
      style={styles.chatItem}
      onPress={() => onChatSelect(item.postID, item.otherParty)}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={require("../../assets/images/profile-icon.png")}
          style={styles.avatar}
        />
      </View>
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.otherParty}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Inbox</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={chats}
        renderItem={renderChat}
        keyExtractor={(item) => item.id}
        style={styles.chatList}
        contentContainerStyle={styles.chatListContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        }
      />

      <View style={styles.floatingNav}>
        <Pressable
          style={styles.nav_button}
          onPress={() => onNavPress("post")}
        >
          <Animated.View
            style={[
              styles.navCircle,
              {
                opacity: postAnim,
                transform: [{ scale: postAnim }],
              },
            ]}
          />
          <Image
            source={require("../../assets/images/icon-post.png")}
            style={[
              styles.nav_icon_image,
              {
                tintColor: activeNav === "post" ? "#D4B75F" : "#FFF",
              },
            ]}
          />
        </Pressable>

        <Pressable
          style={styles.nav_button}
          onPress={() => onNavPress("home")}
        >
          <Animated.View
            style={[
              styles.navCircle,
              {
                opacity: homeAnim,
                transform: [{ scale: homeAnim }],
              },
            ]}
          />
          <Image
            source={require("../../assets/images/icon-home.png")}
            style={[
              styles.nav_icon_image,
              {
                tintColor: activeNav === "home" ? "#D4B75F" : "#FFF",
              },
            ]}
          />
        </Pressable>

        <Pressable
          style={styles.nav_button}
          onPress={() => onNavPress("profile")}
        >
          <Animated.View
            style={[
              styles.navCircle,
              {
                opacity: profileAnim,
                transform: [{ scale: profileAnim }],
              },
            ]}
          />
          <Image
            source={require("../../assets/images/profile-icon.png")}
            style={[
              styles.nav_icon_image,
              {
                tintColor: activeNav === "profile" ? "#D4B75F" : "#FFF",
              },
            ]}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 5,
  },
  backText: {
    fontSize: 18,
    color: "#D4B75F",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  placeholder: {
    width: 50,
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    paddingBottom: 100,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#D4B75F",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  avatar: {
    width: 30,
    height: 30,
    tintColor: "#FFF",
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
  },
  chevron: {
    fontSize: 30,
    color: "#CCC",
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  floatingNav: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    height: 70,
    width: 390,
    backgroundColor: "#D4B75F",
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
  },
  nav_button: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  navCircle: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF",
  },
  nav_icon_image: {
    width: 32,
    height: 32,
    zIndex: 1,
  },
});
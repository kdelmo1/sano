import {
    View,
    Pressable,
    Text,
    StyleSheet,
    TextInput,
    FlatList,
    ListRenderItemInfo,
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
    fromScreen,
}: {
    goBack: () => void;
    postID: string;
    posterName: string;
    fromScreen?: "feed" | "inbox";
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
                .eq("postID", postID);
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
                if (payload.new.poster === posterName && payload.new.applicant === applicantName) {
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
        const { error } = await supabase
            .from("chat")
            .insert({ postID: postID, poster: posterName, applicant: applicantName, message: newMessage });
        if (error) console.log(error);
        setNewMessage("");
    };

    const renderMessage = ({ item }: ListRenderItemInfo<Message>) => (
        <View style={styles.messageBubble}>
            <Text style={styles.text}>{item.message}</Text>
        </View>
    );

    // Determine back button text based on where user came from
    const backButtonText = fromScreen === "inbox" ? "Back to Inbox" : "Back to Feed";

    return (
        <View style={styles.screen}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Pressable onPress={goBack} style={styles.backButton}>
                        <Text style={styles.backText}>{backButtonText}</Text>
                    </Pressable>
                    <Text style={styles.headerTitle}>Chat with {posterName}</Text>
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
                        <Text style={styles.buttonText}>Send</Text>
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
        borderColor: "#E0E0E0",
        maxWidth: 1152,
        width: "100%",
        minHeight: 600,
        borderRadius: 12,
        backgroundColor: "#FFF",
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        height: 70,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
        paddingHorizontal: 16,
        backgroundColor: "#F9F9F9",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
        flex: 1,
        textAlign: "center",
    },
    input: {
        flexDirection: "row",
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#E0E0E0",
        alignItems: "center",
        gap: 12,
        backgroundColor: "#F9F9F9",
    },
    backButton: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    backText: {
        fontSize: 16,
        color: "#D4B75F",
        fontWeight: "600",
    },
    button: {
        backgroundColor: "#D4B75F",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFF",
    },
    mainChat: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    contentMainChat: {
        padding: 16,
    },
    messageBubble: {
        padding: 12,
        backgroundColor: "#D4B75F",
        borderRadius: 15,
        marginVertical: 4,
        maxWidth: "80%",
    },
    text: {
        fontSize: 16,
        color: "#FFF",
    },
    textInput: {
        flex: 1,
        padding: 12,
        backgroundColor: "#FFF",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        color: "#000",
        fontSize: 16,
    },
});
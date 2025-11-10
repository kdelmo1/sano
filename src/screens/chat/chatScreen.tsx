import {
    View,
    Pressable,
    Text,
    StyleSheet,
    TextInput,
    FlatList,
    ListRenderItemInfo
} from "react-native";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../../../src/context/AuthContext";
import { supabase } from "../../lib/supabase";
import { v4 as uuidv4 } from 'uuid';

interface Message {
    message: string;
    id: string;
}

export default function chatScreen({ goBack, postName }: { goBack: () => void; postName: string }) {
    const { isLoggedIn, user } = useContext(AuthContext);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        const roomOne = supabase.channel("room_one", {
            config: {
                broadcast: {
                    self: true,
                },
                presence: {
                    key: user?.id
                }
            }
        })
        roomOne.on("broadcast", { event: "message" }, (payload) => {
            setMessages((prevMessages) => [...prevMessages, payload.payload]);
        });

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
        supabase.channel("room_one").send({
            type: "broadcast",
            event: "message",
            payload: {
                message: newMessage,
                id: user?.id
            },
        });
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
                    <Text style={styles.text}>Chatting with {postName}</Text>
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
                    <Pressable
                        style={styles.button}
                        onPress={sendMessage}>
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
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    container: {
        borderWidth: 1,
        borderColor: '#374151',
        maxWidth: 1152,
        width: '100%',
        minHeight: 600,
        borderRadius: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 80,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    input: {
        flexDirection: 'column',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#374151',
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
        backgroundColor: '#007AFF',
        borderRadius: 15,
        marginVertical: 4,
    },
    textInput: {
        padding: 8,
        width: '100%',
        backgroundColor: '#00000040',
        borderRadius: 8,
        color: '#FFFFFF',
    },
});
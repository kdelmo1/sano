import React, { useEffect } from "react";
import { View, StyleSheet, Text, Pressable, Image, Platform } from "react-native";
import { supabase } from "../../lib/supabase";
import * as WebBrowser from "expo-web-browser";

type LoginScreenProps = {
  onLoginSuccess: () => void;
};

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const redirectUrl = "sano://auth/callback";

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) onLoginSuccess();
      }
    );
    return () => listener.subscription.unsubscribe();
  }, [onLoginSuccess]);

  function parseHashParams(url: string) {
    const hashIndex = url.indexOf("#");
    const query = hashIndex >= 0 ? url.substring(hashIndex + 1) : "";
    const params = new URLSearchParams(query);
    return {
      access_token: params.get("access_token"),
      refresh_token: params.get("refresh_token"),
    };
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          prompt: "select_account",
          access_type: "offline",
        },
      },
    });

    if (error) {
      console.error("Google login error:", error.message);
      return;
    }

    if (data?.url) {
      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      if (res.type === "success" && res.url) {
        const { access_token, refresh_token } = parseHashParams(res.url);
        if (access_token && refresh_token) {
          const { error: setErr } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (setErr) console.error("setSession error:", setErr.message);
        } else {
          console.error("Token non trovati nel callback URL");
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <Image 
          source={require('../../assets/images/sano-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        {/* Google Sign-In Button - Native Component */}
        <Pressable 
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]} 
          onPress={signInWithGoogle}
        >
          <Text style={styles.buttonText}>sign-in with google</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DDBE45",
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    width: "100%",
  },
  logo: {
    width: 190,
    height: 80,
    marginBottom: 0,
  },
  button: {
    backgroundColor: "#DDBE45",
    width: "85%",
    height: 65,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    // Android shadow
    elevation: 8,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "600",
    fontFamily: 'System',
    letterSpacing: 0.3,
  },
});
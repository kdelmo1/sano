import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Button } from "@rneui/themed";
import { supabase } from "../../lib/supabase";
import * as Linking from "expo-linking";
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
      <Button title="Sign In with Google (@ucsc.edu)" onPress={signInWithGoogle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 200,
    padding: 16,
    backgroundColor: "white",
  },
});

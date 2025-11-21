import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Image,
  Dimensions,
  Animated,
} from "react-native";
import { supabase } from "../../lib/supabase";
import * as WebBrowser from "expo-web-browser";

type LoginScreenProps = {
  onLoginSuccess: () => void;
};

WebBrowser.maybeCompleteAuthSession();

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const wp = (percentage: number) => (SCREEN_WIDTH * percentage) / 100;
const hp = (percentage: number) => (SCREEN_HEIGHT * percentage) / 100;
const responsiveFontSize = (size: number) => {
  const scale = SCREEN_WIDTH / 375;
  const newSize = size * scale;
  return Math.round(newSize);
};

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const redirectUrl = "sano://auth/callback";

  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(500),
      Animated.timing(logoTranslateY, {
        toValue: -hp(10),
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(buttonOpacity, {
      toValue: 1,
      duration: 500,
      delay: 1100,
      useNativeDriver: true,
    }).start();

    Animated.timing(buttonTranslateY, {
      toValue: 0,
      duration: 500,
      delay: 800,
      useNativeDriver: true,
    }).start();
  }, []);

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
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ translateY: logoTranslateY }],
            },
          ]}
        >
          <Image
            source={require("../../assets/images/sano-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: buttonOpacity,
              transform: [{ translateY: buttonTranslateY }],
            },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={signInWithGoogle}
          >
            <Text style={styles.buttonText}>sign-in with google</Text>
          </Pressable>
        </Animated.View>
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
    paddingHorizontal: wp(10),
    width: "100%",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: hp(-12),
    marginTop: hp(5),
  },
  logo: {
    width: wp(50),
    height: hp(10),
    maxWidth: 190,
    maxHeight: 80,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: hp(2),
  },
  button: {
    backgroundColor: "#DDBE45",
    width: "85%",
    maxWidth: 400,
    height: hp(8),
    minHeight: 60,
    maxHeight: 70,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: responsiveFontSize(25),
    fontWeight: "600",
    fontFamily: "System",
    letterSpacing: 0.3,
  },
});

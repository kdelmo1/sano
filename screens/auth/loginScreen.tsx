import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, TextInput, Text, Button } from "react-native";
import { supabase } from "../../lib/supabase";
import * as WebBrowser from "expo-web-browser";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";

type LoginScreenProps = {
  onLoginSuccess: () => void;
};

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) Alert.alert(error.message);
    onLoginSuccess();
  }

  async function signUpWithEmail() {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    console.log(data, error);
    if (error) Alert.alert(error.message);
    console.log(error);
    if (!data.session)
      Alert.alert("Please check your inbox for email verification!");
    onLoginSuccess();
  }

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "312489331611-3f8im58l0h61vchi3mvdacsstr48t3un.apps.googleusercontent.com", // client ID of type WEB for your server. Required to get the `idToken` on the user object, and for offline access.
      iosClientId:
        "312489331611-865aera82ocftic6dplk19jr3fmkl6bc.apps.googleusercontent.com", // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
    });
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log("login");
      const response = await GoogleSignin.signIn();
      console.log("finish await");
      if (response?.type === "success") {
        console.log(response);
        // setState({ userInfo: response.data });
      } else {
        // sign in was cancelled by user
      }
    } catch (error) {}
  };

  return (
    <View style={styles.container}>
      <View style={{ width: "100%", alignItems: "center" }}>
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Standard}
          color={GoogleSigninButton.Color.Dark}
          onPress={signInWithGoogle}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    padding: 16,
    backgroundColor: "#000",
    height: "100%",
    justifyContent: "center",
  },
});

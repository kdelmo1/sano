import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Input, Button, Text } from "@rneui/themed";
import { supabase } from "../../lib/supabase";

type LoginScreenProps = {
  onLoginSuccess: () => void;
};

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const [loading, setLoading] = useState(false);

  // const handleLogin = async () => {
  //   if (!isValidEmail(email)) {
  //     setError("Please enter a valid email address.");
  //     return;
  //   }
  //   if (password.length < 6) {
  //     setError("Password must be at least 6 characters.");
  //     return;
  //   }

  //   const { data: user, error } = await supabase
  //     .from("users")
  //     .select("*")
  //     .eq("email", email)
  //     .eq("password", password)
  //     .maybeSingle();

  //   supabase.auth.signInWithPassword({
  //     email: email,
  //     password: password,
  //   });

  //   if (error || !user) {
  //     setError("Invalid email or password.");
  //   } else {
  //     setError("");
  //     Alert.alert("Login successful!", `Welcome ${email}`);
  //     onLoginSuccess();
  //   }
  // };

  //   const handleSignUp = async () => {
  //   if (!isValidEmail(email)) {
  //     setError("Please enter a valid email address.");
  //     return;
  //   }
  //   if (password.length < 6) {
  //     setError("Password must be at least 6 characters.");
  //     return;
  //   }

  //   const { data: existingUser } = await supabase
  //     .from("users")
  //     .select("*")
  //     .eq("email", email)
  //     .maybeSingle();

  //   if (existingUser) {
  //     setError("User already exists. Please log in.");
  //     return;
  //   }

  //   const { error } = await supabase
  //     .from("users")
  //     .insert([{ email: email, password: password }]);

  //   if (error) {
  //     setError(error.message);
  //   } else {
  //     setError("");
  //     Alert.alert("Success", "Account created! You can now log in.");
  //   }
  // };

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
    if (error) Alert.alert(error.message);
    console.log(error);
    if (!data.session)
      Alert.alert("Please check your inbox for email verification!");
    onLoginSuccess();
  }

  return (
    <View style={styles.container}>
      <Input
        label="Email"
        onChangeText={setEmail}
        value={email}
        placeholder="@ucsc.edu"
        inputStyle={{ color: "red" }}
      />
      <Input
        label="Password"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
        placeholder="Password"
        inputStyle={{ color: "red" }}
      />
      {error ? (
        <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>
      ) : null}
      <Button title="Login" onPress={() => signInWithEmail()} />
      <Button title="Sign Up" onPress={() => signUpWithEmail()} type="clear" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    padding: 16,
    backgroundColor: "#000",
  },
});

import { StrictMode, useEffect } from "react";
import { useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import LoginScreen from "./screens/auth/loginScreen";
import Home from "./screens/home/home";
import { setStatusBarBackgroundColor } from "expo-status-bar";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";

//currently use x@ucsc.edu Password123

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const handleLoginSuccess = () => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(true);
      setUser(user);
    });
  };

  return (
    <StrictMode>
      <SafeAreaProvider>
        <View>
          {isLoggedIn ? (
            <Home user={user} />
          ) : (
            <LoginScreen onLoginSuccess={handleLoginSuccess} />
          )}
        </View>
      </SafeAreaProvider>
    </StrictMode>
  );
}

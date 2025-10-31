import { StrictMode, useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import LoginScreen from "./screens/auth/loginScreen";
import Home from "./screens/home/home";
import { supabase } from "./lib/supabase";
import { User } from "@supabase/supabase-js";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  // check auth when app loads or returns from OAuth
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        setUser(session.user);
      }
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setUser(session.user);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <StrictMode>
      <SafeAreaProvider>
        <View>
          {isLoggedIn ? <Home user={user} /> : <LoginScreen onLoginSuccess={() => {}} />}
        </View>
      </SafeAreaProvider>
    </StrictMode>
  );
}

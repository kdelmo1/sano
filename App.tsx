import { StrictMode, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import LoginScreen from "./src/screens/auth/loginScreen";
import Home from "./src/screens/home/Home";
import { supabase } from "./src/lib/supabase";
import { User } from "@supabase/supabase-js";
import AuthContext from "./src/context/AuthContext";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        setUser(session.user);
      }
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setIsLoggedIn(true);
          setUser(session.user);
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user }}>
      <StrictMode>
        <SafeAreaProvider>
          <View style={styles.container}>
            {isLoggedIn ? (
              <Home user={user} />
            ) : (
              <LoginScreen onLoginSuccess={() => {}} />
            )}
          </View>
        </SafeAreaProvider>
      </StrictMode>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});

<<<<<<< HEAD
/*
import { StrictMode } from "react";
import { useState } from 'react';
import { View } from 'react-native';
=======
import { StrictMode, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
>>>>>>> chat
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
<<<<<<< HEAD
*/
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { View, Text } from 'react-native'
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Session } from '@supabase/supabase-js'

import LoginScreen from './screens/auth/loginScreen';
import Home from './screens/home/home';

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLoginSuccess = () => {
		setIsLoggedIn(true)
	}

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    /*<View>
      {session ? (
        <Text>Welcome, {session.user.email}</Text>
      ) : (
        <LoginScreen />
        //<LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}
    </View>
    */
    <SafeAreaProvider>
      <View>
        {isLoggedIn ? (
          <Home />
        ) : (
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        )}
      </View>
    </SafeAreaProvider>
  )
}
//
=======

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
>>>>>>> chat

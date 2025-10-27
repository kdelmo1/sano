import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { supabase } from './lib/supabase'
import { StrictMode, useState, useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Home from "./screens/home/home";
import { Session } from '@supabase/supabase-js'
import LoginScreen from './screens/auth/loginScreen'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <View>
      {session ? (
      <Text>Welcome, {session.user.email}</Text>
    ) : (
      <LoginScreen />
    )}
    {/* </View>
    <StrictMode>
      <SafeAreaProvider>
        <Home></Home>
      </SafeAreaProvider>
    </StrictMode> */}
  );
}

/*
import { StrictMode } from "react";
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";

import LoginScreen from './screens/auth/loginScreen';
import Home from './screens/home/home';

export default function App() {
	const [isLoggedIn, setIsLoggedIn] = useState(false)

	const handleLoginSuccess = () => {
		setIsLoggedIn(true)
	}

	return (
    <StrictMode>
      <SafeAreaProvider>
        <View>
          {isLoggedIn ? (
            <Home />
          ) : (
            <LoginScreen onLoginSuccess={handleLoginSuccess} />
          )}
        </View>
      </SafeAreaProvider>
    </StrictMode>
	)
}
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
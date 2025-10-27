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

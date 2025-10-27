import { View, StyleSheet } from 'react-native'
import { useState } from 'react'
import LoginScreen from './screens/auth/loginScreen'
import Home from './screens/home/home'
import { StrictMode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
	const [isLoggedIn, setIsLoggedIn] = useState(false)

	const handleLoginSuccess = () => {
		setIsLoggedIn(true)
	}

	return (
    <StrictMode>
		<SafeAreaProvider>
			<View style={styles.container}>
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

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
})

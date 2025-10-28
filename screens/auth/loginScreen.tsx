/*
import React, { useState } from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import { Input, Button, Text } from '@rneui/themed'
import { supabase } from '../../lib/supabase'

type LoginScreenProps = {
	onLoginSuccess: () => void
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')

	const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email)

	const handleLogin = async () => {
		if (!isValidEmail(email)) {
			setError('Please enter a valid email address.')
			return
		}
		if (password.length < 6) {
			setError('Password must be at least 6 characters.')
			return
		}

		const { data: user, error } = await supabase
			.from('users')
			.select('*')
			.eq('email', email)
			.eq('password', password)
			.maybeSingle()

		if (error || !user) {
			setError('Invalid email or password.')
		} else {
			setError('')
			Alert.alert('Login successful!', `Welcome ${email}`)
			onLoginSuccess()
		}
	}

	const handleSignUp = async () => {
		if (!isValidEmail(email)) {
			setError('Please enter a valid email address.')
			return
		}
		if (password.length < 6) {
			setError('Password must be at least 6 characters.')
			return
		}

		const { data: existingUser } = await supabase
			.from('users')
			.select('*')
			.eq('email', email)
			.maybeSingle()

		if (existingUser) {
			setError('User already exists. Please log in.')
			return
		}

		const { error } = await supabase
			.from('users')
			.insert([{ email: email, password: password }])

		if (error) {
			setError(error.message)
		} else {
			setError('')
			Alert.alert('Success', 'Account created! You can now log in.')
		}
	}

	return (
		<View style={styles.container}>
			<Input
				label="Email"
				onChangeText={setEmail}
				value={email}
				placeholder="@ucsc.edu"
				inputStyle={{ color: 'red' }}
			/>
			<Input
				label="Password"
				onChangeText={setPassword}
				value={password}
				secureTextEntry
				placeholder="Password"
				inputStyle={{ color: 'red' }}
			/>
			{error ? <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text> : null}
			<Button title="Login" onPress={handleLogin} />
			<Button title="Sign Up" onPress={handleSignUp} type="clear" />
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		marginTop: 50,
		padding: 16,
		backgroundColor: '#000',
	},
})
*/
//
import React, { useState } from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import { Input, Button, Text } from '@rneui/themed'
import { supabase } from '../../lib/supabase'
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

type LoginScreenProps = {
	onLoginSuccess: () => void
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')

	const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email)

	const handleGoogleLogin = async () => {
		const redirectUrl = Linking.createURL('/');
		//const redirectTo = Linking.createURL('https://qjtboybwetairixuiqmc.supabase.co/auth/v1/callback');

		const { data, error } = await supabase.auth.signInWithOAuth({
			/*
			provider: 'google',
			options: {
				queryParams: {
					access_type: 'offline',
					prompt: 'consent',
				},
			},
			*/

			provider: 'google',
			options: { redirectTo: redirectUrl },

		})
		if (data?.url) {
			await WebBrowser.openBrowserAsync(data.url);
		}
		if (error) {
			console.error('Google login error:', error.message);
		}
	};

	const handleLogin = async () => {
		if (!isValidEmail(email)) {
			setError('Please enter a valid email address.')
			return
		}
		if (password.length < 6) {
			setError('Password must be at least 6 characters.')
			return
		}

		//const { data, error } = await supabase.auth.signInWithPassword({ email, password })
		const { data: user, error } = await supabase
		.from('users')
		.select('*')
		.eq('email', email)
		.eq('password', password)
		.maybeSingle()

		if (error) {
			console.error('Login error:', error.message)
			setError(error.message)
		} else {
			setError('')
			Alert.alert('Login successful!', `Welcome ${email}`)
			//console.log('Logged in user:', public.user)
			onLoginSuccess()
		}
	}

	const handleSignUp = async () => {
		if (!isValidEmail(email)) {
			setError('Please enter a valid email address.')
			return
		}
		if (password.length < 6) {
			setError('Password must be at least 6 characters.')
			return
		}

		//Check if user already exists
		//const { data, error } = await supabase.auth.signUp({ email, password })
		const { data: existingUser } = await supabase
			.from('users')
			.select('*')
			.eq('email', email)
			.maybeSingle()

		if (existingUser) {
			setError('User already exists. Please log in.')
			return
    	}
		//Insert new user
		const { error } = await supabase.from('users').insert([
			{
				email: email,
				password: password, // plain for testing; later use hashing
			},
		])
		if (error) {
			console.error('Signup error:', error.message)
			setError(error.message)
		} else {
			setError('')
			//Alert.alert('Signup successful!', 'Check your email for confirmation.')
			Alert.alert('Success', 'Account created! You can now log in.')
			//console.log('New user:', public.user)
		}
	}

  return (
		<View style={styles.container}>
			<Input
				label="Email"
				onChangeText={setEmail}
				value={email}
				placeholder="@ucsc.edu"
				inputStyle={{ color: 'red' }} // red input text
			/>
			<Input
				label="Password"
				onChangeText={setPassword}
				value={password}
				secureTextEntry
				placeholder="Password"
				inputStyle={{ color: 'red' }} // red input text
			/>
			<Button title="Login" onPress={handleLogin} />
			<Button title="Sign Up" onPress={handleSignUp} type="clear" />
			<Button
				title="Sign in with Google (UCSC)"
				onPress={handleGoogleLogin}
				buttonStyle={{ backgroundColor: '#cfdc16ff', marginTop: 10 }}
				icon={{ color: 'white' }}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    padding: 16,
    backgroundColor: '#000',
  },
})
//
import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Input, Button } from '@rneui/themed'

export default function Auth() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	return (
		<View style={styles.container}>
			<Input
				label="Email"
				onChangeText={setEmail}
				value={email}
				placeholder="@ucsc.edu"
			/>
			<Input
				label="Password"
				onChangeText={setPassword}
				value={password}
				secureTextEntry
				placeholder="Password"
			/>
			<Button title="Login"/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		marginTop: 50,
		padding: 16,
	},
})

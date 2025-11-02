import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';

export default function RegisterScreen({ navigation }: any) {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const registerUser = async () => {
    if (!nickname || !email || !password || !repeatPassword) {
      return Alert.alert("Error", "All fields are required");
    }
    if (password !== repeatPassword) {
      return Alert.alert("Error", "Passwords do not match");
    }

    try {
      const res = await fetch("http://10.0.2.2:3000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName: nickname, password })
      });

      if (!res.ok) {
        const error = await res.json();
        return Alert.alert("Error", error.error || "Registration failed");
      }

      Alert.alert("Success", "Account created!");
      navigation.navigate("Login");

    } catch (err) {
      Alert.alert("Error", "Backend not reachable");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput style={styles.input} placeholder="Nickname" value={nickname} onChangeText={setNickname} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Repeat Password" secureTextEntry value={repeatPassword} onChangeText={setRepeatPassword} />

      <Button title="Register" onPress={registerUser} />
      <Button title="Already have an account? Login" onPress={() => navigation.navigate("Login")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 26, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  input: { borderWidth: 1, padding: 12, marginBottom: 12, borderRadius: 5 },
});

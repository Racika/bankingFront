import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';

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
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Nickname"
        placeholderTextColor="#888"
        value={nickname}
        onChangeText={setNickname}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Repeat Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={repeatPassword}
        onChangeText={setRepeatPassword}
      />

      <TouchableOpacity style={styles.button} onPress={registerUser}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c0f14",
    padding: 20,
    justifyContent: "center"
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 30,
    textAlign: "center"
  },
  input: {
    backgroundColor: "#1c1f26",
    padding: 14,
    marginBottom: 14,
    borderRadius: 10,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333"
  },
  button: {
    backgroundColor: "#4caf50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600"
  },
  linkText: {
    marginTop: 20,
    color: "#4caf50",
    fontSize: 16,
    textAlign: "center"
  }
});

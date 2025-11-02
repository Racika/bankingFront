import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const login = async () => {
    const res = await fetch("http://10.0.2.2:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      return Alert.alert("Login Failed", data.error);
    }

    navigation.navigate("Profile", { email: data.email, fullName: data.fullName });
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />


      <Button title="Login" onPress={login} />
      <Button title="No account? Register" onPress={() => navigation.navigate("Register")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 26, textAlign: "center", marginBottom: 20 },
  input: { borderWidth: 1, padding: 12, marginBottom: 12, borderRadius: 5 },
});

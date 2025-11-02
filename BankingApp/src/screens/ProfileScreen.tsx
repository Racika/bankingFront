import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function ProfileScreen({ route, navigation }: any) {
  const { email } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <Text>Email: {route.params.email}</Text>
      <Text>Name: {route.params.fullName}</Text>


      <Button title="Logout" onPress={() => navigation.navigate("Login")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 26, textAlign: "center", marginBottom: 20 },
  label: { fontSize: 18, marginBottom: 10 },
});

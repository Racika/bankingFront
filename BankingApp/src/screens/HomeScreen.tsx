import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function HomeScreen({ navigation }: any) {
  const [fullName, setFullName] = useState("");
  const [funds, setFunds] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return navigation.navigate("Login");

        const res = await axios.get("http://10.0.2.2:3000/api/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setFullName(res.data.fullName);
        setFunds(res.data.funds);
      } catch (err) {
        console.log(err);
        navigation.navigate("Login");
      }
    };

    loadUser();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }]
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello, {fullName}</Text>
      <Text style={styles.balance}>{funds}$</Text>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuText}>Send Money</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuText}>Spendings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuText}>Simulation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, styles.logoutButton]}
          onPress={logout}
        >
          <Text style={styles.menuText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c0f14",
    paddingHorizontal: 20,
    paddingTop: 40
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8
  },
  balance: {
    color: "#4caf50",
    fontSize: 36,
    fontWeight: "700",
    marginBottom: 40
  },
  menuContainer: {
    gap: 15
  },
  menuButton: {
    backgroundColor: "#1c1f26",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333"
  },
  menuText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600"
  },
  logoutButton: {
    marginTop: 40,
    backgroundColor: "#b00020"
  }
});

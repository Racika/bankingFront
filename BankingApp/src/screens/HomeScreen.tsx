import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function HomeScreen({ navigation }: any) {
  const [fullName, setFullName] = useState("");
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayFunds, setDisplayFunds] = useState("0.00");

  const animateFunds = (toValue: number) => {
    animatedValue.setValue(0);

    Animated.timing(animatedValue, {
      toValue,
      duration: 900,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    animatedValue.addListener(({ value }) => {
      setDisplayFunds(value.toFixed(2));
    });
  };

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get("http://10.0.2.2:3000/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFullName(res.data.fullName);
      const f = Number(res.data.funds);
      animateFunds(f);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hello, {fullName}</Text>
      <Text style={styles.balance}>${displayFunds}</Text>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuButton} onPress={loadUserData}>
          <Text style={styles.menuText}>Refresh Balance</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate("SendMoney")}>
          <Text style={styles.menuText}>Send Money</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate("Simulation")}>
          <Text style={styles.menuText}>Simulation</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate("Spendings")}>
          <Text style={styles.menuText}>Spendings History</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c0f14",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  greeting: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
  },
  balance: {
    color: "#4caf50",
    fontSize: 42,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 35,
  },
  menu: {
    gap: 15,
  },
  menuButton: {
    backgroundColor: "#1c1f26",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  menuText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  logoutButton: {
    marginTop: 40,
    backgroundColor: "#b00020",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

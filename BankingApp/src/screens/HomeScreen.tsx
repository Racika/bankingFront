import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function HomeScreen({ navigation }: any) {
  const [funds, setFunds] = useState<number | null>(null);
  const [cardnum, setCardnum] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const token = await AsyncStorage.getItem("token");
    const res = await axios.get("http://10.0.2.2:3000/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setFunds(res.data.funds);
    setCardnum(res.data.cardnum);
    setFullName(res.data.fullName);
  };

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

      {/* Big balance */}
      <Text style={styles.balance}>${funds}</Text>

      {/* Card number */}
      <Text style={styles.card}>Card: {cardnum}</Text>

      {/* Menu buttons */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("SendMoney")}
      >
        <Text style={styles.buttonText}>Send Money</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Spendings")}
      >
        <Text style={styles.buttonText}>Spendings History</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Simulation")}
      >
        <Text style={styles.buttonText}>Simulation</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Options")}
      >
        <Text style={styles.buttonText}>Options</Text>
      </TouchableOpacity>

      {/* Logout button in its own box */}
      <TouchableOpacity style={styles.logoutBox} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

/* Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c0f14",
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: "center",
  },
  greeting: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 5,
    textAlign: "center",
  },
  balance: {
    color: "#4caf50",
    fontSize: 40,
    fontWeight: "800",
    marginBottom: 5,
    textAlign: "center",
  },
  card: {
    color: "#aaa",
    fontSize: 16,
    marginBottom: 30,
  },
  button: {
    width: "100%",
    backgroundColor: "#1c1f26",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  logoutBox: {
    width: "100%",
    backgroundColor: "#1c1f26",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 25,
    borderWidth: 1,
    borderColor: "#ff3d3d",
  },
  logoutText: {
    color: "#ff3d3d",
    fontSize: 16,
    fontWeight: "700",
  },
});

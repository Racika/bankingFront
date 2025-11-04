import React, { useEffect, useState, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ColorThemeContext } from "../theme/ColorThemeContext";

export default function HomeScreen({ navigation }: any) {
  const [funds, setFunds] = useState<number | null>(null);
  const [cardnum, setCardnum] = useState("");
  const [fullName, setFullName] = useState("");


  const { theme } = useContext(ColorThemeContext);
const [displayFunds, setDisplayFunds] = useState(0);

useEffect(() => {
  if (funds !== null) {
    let start = 0;
    const end = Number(funds);
    if (start === end) return;

    const duration = 800; // ms
    const stepTime = 16; // ~60fps
    const step = (end - start) / (duration / stepTime);

    const counter = setInterval(() => {
      start += step;
      if (start >= end) {
        clearInterval(counter);
        setDisplayFunds(end);
      } else {
        setDisplayFunds(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(counter);
  }
}, [funds]);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get("http://10.0.2.2:3000/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFunds(res.data.funds);
      setCardnum(res.data.cardnum);
      setFullName(res.data.fullName);
    } catch (err) {
      console.log("Error loading user:", err);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.greeting, { color: theme.text }]}>
        Hello, {fullName}
      </Text>

      <Text style={[styles.balance, { color: theme.primary }]}>
        ${funds !== null ? displayFunds.toLocaleString() : "..."}
      </Text>


      <Text style={[styles.card, { color: theme.text }]}>
        Card: {cardnum}
      </Text>

      <TouchableOpacity
        style={[styles.button, { borderColor: theme.primary, backgroundColor: theme.card }]}
        onPress={() => navigation.navigate("SendMoney")}
      >
        <Text style={[styles.buttonText, { color: theme.text }]}>Send Money</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { borderColor: theme.primary, backgroundColor: theme.card }]}
        onPress={() => navigation.navigate("Spendings")}
      >
        <Text style={[styles.buttonText, { color: theme.text }]}>Spendings History</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { borderColor: theme.primary, backgroundColor: theme.card }]}
        onPress={() => navigation.navigate("Simulation")}
      >
        <Text style={[styles.buttonText, { color: theme.text }]}>Simulation</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { borderColor: theme.primary, backgroundColor: theme.card }]}
        onPress={() => navigation.navigate("Options")}
      >
        <Text style={[styles.buttonText, { color: theme.text }]}>Options</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.logoutBox, { borderColor: theme.danger, backgroundColor: theme.card }]}
        onPress={logout}
      >
        <Text style={[styles.logoutText, { color: theme.danger }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: "center",
  },
  greeting: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 5,
    textAlign: "center",
  },
  balance: {
    fontSize: 40,
    fontWeight: "800",
    marginBottom: 5,
    textAlign: "center",
  },
  card: {
    fontSize: 16,
    marginBottom: 30,
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  logoutBox: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 25,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
  },
});

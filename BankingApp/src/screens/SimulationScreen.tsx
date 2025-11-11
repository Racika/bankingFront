import React, { useState, useEffect, useContext } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { ColorThemeContext } from "../theme/ColorThemeContext";

const categories = [
  "Food",
  "Transport",
  "Entertainment",
  "Shopping",
  "Bills",
  "Health",
  "Other",
];

export default function SimulationScreen({ navigation }: any) {
  const { theme } = useContext(ColorThemeContext);

  const [userId, setUserId] = useState<string | null>(null);
  const [funds, setFunds] = useState(0);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    const decoded: any = jwtDecode(token);
    setUserId(decoded.userId);

    const res = await axios.get("https://racika-banking-api.onrender.com/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setFunds(Number(res.data.funds));
  };

  const spendRandom = async () => {
    if (!userId) return;

    const randAmount = Math.floor(Math.random() * 60) + 1; // $1–$60
    const randCat = categories[Math.floor(Math.random() * categories.length)];

    await spend(randAmount, randCat);
  };

  const spend = async (amt: number, cat: string) => {
    if (!userId) return;

    const token = await AsyncStorage.getItem("token");

    try {
      await axios.post(
        "https://racika-banking-api.onrender.com/api/spendMoney",
        { userId, amount: amt, category: cat },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(`Spent $${amt} on ${cat}`);
      loadUser();
    } catch (err: any) {
      console.log("spend error:", err.response?.data);
      setMessage("Not enough balance or savings rule blocked this");
    }
  };

  const manualSpend = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return;
    spend(amt, category);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      {/*  Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backBtn, { color: theme.primary }]}>◀</Text>
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: theme.text }]}>
          Home
        </Text>
        <View style={{ width: 30 }} />
      </View>

      <Text style={[styles.balance, { color: theme.primary }]}>
        Balance: ${funds.toLocaleString()}
      </Text>

      <Text style={[styles.label, { color: theme.text }]}>Spend Amount</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        placeholder="Enter amount"
        placeholderTextColor="#777"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={[styles.label, { color: theme.text }]}>Category</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        value={category}
        onChangeText={setCategory}
      />

      <TouchableOpacity
        style={[styles.button, { borderColor: theme.primary }]}
        onPress={manualSpend}
      >
        <Text style={[styles.buttonText, { color: theme.text }]}>Spend Manually</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { borderColor: theme.primary }]}
        onPress={spendRandom}
      >
        <Text style={[styles.buttonText, { color: theme.text }]}>Spend Randomly</Text>
      </TouchableOpacity>

      {message !== "" && (
        <Text style={[styles.msg, { color: theme.text }]}>{message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 15, paddingHorizontal: 20 },

  /*  Header styles */
  header: {
    width: "100%",
    height: 55,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#333",
    marginBottom: 15,
    borderRadius: 8
  },
  backBtn: { fontSize: 24, fontWeight: "800" },
  headerText: { fontSize: 20, fontWeight: "700" },

  balance: { fontSize: 24, fontWeight: "700", marginBottom: 20, textAlign: "center" },
  label: { fontSize: 15, marginTop: 10 },
  input: {
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#444",
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    marginVertical: 8,
  },
  buttonText: { fontSize: 17, fontWeight: "600" },
  msg: { textAlign: "center", marginTop: 12, fontSize: 15 },
});

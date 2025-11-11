import React, { useState, useEffect, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ColorThemeContext } from "../theme/ColorThemeContext";

export default function SendMoneyScreen({ navigation }: any) {
  const [mode, setMode] = useState<"send" | "request">("send");
  const [amount, setAmount] = useState("");
  const [recipientCard, setRecipientCard] = useState("");
  const [funds, setFunds] = useState<number | null>(null);
  const [cardnum, setCardnum] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  const [resultMsg, setResultMsg] = useState("");
  const [resultColor, setResultColor] = useState("#4caf50");
  const [requests, setRequests] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const { theme } = useContext(ColorThemeContext);

  useEffect(() => {
    load();
  }, []);

  const getUserId = async () => {
    const token = await AsyncStorage.getItem("token");
    const decoded: any = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
    return decoded.userId;
  };

  const load = async () => {
    const token = await AsyncStorage.getItem("token");
    const res = await axios.get("https://racika-banking-api.onrender.com/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setFunds(res.data.funds);
    setCardnum(res.data.cardnum);
    setFullName(res.data.fullName);
    loadRecent();
  };

  const loadRecent = async () => {
    try {
      const userId = await getUserId();
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(
        "https://racika-banking-api.onrender.com/api/getRecentRequests",
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const unique = Array.from(new Map(res.data.map((r: any) => [r.requested_number, r])).values());
      setRecent(unique);
    } catch (err) {
      console.log("recent error:", err);
    }
  };

  const doTransfer = async () => {
    setConfirmVisible(false);
    const token = await AsyncStorage.getItem("token");
    try {
      const res = await fetch("https://racika-banking-api.onrender.com/api/transferMoney", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          fromCard: String(cardnum),
          toCard: String(recipientCard),
          amount: Number(amount),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setResultMsg("Transfer failed — check funds or card");
        setResultColor(theme.danger);
        setResultVisible(true);
        return;
      }
      await load();
      setResultMsg(`Sent $${amount} successfully`);
      setResultColor(theme.primary);
      setResultVisible(true);
      setAmount("");
      setRecipientCard("");
    } catch {
      setResultMsg("Server error");
      setResultColor(theme.danger);
      setResultVisible(true);
    }
  };

  const sendRequest = async () => {
    setConfirmVisible(false);
    try {
      const token = await AsyncStorage.getItem("token");
      await fetch("https://racika-banking-api.onrender.com/api/requestPayment", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          recipientCard,
          requesterCard: cardnum,
          requesterName: fullName,
          amount: Number(amount),
        }),
      });
      setResultMsg(`Request sent for $${amount}`);
      setResultColor(theme.primary);
      setResultVisible(true);
      setAmount("");
      setRecipientCard("");
    } catch {
      setResultMsg("Server error");
      setResultColor(theme.danger);
      setResultVisible(true);
    }
  };

  const insufficient = Number(amount) > (funds ?? 0) && mode === "send";

  const validateInputs = () => {
    const value = Number(amount);
    if (!amount || value <= 0) {
      setResultMsg("Enter a valid amount");
      setResultColor(theme.danger);
      setResultVisible(true);
      return false;
    }
    if (!recipientCard || recipientCard.length !== 9) {
      setResultMsg("Card must be 9 digits");
      setResultColor(theme.danger);
      setResultVisible(true);
      return false;
    }
    return true;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.backButton}>
        <Text style={[styles.backText, { color: theme.text }]}>←</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.text }]}>Transfer</Text>
      <Text style={[styles.balance, { color: theme.primary }]}>Balance: ${funds}</Text>

      {/* Toggle */}
      <View style={[styles.toggleContainer, { backgroundColor: theme.card }]}>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === "send" && { backgroundColor: theme.primary }]}
          onPress={() => setMode("send")}
        >
          <Text style={[styles.toggleText, { color: theme.text }]}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === "request" && { backgroundColor: theme.primary }]}
          onPress={() => setMode("request")}
        >
          <Text style={[styles.toggleText, { color: theme.text }]}>Request</Text>
        </TouchableOpacity>
      </View>

      {/* Inputs */}
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: insufficient ? theme.danger : theme.text }]}
        placeholder="Amount"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      {insufficient && <Text style={{ color: theme.danger }}>Not enough balance</Text>}

      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.text }]}
        placeholder="Recipient card number"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={recipientCard}
        onChangeText={setRecipientCard}
      />

      {/* Recent Suggestions */}
      {Array.isArray(recent) && recent.length > 0 && (
        <View style={{ marginBottom: 10 }}>
          <Text style={[{ color: theme.text, fontSize: 16, marginBottom: 6 }]}>
            Recent:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recent.map((r, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.recentChip,
                  { backgroundColor: theme.card, borderColor: theme.primary },
                ]}
                onPress={() => setRecipientCard(r.requested_number)}
              >
                <Text style={{ color: theme.text }}>{r.requested_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}


      {/* Send / Request */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: insufficient && mode === "send" ? "#666" : theme.primary }]}
        onPress={() => validateInputs() && setConfirmVisible(true)}
      >
        <Text style={[styles.buttonText, { color: theme.text }]}>
          {mode === "send" ? "Send Money" : "Request Money"}
        </Text>
      </TouchableOpacity>

      {/* Confirmation Modal */}
      <Modal visible={confirmVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalText, { color: theme.text }]}>
              Are you sure you want to {mode === "send" ? "send" : "request"} ${amount}?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.danger }]}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={{ color: "#fff" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={() => (mode === "send" ? doTransfer() : sendRequest())}
              >
                <Text style={{ color: "#fff" }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Result Message */}
      <Modal visible={resultVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalBox,
              { backgroundColor: theme.card, borderWidth: 1, borderColor: resultColor, alignItems: "center" },
            ]}
          >
            <Text
              style={{
                color: resultColor,
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              {resultMsg}
            </Text>
            <TouchableOpacity
              onPress={() => setResultVisible(false)}
              style={[
                {
                  backgroundColor: theme.primary,
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 30,
                },
              ]}
            >
              <Text style={{ color: theme.text, fontWeight: "600", fontSize: 16 }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60 },
  backButton: { position: "absolute", top: 16, left: 16 },
  backText: { fontSize: 30 },
  title: { fontSize: 26, fontWeight: "700", textAlign: "center", marginBottom: 5 },
  balance: { fontSize: 18, textAlign: "center", marginBottom: 30 },
  toggleContainer: { flexDirection: "row", marginBottom: 20, borderRadius: 12 },
  toggleBtn: { flex: 1, padding: 14, alignItems: "center", borderRadius: 12 },
  toggleText: { fontSize: 16, fontWeight: "600" },
  input: { padding: 14, marginBottom: 12, borderRadius: 10, fontSize: 16, borderWidth: 1 },
  button: { padding: 15, borderRadius: 10, alignItems: "center", marginTop: 10 },
  buttonText: { fontSize: 18, fontWeight: "600" },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalBox: { padding: 20, borderRadius: 12, alignItems: "center", width: "80%" },
  modalText: { fontSize: 16, textAlign: "center", marginBottom: 20 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  modalButton: { flex: 1, padding: 10, marginHorizontal: 5, borderRadius: 10, alignItems: "center" },
  recentChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, marginRight: 8 },
});

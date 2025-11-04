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
  const [confirmAcceptVisible, setConfirmAcceptVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const [resultVisible, setResultVisible] = useState(false);
  const [resultMsg, setResultMsg] = useState("");
  const [resultColor, setResultColor] = useState("#4caf50");

  const [requests, setRequests] = useState<any[]>([]);

  // ✅ Theme
  const { theme } = useContext(ColorThemeContext);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const token = await AsyncStorage.getItem("token");
    const res = await axios.get("http://10.0.2.2:3000/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setFunds(res.data.funds);
    setCardnum(res.data.cardnum);
    setFullName(res.data.fullName);

    loadRequests(res.data.cardnum);
  };

  const loadRequests = async (card: string) => {
    const token = await AsyncStorage.getItem("token");
    const res = await axios.post(
      "http://10.0.2.2:3000/api/getRequests",
      { cardnum: card },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setRequests(res.data);
  };

  const doTransfer = async () => {
    setConfirmVisible(false);
    const token = await AsyncStorage.getItem("token");

    try {
      const res = await fetch("http://10.0.2.2:3000/api/transferMoney", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fromCard: String(cardnum),
          toCard: String(recipientCard),
          amount: Number(amount)
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
      await fetch("http://10.0.2.2:3000/api/requestPayment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientCard: recipientCard,
          requesterCard: cardnum,
          requesterName: fullName,
          amount: Number(amount)
        })
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

  const confirmAccept = (req: any) => {
    setSelectedRequest(req);
    setConfirmAcceptVisible(true);
  };

  const acceptRequest = async () => {
    const request = selectedRequest;
    setConfirmAcceptVisible(false);

    const token = await AsyncStorage.getItem("token");
    const amount = Number(request.amount);

    if (amount > (funds ?? 0)) {
      setResultMsg("Not enough balance");
      setResultColor(theme.danger);
      setResultVisible(true);
      return;
    }

    const res = await fetch("http://10.0.2.2:3000/api/transferMoney", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        fromCard: String(cardnum),
        toCard: String(request.requester_cardnum),
        amount: amount
      })
    });

    const data = await res.json();
    if (!data.success) {
      setResultMsg("Transfer failed");
      setResultColor(theme.danger);
      setResultVisible(true);
      return;
    }

    await deleteRequest(request.request_id, false);
    setResultMsg(`Sent $${amount} to ${request.requester_name}`);
    setResultColor(theme.primary);
    setResultVisible(true);
    await load();
  };

  const deleteRequest = async (id: any, showResult = true) => {
    const token = await AsyncStorage.getItem("token");
    await fetch("http://10.0.2.2:3000/api/deleteRequest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ request_id: id })
    });

    if (showResult) {
      setResultMsg("Request deleted");
      setResultColor(theme.danger);
      setResultVisible(true);
    }

    await load();
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
      {/* Back */}
      <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.backButton}>
        <Text style={[styles.backText, { color: theme.text }]}>←</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.text }]}>Transfer</Text>
      <Text style={[styles.balance, { color: theme.primary }]}>Balance: ${funds}</Text>

      {/* Mode Toggle */}
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
        style={[
          styles.input,
          { backgroundColor: theme.card, color: theme.text, borderColor: insufficient ? theme.danger : theme.text }
        ]}
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

      {/* Submit */}
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: insufficient && mode === "send" ? "#666" : theme.primary }
        ]}
        onPress={() => validateInputs() && setConfirmVisible(true)}
      >
        <Text style={[styles.buttonText, { color: theme.text }]}>
          {mode === "send" ? "Send Money" : "Request Money"}
        </Text>
      </TouchableOpacity>

      {/* Incoming requests */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Incoming Requests</Text>

      <ScrollView style={{ maxHeight: 250 }}>
        {requests.length === 0 ? (
          <Text style={{ color: theme.text, textAlign: "center", opacity: 0.5 }}>No requests</Text>
        ) : (
          requests.map((req, i) => (
            <View key={i} style={[styles.requestRow, { backgroundColor: theme.card, borderColor: theme.text }]}>
              <Text style={[styles.reqText, { color: theme.text }]}>
                {req.requester_name} — ${req.amount}
              </Text>

              <View style={styles.reqButtons}>
                <TouchableOpacity style={[styles.acceptBtn, { backgroundColor: theme.primary }]} onPress={() => confirmAccept(req)}>
                  <Text style={styles.btnTxt}>✓</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.rejectBtn, { backgroundColor: theme.danger }]} onPress={() => deleteRequest(req.request_id)}>
                  <Text style={styles.btnTxt}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Confirm send/request */}
      <Modal transparent visible={confirmVisible}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card, borderColor: theme.primary }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {mode === "send" ? "Confirm Transfer" : "Confirm Request"}
            </Text>

            <Text style={[styles.modalText, { color: theme.text }]}>
              {mode === "send"
                ? `Send $${amount} to card ${recipientCard}?`
                : `Request $${amount} from card ${recipientCard}?`}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: "#444" }]} onPress={() => setConfirmVisible(false)}>
                <Text style={[styles.modalBtnText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: theme.primary }]}
                onPress={() => (mode === "send" ? doTransfer() : sendRequest())}
              >
                <Text style={[styles.modalBtnText, { color: theme.text }]}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirm Accept */}
      <Modal transparent visible={confirmAcceptVisible}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card, borderColor: theme.primary }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Confirm Payment</Text>
            <Text style={[styles.modalText, { color: theme.text }]}>
              Send ${selectedRequest?.amount} to {selectedRequest?.requester_name}?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: "#444" }]} onPress={() => setConfirmAcceptVisible(false)}>
                <Text style={[styles.modalBtnText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: theme.primary }]} onPress={acceptRequest}>
                <Text style={[styles.modalBtnText, { color: theme.text }]}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Result */}
      <Modal transparent visible={resultVisible}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card, borderColor: resultColor }]}>
            <Text style={[styles.modalTitle, { color: resultColor }]}>{resultMsg}</Text>
            <TouchableOpacity style={[styles.closeBtn, { backgroundColor: theme.primary }]} onPress={() => setResultVisible(false)}>
              <Text style={[styles.modalBtnText, { color: theme.text }]}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* Styles */
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
  sectionTitle: { fontSize: 20, fontWeight: "700", marginTop: 30, marginBottom: 10 },
  requestRow: { flexDirection: "row", justifyContent: "space-between", padding: 12, borderRadius: 10, marginBottom: 10, borderWidth: 1 },
  reqText: { fontSize: 16, fontWeight: "600" },
  reqButtons: { flexDirection: "row", gap: 10 },
  acceptBtn: { paddingHorizontal: 12, borderRadius: 6 },
  rejectBtn: { paddingHorizontal: 12, borderRadius: 6 },
  btnTxt: { color: "#fff", fontSize: 18, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
  modalBox: { padding: 25, borderRadius: 12, width: "80%", borderWidth: 1 },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 10, textAlign: "center" },
  modalText: { fontSize: 16, marginBottom: 20, textAlign: "center" },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  cancelBtn: { flex: 1, marginRight: 10, paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  confirmBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  closeBtn: { marginTop: 15, paddingVertical: 12, borderRadius: 8, alignItems: "center" },
});

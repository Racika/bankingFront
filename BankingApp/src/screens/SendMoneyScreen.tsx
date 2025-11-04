import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

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

  const tryTransfer = () => {
    setConfirmVisible(true);
  };

  const doTransfer = async () => {
    setConfirmVisible(false);

    try {
      const token = await AsyncStorage.getItem("token");
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
        setResultColor("#ff3d3d");
        setResultVisible(true);
        return;
      }

      await load();
      setResultMsg(`Sent $${amount} successfully`);
      setResultColor("#4caf50");
      setResultVisible(true);
      setAmount("");
      setRecipientCard("");

    } catch {
      setResultMsg("Server error");
      setResultColor("#ff3d3d");
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
      setResultColor("#4caf50");
      setResultVisible(true);
      setAmount("");
      setRecipientCard("");

    } catch {
      setResultMsg("Server error");
      setResultColor("#ff3d3d");
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
      setResultMsg("Not enough balance to accept request");
      setResultColor("#ff3d3d");
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
      setResultColor("#ff3d3d");
      setResultVisible(true);
      return;
    }

    await deleteRequest(request.request_id, false);

    setResultMsg(`Sent $${amount} to ${request.requester_name}`);
    setResultColor("#4caf50");
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
      setResultColor("#ff3d3d");
      setResultVisible(true);
    }

    await load();
  };

  const insufficient = Number(amount) > (funds ?? 0) && mode === "send";

  const validateInputs = () => {
  const value = Number(amount);

  if (!amount || value <= 0) {
    setResultMsg("Enter a valid amount");
    setResultColor("#ff3d3d");
    setResultVisible(true);
    return false;
  }

  if (!recipientCard || recipientCard.length !== 9) {
    setResultMsg("Card number must be 9 digits");
    setResultColor("#ff3d3d");
    setResultVisible(true);
    return false;
  }

  return true;
};

  return (
    <View style={styles.container}>

      <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.backButton}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Transfer</Text>
      <Text style={styles.balance}>Balance: ${funds}</Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === "send" && styles.toggleActive]}
          onPress={() => setMode("send")}
        >
          <Text style={styles.toggleText}>Send</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, mode === "request" && styles.toggleActive]}
          onPress={() => setMode("request")}
        >
          <Text style={styles.toggleText}>Request</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.input, insufficient && { borderColor: "#ff3d3d" }]}
        placeholder="Amount"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      {insufficient && <Text style={styles.warn}>Not enough balance</Text>}

      <TextInput
        style={styles.input}
        placeholder="Recipient card number"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={recipientCard}
        onChangeText={setRecipientCard}
      />

      <TouchableOpacity
        style={[styles.button, insufficient && mode==="send" && {opacity: 0.4}]}
        onPress={() => {
          if (validateInputs()) setConfirmVisible(true);
        }}
        disabled={insufficient && mode==="send"}
      >


        <Text style={styles.buttonText}>
          {mode === "send" ? "Send Money" : "Request Money"}
        </Text>
      </TouchableOpacity>

      {/* INCOMING REQUESTS */}
      <Text style={styles.sectionTitle}>Incoming Requests</Text>

      <ScrollView style={{ maxHeight: 250 }}>
        {requests.length === 0 ? (
          <Text style={styles.noReq}>No requests</Text>
        ) : (
          requests.map((req, i) => (
            <View key={i} style={styles.requestRow}>
              <Text style={styles.reqText}>
                {req.requester_name} — ${req.amount}
              </Text>

              <View style={styles.reqButtons}>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => confirmAccept(req)}>
                  <Text style={styles.btnTxt}>✓</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.rejectBtn} onPress={() => deleteRequest(req.request_id)}>
                  <Text style={styles.btnTxt}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Confirm Send / Request */}
      <Modal transparent visible={confirmVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {mode === "send" ? "Confirm Transfer" : "Confirm Request"}
            </Text>
            <Text style={styles.modalText}>
              {mode === "send"
                ? `Send $${amount} to card ${recipientCard}?`
                : `Request $${amount} from card ${recipientCard}?`}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => mode === "send" ? doTransfer() : sendRequest()}
              >
                <Text style={styles.modalBtnText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirm Accept Request */}
      <Modal transparent visible={confirmAcceptVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Confirm Payment</Text>
            <Text style={styles.modalText}>
              Send ${selectedRequest?.amount} to {selectedRequest?.requester_name}?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmAcceptVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={acceptRequest}
              >
                <Text style={styles.modalBtnText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Result Modal */}
      <Modal transparent visible={resultVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { borderColor: resultColor }]}>
            <Text style={[styles.modalTitle, { color: resultColor }]}>{resultMsg}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setResultVisible(false)}>
              <Text style={styles.modalBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

/* --------------------- STYLING --------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c0f14",
    paddingHorizontal: 20,
    paddingTop: 60
  },
  backButton: { position: "absolute", top: 16, left: 16 },
  backText: { color: "#fff", fontSize: 30 },
  title: { color: "#fff", fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 5 },
  balance: { color: "#4caf50", fontSize: 20, textAlign: "center", marginBottom: 30 },
  toggleContainer: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#1c1f26",
    borderRadius: 12,
  },
  toggleBtn: {
    flex: 1,
    padding: 14,
    alignItems: "center",
  },
  toggleActive: {
    backgroundColor: "#4caf50",
    borderRadius: 12
  },
  toggleText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  input: {
    backgroundColor: "#1c1f26",
    padding: 14,
    marginBottom: 12,
    borderRadius: 10,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333"
  },
  warn: { color: "#ff3d3d", marginBottom: 10 },
  button: {
    backgroundColor: "#4caf50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },

  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 30,
    marginBottom: 10
  },
  noReq: { color: "#888", textAlign: "center", paddingVertical: 20 },
  requestRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1c1f26",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#333"
  },
  reqText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  reqButtons: { flexDirection: "row", gap: 10 },
  acceptBtn: {
    backgroundColor: "#4caf50",
    paddingHorizontal: 12,
    borderRadius: 6
  },
  rejectBtn: {
    backgroundColor: "#b00020",
    paddingHorizontal: 12,
    borderRadius: 6
  },
  btnTxt: { color: "#fff", fontSize: 18, fontWeight: "700" },

  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center", alignItems: "center"
  },
  modalBox: {
    backgroundColor: "#1c1f26", padding: 25, borderRadius: 12,
    width: "80%", borderWidth: 1, borderColor: "#4caf50"
  },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 10, color: "#fff", textAlign: "center" },
  modalText: { color: "#ccc", fontSize: 16, marginBottom: 20, textAlign: "center" },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  cancelBtn: {
    flex: 1, marginRight: 10, backgroundColor: "#444",
    paddingVertical: 12, borderRadius: 8, alignItems: "center"
  },
  confirmBtn: {
    flex: 1, backgroundColor: "#4caf50",
    paddingVertical: 12, borderRadius: 8, alignItems: "center"
  },
  closeBtn: {
    marginTop: 15, backgroundColor: "#4caf50",
    paddingVertical: 12, borderRadius: 8, alignItems: "center"
  },
  modalBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" }
});
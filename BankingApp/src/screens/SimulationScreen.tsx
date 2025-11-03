import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function SimulationScreen({ navigation }: any) {
  const [funds, setFunds] = useState<number | null>(null);
  const [cardnum, setCardnum] = useState("");

  // Modal state
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  const [selected, setSelected] = useState({ amount: 0, category: "" });
  const [resultMsg, setResultMsg] = useState("");
  const [resultColor, setResultColor] = useState("#4caf50");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get("http://10.0.2.2:3000/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFunds(res.data.funds);
      setCardnum(res.data.cardnum);
    } catch (e) {
      console.log(e);
    }
  };

  const triggerSpend = (amount: number, category: string) => {
    setSelected({ amount, category });
    setConfirmVisible(true);
  };

  const doSpend = async () => {
    setConfirmVisible(false);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch("http://10.0.2.2:3000/api/spendMoney", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cardnum,
          amount: selected.amount,
          category: selected.category,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setResultMsg("Insufficient funds!");
        setResultColor("#ff3d3d");
        setResultVisible(true);
        return;
      }

      setFunds(data.funds);
      setResultMsg(`Purchased ${selected.category} - $${selected.amount}`);
      setResultColor("#4caf50");
      setResultVisible(true);
    } catch (err) {
      console.log(err);
    }
  };

  const PurchaseButton = ({ amount, category }: any) => (
    <TouchableOpacity
      style={styles.button}
      onPress={() => triggerSpend(amount, category)}
    >
      <Text style={styles.buttonText}>
        {category} — ${amount}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Back Arrow */}
      <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.backButton}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Simulation</Text>
      <Text style={styles.balance}>${funds}</Text>

      <View style={styles.menu}>
        <PurchaseButton amount={12} category="Food Order" />
        <PurchaseButton amount={9} category="Fast Food" />
        <PurchaseButton amount={4} category="Coffee" />
        <PurchaseButton amount={40} category="Groceries" />
        <PurchaseButton amount={500} category="Rent" />
      </View>

      {/*  Confirmation Modal */}
      <Modal transparent visible={confirmVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Confirm Purchase</Text>
            <Text style={styles.modalText}>
              Spend ${selected.amount} on {selected.category}?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.confirmBtn} onPress={doSpend}>
                <Text style={styles.modalBtnText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/*Result Modal */}
      <Modal transparent visible={resultVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { borderColor: resultColor }]}>
            <Text style={[styles.modalTitle, { color: resultColor }]}>{resultMsg}</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setResultVisible(false)}
            >
              <Text style={styles.modalBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c0f14",
    paddingHorizontal: 20,
    paddingTop: 60
  },
  backButton: { position: "absolute", top: 16, left: 16 },
  backText: { color: "#fff", fontSize: 30 },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10
  },
  balance: {
    color: "#4caf50",
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 35
  },
  menu: { gap: 15 },

  button: {
    backgroundColor: "#1c1f26",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333"
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalBox: {
    backgroundColor: "#1c1f26",
    padding: 25,
    borderRadius: 12,
    width: "80%",
    borderWidth: 1,
    borderColor: "#4caf50"
  },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 10, color: "#fff", textAlign: "center" },
  modalText: { color: "#ccc", fontSize: 16, marginBottom: 20, textAlign: "center" },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },

  cancelBtn: {
    flex: 1,
    marginRight: 10,
    backgroundColor: "#444",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center"
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: "#4caf50",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center"
  },
  closeBtn: {
    marginTop: 15,
    backgroundColor: "#4caf50",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center"
  },
  modalBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" }
});

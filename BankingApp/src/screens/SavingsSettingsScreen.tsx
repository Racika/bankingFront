import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  FlatList,
  Modal,
  TouchableOpacity,
  Image
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Slider from "@react-native-community/slider";
import { ColorThemeContext } from "../theme/ColorThemeContext";

export default function SavingsSettingsScreen() {
  const { theme } = useContext(ColorThemeContext);

  const [funds, setFunds] = useState(0);
  const [savings, setSavings] = useState(0);
  const [roundUpEnabled, setRoundUpEnabled] = useState(false);
  const [goal, setGoal] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [infoVisible, setInfoVisible] = useState(false);

  useEffect(() => {
    loadUserData();
    loadSavingsSettings();
    loadSavingsHistory();
  }, []);

  const getUserId = async () => {
    const token = await AsyncStorage.getItem("token");
    const decoded: any = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    return decoded.userId;
  };

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get("https://racika-banking-api.onrender.com/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFunds(Number(res.data.funds));
      setSavings(Number(res.data.savings));
    } catch (err) {
      console.log("loadUserData error:", err);
    }
  };

  const loadSavingsSettings = async () => {
    try {
      const userId = await getUserId();
      const token = await AsyncStorage.getItem("token");

      const res = await axios.post(
        "https://racika-banking-api.onrender.com/api/getSavingsSettings",
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRoundUpEnabled(Boolean(res.data.round_up_enabled));
      setGoal(Number(res.data.goal));
    } catch (err) {
      console.log("Load settings error:", err);
    }
  };

  const loadSavingsHistory = async () => {
    try {
      const userId = await getUserId();
      const token = await AsyncStorage.getItem("token");

      const res = await axios.post(
        "https://racika-banking-api.onrender.com/api/getSavingsTransactions",
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTransactions(res.data);
    } catch (err) {
      console.log("history error:", err);
    }
  };

  const updateRoundUp = async (value: boolean) => {
    setRoundUpEnabled(value);

    const token = await AsyncStorage.getItem("token");
    const userId = await getUserId();

    await axios.post(
      "https://racika-banking-api.onrender.com/api/updateSavingsSettings",
      { userId, round_up_enabled: value, goal },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const updateGoal = async (v: number) => {
    setGoal(v);

    const token = await AsyncStorage.getItem("token");
    const userId = await getUserId();

    await axios.post(
      "https://racika-banking-api.onrender.com/api/updateSavingsSettings",
      { userId, round_up_enabled: roundUpEnabled, goal: v },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const progress = goal > 0 ? Math.min(savings / goal, 1) : 0;
  const progressPct = Math.round(progress * 100);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      {/* Balance & Savings Card */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.label, { color: theme.text }]}>Balance</Text>
        <Text style={[styles.value, { color: theme.primary }]}>
          ${funds.toLocaleString()}
        </Text>

        <Text style={[styles.label, { color: theme.text, marginTop: 15 }]}>
          Savings
        </Text>
        <Text style={[styles.value, { color: theme.primary }]}>
          ${savings.toLocaleString()}
        </Text>

        {/* Info Icon */}
        <TouchableOpacity
          style={styles.infoIconWrapper}
          onPress={() => setInfoVisible(true)}
        >
          <Image
            source={require("../../assets/info.png")}
            style={styles.infoIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Info Modal */}
      <Modal visible={infoVisible} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.primary }]}>
              Savings & Round-Up Info
            </Text>

            <Text style={[styles.modalText, { color: theme.text }]}>
              Round-Up automatically adds extra savings to each purchase:
              {"\n\n"}• Purchases under $50 → +$1 to savings
              {"\n"}• Purchases over $50 → +$5 to savings
              {"\n\n"}You cannot withdraw from savings inside the app.
              To transfer funds, please contact Racika Bank Support:
              {"\n\n"}📞 1-800-RAC
            </Text>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setInfoVisible(false)}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Goal Progress */}
      <Text style={[styles.goalHeader, { color: theme.text }]}>Goal Progress</Text>

      <View style={styles.progressBarOuter}>
        <View
          style={[
            styles.progressBarInner,
            { width: `${progressPct}%`, backgroundColor: theme.primary },
          ]}
        />
      </View>

      <Text style={[styles.progressText, { color: theme.text }]}>
        {progressPct}%  (${savings.toLocaleString()} / ${goal.toLocaleString()})
      </Text>

      {/* Slider */}
      <Text style={[styles.sliderLabel, { color: theme.text }]}>Change Goal</Text>

      <Slider
        value={goal}
        minimumValue={0}
        maximumValue={10000}
        step={10}
        onValueChange={(v) => setGoal(v)}
        onSlidingComplete={(v) => updateGoal(v)}
        minimumTrackTintColor={theme.primary}
        maximumTrackTintColor="#555"
      />

      {/* Toggle */}
      <View style={styles.row}>
        <Text style={[styles.rowLabel, { color: theme.text }]}>
          Round-up Purchases
        </Text>
        <Switch
          value={roundUpEnabled}
          onValueChange={(v) => updateRoundUp(v)}
          thumbColor={roundUpEnabled ? theme.primary : "#555"}
          trackColor={{ true: "#444", false: "#222" }}
        />
      </View>

      {/* History */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Savings Activity
      </Text>

      <FlatList
        style={{ width: "100%" }}
        data={transactions}
        keyExtractor={(item, i) => String(item.id ?? `tx-${i}`)}
        renderItem={({ item }) => (
          <View style={[styles.historyRow, { backgroundColor: theme.card }]}>
            <Text style={{ color: theme.primary }}>+${item.amount}</Text>
            <Text style={{ color: theme.text }}>{item.category}</Text>
          </View>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  card: {
    width: "100%",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 20,
    position: "relative",
  },

 infoIconWrapper: {
   position: "absolute",
   right: 8,
   bottom: 8,
   padding: 20,
 },

 infoIcon: {
   width: 52,
   height: 53,
   opacity: 0.9,
 },



  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "85%",
    padding: 20,
    borderRadius: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },

  modalText: { fontSize: 14, lineHeight: 22, marginBottom: 20 },

  closeBtn: {
    backgroundColor: "#444",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  label: { fontSize: 14, opacity: 0.8 },
  value: { fontSize: 26, fontWeight: "700" },

  goalHeader: { fontSize: 18, fontWeight: "700", marginBottom: 8 },

  progressBarOuter: {
    width: "100%",
    height: 12,
    backgroundColor: "#222",
    borderRadius: 6,
    overflow: "hidden",
  },

  progressBarInner: { height: "100%", borderRadius: 6 },

  progressText: { marginTop: 5, fontSize: 14, fontWeight: "600" },

  sliderLabel: { fontSize: 16, fontWeight: "600", marginTop: 20 },

  row: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 14,
    alignItems: "center",
  },

  rowLabel: { fontSize: 18, fontWeight: "600" },

  sectionTitle: { fontSize: 18, marginVertical: 10, fontWeight: "700" },

  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    marginBottom: 6,
    borderRadius: 8,
  },
});

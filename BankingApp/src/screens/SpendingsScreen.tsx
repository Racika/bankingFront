import React, { useEffect, useState, useContext } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, Modal, Dimensions
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LineChart } from "react-native-chart-kit";
import { jwtDecode } from "jwt-decode";
import { ColorThemeContext } from "../theme/ColorThemeContext";

const screenWidth = Dimensions.get("window").width;

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function SpendingsScreen() {
  const { theme } = useContext(ColorThemeContext);

  const currentMonth = monthNames[new Date().getMonth()];
  const [month, setMonth] = useState(currentMonth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [spendings, setSpendings] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const token: any = await AsyncStorage.getItem("token");
      if (!token) return;
      const decoded: any = jwtDecode(token);
      setUserId(decoded.userId);
    };
    loadUser();
  }, []);

  const loadData = async (selectedMonth = month) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!userId || !token) return;

      const [spendRes, earnRes] = await Promise.all([
        axios.post("http://10.0.2.2:3000/api/spendings",
          { userId, month: selectedMonth },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.post("http://10.0.2.2:3000/api/earnings",
          { userId, month: selectedMonth },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ]);

      const spend = spendRes.data;
      const earn = earnRes.data;

      setSpendings(spend);
      setEarnings(earn);

      const all = [
        ...spend.map((s: any) => ({ ...s, type: "spending" })),
        ...earn.map((e: any) => ({ ...e, type: "earning" }))
      ].sort((a, b) => a.day - b.day);

      setTransactions(all);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (userId) loadData(month);
  }, [month, userId]);

  const dailyTotals: Record<number, number> = {};
  spendings.forEach((t: any) => {
    dailyTotals[t.day] = (dailyTotals[t.day] || 0) + Number(t.amount);
  });

  const allDays = Object.keys(dailyTotals);
  const labels = allDays.filter((_, i) => i % 3 === 0);
  const values = labels.map(d => dailyTotals[Number(d)]);

  const chartData = {
    labels,
    datasets: [{ data: values, color: () => theme.primary }]
  };

return (
  <View style={[styles.container, { backgroundColor: theme.background }]}>

    <Text style={[styles.title, { color: theme.text }]}>Monthly Spendings</Text>

    {/* Month selector */}
    <TouchableOpacity
      style={[styles.monthSelect, { backgroundColor: theme.card, borderColor: theme.text }]}
      onPress={() => setDropdownOpen(true)}
    >
      <Text style={[styles.monthSelectText, { color: theme.text }]}>{month} ▾</Text>
    </TouchableOpacity>

    {/* Month dropdown modal */}
    <Modal visible={dropdownOpen} transparent animationType="fade">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setDropdownOpen(false)}
      >
        <View style={[styles.monthDropdown, { backgroundColor: theme.card, borderColor: theme.text }]}>
          {monthNames.map((m) => (
            <TouchableOpacity
              key={m}
              style={styles.monthItem}
              onPress={() => {
                setMonth(m);
                setDropdownOpen(false);
              }}
            >
              <Text style={[styles.monthItemText, { color: theme.text }]}>
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>

    {/* Chart */}
    {spendings.length > 0 ? (
      <LineChart
        data={chartData}
        width={screenWidth - 20}
        height={220}
        yAxisLabel="$"
        withDots
        bezier
        chartConfig={{
          backgroundColor: theme.background,
          backgroundGradientFrom: theme.background,
          backgroundGradientTo: theme.card,
          decimalPlaces: 2,
          color: () => theme.primary,
          labelColor: () => theme.text,
          propsForDots: { r: "4", strokeWidth: "2", stroke: theme.primary }
        }}
        style={styles.chart}
      />
    ) : (
      <Text style={[styles.noData, { color: theme.text }]}>No spendings this month</Text>
    )}

    <Text style={[styles.listTitle, { color: theme.text }]}>Transactions</Text>

    {/* ✅ Scroll fix — Now always scrollable */}
    <View style={{ flex: 1 }}>
      <FlatList
        data={transactions}
        keyExtractor={(_, i) => i.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View
            style={[
              styles.listItem,
              { backgroundColor: theme.card }
            ]}
          >
            <Text style={[styles.day, { color: theme.text }]}>Day {item.day}</Text>

            <Text style={[styles.category, { color: theme.text }]}>
              {item.type === "spending" ? item.category : `From ${item.sender}`}
            </Text>

            <Text
              style={{
                color: item.type === "spending" ? theme.danger : theme.primary,
                fontWeight: "600"
              }}
            >
              {item.type === "spending"
                ? `-$${Number(item.amount).toFixed(2)}`
                : `+$${Number(item.amount).toFixed(2)}`}
            </Text>
          </View>
        )}
      />
    </View>

  </View>
);

}

/* STYLES */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },

  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 15
  },

  /* Month select button */
  monthSelect: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15
  },
  monthSelectText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center"
  },

  /* Dropdown modal */
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 120,
    backgroundColor: "rgba(0,0,0,0.5)"
  },

  monthDropdown: {
    width: "70%",
    alignSelf: "center",
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8
  },

  monthItem: {
    paddingVertical: 14,
    alignItems: "center",
  },
  monthItemText: {
    fontSize: 16,
    fontWeight: "500"
  },

  chart: { marginVertical: 15, borderRadius: 10 },
  noData: { textAlign: "center", marginVertical: 20 },

  listTitle: { fontSize: 20, fontWeight: "600", marginBottom: 10 },

  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    marginVertical: 5,
    borderRadius: 10
  },
  day: { fontSize: 14 },
  category: { fontSize: 14 }
});

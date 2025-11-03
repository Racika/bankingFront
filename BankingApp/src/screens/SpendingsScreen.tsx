import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, Modal, Dimensions
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LineChart } from "react-native-chart-kit";
import { jwtDecode } from "jwt-decode";

const screenWidth = Dimensions.get("window").width;

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function SpendingsScreen() {
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
    datasets: [{ data: values }]
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monthly Spendings</Text>

      {/* Month select */}
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setDropdownOpen(true)}>
        <Text style={styles.dropdownText}>{month} ▾</Text>
      </TouchableOpacity>

      <Modal visible={dropdownOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setDropdownOpen(false)}>
          <View style={styles.dropdownList}>
            {monthNames.map((m) => (
              <TouchableOpacity
                key={m}
                style={styles.dropdownItem}
                onPress={() => {
                  setMonth(m);
                  setDropdownOpen(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{m}</Text>
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
            backgroundColor: "#0c0f14",
            backgroundGradientFrom: "#11151c",
            backgroundGradientTo: "#11151c",
            decimalPlaces: 2,
            color: () => "#4caf50",
            labelColor: () => "#fff",
            propsForDots: { r: "4" }
          }}
          style={styles.chart}
        />
      ) : (
        <Text style={styles.noData}>No spendings this month</Text>
      )}

      <Text style={styles.listTitle}>Transactions</Text>

      <FlatList
        data={transactions}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.day}>Day {item.day}</Text>
            <Text style={styles.category}>
              {item.type === "spending" ? item.category : `From ${item.sender}`}
            </Text>
            <Text style={item.type === "spending" ? styles.amountSpending : styles.amountEarning}>
              {item.type === "spending"
                ? `-$${Number(item.amount).toFixed(2)}`
                : `+$${Number(item.amount).toFixed(2)}`}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

/*  Styles */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0c0f14", padding: 15 },
  title: {
    color: "#fff", fontSize: 26, fontWeight: "700",
    textAlign: "center", marginBottom: 15
  },
  dropdownButton: {
    backgroundColor: "#1c1f26", padding: 14, borderRadius: 10, marginBottom: 15
  },
  dropdownText: {
    color: "#fff", fontSize: 18, fontWeight: "600", textAlign: "center"
  },
  modalOverlay: {
    flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.6)"
  },
  dropdownList: {
    backgroundColor: "#1c1f26", marginHorizontal: 40, borderRadius: 10
  },
  dropdownItem: {
    padding: 14, borderBottomWidth: 1, borderBottomColor: "#333"
  },
  dropdownItemText: { color: "#fff", fontSize: 16 },
  chart: { marginVertical: 15, borderRadius: 10 },
  noData: { color: "#aaa", textAlign: "center", marginVertical: 20 },
  listTitle: { color: "#fff", fontSize: 20, fontWeight: "600", marginBottom: 10 },
  listItem: {
    flexDirection: "row", justifyContent: "space-between",
    padding: 12, marginVertical: 5, backgroundColor: "#1c1f26", borderRadius: 10
  },
  day: { color: "#fff" },
  category: { color: "#aaa" },
  amountSpending: { color: "#ff3d3d", fontWeight: "600" },
  amountEarning: { color: "#4caf50", fontWeight: "600" }
});

import React, { useEffect, useState, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as RNHTMLtoPDF from "react-native-html-to-pdf";
import RNFS from "react-native-fs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Tts from "react-native-tts";
import { ColorThemeContext } from "../theme/ColorThemeContext";
import { jwtDecode } from "jwt-decode";

export default function OptionsScreen({ navigation }: any) {
  const [userId, setUserId] = useState<string | null>(null);
  const [funds, setFunds] = useState<number | null>(null);
  const [fullName, setFullName] = useState("");
  const [requests, setRequests] = useState<any[]>([]);
  const { theme, changeTheme } = useContext(ColorThemeContext);

  useEffect(() => {
    Tts.stop();
    Tts.setDefaultLanguage("en-US");
    Tts.setDefaultRate(0.5);
    loadUser();
    return () => Tts.stop();
  }, []);

  const loadUser = async () => {
    const token = await AsyncStorage.getItem("token");
    const res = await axios.get("https://racika-banking-api.onrender.com/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const decoded: any = jwtDecode(token as string);
    setUserId(Number(decoded.userId));
    setFunds(res.data.funds);
    setFullName(res.data.fullName);
    loadRequests(res.data.cardnum);
  };

  const loadRequests = async (card: string) => {
    const token = await AsyncStorage.getItem("token");
    const res = await axios.post(
      "https://racika-banking-api.onrender.com/api/getRequests",
      { cardnum: card },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setRequests(res.data);
  };

  const speakStatus = async () => {
    await Tts.stop();
    let message = `Hello ${fullName}. Your balance is ${funds} dollars. `;

    if (requests.length === 0) {
      message += "You have no pending requests.";
    } else {
      message += `You have ${requests.length} pending requests. `;
      requests.forEach((r) => {
        message += `From ${r.requester_name}, for ${r.amount} dollars. `;
      });
    }

    setTimeout(() => {
      Tts.speak(message);
    }, 100);
  };

  const exportPDF = async () => {
    try {
      if (!userId) {
        alert("User not loaded yet, try again.");
        return;
      }

      const token = await AsyncStorage.getItem("token");
      const month = new Date().toLocaleString("en-US", { month: "long" });

      const res = await axios.post(
        "https://racika-banking-api.onrender.com/api/spendings",
        { userId, month },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data;

      if (!data || !Array.isArray(data) || data.length === 0) {
        alert("No spendings found for this month.");
        return;
      }

      const amounts = data.map((x: any) => Number(x.amount));
      const avg = (amounts.reduce((a, b) => a + b, 0) / amounts.length).toFixed(2);
      const max = Math.max(...amounts).toFixed(2);
      const min = Math.min(...amounts).toFixed(2);

      const rows = data
        .map((x: any) => `<tr><td>${x.day}</td><td>${x.category}</td><td>$${x.amount}</td></tr>`)
        .join("");

      // ✅ Load bank sigil from Android assets folder
      const base64Image = await RNFS.readFileAssets("sigil.png", "base64");

      const watermarkStyle = `
        position: absolute;
        top: 35%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-25deg);
        font-size: 48px;
        opacity: 0.08;
        font-weight: bold;
        color: #000;
        white-space: nowrap;
      `;

      const html = `
        <html>
        <body style="font-family: Arial; position: relative;">
          <div style="${watermarkStyle}">
            RACIKA BANKING INC.
          </div>

          <h2 style="text-align:center;">Racika Banking Inc.</h2>
          <h3 style="text-align:center;">Monthly Spendings Report — ${month}</h3>
          <p><strong>Valued Customer:</strong> ${fullName}</p>

          <h4>Summary</h4>
          <p>Average: $${avg}</p>
          <p>Highest: $${max}</p>
          <p>Lowest: $${min}</p>

          <h4>Transactions</h4>
          <table border="1" style="width:100%;border-collapse:collapse;">
            <tr><th>Day</th><th>Category</th><th>Amount</th></tr>
            ${rows}
          </table>

          <div style="width:100%; text-align:center; margin-top:30px;">
            <img src="data:image/png;base64,${base64Image}" width="90" />
          </div>

          <p style="text-align:center;font-size:10px;opacity:.6;margin-top:5px;">
            © Racika Banking Inc — Confidential Financial Statement
          </p>
        </body>
        </html>
      `;

      const file = await RNHTMLtoPDF.generatePDF({
        html,
        fileName: `${fullName}_Spendings_${month}`,
        directory: "Downloads",
      });

      alert(`PDF exported successfully:\n${file.filePath}`);

    } catch (err) {
      console.log("PDF Export Error:", err);
      alert("PDF export failed — check Logcat for details.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Accessibility Options</Text>

      <TouchableOpacity style={[styles.button, { borderColor: theme.primary, backgroundColor: theme.card }]} onPress={speakStatus}>
        <Text style={[styles.buttonText, { color: theme.primary }]}>Speak Account Status</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Colorblind Modes</Text>

      {["default", "deuteranopia", "protanopia", "tritanopia"].map((mode) => (
        <TouchableOpacity
          key={mode}
          style={[styles.button, { borderColor: theme.primary, backgroundColor: theme.card }]}
          onPress={() => changeTheme(mode)}
        >
          <Text style={[styles.buttonText, { color: theme.primary }]}>
            {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
          </Text>
        </TouchableOpacity>
      ))}

<Text style={[styles.sectionTitle, { color: theme.text }]}>Spendings To PDF</Text>
      <TouchableOpacity
        style={[styles.button, { borderColor: theme.primary, backgroundColor: theme.card }]}
        onPress={exportPDF}
      >
        <Text style={[styles.buttonText, { color: theme.primary }]}>
          Export Monthly Spendings to PDF
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: theme.card }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.backText, { color: theme.text }]}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60, alignItems: "center" },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 30, textAlign: "center" },
  button: { width: "100%", paddingVertical: 16, borderRadius: 12, alignItems: "center", marginBottom: 12, borderWidth: 1 },
  buttonText: { fontSize: 18, fontWeight: "600" },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginTop: 20, marginBottom: 10, textAlign: "center" },
  backButton: { marginTop: 25, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
  backText: { fontSize: 16, fontWeight: "600" },
});

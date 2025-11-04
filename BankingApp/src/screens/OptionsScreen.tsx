import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Tts from "react-native-tts";

export default function OptionsScreen({ navigation }: any) {
  const [funds, setFunds] = useState<number | null>(null);
  const [fullName, setFullName] = useState("");
  const [requests, setRequests] = useState<any[]>([]);

useEffect(() => {
  Tts.stop();
  Tts.setDefaultLanguage("en-US");
  Tts.setDefaultRate(0.5);
  loadUser();

  return () => {
    Tts.stop(); // only stop speech, no removing listeners
  };
}, []);



  const loadUser = async () => {
    const token = await AsyncStorage.getItem("token");
    const res = await axios.get("http://10.0.2.2:3000/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setFunds(res.data.funds);
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


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accessibility Options</Text>

      <TouchableOpacity style={styles.button} onPress={speakStatus}>
        <Text style={styles.buttonText}>Speak Account Status</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c0f14",
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 30,
  },
  button: {
    width: "100%",
    backgroundColor: "#1c1f26",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#4caf50",
  },
  buttonText: {
    color: "#4caf50",
    fontSize: 18,
    fontWeight: "600",
  },
  backButton: {
    marginTop: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: "#444",
    borderRadius: 10,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

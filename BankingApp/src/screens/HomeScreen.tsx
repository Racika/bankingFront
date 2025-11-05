import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ColorThemeContext } from "../theme/ColorThemeContext";
import LinearGradient from "react-native-linear-gradient";

export default function HomeScreen({ navigation }: any) {
  const [funds, setFunds] = useState<number | null>(null);
  const [cardnum, setCardnum] = useState("");
  const [fullName, setFullName] = useState("");
  const { theme } = useContext(ColorThemeContext);
  const [displayFunds, setDisplayFunds] = useState(0);

  const flipAnim = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const flipCard = () => {
    Animated.spring(flipAnim, { toValue: flipped ? 0 : 180, useNativeDriver: true }).start();
    setFlipped(!flipped);
  };

  const formatCardNumber = (num: string) => {
    return num.replace(/\W/gi, "").replace(/(.{3})/g, "$1 ").trim();
  };

  useEffect(() => {
    if (funds !== null) {
      let start = 0;
      const end = Number(funds);
      if (start === end) return;

      const duration = 800;
      const stepTime = 16;
      const step = (end - start) / (duration / stepTime);

      const counter = setInterval(() => {
        start += step;
        if (start >= end) {
          clearInterval(counter);
          setDisplayFunds(end);
        } else {
          setDisplayFunds(Math.floor(start));
        }
      }, stepTime);

      return () => clearInterval(counter);
    }
  }, [funds]);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get("http://10.0.2.2:3000/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFunds(res.data.funds);
      setCardnum(res.data.cardnum);
      setFullName(res.data.fullName);
    } catch (err) {
      console.log("Error loading user:", err);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      {/* CARD */}
      <Animated.View>
        <Pressable onPress={flipCard}>

          {/* FRONT */}
          <Animated.View
            style={[
              styles.cardContainer,
              {
                backgroundColor: theme.card,
                borderColor: theme.primary,
                transform: [{ rotateY: frontInterpolate }],
              },
            ]}
          >
            <Image source={require("../../assets/card_texture.png")} style={styles.textureLayer} />
            <LinearGradient
              colors={["rgba(255,255,255,0.35)", "rgba(255,255,255,0)"]}
              style={styles.glossLayer}
            />

            {/* BANK NAME */}
            <Text style={[styles.cardTitle, { color: theme.text }]}>Racika Banking Inc.</Text>

            {/* BALANCE */}
            <Text style={[styles.cardBalance, { color: theme.primary }]}>
              ${funds !== null ? displayFunds.toLocaleString() : "…"}
            </Text>

            {/* CARD NUMBER */}
            <Text style={[styles.cardNumber, { color: theme.text }]}>
              {formatCardNumber(cardnum)}
            </Text>

            {/* NAME */}
            <Text style={[styles.cardName, { color: theme.text }]}>{fullName}</Text>

            {/* SIGIL bottom-right */}
            <Image
              source={require("../../assets/sigil.png")}
              style={styles.sigil}
            />
          </Animated.View>

          {/* BACK */}
          <Animated.View
            style={[
              styles.cardContainer,
              styles.cardBack,
              {
                backgroundColor: theme.card,
                borderColor: theme.primary,
                transform: [{ rotateY: backInterpolate }],
              },
            ]}
          >
            <Image source={require("../../assets/card_texture.png")} style={styles.textureLayer} />
            <LinearGradient
              colors={["rgba(255,255,255,0.35)", "rgba(255,255,255,0)"]}
              style={styles.glossLayer}
            />

            <Text style={[styles.cardTitle, { color: theme.text }]}>Savings</Text>
            <Text style={[styles.cardBalance, { color: theme.primary }]}>
              Coming Soon
            </Text>
            <Text style={[styles.cardName, { color: theme.text }]}>
              Secure vault enabled
            </Text>
          </Animated.View>
        </Pressable>
      </Animated.View>

      {/* BUTTONS */}
      <TouchableOpacity
        style={[styles.button, { borderColor: theme.primary, backgroundColor: theme.card }]}
        onPress={() => navigation.navigate("SendMoney")}
      >
        <Text style={[styles.buttonText, { color: theme.text }]}>Send Money</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { borderColor: theme.primary, backgroundColor: theme.card }]}
        onPress={() => navigation.navigate("Spendings")}
      >
        <Text style={[styles.buttonText, { color: theme.text }]}>Spendings History</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { borderColor: theme.primary, backgroundColor: theme.card }]}
        onPress={() => navigation.navigate("Simulation")}
      >
        <Text style={[styles.buttonText, { color: theme.text }]}>Simulation</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { borderColor: theme.primary, backgroundColor: theme.card }]}
        onPress={() => navigation.navigate("Options")}
      >
        <Text style={[styles.buttonText, { color: theme.text }]}>Options</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.logoutBox, { borderColor: theme.danger, backgroundColor: theme.card }]}
        onPress={logout}
      >
        <Text style={[styles.logoutText, { color: theme.danger }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 40, alignItems: "center" },

  cardContainer: {
    width: 330,
    height: 200,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: "flex-end",
    padding: 20,
    marginBottom: 30,
    backfaceVisibility: "hidden",
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },

  cardBack: { position: "absolute", top: 0 },

  textureLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.18,
    resizeMode: "cover",
  },

  glossLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
    transform: [{ rotate: "-20deg" }],
  },

  sigil: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    position: "absolute",
    bottom: 12,
    right: 12,
    opacity: 0.75,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Montserrat-Bold",
    letterSpacing: 1,
    marginBottom: 8,
  },

  cardBalance: {
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 12,
  },

  cardNumber: {
    fontSize: 18,
    fontWeight: "600",
    opacity: 0.85,
    letterSpacing: 2,
    marginBottom: 6,
  },

  cardName: {
    fontSize: 16,
    fontWeight: "700",
  },

  button: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
  },

  buttonText: { fontSize: 18, fontWeight: "600" },

  logoutBox: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 25,
    borderWidth: 1,
  },

  logoutText: { fontSize: 16, fontWeight: "700" },
});

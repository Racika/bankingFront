import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { enableScreens } from "react-native-screens";

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import SimulationScreen from "./src/screens/SimulationScreen";
import SendMoneyScreen from "./src/screens/SendMoneyScreen";
import SpendingsScreen from "./src/screens/SpendingsScreen";
import OptionsScreen from "./src/screens/OptionsScreen";

import { ColorThemeProvider, ColorThemeContext } from "./src/theme/ColorThemeContext";

enableScreens();
const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { theme } = useContext(ColorThemeContext);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: true,
            headerTitle: "Racika Banking Inc.",
            headerTitleAlign: "center",
            headerStyle: { backgroundColor: theme.background },
            headerTintColor: theme.text,
          }}
        />

        <Stack.Screen
          name="Simulation"
          component={SimulationScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="SendMoney"
          component={SendMoneyScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Spendings"
          component={SpendingsScreen}
          options={{
            headerShown: true,
            headerTitle: "Spendings",
            headerStyle: { backgroundColor: theme.background },
            headerTintColor: theme.text,
          }}
        />

        <Stack.Screen
          name="Options"
          component={OptionsScreen}
          options={{
            headerShown: true,
            headerTitle: "Options",
            headerStyle: { backgroundColor: theme.background },
            headerTintColor: theme.text,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ColorThemeProvider>
      <AppNavigator />
    </ColorThemeProvider>
  );
}

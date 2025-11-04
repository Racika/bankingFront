import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import SimulationScreen from './src/screens/SimulationScreen';
import SendMoneyScreen from './src/screens/SendMoneyScreen';
import SpendingsScreen from './src/screens/SpendingsScreen';
import OptionsScreen from './src/screens/OptionsScreen';
import { enableScreens } from 'react-native-screens';
enableScreens();

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
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
            headerStyle: { backgroundColor: "#0c0f14" },
            headerTintColor: "#fff",
            headerTitleAlign: "center",
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
            headerStyle: { backgroundColor: "#0c0f14" },
            headerTintColor: "#fff"
          }}
        />
        <Stack.Screen
          name="Options"
          component={OptionsScreen}
          options={{
            headerShown: true,
            headerTitle: "Options",
            headerStyle: { backgroundColor: "#0c0f14" },
            headerTintColor: "#fff",
          }}
        />


      </Stack.Navigator>

    </NavigationContainer>
  );
}

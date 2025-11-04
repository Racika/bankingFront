import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const themes: any = {
  default: {
    primary: "#4caf50",
    background: "#0c0f14",
    card: "#1c1f26",
    danger: "#ff3d3d",
    text: "#fff"
  },
  deuteranopia: {
    primary: "#2b82ff",
    background: "#0c0f14",
    card: "#1c1f26",
    danger: "#ffbf00",
    text: "#fff"
  },
  protanopia: {
    primary: "#0066ff",
    background: "#0c0f14",
    card: "#1c1f26",
    danger: "#ffaa00",
    text: "#fff"
  },
  tritanopia: {
    primary: "#00cc66",
    background: "#0c0f14",
    card: "#1c1f26",
    danger: "#ff3366",
    text: "#fff"
  },
};

export const ColorThemeContext = createContext<any>(null);

export const ColorThemeProvider = ({ children }: any) => {
  const [theme, setTheme] = useState(themes.default);

  useEffect(() => {
    AsyncStorage.getItem("colorTheme").then((value) => {
      if (value && themes[value]) setTheme(themes[value]);
    });
  }, []);

  const changeTheme = async (mode: string) => {
    await AsyncStorage.setItem("colorTheme", mode);
    setTheme(themes[mode]);
  };

  return (
    <ColorThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
};

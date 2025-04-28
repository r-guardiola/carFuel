import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { colors } from '../theme';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  isDark: boolean;
  colors: typeof colors;
  setTheme: (theme: ThemeType) => void;
}

const darkColors = {
  ...colors,
  background: '#121212',
  text: '#FFFFFF',
  lightText: '#B0B0B0',
  card: '#1E1E1E',
  border: '#2D2D2D',
  error: '#CF6679',
  success: '#4CAF50',
  warning: '#FFC107',
  info: '#2196F3',
  white: '#FFFFFF',
  black: '#000000',
  disabled: '#BDBDBD',
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  isDark: false,
  colors,
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>('system');

  const isDark = theme === 'system' 
    ? systemColorScheme === 'dark'
    : theme === 'dark';

  const currentColors = isDark ? darkColors : colors;

  return (
    <ThemeContext.Provider value={{ theme, isDark, colors: currentColors, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 
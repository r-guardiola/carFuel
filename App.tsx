import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import { ThemeProvider } from './src/context/ThemeContext';
import { AppContent } from './src/components/AppContent';

// Habilitar o react-native-screens para melhor performance
enableScreens();

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PaperProvider>
          <AppContent />
        </PaperProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
} 
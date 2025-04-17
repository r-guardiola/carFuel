import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase, clearDatabase } from './src/database/database';
import { insertTestData } from './src/database/testData';
import { ensureDefaultConfiguracao } from './src/database/configuracaoService';
import { colors } from './src/theme';

// Habilitar o react-native-screens para melhor performance
enableScreens();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Inicializar o banco de dados
        await initDatabase();
        
        // Limpar dados antigos para evitar problemas com tentativas anteriores
        await clearDatabase();
        
        // Garantir que temos uma configuração padrão
        await ensureDefaultConfiguracao();
        
        // Inserir dados de teste
        await insertTestData();
        
        setIsLoading(false);
      } catch (err) {
        console.error('Erro ao inicializar o banco de dados:', err);
        setError('Falha ao inicializar o aplicativo. Por favor, reinicie-o.');
        setIsLoading(false);
      }
    };

    init();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Inicializando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
  },
}); 
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/database/database';
import { ensureDefaultConfiguracao } from './src/database/configuracaoService';
import { ensureDefaultVeiculo } from './src/database/veiculoService';
import { updateAbastecimentosLegados } from './src/database/abastecimentoService';
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
        console.log('Inicializando banco de dados...');
        await initDatabase();
        
        // Garantir que temos uma configuração padrão
        console.log('Inicializando configurações padrão...');
        await ensureDefaultConfiguracao();
        await ensureDefaultVeiculo();
        await updateAbastecimentosLegados();
        
        console.log('Inicialização concluída com sucesso!');
        setIsLoading(false);
      } catch (err: any) {
        console.error('Erro ao inicializar o banco de dados:', err);
        setError(`Erro: ${err?.message || 'Desconhecido'}`);
        setIsLoading(false);
      }
    };

    init();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.title}>CarFuel</Text>
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
        <Text style={styles.loadingText}>Inicializando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.title}>CarFuel</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText}>Por favor, reinicie o aplicativo.</Text>
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
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 30,
  },
  spinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryText: {
    fontSize: 14,
    color: colors.text,
  }
}); 
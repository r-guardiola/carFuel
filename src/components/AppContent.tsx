import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { initDatabase } from '../database/database';
import { ensureDefaultConfiguracao } from '../database/configuracaoService';
import { ensureDefaultVeiculo } from '../database/veiculoService';
import { updateAbastecimentosLegados } from '../database/abastecimentoService';
import { executeMigrations } from '../database/migration';
import AppNavigator from '../navigation/AppNavigator';

export const AppContent: React.FC = () => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Inicializar o banco de dados
        console.log('Inicializando banco de dados...');
        await initDatabase();
        
        // Executar migrações de banco de dados
        console.log('Executando migrações de banco de dados...');
        await executeMigrations();
        
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
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.primary }]}>CarFuel</Text>
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Inicializando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.primary }]}>CarFuel</Text>
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <Text style={[styles.retryText, { color: colors.text }]}>Por favor, reinicie o aplicativo.</Text>
      </View>
    );
  }

  return <AppNavigator />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  spinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryText: {
    fontSize: 14,
  }
}); 
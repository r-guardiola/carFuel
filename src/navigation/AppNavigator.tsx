import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { DashboardScreen, TestScreen, VeiculosScreen, HomeScreen, SetupScreen, ConfiguracoesScreen } from '../screens';
import { getVeiculoAtivo, getVeiculos } from '../database/veiculoService';
import { View, ActivityIndicator, Text } from 'react-native';
import { colors } from '../theme';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const determineInitialRoute = async () => {
      try {
        // Verificar se existe algum veículo cadastrado
        const veiculos = await getVeiculos();
        
        if (veiculos.length === 0) {
          // Se não tiver nenhum veículo, redirecionar para tela de adicionar veículo
          setInitialRoute('Setup');
        } else {
          // Verificar se tem um veículo ativo
          const veiculoAtivo = await getVeiculoAtivo();
          
          if (veiculoAtivo) {
            // Se tiver um veículo ativo, ir direto para o dashboard
            setInitialRoute('Dashboard');
          } else {
            // Se tiver veículos mas nenhum ativo, ir para lista de veículos
            setInitialRoute('Veiculos');
          }
        }
      } catch (error) {
        console.error('Erro ao determinar rota inicial:', error);
        setInitialRoute('Home');
      } finally {
        setLoading(false);
      }
    };

    determineInitialRoute();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.text }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute || "Home"}
        screenOptions={{
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'CarFuel',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: 'Meu Veículo',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="Veiculos"
          component={VeiculosScreen}
          options={{
            title: 'Meus Veículos',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="Setup"
          component={SetupScreen}
          options={{
            title: 'Configuração',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="Test"
          component={TestScreen}
          options={{
            title: 'Tela de Teste',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="Configuracoes"
          component={ConfiguracoesScreen}
          options={{
            title: 'Configurações',
            headerTitleAlign: 'center',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

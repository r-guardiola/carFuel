import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { DashboardScreen, TestScreen, VeiculosScreen, HomeScreen, SetupScreen } from '../screens';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

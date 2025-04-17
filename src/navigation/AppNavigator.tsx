import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

// Implementação temporária até criarmos a navegação real
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>O projeto está configurado corretamente!</Text>
        <Text>Banco de dados SQLite carregado com sucesso.</Text>
      </View>
    </NavigationContainer>
  );
};

export default AppNavigator; 
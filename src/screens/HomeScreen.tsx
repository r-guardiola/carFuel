import React from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import { Button } from 'react-native-paper';
import { colors } from '../theme';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const handleDashboardPress = () => {
    navigation.navigate('Dashboard');
  };

  const handleVeiculosPress = () => {
    navigation.navigate('Veiculos');
  };

  const handleSetupPress = () => {
    navigation.navigate('Setup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>CarFuel</Text>
        <Text style={styles.subtitle}>Controle de abastecimentos</Text>
        
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            icon="speedometer"
            style={styles.button}
            onPress={handleDashboardPress}
          >
            Dashboard
          </Button>
          
          <Button
            mode="contained"
            icon="car-settings"
            style={styles.button}
            onPress={handleVeiculosPress}
          >
            Meus Veículos
          </Button>
          
          <Button
            mode="outlined"
            icon="cog"
            style={[styles.button, styles.lastButton]}
            onPress={handleSetupPress}
          >
            Configuração Inicial
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  lastButton: {
    marginTop: 20,
  },
}); 
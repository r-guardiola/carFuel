import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

export const TestScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela de teste funcionando!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    fontSize: 20,
    color: colors.text,
  },
}); 
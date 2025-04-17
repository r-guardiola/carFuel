import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Card } from 'react-native-paper';
import { colors } from '../theme';

interface ConsumoStatsProps {
  mediaGeral: number | null;
  mediaUltimoAbastecimento: number | null;
  totalAbastecimentos: number;
  totalGasto: number;
}

export const ConsumoStats: React.FC<ConsumoStatsProps> = ({
  mediaGeral,
  mediaUltimoAbastecimento,
  totalAbastecimentos,
  totalGasto,
}) => {
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Resumo de Desempenho</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {mediaGeral ? `${mediaGeral.toFixed(2)}` : '-'}
            </Text>
            <Text style={styles.statLabel}>Média Geral (km/L)</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {mediaUltimoAbastecimento ? `${mediaUltimoAbastecimento.toFixed(2)}` : '-'}
            </Text>
            <Text style={styles.statLabel}>Última Média (km/L)</Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalAbastecimentos}</Text>
            <Text style={styles.statLabel}>Abastecimentos</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatCurrency(totalGasto)}</Text>
            <Text style={styles.statLabel}>Total Gasto</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    borderRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.lightText,
    textAlign: 'center',
  },
}); 
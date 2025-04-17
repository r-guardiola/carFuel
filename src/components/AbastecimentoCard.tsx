import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Card, Divider, Icon } from 'react-native-paper';
import { Abastecimento } from '../types/abastecimento';
import { colors } from '../theme';

interface AbastecimentoCardProps {
  abastecimento: Abastecimento;
  onPress?: (abastecimento: Abastecimento) => void;
}

export const AbastecimentoCard: React.FC<AbastecimentoCardProps> = ({
  abastecimento,
  onPress,
}) => {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handlePress = () => {
    if (onPress) {
      onPress(abastecimento);
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View>
              <Text style={styles.date}>
                {formatDate(abastecimento.data)} às {formatTime(abastecimento.data)}
              </Text>
              <Text style={styles.posto}>
                {abastecimento.posto || 'Posto não informado'}
              </Text>
            </View>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{formatCurrency(abastecimento.valorTotal)}</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Litros</Text>
              <Text style={styles.detailValue}>
                {abastecimento.litros.toFixed(2)}L
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Preço/L</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(abastecimento.valorLitro)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Km Atual</Text>
              <Text style={styles.detailValue}>
                {abastecimento.kmAtual.toFixed(1)} km
              </Text>
            </View>
          </View>

          {abastecimento.kmPercorridos && (
            <View style={styles.consumoContainer}>
              <View style={styles.consumoItem}>
                <Text style={styles.consumoLabel}>Km percorridos</Text>
                <Text style={styles.consumoValue}>
                  {abastecimento.kmPercorridos.toFixed(1)} km
                </Text>
              </View>
              <View style={styles.consumoItem}>
                <Text style={styles.consumoLabel}>Média consumo</Text>
                <Text style={styles.consumoValue}>
                  {(abastecimento.kmPercorridos / abastecimento.litros).toFixed(2)} km/L
                </Text>
              </View>
            </View>
          )}

          <View style={styles.tagsContainer}>
            {abastecimento.tanqueCheio && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>Tanque Cheio</Text>
              </View>
            )}
            {abastecimento.chequeiCalibragem && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>Calibragem</Text>
              </View>
            )}
            {abastecimento.chequeiOleo && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>Óleo</Text>
              </View>
            )}
            {abastecimento.useiAditivo && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>Aditivo</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  date: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  posto: {
    fontSize: 14,
    color: colors.lightText,
    marginTop: 2,
  },
  valueContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  value: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  divider: {
    marginVertical: 12,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.lightText,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  consumoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  consumoItem: {
    alignItems: 'center',
  },
  consumoLabel: {
    fontSize: 12,
    color: colors.lightText,
  },
  consumoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    color: colors.text,
  },
}); 
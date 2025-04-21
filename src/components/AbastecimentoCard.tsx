import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Card, Divider, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Abastecimento } from '../types/abastecimento';
import { colors } from '../theme';

interface AbastecimentoCardProps {
  abastecimento: Abastecimento;
  abastecimentoAnterior?: Abastecimento | null;
  onPress?: (abastecimento: Abastecimento) => void;
  onEdit?: (abastecimento: Abastecimento) => void;
}

export const AbastecimentoCard: React.FC<AbastecimentoCardProps> = ({
  abastecimento,
  abastecimentoAnterior,
  onPress,
  onEdit,
}) => {
  // Calcular km percorridos se tiver abastecimento anterior
  const kmPercorridos = abastecimentoAnterior 
    ? abastecimento.kmAtual - abastecimentoAnterior.kmAtual
    : 0;
  
  // Calcular média de consumo
  const mediaConsumo = kmPercorridos > 0 ? kmPercorridos / abastecimento.litros : 0;
  
  // Calcular preço por Km
  const precoPorKm = kmPercorridos > 0 ? abastecimento.valorTotal / kmPercorridos : 0;

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatNumber = (value: number): string => {
    return Math.round(value).toLocaleString('pt-BR');
  };

  const handlePress = () => {
    if (onPress) {
      onPress(abastecimento);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(abastecimento);
    } else if (onPress) {
      // Se não tiver handler de edição específico, usa o handler de press
      onPress(abastecimento);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={{ marginBottom: 16 }}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View>
              <Text style={styles.date}>{formatDate(abastecimento.data)} {formatTime(abastecimento.data)}</Text>
              {abastecimento.posto && (
                <Text style={styles.posto}>{abastecimento.posto}</Text>
              )}
            </View>
            <View style={styles.headerActions}>
              <IconButton
                icon="pencil"
                size={20}
                onPress={handleEdit}
                style={styles.editButton}
              />
              <View style={styles.valueContainer}>
                <Text style={styles.value}>{formatCurrency(abastecimento.valorTotal)}</Text>
              </View>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <View style={styles.detailLabelContainer}>
                <Icon name="gas-station" size={14} color={colors.primary} style={styles.detailIcon} />
                <Text style={styles.detailLabel}>Litros</Text>
              </View>
              <Text style={styles.detailValue}>{abastecimento.litros.toFixed(2)}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <View style={styles.detailLabelContainer}>
                <Icon name="cash" size={14} color={colors.primary} style={styles.detailIcon} />
                <Text style={styles.detailLabel}>Preço/L</Text>
              </View>
              <Text style={styles.detailValue}>
                {formatCurrency(abastecimento.valorLitro)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailLabelContainer}>
                <Icon name="speedometer" size={14} color={colors.primary} style={styles.detailIcon} />
                <Text style={styles.detailLabel}>Km Atual</Text>
              </View>
              <Text style={styles.detailValue}>
                {formatNumber(abastecimento.kmAtual)} km
              </Text>
            </View>
          </View>

          {kmPercorridos > 0 && (
            <View style={styles.consumoContainer}>
              <View style={styles.consumoItem}>
                <View style={styles.consumoLabelContainer}>
                  <Icon name="road" size={14} color={colors.primary} style={styles.consumoIcon} />
                  <Text style={styles.consumoLabel}>Km percorridos</Text>
                </View>
                <Text style={styles.consumoValue}>
                  {formatNumber(kmPercorridos)} km
                </Text>
              </View>
              
              <View style={styles.consumoItem}>
                <View style={styles.consumoLabelContainer}>
                  <Icon name="fuel-cell" size={14} color={colors.primary} style={styles.consumoIcon} />
                  <Text style={styles.consumoLabel}>Média</Text>
                </View>
                <Text style={styles.consumoValue}>
                  {mediaConsumo.toFixed(2)} km/L
                </Text>
              </View>

              <View style={styles.consumoItem}>
                <View style={styles.consumoLabelContainer}>
                  <Icon name="cash-multiple" size={14} color={colors.primary} style={styles.consumoIcon} />
                  <Text style={styles.consumoLabel}>Preço/Km</Text>
                </View>
                <Text style={styles.consumoValue}>
                  {formatCurrency(precoPorKm)}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.tagsContainer}>
            {abastecimento.tanqueCheio && (
              <View style={styles.tag}>
                <Icon name="gas-station" size={12} color={colors.text} style={styles.tagIcon} />
                <Text style={styles.tagText}>Tanque Cheio</Text>
              </View>
            )}
            {abastecimento.chequeiCalibragem && (
              <View style={styles.tag}>
                <Icon name="car-tire-alert" size={12} color={colors.text} style={styles.tagIcon} />
                <Text style={styles.tagText}>Calibragem</Text>
              </View>
            )}
            {abastecimento.chequeiOleo && (
              <View style={styles.tag}>
                <Icon name="oil" size={12} color={colors.text} style={styles.tagIcon} />
                <Text style={styles.tagText}>Óleo</Text>
              </View>
            )}
            {abastecimento.useiAditivo && (
              <View style={styles.tag}>
                <Icon name="flask" size={12} color={colors.text} style={styles.tagIcon} />
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    marginRight: 4,
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
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  detailIcon: {
    marginRight: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.lightText,
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
    flex: 1,
  },
  consumoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  consumoIcon: {
    marginRight: 4,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagIcon: {
    marginRight: 4,
  },
  tagText: {
    fontSize: 12,
    color: colors.text,
  },
}); 
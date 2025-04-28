import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Card, Divider, IconButton, DataTable } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Abastecimento } from '../types/abastecimento';
import { useTheme } from '../context/ThemeContext';

interface AbastecimentoCardProps {
  abastecimento: Abastecimento;
  abastecimentoAnterior?: Abastecimento | null;
  abastecimentosAssociados?: Abastecimento[];
  consumoInfo?: {
    kmPercorridos: number;
    litrosConsumidos: number;
    mediaConsumo: number;
    precoPorKm: number;
  };
  onPress?: (abastecimento: Abastecimento) => void;
  onEdit?: (abastecimento: Abastecimento) => void;
}

export const AbastecimentoCard: React.FC<AbastecimentoCardProps> = ({
  abastecimento,
  abastecimentoAnterior,
  abastecimentosAssociados = [],
  consumoInfo,
  onPress,
  onEdit,
}) => {
  const { colors } = useTheme();
  
  // Usar os valores calculados de consumo se fornecidos, caso contrário calcular aqui
  const kmPercorridos = consumoInfo?.kmPercorridos || (abastecimentoAnterior 
    ? abastecimento.kmAtual - abastecimentoAnterior.kmAtual
    : 0);
  
  // Total de litros (incluindo abastecimentos associados)
  const totalLitros = consumoInfo?.litrosConsumidos || abastecimento.litros;
  
  // Média de consumo
  const mediaConsumo = consumoInfo?.mediaConsumo || (kmPercorridos > 0 ? kmPercorridos / totalLitros : 0);
  
  // Preço por km
  const valorTotal = abastecimento.valorTotal + 
    abastecimentosAssociados.reduce((total, item) => total + item.valorTotal, 0);
  const precoPorKm = consumoInfo?.precoPorKm || (kmPercorridos > 0 ? valorTotal / kmPercorridos : 0);

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

  // Definir estilos dentro do componente para usar colors
  const styles = StyleSheet.create({
    card: {
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 12,
      elevation: 4,
      backgroundColor: colors.card,
      borderWidth: abastecimento.tanqueCheio ? 2 : 0,
      borderColor: abastecimento.tanqueCheio ? colors.primary + '50' : 'transparent',
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
      fontWeight: 'bold',
      fontSize: 14,
      color: colors.text,
    },
    consumoContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 10,
      backgroundColor: colors.background,
      padding: 8,
      borderRadius: 8,
    },
    consumoItem: {
      alignItems: 'center',
      flex: 1,
    },
    consumoLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 2,
    },
    consumoIcon: {
      marginRight: 4,
    },
    consumoLabel: {
      fontSize: 12,
      color: colors.lightText,
    },
    consumoValue: {
      fontWeight: 'bold',
      fontSize: 14,
      color: colors.text,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 8,
      marginBottom: 8,
    },
    tagIcon: {
      marginRight: 4,
    },
    tagText: {
      fontSize: 12,
      color: colors.text,
    },
    abastecimentosAssociadosContainer: {
      marginTop: 12,
      marginBottom: 8,
    },
    abastecimentosAssociadosTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    dataTable: {
      backgroundColor: colors.background,
      borderRadius: 8,
    },
    tableHeader: {
      backgroundColor: colors.primary + '20',
    },
    tableHeaderText: {
      color: colors.text,
      fontWeight: 'bold',
      fontSize: 13,
    },
    tableCell: {
      color: colors.text,
      fontSize: 13,
    },
    totalRow: {
      backgroundColor: colors.primary + '15',
      fontWeight: 'bold',
    },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    tableEditButton: {
      padding: 0,
      margin: 0,
      width: 24,
      height: 24,
    },
  });

  return (
    <View style={{ marginBottom: 16 }}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View>
              <Text style={styles.date}>
                {formatDate(abastecimento.data)} {formatTime(abastecimento.data)}
                {abastecimento.tanqueCheio && " "}
                {abastecimento.tanqueCheio && (
                  <Icon name="check-circle" size={14} color={colors.primary} />
                )}
              </Text>
              {abastecimento.posto && (
                <Text style={styles.posto}>{abastecimento.posto}</Text>
              )}
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Mostrar dados de consumo no topo quando temos km percorridos */}
          {kmPercorridos > 0 && abastecimento.tanqueCheio && (
            <View style={[styles.consumoContainer, abastecimentosAssociados.length > 0 ? { backgroundColor: colors.primary + '15' } : {}]}>
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
                  <Text style={styles.consumoLabel}>
                    Média{abastecimentosAssociados.length > 0 ? " (total)" : ""}
                  </Text>
                </View>
                <Text style={[styles.consumoValue, { color: abastecimentosAssociados.length > 0 ? colors.primary : colors.text }]}>
                  {mediaConsumo.toFixed(2)} km/L
                </Text>
                {abastecimentosAssociados.length > 0 && (
                  <Text style={{ fontSize: 10, color: colors.primary }}>
                    Total: {totalLitros.toFixed(2)}L
                  </Text>
                )}
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
              
              <View style={styles.consumoItem}>
                <View style={styles.consumoLabelContainer}>
                  <Icon name="speedometer" size={14} color={colors.primary} style={styles.consumoIcon} />
                  <Text style={styles.consumoLabel}>Hodômetro</Text>
                </View>
                <Text style={styles.consumoValue}>
                  {formatNumber(abastecimento.kmAtual)} km
                </Text>
              </View>
            </View>
          )}
          
          {/* Tabela com todos os abastecimentos (principal + parciais) */}
          <View style={styles.abastecimentosAssociadosContainer}>
            <Text style={styles.abastecimentosAssociadosTitle}>
              {abastecimentosAssociados.length > 0 
                ? `Todos os Abastecimentos (${abastecimentosAssociados.length + 1})`
                : 'Detalhes do Abastecimento'}
            </Text>
            <DataTable style={styles.dataTable}>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title style={{ flex: 1.2 }}><Text style={styles.tableHeaderText}>Data</Text></DataTable.Title>
                <DataTable.Title numeric style={{ flex: 0.8 }}><Text style={styles.tableHeaderText}>Litros</Text></DataTable.Title>
                <DataTable.Title numeric style={{ flex: 1 }}><Text style={styles.tableHeaderText}>Preço/L</Text></DataTable.Title>
                <DataTable.Title numeric style={{ flex: 1 }}><Text style={styles.tableHeaderText}>Total</Text></DataTable.Title>
                <DataTable.Title style={{ flex: 1 }}><Text style={styles.tableHeaderText}>Tipo</Text></DataTable.Title>
                <DataTable.Title style={{ flex: 0.5 }}><Text style={styles.tableHeaderText}></Text></DataTable.Title>
              </DataTable.Header>

              {/* Primeiro, mostrar o abastecimento principal (tanque cheio) */}
              <DataTable.Row style={{ backgroundColor: colors.primary + '15' }}>
                <DataTable.Cell style={{ flex: 1.2 }}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{formatDate(abastecimento.data)}</Text>
                </DataTable.Cell>
                <DataTable.Cell numeric style={{ flex: 0.8 }}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{abastecimento.litros.toFixed(2)}</Text>
                </DataTable.Cell>
                <DataTable.Cell numeric style={{ flex: 1 }}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{formatCurrency(abastecimento.valorLitro)}</Text>
                </DataTable.Cell>
                <DataTable.Cell numeric style={{ flex: 1 }}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{formatCurrency(abastecimento.valorTotal)}</Text>
                </DataTable.Cell>
                <DataTable.Cell style={{ flex: 1 }}>
                  {abastecimento.tanqueCheio ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon name="gas-station" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                      <Text style={[styles.tableCell, { color: colors.primary, fontWeight: 'bold', fontSize: 12 }]}>Tanque Cheio</Text>
                    </View>
                  ) : (
                    <Text>-</Text>
                  )}
                </DataTable.Cell>
                <DataTable.Cell style={{ flex: 0.5 }}>
                  <IconButton
                    icon="pencil"
                    size={16}
                    iconColor={colors.primary}
                    style={styles.tableEditButton}
                    onPress={handleEdit}
                  />
                </DataTable.Cell>
              </DataTable.Row>

              {/* Depois, mostrar os abastecimentos parciais */}
              {abastecimentosAssociados.map((item) => (
                <DataTable.Row key={item.id}>
                  <DataTable.Cell style={{ flex: 1.2 }}>
                    <Text style={styles.tableCell}>{formatDate(item.data)}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell numeric style={{ flex: 0.8 }}>
                    <Text style={styles.tableCell}>{item.litros.toFixed(2)}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell numeric style={{ flex: 1 }}>
                    <Text style={styles.tableCell}>{formatCurrency(item.valorLitro)}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell numeric style={{ flex: 1 }}>
                    <Text style={styles.tableCell}>{formatCurrency(item.valorTotal)}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 1 }}>
                    <Text style={[styles.tableCell, { color: colors.lightText, fontSize: 12 }]}>Parcial</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 0.5 }}>
                    <IconButton
                      icon="pencil"
                      size={16}
                      iconColor={colors.primary}
                      style={styles.tableEditButton}
                      onPress={() => onEdit && onEdit(item)}
                    />
                  </DataTable.Cell>
                </DataTable.Row>
              ))}

              {/* Mostrar linha de total se houver abastecimentos parciais */}
              {abastecimentosAssociados.length > 0 && (
                <DataTable.Row style={[styles.totalRow, { backgroundColor: colors.primary + '25' }]}>
                  <DataTable.Cell style={{ flex: 1.2 }}>
                    <Text style={[styles.tableCell, {fontWeight: 'bold', color: colors.primary}]}>TOTAL</Text>
                  </DataTable.Cell>
                  <DataTable.Cell numeric style={{ flex: 0.8 }}>
                    <Text style={[styles.tableCell, {fontWeight: 'bold', color: colors.primary}]}>
                      {(abastecimentosAssociados.reduce((sum, item) => sum + item.litros, 0) + abastecimento.litros).toFixed(2)}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell numeric style={{ flex: 1 }}>
                    <Text style={[styles.tableCell, {fontWeight: 'bold', color: colors.primary}]}>-</Text>
                  </DataTable.Cell>
                  <DataTable.Cell numeric style={{ flex: 1 }}>
                    <Text style={[styles.tableCell, {fontWeight: 'bold', color: colors.primary}]}>
                      {formatCurrency(abastecimentosAssociados.reduce((sum, item) => sum + item.valorTotal, 0) + abastecimento.valorTotal)}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 1 }}>
                    <Text>-</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 0.5 }}>
                    <Text>-</Text>
                  </DataTable.Cell>
                </DataTable.Row>
              )}
            </DataTable>
          </View>

          {/* Área de tags para indicadores adicionais */}
          <View style={styles.tagsContainer}>
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
    </View>
  );
}; 
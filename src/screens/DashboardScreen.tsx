import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { ActivityIndicator, Card, FAB, IconButton, Menu, Text as PaperText } from 'react-native-paper';
import { getAbastecimentos, calculateMediaConsumo } from '../database/abastecimentoService';
import { Abastecimento } from '../types/abastecimento';
import { colors } from '../theme';
import { getVeiculoAtivo } from '../database/veiculoService';
import { Veiculo } from '../types/veiculo';
import { NovoAbastecimentoModal } from './NovoAbastecimentoModal';
import { EditarAbastecimentoModal } from './EditarAbastecimentoModal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '@react-navigation/native';
import { AbastecimentoCard } from '../components/AbastecimentoCard';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [abastecimentos, setAbastecimentos] = useState<Abastecimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [veiculoAtivo, setVeiculoAtivo] = useState<Veiculo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedAbastecimentoId, setSelectedAbastecimentoId] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [stats, setStats] = useState({
    mediaGeral: null as number | null,
    mediaUltimoAbastecimento: null as number | null,
    totalAbastecimentos: 0,
    totalGasto: 0,
    kmTotalPercorrido: 0,
    custoPorKm: null as number | null,
    mediaPrecoCombustivel: null as number | null,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar veículo ativo
      const veiculo = await getVeiculoAtivo();
      setVeiculoAtivo(veiculo);
      
      // Carregar abastecimentos
      const data = await getAbastecimentos();
      console.log('Abastecimentos carregados:', data.length);
      
      // Ordenar abastecimentos por data (mais recentes primeiro para exibição)
      const sortedDataDesc = [...data].sort((a, b) => b.data.getTime() - a.data.getTime());
      setAbastecimentos(sortedDataDesc);
      
      // Calcular estatísticas
      const mediaConsumo = await calculateMediaConsumo();
      
      // Calcular quilometragem total percorrida e custo por km (desconsiderando o primeiro abastecimento)
      let kmTotalPercorrido = 0;
      let custoPorKm = null;
      let mediaPrecoCombustivel = null;
      
      if (data.length >= 2) {
        // Ordenar por data crescente para cálculos de estatísticas
        const sortedDataAsc = [...data].sort((a, b) => a.data.getTime() - b.data.getTime());
        
        // Pegar o km do primeiro e do último abastecimento
        const primeiroKm = sortedDataAsc[0].kmAtual;
        const ultimoKm = sortedDataAsc[sortedDataAsc.length - 1].kmAtual;
        kmTotalPercorrido = ultimoKm - primeiroKm;
        
        // Calcular o total gasto excluindo o primeiro abastecimento
        const gastoExcluindoPrimeiro = sortedDataAsc.slice(1).reduce(
          (total, item) => total + item.valorTotal,
          0
        );
        
        // Calcular custo por km (apenas se houver quilometragem válida)
        if (kmTotalPercorrido > 0) {
          custoPorKm = gastoExcluindoPrimeiro / kmTotalPercorrido;
        }
        
        // Calcular a média do preço do combustível
        const totalPrecos = sortedDataAsc.reduce((sum, item) => sum + item.valorLitro, 0);
        mediaPrecoCombustivel = totalPrecos / sortedDataAsc.length;
      }
      
      // Calcular o total gasto incluindo todos os abastecimentos (para exibição)
      const totalGasto = data.reduce(
        (total, item) => total + item.valorTotal,
        0
      );
      
      setStats({
        mediaGeral: mediaConsumo.mediaGeral,
        mediaUltimoAbastecimento: mediaConsumo.ultimoAbastecimento,
        totalAbastecimentos: data.length,
        totalGasto,
        kmTotalPercorrido,
        custoPorKm,
        mediaPrecoCombustivel,
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatNumber = (value: number): string => {
    return Math.round(value).toLocaleString('pt-BR');
  };

  const handleAddPress = () => {
    console.log('Adicionar novo abastecimento');
    setModalVisible(true);
  };

  const handleModalDismiss = () => {
    setModalVisible(false);
  };
  
  const handleModalSuccess = () => {
    setModalVisible(false);
    loadData(); // Recarregar os dados após adicionar um novo abastecimento
  };

  const handleEditModalDismiss = () => {
    setEditModalVisible(false);
    setSelectedAbastecimentoId(null);
  };
  
  const handleEditModalSuccess = () => {
    setEditModalVisible(false);
    setSelectedAbastecimentoId(null);
    loadData(); // Recarregar os dados após editar um abastecimento
  };

  const handleSettingsPress = () => {
    console.log('Abrir configurações de veículos');
    navigation.navigate('Veiculos');
  };

  const handleItemPress = (item: Abastecimento) => {
    console.log('Selecionado abastecimento:', item.id);
    // Abrir modal de edição ao clicar no card
    setSelectedAbastecimentoId(item.id);
    setEditModalVisible(true);
  };

  const handleEditAbastecimento = (item: Abastecimento) => {
    console.log('Editar abastecimento:', item.id);
    setSelectedAbastecimentoId(item.id);
    setEditModalVisible(true);
  };

  const renderAbastecimentoItem = ({ item, index }: { item: Abastecimento; index: number }) => {
    // Obter o abastecimento posterior cronologicamente (que é o anterior no array,
    // já que a lista está ordenada dos mais recentes para os mais antigos)
    const abastecimentoAnterior = index < abastecimentos.length - 1 ? abastecimentos[index + 1] : null;
    
    return (
      <AbastecimentoCard
        abastecimento={item}
        abastecimentoAnterior={abastecimentoAnterior}
        onPress={handleItemPress}
        onEdit={handleEditAbastecimento}
      />
    );
  };

  const renderStatsCard = () => (
    <Card style={styles.statsCard}>
      <Card.Content>
        <Text style={styles.statsTitle}>Resumo de Desempenho</Text>
        
        {veiculoAtivo && (
          <View style={styles.veiculoAtivoContainer}>
            <Icon name="car" size={16} color={colors.primary} style={{marginRight: 6}} />
            <Text style={styles.veiculoAtivo}>
              {veiculoAtivo.apelido} ({veiculoAtivo.modelo})
            </Text>
          </View>
        )}
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Icon name="fuel-cell" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>
              {stats.mediaGeral ? `${stats.mediaGeral.toFixed(2)}` : '-'}
            </Text>
            <Text style={styles.statLabel}>Média Geral (km/L)</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Icon name="speedometer" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>
              {stats.mediaUltimoAbastecimento ? `${stats.mediaUltimoAbastecimento.toFixed(2)}` : '-'}
            </Text>
            <Text style={styles.statLabel}>Última Média (km/L)</Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Icon name="road" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>
              {stats.kmTotalPercorrido > 0 ? formatNumber(stats.kmTotalPercorrido) : '-'}
            </Text>
            <Text style={styles.statLabel}>Km Total Percorrido</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Icon name="cash" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{formatCurrency(stats.totalGasto)}</Text>
            <Text style={styles.statLabel}>Total Gasto</Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Icon name="gas-station" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{stats.totalAbastecimentos}</Text>
            <Text style={styles.statLabel}>Abastecimentos</Text>
          </View>
          
          {stats.kmTotalPercorrido > 0 && stats.custoPorKm !== null && (
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Icon name="currency-usd" size={24} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>
                {stats.custoPorKm.toFixed(2)}
              </Text>
              <Text style={styles.statLabel}>Custo por km (R$)</Text>
              <Text style={styles.statNote}>*Excluindo 1º abastecimento</Text>
            </View>
          )}
        </View>
        
        {stats.mediaPrecoCombustivel !== null && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Icon name="gas-station-outline" size={24} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>
                {formatCurrency(stats.mediaPrecoCombustivel)}
              </Text>
              <Text style={styles.statLabel}>Preço Médio/Litro</Text>
            </View>
            
            {abastecimentos.length > 0 && (
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Icon name="trending-up" size={24} color={colors.primary} />
                </View>
                <Text style={styles.statValue}>
                  {formatCurrency(abastecimentos[0].valorLitro)}
                </Text>
                <Text style={styles.statLabel}>Último Preço/Litro</Text>
                {stats.mediaPrecoCombustivel !== null && (
                  <View style={styles.precoVariacaoContainer}>
                    {abastecimentos[0].valorLitro > stats.mediaPrecoCombustivel ? (
                      <>
                        <Icon name="arrow-up-bold" size={14} color={colors.error || '#F44336'} />
                        <Text style={[styles.precoVariacaoText, {color: colors.error || '#F44336'}]}>
                          +{Math.round((abastecimentos[0].valorLitro / stats.mediaPrecoCombustivel - 1) * 100)}% da média
                        </Text>
                      </>
                    ) : abastecimentos[0].valorLitro < stats.mediaPrecoCombustivel ? (
                      <>
                        <Icon name="arrow-down-bold" size={14} color={colors.success || '#4CAF50'} />
                        <Text style={[styles.precoVariacaoText, {color: colors.success || '#4CAF50'}]}>
                          -{Math.round((1 - abastecimentos[0].valorLitro / stats.mediaPrecoCombustivel) * 100)}% da média
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.precoVariacaoText}>Igual à média</Text>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={24}
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item 
            onPress={() => {
              setMenuVisible(false);
              handleSettingsPress();
            }} 
            title="Configurações de veículos" 
            leadingIcon="car-settings"
          />
          <Menu.Item 
            onPress={() => {
              setMenuVisible(false);
              onRefresh();
            }} 
            title="Atualizar dados" 
            leadingIcon="refresh"
          />
          <Menu.Item 
            onPress={() => {
              setMenuVisible(false);
              handleAddPress();
            }} 
            title="Adicionar abastecimento" 
            leadingIcon="gas-station"
          />
        </Menu>
      </View>
      
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {renderStatsCard()}
        
        <Text style={styles.sectionTitle}>Histórico de Abastecimentos</Text>
        
        {abastecimentos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum abastecimento registrado.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {abastecimentos.map((item, index) => (
              <View key={item.id}>
                {renderAbastecimentoItem({ item, index })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      
      <FAB
        style={styles.fabAdd}
        icon="plus"
        color={colors.white}
        onPress={handleAddPress}
      />
      
      <FAB
        style={styles.fabSettings}
        icon="car-settings"
        color={colors.white}
        onPress={handleSettingsPress}
      />

      <NovoAbastecimentoModal
        visible={modalVisible}
        onDismiss={handleModalDismiss}
        onSuccess={handleModalSuccess}
      />

      <EditarAbastecimentoModal
        visible={editModalVisible}
        abastecimentoId={selectedAbastecimentoId}
        onDismiss={handleEditModalDismiss}
        onSuccess={handleEditModalSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    margin: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    margin: 16,
    marginBottom: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.lightText,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    marginBottom: 12,
    borderRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  editButton: {
    marginLeft: 8,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.text,
    textAlign: 'center',
  },
  veiculoAtivoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  veiculoAtivo: {
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    padding: 8,
  },
  statIconContainer: {
    marginBottom: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.lightText,
    textAlign: 'center',
  },
  statNote: {
    fontSize: 12,
    color: colors.lightText,
    textAlign: 'center',
  },
  fabAdd: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  fabSettings: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 72, // Posicionar acima do outro FAB
    backgroundColor: colors.secondary || '#6200ee',
  },
  precoVariacaoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  precoVariacaoText: {
    fontSize: 12,
    marginLeft: 2,
  },
}); 
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { ActivityIndicator, Card, FAB, IconButton, Menu, Text as PaperText } from 'react-native-paper';
import { getAbastecimentos, calculateMediaConsumo, calcularConsumoEntreTanquesCheios } from '../database/abastecimentoService';
import { Abastecimento } from '../types/abastecimento';
import { getVeiculoAtivo } from '../database/veiculoService';
import { Veiculo } from '../types/veiculo';
import { NovoAbastecimentoModal } from './NovoAbastecimentoModal';
import { EditarAbastecimentoModal } from './EditarAbastecimentoModal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { AbastecimentoCard } from '../components/AbastecimentoCard';

interface DashboardScreenProps {
  navigation: any;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 16,
    marginBottom: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
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
    margin: 16,
    borderRadius: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  veiculoAtivoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  veiculoAtivo: {
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  statNote: {
    fontSize: 12,
    textAlign: 'center',
  },
  fabAdd: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  fabSettings: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 72,
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

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { colors, theme, setTheme } = useTheme();
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

  const renderStatsCard = () => {
    return (
      <Card style={[styles.statsCard, { backgroundColor: colors.card }]}>
        <Card.Content>
          <Text style={[styles.statsTitle, { color: colors.text }]}>Resumo de Desempenho</Text>
          
          {veiculoAtivo && (
            <View style={styles.veiculoAtivoContainer}>
              <Icon name="car" size={16} color={colors.primary} style={{marginRight: 6}} />
              <Text style={[styles.veiculoAtivo, { color: colors.text }]}>
                {veiculoAtivo.apelido} ({veiculoAtivo.modelo})
              </Text>
            </View>
          )}
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Icon name="fuel-cell" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {stats.mediaGeral ? `${stats.mediaGeral.toFixed(2)}` : '-'}
              </Text>
              <Text style={[styles.statLabel, { color: colors.lightText }]}>Média Geral (km/L)</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Icon name="speedometer" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {stats.mediaUltimoAbastecimento ? `${stats.mediaUltimoAbastecimento.toFixed(2)}` : '-'}
              </Text>
              <Text style={[styles.statLabel, { color: colors.lightText }]}>Última Média (km/L)</Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Icon name="road" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {stats.kmTotalPercorrido > 0 ? formatNumber(stats.kmTotalPercorrido) : '-'}
              </Text>
              <Text style={[styles.statLabel, { color: colors.lightText }]}>Km Total Percorrido</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Icon name="cash" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.primary }]}>{formatCurrency(stats.totalGasto)}</Text>
              <Text style={[styles.statLabel, { color: colors.lightText }]}>Total Gasto</Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Icon name="gas-station" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.primary }]}>{stats.totalAbastecimentos}</Text>
              <Text style={[styles.statLabel, { color: colors.lightText }]}>Abastecimentos</Text>
            </View>
            
            {stats.kmTotalPercorrido > 0 && stats.custoPorKm !== null && (
              <View style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '15' }]}>
                  <Icon name="currency-usd" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {stats.custoPorKm.toFixed(2)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.lightText }]}>Custo por km (R$)</Text>
                <Text style={[styles.statNote, { color: colors.lightText }]}>*Excluindo 1º abastecimento</Text>
              </View>
            )}
          </View>
          
          {stats.mediaPrecoCombustivel !== null && (
            <View style={styles.statsRow}>
              <View style={[styles.statItem, { backgroundColor: colors.primary + '15' }]}>
                <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '15' }]}>
                  <Icon name="gas-station-outline" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {formatCurrency(stats.mediaPrecoCombustivel)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.lightText }]}>Preço Médio/Litro</Text>
              </View>
              
              {abastecimentos.length > 0 && (
                <View style={[styles.statItem, { backgroundColor: colors.primary + '15' }]}>
                  <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '15' }]}>
                    <Icon name="trending-up" size={24} color={colors.primary} />
                  </View>
                  <Text style={[styles.statValue, { color: colors.primary }]}>
                    {formatCurrency(abastecimentos[0].valorLitro)}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.lightText }]}>Último Preço/Litro</Text>
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
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setMenuVisible(false);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return 'weather-sunny';
      case 'dark':
        return 'weather-night';
      default:
        return 'theme-light-dark';
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Dashboard</Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={24}
              onPress={() => setMenuVisible(true)}
              iconColor={colors.text}
            />
          }
        >
          <Menu.Item
            onPress={() => handleThemeChange('light')}
            title="Tema Claro"
            leadingIcon="weather-sunny"
          />
          <Menu.Item
            onPress={() => handleThemeChange('dark')}
            title="Tema Escuro"
            leadingIcon="weather-night"
          />
          <Menu.Item
            onPress={() => handleThemeChange('system')}
            title="Seguir Sistema"
            leadingIcon="theme-light-dark"
          />
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
              navigation.navigate('Configuracoes');
            }}
            title="Configurações"
            leadingIcon="cog"
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
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Histórico de Abastecimentos
        </Text>
        
        {abastecimentos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.lightText }]}>
              Nenhum abastecimento registrado.
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {/* Mostrar APENAS abastecimentos de tanque cheio como cards principais */}
            {abastecimentos
              .filter(a => a.tanqueCheio) // Filtrar apenas tanque cheio
              .map((item) => {
                // Encontrar o abastecimento de tanque cheio anterior, se existir
                const abastecimentosTanqueCheio = abastecimentos
                  .filter(a => a.tanqueCheio)
                  .sort((a, b) => b.data.getTime() - a.data.getTime()); // Ordenar por data decrescente
                
                const currentIndex = abastecimentosTanqueCheio.findIndex(a => a.id === item.id);
                const abastecimentoAnterior = currentIndex >= 0 && currentIndex < abastecimentosTanqueCheio.length - 1 ? 
                  abastecimentosTanqueCheio[currentIndex + 1] : null;
                
                // Encontrar todos os abastecimentos parciais entre este tanque cheio e o anterior
                const abastecimentosAssociados = abastecimentoAnterior ?
                  abastecimentos.filter(a => 
                    !a.tanqueCheio && 
                    a.data < item.data && 
                    a.data > abastecimentoAnterior.data
                  ).sort((a, b) => a.data.getTime() - b.data.getTime()) // Ordenar por data crescente
                  : [];
                
                // Calcular métricas de consumo para abastecimentos de tanque cheio
                let consumoInfo = undefined;
                
                if (abastecimentoAnterior) {
                  const kmPercorridos = item.kmAtual - abastecimentoAnterior.kmAtual;
                  const litrosConsumidos = item.litros + 
                    abastecimentosAssociados.reduce((total, a) => total + a.litros, 0);
                  const mediaConsumo = kmPercorridos > 0 ? kmPercorridos / litrosConsumidos : 0;
                  const valorTotal = item.valorTotal + 
                    abastecimentosAssociados.reduce((total, a) => total + a.valorTotal, 0);
                  const precoPorKm = kmPercorridos > 0 ? valorTotal / kmPercorridos : 0;
                  
                  consumoInfo = {
                    kmPercorridos,
                    litrosConsumidos,
                    mediaConsumo,
                    precoPorKm
                  };
                }
                
                return (
                  <AbastecimentoCard
                    key={item.id}
                    abastecimento={item}
                    abastecimentoAnterior={abastecimentoAnterior}
                    abastecimentosAssociados={abastecimentosAssociados}
                    consumoInfo={consumoInfo}
                    onPress={handleItemPress}
                    onEdit={handleEditAbastecimento}
                  />
                );
              })}
          </View>
        )}
      </ScrollView>
      
      <FAB
        style={[styles.fabAdd, { backgroundColor: colors.primary }]}
        icon="plus"
        color={colors.white}
        onPress={handleAddPress}
      />
      
      <FAB
        style={[styles.fabSettings, { backgroundColor: colors.secondary }]}
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
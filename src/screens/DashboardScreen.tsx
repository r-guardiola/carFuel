import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ScrollView } from 'react-native';
import { ActivityIndicator, Card, FAB } from 'react-native-paper';
import { getAbastecimentos, calculateMediaConsumo } from '../database/abastecimentoService';
import { Abastecimento } from '../types/abastecimento';
import { colors } from '../theme';
import { getVeiculoAtivo } from '../database/veiculoService';
import { Veiculo } from '../types/veiculo';
import { NovoAbastecimentoModal } from './NovoAbastecimentoModal';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [abastecimentos, setAbastecimentos] = useState<Abastecimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [veiculoAtivo, setVeiculoAtivo] = useState<Veiculo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [stats, setStats] = useState({
    mediaGeral: null as number | null,
    mediaUltimoAbastecimento: null as number | null,
    totalAbastecimentos: 0,
    totalGasto: 0,
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
      setAbastecimentos(data);
      
      // Calcular estatísticas
      const mediaConsumo = await calculateMediaConsumo();
      
      const totalGasto = data.reduce(
        (total, item) => total + item.valorTotal,
        0
      );
      
      setStats({
        mediaGeral: mediaConsumo.mediaGeral,
        mediaUltimoAbastecimento: mediaConsumo.ultimoAbastecimento,
        totalAbastecimentos: data.length,
        totalGasto,
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSettingsPress = () => {
    console.log('Abrir configurações de veículos');
    navigation.navigate('Veiculos');
  };

  const handleItemPress = (item: Abastecimento) => {
    console.log('Selecionado abastecimento:', item.id);
    // Aqui você adicionaria a navegação para a tela de detalhes
    // navigation.navigate('DetalhesAbastecimento', { id: item.id });
  };

  const renderAbastecimentoItem = ({ item }: { item: Abastecimento }) => (
    <Card 
      style={styles.card}
      onPress={() => handleItemPress(item)}
    >
      <Card.Content>
        <Text style={styles.cardDate}>{formatDate(item.data)}</Text>
        <View style={styles.cardRow}>
          <Text>Litros: {item.litros.toFixed(2)}</Text>
          <Text>Valor: {formatCurrency(item.valorTotal)}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text>Km Atual: {item.kmAtual.toFixed(1)}</Text>
          {item.kmPercorridos && (
            <Text>Média: {(item.kmPercorridos / item.litros).toFixed(2)} km/L</Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderStatsCard = () => (
    <Card style={styles.statsCard}>
      <Card.Content>
        <Text style={styles.statsTitle}>Resumo de Desempenho</Text>
        
        {veiculoAtivo && (
          <Text style={styles.veiculoAtivo}>
            {veiculoAtivo.apelido} ({veiculoAtivo.modelo})
          </Text>
        )}
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats.mediaGeral ? `${stats.mediaGeral.toFixed(2)}` : '-'}
            </Text>
            <Text style={styles.statLabel}>Média Geral (km/L)</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats.mediaUltimoAbastecimento ? `${stats.mediaUltimoAbastecimento.toFixed(2)}` : '-'}
            </Text>
            <Text style={styles.statLabel}>Última Média (km/L)</Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalAbastecimentos}</Text>
            <Text style={styles.statLabel}>Abastecimentos</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatCurrency(stats.totalGasto)}</Text>
            <Text style={styles.statLabel}>Total Gasto</Text>
          </View>
        </View>
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
      <ScrollView>
        <Text style={styles.title}>Dashboard</Text>
        
        {renderStatsCard()}
        
        <Text style={styles.sectionTitle}>Histórico de Abastecimentos</Text>
        
        {abastecimentos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum abastecimento registrado.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {abastecimentos.map(item => (
              <View key={item.id}>
                {renderAbastecimentoItem({ item })}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  veiculoAtivo: {
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 12,
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
}); 
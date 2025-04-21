import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import { ActivityIndicator, Button, Card, Dialog, FAB, IconButton, Portal, TextInput, RadioButton } from 'react-native-paper';
import { colors } from '../theme';
import { Veiculo } from '../types/veiculo';
import { deleteVeiculo, getVeiculos, saveVeiculo, setVeiculoAtivo } from '../database/veiculoService';
import { TipoCombustivel } from '../types/configuracao';

interface VeiculosScreenProps {
  navigation: any;
}

export const VeiculosScreen: React.FC<VeiculosScreenProps> = ({ navigation }) => {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [editingVeiculo, setEditingVeiculo] = useState<Partial<Veiculo>>({});

  // Estado dos campos do formulário
  const [apelido, setApelido] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [cor, setCor] = useState('');
  const [tipoCombustivel, setTipoCombustivel] = useState<TipoCombustivel>('gasolina');
  const [tanqueCapacidade, setTanqueCapacidade] = useState('');

  const hideDialog = () => setVisible(false);

  const loadVeiculos = async () => {
    try {
      setLoading(true);
      const data = await getVeiculos();
      setVeiculos(data);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de veículos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVeiculos();
  }, []);

  const handleAddPress = () => {
    // Limpa os campos para adicionar um novo veículo
    setEditingVeiculo({});
    setApelido('');
    setModelo('');
    setAno('');
    setCor('');
    setTipoCombustivel('gasolina');
    setTanqueCapacidade('');
    setVisible(true);
  };

  const handleEditPress = (veiculo: Veiculo) => {
    // Preenche os campos com os dados do veículo para edição
    setEditingVeiculo(veiculo);
    setApelido(veiculo.apelido);
    setModelo(veiculo.modelo);
    setAno(veiculo.ano.toString());
    setCor(veiculo.cor);
    setTipoCombustivel(veiculo.tipoCombustivel);
    setTanqueCapacidade(veiculo.tanqueCapacidade.toString());
    setVisible(true);
  };

  const handleSave = async () => {
    try {
      // Validação básica
      if (!apelido || !modelo || !ano || !cor || !tanqueCapacidade) {
        Alert.alert('Erro', 'Todos os campos são obrigatórios.');
        return;
      }

      const anoNum = parseInt(ano, 10);
      if (isNaN(anoNum) || anoNum < 1900 || anoNum > new Date().getFullYear() + 1) {
        Alert.alert('Erro', 'Ano inválido.');
        return;
      }

      const capacidadeNum = parseFloat(tanqueCapacidade);
      if (isNaN(capacidadeNum) || capacidadeNum <= 0) {
        Alert.alert('Erro', 'Capacidade do tanque inválida.');
        return;
      }

      // Verificar se a lista de veículos está vazia (primeiro veículo)
      const isFirstVeiculo = veiculos.length === 0 && !editingVeiculo.id;

      const veiculoData = {
        ...(editingVeiculo.id ? { id: editingVeiculo.id } : {}),
        apelido,
        modelo,
        ano: anoNum,
        cor,
        tipoCombustivel,
        tanqueCapacidade: capacidadeNum,
        isAtivo: isFirstVeiculo ? true : (editingVeiculo.isAtivo || false)
      };

      const savedVeiculo = await saveVeiculo(veiculoData);
      
      // Se for o primeiro veículo, definir como ativo
      if (isFirstVeiculo) {
        await setVeiculoAtivo(savedVeiculo.id);
      }
      
      hideDialog();
      await loadVeiculos();
      
      // Se for o primeiro veículo, redirecionar para o Dashboard
      if (isFirstVeiculo) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      }
    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
      Alert.alert('Erro', 'Não foi possível salvar o veículo.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      Alert.alert(
        'Confirmar exclusão',
        'Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Excluir', 
            style: 'destructive',
            onPress: async () => {
              await deleteVeiculo(id);
              await loadVeiculos();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao excluir veículo:', error);
      Alert.alert('Erro', 'Não foi possível excluir o veículo.');
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      await setVeiculoAtivo(id);
      await loadVeiculos();
      
      // Redirecionar para o Dashboard após definir o veículo como ativo
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (error) {
      console.error('Erro ao definir veículo ativo:', error);
      Alert.alert('Erro', 'Não foi possível definir o veículo como ativo.');
    }
  };

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
        <Text style={styles.title}>Meus Veículos</Text>
        
        {veiculos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum veículo cadastrado.</Text>
          </View>
        ) : (
          veiculos.map(veiculo => (
            <Card 
              key={veiculo.id}
              style={[styles.card, veiculo.isAtivo === true && styles.activeCard]}
              onPress={() => handleEditPress(veiculo)}
            >
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{veiculo.apelido}</Text>
                  {veiculo.isAtivo === true && (
                    <Text style={styles.activeTag}>Ativo</Text>
                  )}
                </View>
                
                <Text style={styles.cardModel}>{veiculo.modelo} ({veiculo.ano})</Text>
                
                <View style={styles.cardRow}>
                  <Text>Cor: {veiculo.cor}</Text>
                  <Text>Combustível: {veiculo.tipoCombustivel.charAt(0).toUpperCase() + veiculo.tipoCombustivel.slice(1)}</Text>
                </View>
                
                <Text>Capacidade do tanque: {veiculo.tanqueCapacidade}L</Text>
                
                <View style={styles.cardActions}>
                  <Button 
                    mode="contained" 
                    onPress={() => handleSetActive(veiculo.id)}
                    disabled={veiculo.isAtivo === true}
                    style={styles.actionButton}
                  >
                    Definir como ativo
                  </Button>
                  
                  <IconButton
                    icon="delete"
                    iconColor={colors.error}
                    size={24}
                    onPress={() => handleDelete(veiculo.id)}
                  />
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
      
      <FAB
        style={styles.fab}
        icon="plus"
        color={colors.white}
        onPress={handleAddPress}
      />
      
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>
            {editingVeiculo.id ? 'Editar Veículo' : 'Novo Veículo'}
          </Dialog.Title>
          
          <Dialog.Content>
            <TextInput
              label="Apelido"
              value={apelido}
              onChangeText={setApelido}
              style={styles.input}
            />
            
            <TextInput
              label="Modelo"
              value={modelo}
              onChangeText={setModelo}
              style={styles.input}
            />
            
            <TextInput
              label="Ano"
              value={ano}
              onChangeText={setAno}
              keyboardType="numeric"
              style={styles.input}
            />
            
            <TextInput
              label="Cor"
              value={cor}
              onChangeText={setCor}
              style={styles.input}
            />
            
            <Text style={styles.sectionTitle}>Tipo de Combustível</Text>
            <RadioButton.Group
              onValueChange={(value: string) => setTipoCombustivel(value as TipoCombustivel)}
              value={tipoCombustivel}
            >
              <View style={styles.radioButtonContainer}>
                <RadioButton.Item 
                  label="Gasolina" 
                  value="gasolina" 
                  labelStyle={styles.radioLabel}
                  style={styles.radioItem}
                />
                <RadioButton.Item 
                  label="Álcool" 
                  value="alcool" 
                  labelStyle={styles.radioLabel}
                  style={styles.radioItem}
                />
                <RadioButton.Item 
                  label="Flex" 
                  value="flex" 
                  labelStyle={styles.radioLabel}
                  style={styles.radioItem}
                />
                <RadioButton.Item 
                  label="Diesel" 
                  value="diesel" 
                  labelStyle={styles.radioLabel}
                  style={styles.radioItem}
                />
              </View>
            </RadioButton.Group>
            
            <TextInput
              label="Capacidade do Tanque (L)"
              value={tanqueCapacidade}
              onChangeText={setTanqueCapacidade}
              keyboardType="numeric"
              style={styles.input}
            />
          </Dialog.Content>
          
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancelar</Button>
            <Button onPress={handleSave}>Salvar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.lightText,
    textAlign: 'center',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  activeCard: {
    borderLeftWidth: 5,
    borderLeftColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  activeTag: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
  },
  cardModel: {
    fontSize: 16,
    marginBottom: 8,
    color: colors.text,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    marginRight: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  input: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  radioButtonContainer: {
    flexDirection: 'column',
  },
  radioLabel: {
    fontSize: 16,
    color: colors.text,
  },
  radioItem: {
    marginVertical: 0,
    paddingVertical: 4,
  },
}); 
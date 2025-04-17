import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import { Button, Dialog, Portal, TextInput, Switch, Modal, ActivityIndicator, Checkbox, RadioButton } from 'react-native-paper';
import { colors } from '../theme';
import { Abastecimento } from '../types/abastecimento';
import { TipoCombustivel } from '../types/configuracao';
import { insertAbastecimento, getAbastecimentos } from '../database/abastecimentoService';
import { getVeiculoAtivo } from '../database/veiculoService';
import { Veiculo } from '../types/veiculo';

interface NovoAbastecimentoModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess: () => void;
}

export const NovoAbastecimentoModal: React.FC<NovoAbastecimentoModalProps> = ({
  visible,
  onDismiss,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [veiculoAtivo, setVeiculoAtivo] = useState<Veiculo | null>(null);

  // Campos do formulário
  const [data, setData] = useState<Date>(new Date());
  const [valorLitro, setValorLitro] = useState('');
  const [litros, setLitros] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [kmAtual, setKmAtual] = useState('');
  const [posto, setPosto] = useState('');
  const [tanqueCheio, setTanqueCheio] = useState(true);
  const [chequeiCalibragem, setChequeiCalibragem] = useState(false);
  const [chequeiOleo, setChequeiOleo] = useState(false);
  const [useiAditivo, setUseiAditivo] = useState(false);
  const [observacoes, setObservacoes] = useState('');

  // Últimos valores registrados
  const [ultimoKm, setUltimoKm] = useState<number | null>(null);

  useEffect(() => {
    const carregarVeiculo = async () => {
      try {
        const veiculo = await getVeiculoAtivo();
        setVeiculoAtivo(veiculo);
      } catch (error) {
        console.error('Erro ao carregar veículo ativo:', error);
      }
    };

    carregarVeiculo();
  }, []);

  // Buscar o último KM registrado
  useEffect(() => {
    const carregarUltimoKm = async () => {
      try {
        const abastecimentos = await getAbastecimentos();
        if (abastecimentos.length > 0) {
          // Ordenar por data decrescente para pegar o mais recente
          const ultimoAbastecimento = abastecimentos[0];
          setUltimoKm(ultimoAbastecimento.kmAtual);
        }
      } catch (error) {
        console.error('Erro ao carregar último km:', error);
      }
    };

    if (visible) {
      carregarUltimoKm();
    }
  }, [visible]);

  // Atualiza o valor total quando o valor do litro ou a quantidade de litros muda
  useEffect(() => {
    if (valorLitro && litros) {
      const total = parseFloat(valorLitro) * parseFloat(litros);
      setValorTotal(total.toFixed(2));
    }
  }, [valorLitro, litros]);

  // Atualiza a quantidade de litros quando o valor total e o valor do litro mudam
  useEffect(() => {
    if (valorTotal && valorLitro && parseFloat(valorLitro) > 0) {
      const litrosCalculados = parseFloat(valorTotal) / parseFloat(valorLitro);
      setLitros(litrosCalculados.toFixed(2));
    }
  }, [valorTotal, valorLitro]);

  const limparFormulario = () => {
    setData(new Date());
    setValorLitro('');
    setLitros('');
    setValorTotal('');
    setKmAtual('');
    setPosto('');
    setTanqueCheio(true);
    setChequeiCalibragem(false);
    setChequeiOleo(false);
    setUseiAditivo(false);
    setObservacoes('');
  };

  const handleSave = async () => {
    try {
      // Validação básica
      if (!valorLitro || !litros || !valorTotal || !kmAtual) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
        return;
      }

      if (!veiculoAtivo) {
        Alert.alert('Erro', 'Nenhum veículo ativo encontrado. Por favor, cadastre um veículo antes de adicionar abastecimentos.');
        return;
      }

      const kmAtualNumber = parseFloat(kmAtual);
      
      // Validar se o KM atual é maior que o último registrado
      if (ultimoKm !== null && kmAtualNumber <= ultimoKm) {
        Alert.alert(
          'Atenção', 
          `O KM atual (${kmAtualNumber}) deve ser maior que o último registrado (${ultimoKm})`
        );
        return;
      }

      setLoading(true);

      const litrosNumber = parseFloat(litros);
      const valorLitroNumber = parseFloat(valorLitro);
      const valorTotalNumber = parseFloat(valorTotal);

      // Calcular km percorridos (se aplicável)
      let kmPercorridos: number | undefined = undefined;
      if (ultimoKm !== null && kmAtualNumber > ultimoKm) {
        kmPercorridos = kmAtualNumber - ultimoKm;
      }

      // Criar o objeto abastecimento
      const novoAbastecimento: Omit<Abastecimento, 'id' | 'createdAt' | 'updatedAt' | 'veiculoId'> = {
        data: data,
        valorLitro: valorLitroNumber,
        litros: litrosNumber,
        valorTotal: valorTotalNumber,
        tipoCombustivel: veiculoAtivo.tipoCombustivel,
        kmAtual: kmAtualNumber,
        kmPercorridos: kmPercorridos,
        posto: posto || undefined,
        tanqueCheio: tanqueCheio,
        chequeiCalibragem: chequeiCalibragem,
        chequeiOleo: chequeiOleo,
        useiAditivo: useiAditivo,
        observacoes: observacoes || undefined
      };

      await insertAbastecimento(novoAbastecimento);
      
      limparFormulario();
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar abastecimento:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar o abastecimento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView style={styles.scrollView}>
          <Text style={styles.title}>Novo Abastecimento</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Salvando...</Text>
            </View>
          ) : (
            <View style={styles.form}>
              <TextInput
                label="Data"
                value={data.toLocaleDateString('pt-BR')}
                disabled
                style={styles.input}
              />
              
              <TextInput
                label="Valor por Litro (R$)"
                value={valorLitro}
                onChangeText={setValorLitro}
                keyboardType="decimal-pad"
                style={styles.input}
              />
              
              <TextInput
                label="Litros"
                value={litros}
                onChangeText={setLitros}
                keyboardType="decimal-pad"
                style={styles.input}
              />
              
              <TextInput
                label="Valor Total (R$)"
                value={valorTotal}
                onChangeText={setValorTotal}
                keyboardType="decimal-pad"
                style={styles.input}
              />
              
              {veiculoAtivo && (
                <Text style={styles.infoText}>
                  Tipo de combustível: {veiculoAtivo.tipoCombustivel.charAt(0).toUpperCase() + veiculoAtivo.tipoCombustivel.slice(1)}
                </Text>
              )}
              
              <TextInput
                label="Km Atual do Veículo"
                value={kmAtual}
                onChangeText={setKmAtual}
                keyboardType="decimal-pad"
                style={styles.input}
              />
              
              {ultimoKm !== null && (
                <Text style={styles.infoText}>
                  Último KM registrado: {ultimoKm} | Distância: {kmAtual ? (parseFloat(kmAtual) - ultimoKm).toFixed(1) : '0'} km
                </Text>
              )}
              
              <TextInput
                label="Posto (opcional)"
                value={posto}
                onChangeText={setPosto}
                style={styles.input}
              />
              
              <View style={styles.checkboxContainer}>
                <Checkbox.Item
                  label="Tanque Cheio"
                  status={tanqueCheio ? 'checked' : 'unchecked'}
                  onPress={() => setTanqueCheio(!tanqueCheio)}
                  style={styles.checkbox}
                />
                
                <Checkbox.Item
                  label="Chequei Calibragem"
                  status={chequeiCalibragem ? 'checked' : 'unchecked'}
                  onPress={() => setChequeiCalibragem(!chequeiCalibragem)}
                  style={styles.checkbox}
                />
                
                <Checkbox.Item
                  label="Chequei Óleo"
                  status={chequeiOleo ? 'checked' : 'unchecked'}
                  onPress={() => setChequeiOleo(!chequeiOleo)}
                  style={styles.checkbox}
                />
                
                <Checkbox.Item
                  label="Usei Aditivo"
                  status={useiAditivo ? 'checked' : 'unchecked'}
                  onPress={() => setUseiAditivo(!useiAditivo)}
                  style={styles.checkbox}
                />
              </View>
              
              <TextInput
                label="Observações (opcional)"
                value={observacoes}
                onChangeText={setObservacoes}
                multiline
                numberOfLines={4}
                style={styles.input}
              />
              
              <View style={styles.buttonContainer}>
                <Button 
                  mode="outlined" 
                  onPress={onDismiss} 
                  style={styles.cancelButton}
                >
                  Cancelar
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handleSave} 
                  style={styles.saveButton}
                >
                  Salvar
                </Button>
              </View>
            </View>
          )}
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: colors.background,
    margin: 20,
    borderRadius: 8,
    maxHeight: '90%'
  },
  scrollView: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
    backgroundColor: colors.background,
  },
  checkboxContainer: {
    marginVertical: 8,
  },
  checkbox: {
    paddingVertical: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
  },
  infoText: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: -4,
    marginBottom: 16,
  },
}); 
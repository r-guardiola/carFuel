import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, Platform, TouchableOpacity } from 'react-native';
import { Button, Dialog, Portal, TextInput, Modal, ActivityIndicator, Checkbox, IconButton } from 'react-native-paper';
import { colors } from '../theme';
import { Abastecimento } from '../types/abastecimento';
import { getAbastecimentoById, updateAbastecimento } from '../database/abastecimentoService';
import { getVeiculoAtivo } from '../database/veiculoService';
import { Veiculo } from '../types/veiculo';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EditarAbastecimentoModalProps {
  visible: boolean;
  abastecimentoId: string | null;
  onDismiss: () => void;
  onSuccess: () => void;
}

export const EditarAbastecimentoModal: React.FC<EditarAbastecimentoModalProps> = ({
  visible,
  abastecimentoId,
  onDismiss,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [veiculoAtivo, setVeiculoAtivo] = useState<Veiculo | null>(null);
  const [abastecimento, setAbastecimento] = useState<Abastecimento | null>(null);

  // Campos do formulário
  const [data, setData] = useState<Date>(new Date());
  const [dateString, setDateString] = useState(format(new Date(), 'dd/MM/yyyy', { locale: ptBR }));
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
  
  // Estado para controle do Date Picker
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Função para formatar números com separador de milhares
  const formatNumber = (value: number): string => {
    return Math.round(value).toLocaleString('pt-BR');
  };

  // Carregar veículo ativo
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

  // Carregar dados do abastecimento quando o ID mudar
  useEffect(() => {
    const carregarAbastecimento = async () => {
      if (!abastecimentoId) return;
      
      try {
        setLoadingData(true);
        const data = await getAbastecimentoById(abastecimentoId);
        
        if (data) {
          setAbastecimento(data);
          
          // Preencher os campos do formulário
          setData(data.data);
          setDateString(format(data.data, 'dd/MM/yyyy', { locale: ptBR }));
          setValorLitro(data.valorLitro.toString());
          setLitros(data.litros.toString());
          setValorTotal(data.valorTotal.toString());
          setKmAtual(data.kmAtual.toString());
          setPosto(data.posto || '');
          setTanqueCheio(data.tanqueCheio);
          setChequeiCalibragem(data.chequeiCalibragem);
          setChequeiOleo(data.chequeiOleo);
          setUseiAditivo(data.useiAditivo);
          setObservacoes(data.observacoes || '');
        }
      } catch (error) {
        console.error('Erro ao carregar abastecimento:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados do abastecimento');
        onDismiss();
      } finally {
        setLoadingData(false);
      }
    };

    if (visible && abastecimentoId) {
      carregarAbastecimento();
    }
  }, [visible, abastecimentoId]);

  // Funções para calcular os valores sem causar loop
  const calcularValorTotal = (novoValorLitro: string, novosLitros: string) => {
    try {
      const valorLitroNum = parseFloat(novoValorLitro);
      const litrosNum = parseFloat(novosLitros);
      if (!isNaN(valorLitroNum) && !isNaN(litrosNum)) {
        return (valorLitroNum * litrosNum).toFixed(2);
      }
    } catch (error) {
      console.error('Erro ao calcular valor total:', error);
    }
    return valorTotal;
  };

  const calcularLitros = (novoValorTotal: string, novoValorLitro: string) => {
    try {
      const valorTotalNum = parseFloat(novoValorTotal);
      const valorLitroNum = parseFloat(novoValorLitro);
      if (!isNaN(valorTotalNum) && !isNaN(valorLitroNum) && valorLitroNum > 0) {
        return (valorTotalNum / valorLitroNum).toFixed(2);
      }
    } catch (error) {
      console.error('Erro ao calcular litros:', error);
    }
    return litros;
  };

  const handleValorLitroChange = (text: string) => {
    setValorLitro(text);
    // Se houver um valor de litros, calcular o valor total
    if (litros) {
      setValorTotal(calcularValorTotal(text, litros));
    }
  };

  const handleLitrosChange = (text: string) => {
    setLitros(text);
    // Se houver um valor por litro, calcular o valor total
    if (valorLitro) {
      setValorTotal(calcularValorTotal(valorLitro, text));
    }
  };

  const handleValorTotalChange = (text: string) => {
    setValorTotal(text);
    // Se houver um valor por litro, calcular os litros
    if (valorLitro && parseFloat(valorLitro) > 0) {
      setLitros(calcularLitros(text, valorLitro));
    }
  };

  const handleDateChange = (text: string) => {
    setDateString(text);
    try {
      // Validar formato da data (DD/MM/YYYY)
      if (text.length === 10) {
        const dateParts = text.split('/');
        if (dateParts.length === 3) {
          const day = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1; // Mês começa em 0
          const year = parseInt(dateParts[2], 10);
          
          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            const newDate = new Date(year, month, day);
            
            // Verificar se a data é válida (não é no futuro)
            const today = new Date();
            if (newDate > today) {
              Alert.alert('Erro', 'A data não pode ser no futuro');
              return;
            }
            
            setData(newDate);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao processar data:', error);
    }
  };

  const openDateDialog = () => {
    setShowDatePicker(true);
  };

  const handleSave = async () => {
    if (!abastecimentoId) return;
    
    try {
      // Validação básica
      if (!valorLitro || !litros || !valorTotal || !kmAtual) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
        return;
      }

      if (!veiculoAtivo) {
        Alert.alert('Erro', 'Nenhum veículo ativo encontrado');
        return;
      }

      setLoading(true);

      const litrosNumber = parseFloat(litros);
      const valorLitroNumber = parseFloat(valorLitro);
      const valorTotalNumber = parseFloat(valorTotal);
      const kmAtualNumber = Math.round(parseFloat(kmAtual)); // Arredondar para inteiro

      // Não é mais necessário calcular ou manter kmPercorridos, isso será feito em tempo de execução

      // Criar o objeto de atualização
      const abastecimentoAtualizado: Partial<Omit<Abastecimento, 'id' | 'createdAt' | 'updatedAt' | 'veiculoId'>> = {
        data: data,
        valorLitro: valorLitroNumber,
        litros: litrosNumber,
        valorTotal: valorTotalNumber,
        kmAtual: kmAtualNumber,
        posto: posto || undefined,
        tanqueCheio: tanqueCheio,
        chequeiCalibragem: chequeiCalibragem,
        chequeiOleo: chequeiOleo,
        useiAditivo: useiAditivo,
        observacoes: observacoes || undefined
      };

      await updateAbastecimento(abastecimentoId, abastecimentoAtualizado);
      
      onSuccess();
    } catch (error) {
      console.error('Erro ao atualizar abastecimento:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao atualizar o abastecimento');
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
          <Text style={styles.title}>Editar Abastecimento</Text>
          
          {loadingData ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Carregando...</Text>
            </View>
          ) : loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Salvando...</Text>
            </View>
          ) : (
            <View style={styles.form}>
              <View style={styles.dateContainer}>
                <TextInput
                  label="Data"
                  value={dateString}
                  onChangeText={handleDateChange}
                  style={[styles.input, styles.dateInput]}
                  placeholder="DD/MM/AAAA"
                  keyboardType="numeric"
                />
                <TouchableOpacity style={styles.dateButton}>
                  <IconButton
                    icon="calendar"
                    size={24}
                    onPress={() => Alert.alert('Dica', 'Digite a data no formato DD/MM/AAAA')}
                  />
                </TouchableOpacity>
              </View>
              
              <TextInput
                label="Valor por Litro (R$)"
                value={valorLitro}
                onChangeText={handleValorLitroChange}
                keyboardType="decimal-pad"
                style={styles.input}
              />
              
              <TextInput
                label="Litros"
                value={litros}
                onChangeText={handleLitrosChange}
                keyboardType="decimal-pad"
                style={styles.input}
              />
              
              <TextInput
                label="Valor Total (R$)"
                value={valorTotal}
                onChangeText={handleValorTotalChange}
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
    marginBottom: 16,
    fontSize: 14,
    color: colors.primary,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
    marginBottom: 0,
  },
  dateButton: {
    marginLeft: 8,
  },
}); 
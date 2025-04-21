import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { colors } from '../theme';
import { saveVeiculo, setVeiculoAtivo } from '../database/veiculoService';
import { TipoCombustivel } from '../types/configuracao';

interface SetupScreenProps {
  navigation: any;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ navigation }) => {
  const [apelido, setApelido] = useState('Meu Carro');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState(new Date().getFullYear().toString());
  const [cor, setCor] = useState('');
  const [tipoCombustivel, setTipoCombustivel] = useState<TipoCombustivel>('gasolina');
  const [tanqueCapacidade, setTanqueCapacidade] = useState('50');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!apelido || !modelo || !ano || !cor || !tanqueCapacidade) {
      alert('Todos os campos são obrigatórios');
      return;
    }

    try {
      setLoading(true);
      const veiculoData = {
        apelido,
        modelo,
        ano: parseInt(ano, 10),
        cor,
        tipoCombustivel,
        tanqueCapacidade: parseFloat(tanqueCapacidade),
        isAtivo: true
      };

      const novoVeiculo = await saveVeiculo(veiculoData);
      await setVeiculoAtivo(novoVeiculo.id);
      
      setLoading(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
      setLoading(false);
      alert('Erro ao salvar veículo. Tente novamente.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Configuração Inicial</Text>
        <Text style={styles.subtitle}>Vamos configurar seu primeiro veículo</Text>
        
        <View style={styles.form}>
          <TextInput
            label="Apelido do Veículo"
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
          
          <TextInput
            label="Tipo de Combustível"
            value={tipoCombustivel}
            onChangeText={(text: string) => setTipoCombustivel(text as TipoCombustivel)}
            style={styles.input}
          />
          
          <TextInput
            label="Capacidade do Tanque (L)"
            value={tanqueCapacidade}
            onChangeText={setTanqueCapacidade}
            keyboardType="numeric"
            style={styles.input}
          />
          
          <Button
            mode="contained"
            disabled={loading}
            loading={loading}
            onPress={handleSave}
            style={styles.button}
          >
            Salvar Configurações
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.lightText,
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
    backgroundColor: colors.background,
  },
  button: {
    marginTop: 20,
    paddingVertical: 6,
  },
}); 
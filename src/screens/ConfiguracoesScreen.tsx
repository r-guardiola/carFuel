import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, Platform } from 'react-native';
import { Button, Card, Divider, List } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import { database, listTables, describeTable } from '../database/database';
import { AnyObject } from '../types';
import Constants from 'expo-constants';
import { database as db } from '../database/database';

interface ConfiguracoesScreenProps {
  navigation: any;
}

export const ConfiguracoesScreen: React.FC<ConfiguracoesScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    card: {
      marginBottom: 16,
    },
    divider: {
      marginVertical: 8,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
    },
    button: {
      flex: 1,
      marginHorizontal: 4,
    },
    versionText: {
      textAlign: 'center',
      marginTop: 16,
      color: colors.lightText,
    },
  });

  const saveFileToDownloads = async (fileUri: string, fileName: string) => {
    try {
      if (Platform.OS === 'android') {
        // Solicitar permissões para acessar a biblioteca de mídia
        const { status } = await MediaLibrary.requestPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert('Permissão negada', 'Não foi possível salvar o arquivo sem permissão de acesso à galeria');
          return;
        }
        
        // Salvar o arquivo na biblioteca de mídia (pasta Downloads)
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        
        // Tentar mover para pasta Downloads
        try {
          const album = await MediaLibrary.getAlbumAsync('Download');
          if (album === null) {
            // Se não existir, cria o álbum
            await MediaLibrary.createAlbumAsync('Download', asset, false);
          } else {
            // Se existir, move o asset para o álbum
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          }
          
          Alert.alert('Sucesso', `Arquivo salvo em Downloads como ${fileName}`);
        } catch (e) {
          console.error('Erro ao mover para Downloads:', e);
          Alert.alert('Sucesso', 'Arquivo salvo na galeria do dispositivo');
        }
        
        return true;
      } else {
        // Para iOS, apenas compartilhar o arquivo
        return null;
      }
    } catch (error) {
      console.error('Erro ao salvar arquivo:', error);
      return false;
    }
  };

  const saveFileWithSAF = async (fileUri: string, fileName: string, mimeType: string) => {
    try {
      if (Platform.OS === 'android') {
        // Usar o Storage Access Framework para salvar em local escolhido pelo usuário
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        
        if (!permissions.granted) {
          return null;
        }
        
        try {
          // Ler o arquivo como base64
          const base64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          // Criar arquivo no diretório selecionado
          const destinationUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            mimeType
          );
          
          // Escrever conteúdo no arquivo
          await FileSystem.writeAsStringAsync(destinationUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          Alert.alert('Sucesso', `Arquivo ${fileName} salvo com sucesso!`);
          return true;
        } catch (e) {
          console.error('Erro ao salvar com SAF:', e);
          return false;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao salvar arquivo com SAF:', error);
      return false;
    }
  };

  const exportarBancoDados = async () => {
    try {
      setLoading(true);
      
      // Listar todas as tabelas do banco de dados
      const tables = await listTables();
      
      // Obter dados de cada tabela
      const databaseData: Record<string, any[]> = {};
      
      for (const tableName of tables) {
        const result = await db.getAllAsync<AnyObject>(`SELECT * FROM ${tableName}`);
        databaseData[tableName] = result;
      }
      
      // Criar objeto com os dados e metadados
      const exportData = {
        appVersion,
        exportDate: new Date().toISOString(),
        tables,
        data: databaseData,
      };
      
      // Converter para JSON
      const jsonData = JSON.stringify(exportData, null, 2);
      
      // Nome do arquivo
      const fileName = `carfuel_backup_${Date.now()}.json`;
      
      // Criar arquivo temporário
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, jsonData, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      // Perguntar ao usuário como deseja salvar o arquivo
      Alert.alert(
        'Exportar dados',
        'Como deseja salvar o arquivo de backup?',
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Compartilhar',
            onPress: async () => {
              // Compartilhar arquivo
              if (Platform.OS === 'android' || Platform.OS === 'ios') {
                const isAvailable = await Sharing.isAvailableAsync();
                if (isAvailable) {
                  await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/json',
                    dialogTitle: 'Exportar dados do CarFuel',
                    UTI: 'public.json',
                  });
                } else {
                  Alert.alert('Erro', 'Compartilhamento não disponível neste dispositivo');
                }
              } else {
                Alert.alert('Erro', 'Exportação não suportada nesta plataforma');
              }
            }
          },
          {
            text: 'Salvar em Downloads',
            onPress: async () => {
              if (Platform.OS === 'android') {
                // Tentar salvar em downloads
                const result = await saveFileToDownloads(fileUri, fileName);
                if (!result) {
                  // Se falhar, tentar com SAF
                  await saveFileWithSAF(fileUri, fileName, 'application/json');
                }
              } else {
                // iOS não tem pasta Downloads, usar compartilhamento
                const isAvailable = await Sharing.isAvailableAsync();
                if (isAvailable) {
                  await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/json',
                    dialogTitle: 'Exportar dados do CarFuel',
                    UTI: 'public.json',
                  });
                }
              }
            }
          },
          {
            text: 'Escolher pasta',
            onPress: async () => {
              await saveFileWithSAF(fileUri, fileName, 'application/json');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao exportar banco de dados:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao exportar os dados');
    } finally {
      setLoading(false);
    }
  };

  const importarBancoDados = async () => {
    try {
      setLoading(true);
      
      // Selecionar arquivo
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        setLoading(false);
        return;
      }
      
      // Ler conteúdo do arquivo
      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      
      // Converter para objeto
      const importData = JSON.parse(fileContent);
      
      // Verificar versão do app
      const backupVersion = importData.appVersion || '1.0.0';
      
      // Dividir versões em componentes numéricos para comparação
      const backupVersionParts = backupVersion.split('.').map(Number);
      const currentVersionParts = appVersion.split('.').map(Number);
      
      // Verificar se a versão do backup é compatível
      let isCompatible = false;
      
      // Versão atual é igual ou mais recente que o backup
      if (
        currentVersionParts[0] > backupVersionParts[0] || 
        (currentVersionParts[0] === backupVersionParts[0] && currentVersionParts[1] >= backupVersionParts[1])
      ) {
        isCompatible = true;
      }
      
      if (!isCompatible) {
        Alert.alert(
          'Versão incompatível', 
          `O backup foi gerado na versão ${backupVersion}, mas você está usando a versão ${appVersion}. A importação pode causar problemas.`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Importar mesmo assim', 
              style: 'destructive',
              onPress: () => realizarImportacao(importData)
            }
          ]
        );
        setLoading(false);
        return;
      }
      
      // Confirmação antes de importar
      Alert.alert(
        'Confirmar importação',
        'Todos os dados atuais serão substituídos. Deseja continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Confirmar', 
            onPress: () => realizarImportacao(importData)
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao importar banco de dados:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao importar os dados');
      setLoading(false);
    }
  };
  
  const realizarImportacao = async (importData: any) => {
    try {
      // Iniciar transação
      await db.execAsync('BEGIN TRANSACTION');
      
      // Limpar tabelas existentes
      for (const tableName of importData.tables) {
        await db.execAsync(`DELETE FROM ${tableName}`);
      }
      
      // Importar dados para cada tabela
      for (const tableName of importData.tables) {
        const tableData = importData.data[tableName];
        
        if (tableData && tableData.length > 0) {
          for (const row of tableData) {
            // Construir query de inserção
            const columns = Object.keys(row);
            const values = Object.values(row);
            const placeholders = columns.map(() => '?').join(', ');
            
            const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
            
            // Vamos usar runAsync para queries de inserção com parâmetros
            try {
              await db.runAsync(query, values as any[]);
            } catch (insertError) {
              console.error(`Erro ao inserir dados na tabela ${tableName}:`, insertError);
              throw insertError;
            }
          }
        }
      }
      
      // Finalizar transação
      await db.execAsync('COMMIT');
      
      Alert.alert('Sucesso', 'Dados importados com sucesso! O aplicativo será reiniciado.', [
        { 
          text: 'OK',
          onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          })
        }
      ]);
    } catch (error) {
      // Reverter transação em caso de erro
      await db.execAsync('ROLLBACK');
      console.error('Erro ao realizar importação:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao importar os dados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Configurações</Text>
      
      <Card style={styles.card}>
        <Card.Title title="Dados e backup" />
        <Card.Content>
          <List.Item
            title="Exportar dados"
            description="Crie um arquivo de backup com todos os dados do aplicativo"
            left={props => <List.Icon {...props} icon="database-export" />}
            onPress={exportarBancoDados}
            disabled={loading}
          />
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="Importar dados"
            description="Restaure um backup realizado anteriormente"
            left={props => <List.Icon {...props} icon="database-import" />}
            onPress={importarBancoDados}
            disabled={loading}
          />
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Title title="Sobre o aplicativo" />
        <Card.Content>
          <List.Item
            title="Versão do aplicativo"
            description={appVersion}
            left={props => <List.Icon {...props} icon="information" />}
          />
        </Card.Content>
      </Card>
      
      <Text style={styles.versionText}>CarFuel v{appVersion}</Text>
    </ScrollView>
  );
};

export default ConfiguracoesScreen; 
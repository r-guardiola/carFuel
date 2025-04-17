import { SQLiteDatabase } from 'expo-sqlite';
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

export const getDatabase = (): SQLiteDatabase => {
  if (Platform.OS === 'web') {
    throw new Error('SQLite não é suportado no navegador web');
  }
  return SQLite.openDatabaseSync('carfuel.db');
};

export const database = getDatabase();

export const clearDatabase = async (): Promise<void> => {
  try {
    await database.execAsync('DELETE FROM abastecimento');
    await database.execAsync('DELETE FROM configuracao');
    console.log('Banco de dados limpo com sucesso');
  } catch (error) {
    console.error('Erro ao limpar banco de dados:', error);
    throw error;
  }
};

export const initDatabase = async (): Promise<void> => {
  try {
    // Tabela de configurações
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS configuracao (
        id TEXT PRIMARY KEY NOT NULL,
        tipoCombustivel TEXT NOT NULL,
        tanqueCapacidade REAL NOT NULL,
        marca TEXT NOT NULL,
        modelo TEXT NOT NULL,
        placa TEXT NOT NULL,
        ano INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    // Tabela de abastecimentos
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS abastecimento (
        id TEXT PRIMARY KEY NOT NULL,
        data TEXT NOT NULL,
        valorLitro REAL NOT NULL,
        litros REAL NOT NULL,
        valorTotal REAL NOT NULL,
        tipoCombustivel TEXT NOT NULL,
        kmAtual REAL NOT NULL,
        kmPercorridos REAL,
        posto TEXT,
        tanqueCheio INTEGER NOT NULL DEFAULT 0,
        chequeiCalibragem INTEGER NOT NULL DEFAULT 0,
        chequeiOleo INTEGER NOT NULL DEFAULT 0,
        useiAditivo INTEGER NOT NULL DEFAULT 0,
        observacoes TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    console.log('Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    throw error;
  }
}; 
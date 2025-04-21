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
    await database.execAsync('DELETE FROM veiculos');
    console.log('Banco de dados limpo com sucesso');
  } catch (error) {
    console.error('Erro ao limpar banco de dados:', error);
    throw error;
  }
};

export const listTables = async (): Promise<string[]> => {
  try {
    const result = await database.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );
    const tables = result.map(r => r.name);
    console.log('Tabelas encontradas:', tables);
    return tables;
  } catch (error) {
    console.error('Erro ao listar tabelas:', error);
    throw error;
  }
};

export const describeTable = async (tableName: string): Promise<any[]> => {
  try {
    const columns = await database.getAllAsync<any>(
      `PRAGMA table_info(${tableName})`
    );
    console.log(`Estrutura da tabela ${tableName}:`, columns);
    
    // Mostrar também alguns registros para depuração
    if (tableName === 'veiculos') {
      const rows = await database.getAllAsync<any>(`SELECT * FROM ${tableName} LIMIT 10`);
      console.log(`Primeiros registros da tabela ${tableName}:`, rows);
      
      // Verificar o tipo de isAtivo
      rows.forEach((row, index) => {
        console.log(`Veículo ${index} - isAtivo: ${row.isAtivo} (tipo: ${typeof row.isAtivo})`);
      });
    }
    
    return columns;
  } catch (error) {
    console.error(`Erro ao descrever tabela ${tableName}:`, error);
    throw error;
  }
};

export const updateDatabaseSchema = async (): Promise<void> => {
  try {
    // Listar tabelas existentes
    const tables = await listTables();
    
    // Verificar e criar tabelas faltantes
    const requiredTables = ['configuracao', 'veiculos', 'abastecimento'];
    for (const table of requiredTables) {
      if (!tables.includes(table)) {
        console.log(`Tabela ${table} não encontrada, criando...`);
        
        if (table === 'veiculos') {
          await database.execAsync(`
            CREATE TABLE IF NOT EXISTS veiculos (
              id TEXT PRIMARY KEY NOT NULL,
              apelido TEXT NOT NULL,
              modelo TEXT NOT NULL,
              ano INTEGER NOT NULL,
              cor TEXT NOT NULL,
              tipoCombustivel TEXT NOT NULL,
              tanqueCapacidade REAL NOT NULL,
              isAtivo INTEGER NOT NULL DEFAULT 0,
              createdAt TEXT NOT NULL,
              updatedAt TEXT NOT NULL
            );
          `);
          console.log(`Tabela ${table} criada com sucesso!`);
        }
      }
    }
    
    // Se a tabela de abastecimento existe, verificar a coluna veiculoId
    if (tables.includes('abastecimento')) {
      const tableInfo = await describeTable('abastecimento');
      
      const hasVeiculoIdColumn = tableInfo.some(
        (column) => column.name === 'veiculoId'
      );
      
      if (!hasVeiculoIdColumn) {
        console.log('Coluna veiculoId não encontrada, adicionando à tabela abastecimento...');
        await database.execAsync(
          `ALTER TABLE abastecimento ADD COLUMN veiculoId TEXT NOT NULL DEFAULT 'temp_id'`
        );
        console.log('Coluna veiculoId adicionada com sucesso!');
      } else {
        console.log('Coluna veiculoId já existe na tabela abastecimento');
      }
    }
  } catch (error) {
    console.error('Erro ao atualizar schema do banco de dados:', error);
    throw error;
  }
};

export const initDatabase = async (): Promise<void> => {
  try {
    console.log('Iniciando verificação da estrutura do banco de dados...');
    
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

    // Tabela de veículos
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS veiculos (
        id TEXT PRIMARY KEY NOT NULL,
        apelido TEXT NOT NULL,
        modelo TEXT NOT NULL,
        ano INTEGER NOT NULL,
        cor TEXT NOT NULL,
        tipoCombustivel TEXT NOT NULL,
        tanqueCapacidade REAL NOT NULL,
        isAtivo INTEGER NOT NULL DEFAULT 0,
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
        posto TEXT,
        tanqueCheio INTEGER NOT NULL DEFAULT 0,
        chequeiCalibragem INTEGER NOT NULL DEFAULT 0,
        chequeiOleo INTEGER NOT NULL DEFAULT 0,
        useiAditivo INTEGER NOT NULL DEFAULT 0,
        observacoes TEXT,
        veiculoId TEXT NOT NULL DEFAULT 'temp_id',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (veiculoId) REFERENCES veiculos (id)
      );
    `);

    // Verificar e atualizar o schema do banco de dados se necessário
    await updateDatabaseSchema();
    
    // Listar tabelas para verificação
    await listTables();

    console.log('Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    throw error;
  }
}; 
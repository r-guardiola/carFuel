import { database } from './database';

interface ColumnInfo {
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
}

export const executeMigrations = async (): Promise<void> => {
  try {
    console.log('Iniciando migrações...');
    
    await removeKmPercorridosColumn();
    
    console.log('Migrações concluídas com sucesso!');
  } catch (error) {
    console.error('Erro ao executar migrações:', error);
    throw error;
  }
};

// Migração para remover a coluna kmPercorridos da tabela abastecimento
export const removeKmPercorridosColumn = async (): Promise<void> => {
  try {
    console.log('Verificando se a coluna kmPercorridos existe...');
    
    // Verificar se a coluna existe
    const tableInfo = await database.getAllAsync<ColumnInfo>('PRAGMA table_info(abastecimento)');
    const kmPercorridosColumn = tableInfo.find(column => column.name === 'kmPercorridos');
    
    if (kmPercorridosColumn) {
      console.log('Coluna kmPercorridos encontrada. Iniciando migração...');
      
      // Criar tabela temporária sem a coluna kmPercorridos
      await database.execAsync(`
        CREATE TABLE abastecimento_temp (
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
      
      // Copiar dados da tabela original para a temporária
      await database.execAsync(`
        INSERT INTO abastecimento_temp (
          id, data, valorLitro, litros, valorTotal, tipoCombustivel, 
          kmAtual, posto, tanqueCheio, chequeiCalibragem, 
          chequeiOleo, useiAditivo, observacoes, veiculoId, createdAt, updatedAt
        )
        SELECT
          id, data, valorLitro, litros, valorTotal, tipoCombustivel, 
          kmAtual, posto, tanqueCheio, chequeiCalibragem, 
          chequeiOleo, useiAditivo, observacoes, veiculoId, createdAt, updatedAt
        FROM abastecimento;
      `);
      
      // Remover tabela original
      await database.execAsync('DROP TABLE abastecimento;');
      
      // Renomear tabela temporária
      await database.execAsync('ALTER TABLE abastecimento_temp RENAME TO abastecimento;');
      
      console.log('Migração para remover coluna kmPercorridos concluída com sucesso!');
    } else {
      console.log('Coluna kmPercorridos não encontrada. Nenhuma migração necessária.');
    }
  } catch (error) {
    console.error('Erro ao remover coluna kmPercorridos:', error);
    throw error;
  }
}; 
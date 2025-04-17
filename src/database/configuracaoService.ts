import { database } from './database';
import { Configuracao, TipoCombustivel } from '../types/configuracao';
import { generateUUID } from '../utils/uuid';

export const getConfiguracao = async (): Promise<Configuracao | null> => {
  try {
    const rows = await database.getAllAsync<any>('SELECT * FROM configuracao LIMIT 1');
    
    if (rows.length === 0) {
      return null;
    }
    
    const row = rows[0];
    return {
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    throw error;
  }
};

export const saveConfiguracao = async (configuracao: Omit<Configuracao, 'id' | 'createdAt' | 'updatedAt'>): Promise<Configuracao> => {
  try {
    const now = new Date();
    const existingConfig = await getConfiguracao();
    
    if (existingConfig) {
      // Atualizar configuração existente
      const updatedConfig: Configuracao = {
        ...configuracao,
        id: existingConfig.id,
        createdAt: existingConfig.createdAt,
        updatedAt: now
      };
      
      await database.runAsync(
        `UPDATE configuracao SET 
          tipoCombustivel = ?, 
          tanqueCapacidade = ?, 
          marca = ?, 
          modelo = ?, 
          placa = ?, 
          ano = ?, 
          updatedAt = ?
        WHERE id = ?`,
        [
          updatedConfig.tipoCombustivel,
          updatedConfig.tanqueCapacidade,
          updatedConfig.marca,
          updatedConfig.modelo,
          updatedConfig.placa,
          updatedConfig.ano,
          updatedConfig.updatedAt.toISOString(),
          updatedConfig.id
        ]
      );
      
      return updatedConfig;
    } else {
      // Criar nova configuração
      const newConfig: Configuracao = {
        ...configuracao,
        id: generateUUID(),
        createdAt: now,
        updatedAt: now
      };
      
      await database.runAsync(
        `INSERT INTO configuracao (
          id, tipoCombustivel, tanqueCapacidade, marca, modelo, placa, ano, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newConfig.id,
          newConfig.tipoCombustivel,
          newConfig.tanqueCapacidade,
          newConfig.marca,
          newConfig.modelo,
          newConfig.placa,
          newConfig.ano,
          newConfig.createdAt.toISOString(),
          newConfig.updatedAt.toISOString()
        ]
      );
      
      return newConfig;
    }
  } catch (error) {
    console.error('Erro ao salvar configuração:', error);
    throw error;
  }
};

export const ensureDefaultConfiguracao = async (): Promise<void> => {
  try {
    const existingConfig = await getConfiguracao();
    
    if (!existingConfig) {
      // Criar configuração padrão
      await saveConfiguracao({
        tipoCombustivel: 'gasolina' as TipoCombustivel,
        tanqueCapacidade: 50,
        marca: 'Toyota',
        modelo: 'Corolla',
        placa: 'ABC1234',
        ano: 2022
      });
      
      console.log('Configuração padrão criada com sucesso');
    }
  } catch (error) {
    console.error('Erro ao garantir configuração padrão:', error);
    throw error;
  }
}; 
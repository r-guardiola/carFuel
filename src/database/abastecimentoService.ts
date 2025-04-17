import { database } from './database';
import { Abastecimento } from '../types/abastecimento';
import { generateUUID } from '../utils/uuid';

export const getAbastecimentos = async (): Promise<Abastecimento[]> => {
  try {
    const resultado = await database.getAllAsync<any>(
      'SELECT * FROM abastecimento ORDER BY data DESC'
    );
    
    return resultado.map(row => ({
      ...row,
      data: new Date(row.data),
      tanqueCheio: !!row.tanqueCheio,
      chequeiCalibragem: !!row.chequeiCalibragem,
      chequeiOleo: !!row.chequeiOleo,
      useiAditivo: !!row.useiAditivo,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }));
  } catch (error) {
    console.error('Erro ao buscar abastecimentos:', error);
    throw error;
  }
};

export const getAbastecimentoById = async (id: string): Promise<Abastecimento | null> => {
  try {
    const rows = await database.getAllAsync<any>(
      'SELECT * FROM abastecimento WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const row = rows[0];
    return {
      ...row,
      data: new Date(row.data),
      tanqueCheio: !!row.tanqueCheio,
      chequeiCalibragem: !!row.chequeiCalibragem,
      chequeiOleo: !!row.chequeiOleo,
      useiAditivo: !!row.useiAditivo,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  } catch (error) {
    console.error(`Erro ao buscar abastecimento com id ${id}:`, error);
    throw error;
  }
};

export const insertAbastecimento = async (abastecimento: Omit<Abastecimento, 'id' | 'createdAt' | 'updatedAt'>): Promise<Abastecimento> => {
  const now = new Date();
  const newAbastecimento: Abastecimento = {
    ...abastecimento,
    id: generateUUID(),
    createdAt: now,
    updatedAt: now
  };
  
  try {
    await database.runAsync(
      `INSERT INTO abastecimento (
        id, data, valorLitro, litros, valorTotal, tipoCombustivel, 
        kmAtual, kmPercorridos, posto, tanqueCheio, chequeiCalibragem, 
        chequeiOleo, useiAditivo, observacoes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newAbastecimento.id,
        newAbastecimento.data.toISOString(),
        newAbastecimento.valorLitro,
        newAbastecimento.litros,
        newAbastecimento.valorTotal,
        newAbastecimento.tipoCombustivel,
        newAbastecimento.kmAtual,
        newAbastecimento.kmPercorridos || null,
        newAbastecimento.posto || null,
        newAbastecimento.tanqueCheio ? 1 : 0,
        newAbastecimento.chequeiCalibragem ? 1 : 0,
        newAbastecimento.chequeiOleo ? 1 : 0,
        newAbastecimento.useiAditivo ? 1 : 0,
        newAbastecimento.observacoes || null,
        newAbastecimento.createdAt.toISOString(),
        newAbastecimento.updatedAt.toISOString()
      ]
    );
    
    return newAbastecimento;
  } catch (error) {
    console.error('Erro ao inserir abastecimento:', error);
    throw error;
  }
};

export const deleteAbastecimento = async (id: string): Promise<void> => {
  try {
    await database.runAsync('DELETE FROM abastecimento WHERE id = ?', [id]);
  } catch (error) {
    console.error(`Erro ao deletar abastecimento com id ${id}:`, error);
    throw error;
  }
};

export const calculateMediaConsumo = async (): Promise<{
  mediaGeral: number | null;
  ultimoAbastecimento: number | null;
}> => {
  try {
    // Busca todos os abastecimentos com km percorridos (ordenados por data)
    const abastecimentos = await database.getAllAsync<{
      litros: number;
      kmPercorridos: number;
    }>(
      'SELECT litros, kmPercorridos FROM abastecimento WHERE kmPercorridos IS NOT NULL ORDER BY data ASC'
    );
    
    if (abastecimentos.length === 0) {
      return { mediaGeral: null, ultimoAbastecimento: null };
    }
    
    // Média geral
    const totalKm = abastecimentos.reduce((sum, a) => sum + a.kmPercorridos, 0);
    const totalLitros = abastecimentos.reduce((sum, a) => sum + a.litros, 0);
    
    // Último abastecimento
    const ultimo = abastecimentos[abastecimentos.length - 1];
    
    return {
      mediaGeral: totalKm / totalLitros,
      ultimoAbastecimento: ultimo.kmPercorridos / ultimo.litros
    };
  } catch (error) {
    console.error('Erro ao calcular média de consumo:', error);
    throw error;
  }
}; 
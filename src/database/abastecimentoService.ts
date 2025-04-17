import { database } from './database';
import { Abastecimento } from '../types/abastecimento';
import { generateUUID } from '../utils/uuid';
import { getVeiculoAtivo } from './veiculoService';

// Atualiza os registros antigos de abastecimento para associá-los ao veículo ativo
export const updateAbastecimentosLegados = async (): Promise<void> => {
  try {
    const veiculoAtivo = await getVeiculoAtivo();
    
    if (!veiculoAtivo) {
      console.log('Nenhum veículo ativo encontrado para atualizar abastecimentos legados');
      return;
    }
    
    // Verificar se existem registros com veiculoId = 'temp_id'
    const result = await database.getAllAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM abastecimento WHERE veiculoId = 'temp_id'"
    );
    
    if (result[0].count > 0) {
      console.log(`Atualizando ${result[0].count} abastecimentos legados para o veículo ativo...`);
      await database.runAsync(
        "UPDATE abastecimento SET veiculoId = ? WHERE veiculoId = 'temp_id'",
        [veiculoAtivo.id]
      );
      console.log('Abastecimentos legados atualizados com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao atualizar abastecimentos legados:', error);
    throw error;
  }
};

export const getAbastecimentos = async (): Promise<Abastecimento[]> => {
  try {
    // Buscar o veículo ativo
    const veiculoAtivo = await getVeiculoAtivo();
    
    if (!veiculoAtivo) {
      console.log('Nenhum veículo ativo encontrado');
      return [];
    }
    
    const resultado = await database.getAllAsync<any>(
      'SELECT * FROM abastecimento WHERE veiculoId = ? ORDER BY data DESC',
      [veiculoAtivo.id]
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

export const insertAbastecimento = async (abastecimento: Omit<Abastecimento, 'id' | 'createdAt' | 'updatedAt' | 'veiculoId'>): Promise<Abastecimento> => {
  try {
    // Buscar o veículo ativo para associar ao abastecimento
    const veiculoAtivo = await getVeiculoAtivo();
    
    if (!veiculoAtivo) {
      throw new Error('Nenhum veículo ativo encontrado para associar ao abastecimento');
    }
    
    const now = new Date();
    const newAbastecimento: Abastecimento = {
      ...abastecimento,
      id: generateUUID(),
      veiculoId: veiculoAtivo.id,
      createdAt: now,
      updatedAt: now
    };
    
    await database.runAsync(
      `INSERT INTO abastecimento (
        id, data, valorLitro, litros, valorTotal, tipoCombustivel, 
        kmAtual, kmPercorridos, posto, tanqueCheio, chequeiCalibragem, 
        chequeiOleo, useiAditivo, observacoes, veiculoId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        newAbastecimento.veiculoId,
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
    // Buscar o veículo ativo
    const veiculoAtivo = await getVeiculoAtivo();
    
    if (!veiculoAtivo) {
      return { mediaGeral: null, ultimoAbastecimento: null };
    }
    
    // Busca todos os abastecimentos com km percorridos (ordenados por data)
    const abastecimentos = await database.getAllAsync<{
      litros: number;
      kmPercorridos: number;
    }>(
      'SELECT litros, kmPercorridos FROM abastecimento WHERE kmPercorridos IS NOT NULL AND veiculoId = ? ORDER BY data ASC',
      [veiculoAtivo.id]
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
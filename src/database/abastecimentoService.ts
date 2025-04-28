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
        kmAtual, posto, tanqueCheio, chequeiCalibragem, 
        chequeiOleo, useiAditivo, observacoes, veiculoId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newAbastecimento.id,
        newAbastecimento.data.toISOString(),
        newAbastecimento.valorLitro,
        newAbastecimento.litros,
        newAbastecimento.valorTotal,
        newAbastecimento.tipoCombustivel,
        newAbastecimento.kmAtual,
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

export const updateAbastecimento = async (id: string, abastecimento: Partial<Omit<Abastecimento, 'id' | 'createdAt' | 'updatedAt' | 'veiculoId'>>): Promise<Abastecimento> => {
  try {
    // Buscar o abastecimento atual para manter os campos não atualizados
    const currentAbastecimento = await getAbastecimentoById(id);
    
    if (!currentAbastecimento) {
      throw new Error(`Abastecimento com id ${id} não encontrado`);
    }
    
    const now = new Date();
    const updatedAbastecimento = {
      ...currentAbastecimento,
      ...abastecimento,
      updatedAt: now
    };
    
    await database.runAsync(
      `UPDATE abastecimento SET 
        data = ?, 
        valorLitro = ?, 
        litros = ?, 
        valorTotal = ?, 
        tipoCombustivel = ?, 
        kmAtual = ?, 
        posto = ?, 
        tanqueCheio = ?, 
        chequeiCalibragem = ?, 
        chequeiOleo = ?, 
        useiAditivo = ?, 
        observacoes = ?,
        updatedAt = ?
      WHERE id = ?`,
      [
        updatedAbastecimento.data.toISOString(),
        updatedAbastecimento.valorLitro,
        updatedAbastecimento.litros,
        updatedAbastecimento.valorTotal,
        updatedAbastecimento.tipoCombustivel,
        updatedAbastecimento.kmAtual,
        updatedAbastecimento.posto || null,
        updatedAbastecimento.tanqueCheio ? 1 : 0,
        updatedAbastecimento.chequeiCalibragem ? 1 : 0,
        updatedAbastecimento.chequeiOleo ? 1 : 0,
        updatedAbastecimento.useiAditivo ? 1 : 0,
        updatedAbastecimento.observacoes || null,
        updatedAbastecimento.updatedAt.toISOString(),
        id
      ]
    );
    
    return updatedAbastecimento;
  } catch (error) {
    console.error(`Erro ao atualizar abastecimento com id ${id}:`, error);
    throw error;
  }
};

// Função para calcular a quilometragem percorrida entre dois abastecimentos
export const calcularKmPercorridos = (abastecimentoAtual: Abastecimento, abastecimentoAnterior: Abastecimento | null): number => {
  if (!abastecimentoAnterior) {
    return 0;
  }
  
  return Math.round(abastecimentoAtual.kmAtual) - Math.round(abastecimentoAnterior.kmAtual);
};

// Função para calcular a quilometragem percorrida de um abastecimento específico
export const getKmPercorridos = async (abastecimento: Abastecimento): Promise<number> => {
  try {
    // Busca o abastecimento anterior
    const abastecimentosAnteriores = await database.getAllAsync<Abastecimento>(
      'SELECT * FROM abastecimento WHERE data < ? AND veiculoId = ? ORDER BY data DESC LIMIT 1',
      [abastecimento.data.toISOString(), abastecimento.veiculoId]
    );
    
    if (abastecimentosAnteriores.length === 0) {
      return 0;
    }
    
    const abastecimentoAnterior = {
      ...abastecimentosAnteriores[0],
      data: new Date(abastecimentosAnteriores[0].data),
      tanqueCheio: !!abastecimentosAnteriores[0].tanqueCheio,
      chequeiCalibragem: !!abastecimentosAnteriores[0].chequeiCalibragem,
      chequeiOleo: !!abastecimentosAnteriores[0].chequeiOleo,
      useiAditivo: !!abastecimentosAnteriores[0].useiAditivo,
      createdAt: new Date(abastecimentosAnteriores[0].createdAt),
      updatedAt: new Date(abastecimentosAnteriores[0].updatedAt)
    };
    
    return Math.round(abastecimento.kmAtual) - Math.round(abastecimentoAnterior.kmAtual);
  } catch (error) {
    console.error('Erro ao calcular km percorridos:', error);
    return 0;
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
    
    // Busca todos os abastecimentos ordenados por data
    const abastecimentos = await database.getAllAsync<{
      id: string;
      data: string;
      kmAtual: number;
      litros: number;
      veiculoId: string;
      tanqueCheio: number;
    }>(
      'SELECT id, data, kmAtual, litros, veiculoId, tanqueCheio FROM abastecimento WHERE veiculoId = ? ORDER BY data ASC',
      [veiculoAtivo.id]
    );
    
    if (abastecimentos.length <= 1) {
      return { mediaGeral: null, ultimoAbastecimento: null };
    }
    
    // Calcular média geral considerando apenas abastecimentos entre tanques cheios
    let mediaGeral = null;
    let totalKmPercorridos = 0;
    let totalLitrosConsumidos = 0;
    let abastecimentosTanqueCheio = abastecimentos.filter(a => !!a.tanqueCheio);
    
    // Precisamos de pelo menos dois abastecimentos de tanque cheio para calcular
    if (abastecimentosTanqueCheio.length >= 2) {
      for (let i = 1; i < abastecimentosTanqueCheio.length; i++) {
        const abastecimentoAtual = abastecimentosTanqueCheio[i];
        const abastecimentoAnterior = abastecimentosTanqueCheio[i-1];
        
        // Calcular km percorridos entre estes dois abastecimentos de tanque cheio
        const kmPercorridos = Math.round(abastecimentoAtual.kmAtual) - 
                            Math.round(abastecimentoAnterior.kmAtual);
        
        // Acumular litros de todos os abastecimentos entre estes dois tanques cheios (inclusive o atual)
        let litrosConsumidos = 0;
        
        // Encontrar todos os abastecimentos entre o tanque cheio anterior e o atual (inclusive o atual)
        const abastecimentosIntermediarios = abastecimentos.filter(a => {
          const dataAbastecimento = new Date(a.data);
          return dataAbastecimento >= new Date(abastecimentoAnterior.data) && 
                 dataAbastecimento <= new Date(abastecimentoAtual.data) &&
                 dataAbastecimento > new Date(abastecimentoAnterior.data); // Excluir o abastecimento anterior
        });
        
        litrosConsumidos = abastecimentosIntermediarios.reduce((total, a) => total + a.litros, 0);
        
        totalKmPercorridos += kmPercorridos;
        totalLitrosConsumidos += litrosConsumidos;
      }
      
      mediaGeral = totalKmPercorridos / totalLitrosConsumidos;
    }
    
    // Calcular média do último abastecimento (entre os dois últimos tanques cheios)
    let mediaUltimoAbastecimento = null;
    
    if (abastecimentosTanqueCheio.length >= 2) {
      const ultimoTanqueCheio = abastecimentosTanqueCheio[abastecimentosTanqueCheio.length - 1];
      const penultimoTanqueCheio = abastecimentosTanqueCheio[abastecimentosTanqueCheio.length - 2];
      
      const kmUltimoAbastecimento = Math.round(ultimoTanqueCheio.kmAtual) - 
                                  Math.round(penultimoTanqueCheio.kmAtual);
      
      // Encontrar todos os abastecimentos entre o penúltimo e o último tanque cheio (inclusive o último)
      const abastecimentosUltimoIntervalo = abastecimentos.filter(a => {
        const dataAbastecimento = new Date(a.data);
        return dataAbastecimento >= new Date(penultimoTanqueCheio.data) && 
               dataAbastecimento <= new Date(ultimoTanqueCheio.data) &&
               dataAbastecimento > new Date(penultimoTanqueCheio.data); // Excluir o penúltimo
      });
      
      const litrosUltimoIntervalo = abastecimentosUltimoIntervalo.reduce((total, a) => total + a.litros, 0);
      
      if (kmUltimoAbastecimento > 0 && litrosUltimoIntervalo > 0) {
        mediaUltimoAbastecimento = kmUltimoAbastecimento / litrosUltimoIntervalo;
      }
    }
    
    return {
      mediaGeral: mediaGeral,
      ultimoAbastecimento: mediaUltimoAbastecimento
    };
  } catch (error) {
    console.error('Erro ao calcular média de consumo:', error);
    throw error;
  }
};

// Função para obter os abastecimentos parciais entre dois abastecimentos de tanque cheio
export const getAbastecimentosParciais = async (tanqueCheioAtual: Abastecimento, tanqueCheioAnterior: Abastecimento): Promise<Abastecimento[]> => {
  try {
    // Verificar se ambos os abastecimentos têm tanque cheio
    if (!tanqueCheioAtual.tanqueCheio || !tanqueCheioAnterior.tanqueCheio) {
      return [];
    }

    // Buscar todos os abastecimentos entre os dois abastecimentos de tanque cheio
    const abastecimentosEntre = await database.getAllAsync<any>(
      `SELECT * FROM abastecimento 
       WHERE veiculoId = ? 
       AND data > ? 
       AND data < ? 
       AND tanqueCheio = 0
       ORDER BY data ASC`,
      [
        tanqueCheioAtual.veiculoId,
        tanqueCheioAnterior.data.toISOString(),
        tanqueCheioAtual.data.toISOString()
      ]
    );

    return abastecimentosEntre.map(row => ({
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
    console.error('Erro ao buscar abastecimentos parciais:', error);
    return [];
  }
};

// Função para obter informações de consumo entre dois abastecimentos de tanque cheio
export const calcularConsumoEntreTanquesCheios = async (
  tanqueCheioAtual: Abastecimento, 
  tanqueCheioAnterior: Abastecimento
): Promise<{
  kmPercorridos: number;
  litrosConsumidos: number;
  mediaConsumo: number;
  precoPorKm: number;
  abastecimentosParciais: Abastecimento[];
}> => {
  try {
    // Obter os abastecimentos parciais entre os dois tanques cheios
    const abastecimentosParciais = await getAbastecimentosParciais(tanqueCheioAtual, tanqueCheioAnterior);
    
    // Calcular quilometragem percorrida
    const kmPercorridos = tanqueCheioAtual.kmAtual - tanqueCheioAnterior.kmAtual;
    
    // Calcular litros consumidos (incluindo o abastecimento atual)
    const litrosConsumidos = tanqueCheioAtual.litros + 
      abastecimentosParciais.reduce((total, a) => total + a.litros, 0);
    
    // Calcular média de consumo
    const mediaConsumo = kmPercorridos > 0 ? kmPercorridos / litrosConsumidos : 0;
    
    // Calcular valor total gasto
    const valorTotal = tanqueCheioAtual.valorTotal + 
      abastecimentosParciais.reduce((total, a) => total + a.valorTotal, 0);
    
    // Calcular preço por Km
    const precoPorKm = kmPercorridos > 0 ? valorTotal / kmPercorridos : 0;
    
    return {
      kmPercorridos,
      litrosConsumidos,
      mediaConsumo,
      precoPorKm,
      abastecimentosParciais
    };
  } catch (error) {
    console.error('Erro ao calcular consumo entre tanques cheios:', error);
    return {
      kmPercorridos: 0,
      litrosConsumidos: 0,
      mediaConsumo: 0,
      precoPorKm: 0,
      abastecimentosParciais: []
    };
  }
};
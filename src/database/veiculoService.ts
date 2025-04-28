import { database } from './database';
import { Veiculo } from '../types/veiculo';
import { generateUUID } from '../utils/uuid';

// Busca todos os veículos cadastrados
export const getVeiculos = async (): Promise<Veiculo[]> => {
  try {
    const rows = await database.getAllAsync<any>('SELECT * FROM veiculos ORDER BY apelido');
    
    return rows.map(row => ({
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      isAtivo: row.isAtivo === 1 || row.isAtivo === true // Garantir que isAtivo seja booleano
    }));
  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    throw error;
  }
};

// Busca um veículo específico pelo ID
export const getVeiculoById = async (id: string): Promise<Veiculo | null> => {
  try {
    const rows = await database.getAllAsync<any>('SELECT * FROM veiculos WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    const row = rows[0];
    return {
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      isAtivo: row.isAtivo === 1 || row.isAtivo === true
    };
  } catch (error) {
    console.error(`Erro ao buscar veículo com ID ${id}:`, error);
    throw error;
  }
};

// Busca o veículo ativo
export const getVeiculoAtivo = async (): Promise<Veiculo | null> => {
  try {
    const rows = await database.getAllAsync<any>('SELECT * FROM veiculos WHERE isAtivo = 1 LIMIT 1');
    
    if (rows.length === 0) {
      return null;
    }
    
    const row = rows[0];
    return {
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      isAtivo: true // Forçar como true já que estamos buscando por veículo ativo
    };
  } catch (error) {
    console.error('Erro ao buscar veículo ativo:', error);
    throw error;
  }
};

// Salva um novo veículo ou atualiza um existente
export const saveVeiculo = async (veiculo: Omit<Veiculo, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Veiculo> => {
  try {
    const now = new Date();
    const id = veiculo.id || generateUUID();
    
    // Verifica se o veículo já existe
    const existingVeiculo = await getVeiculoById(id);
    
    if (existingVeiculo) {
      // Atualiza veículo existente
      const updatedVeiculo: Veiculo = {
        ...veiculo,
        id,
        createdAt: existingVeiculo.createdAt,
        updatedAt: now
      };
      
      await database.runAsync(
        `UPDATE veiculos SET 
          apelido = ?, 
          modelo = ?, 
          ano = ?, 
          cor = ?, 
          tipoCombustivel = ?, 
          tanqueCapacidade = ?, 
          isAtivo = ?,
          updatedAt = ?
        WHERE id = ?`,
        [
          updatedVeiculo.apelido,
          updatedVeiculo.modelo,
          updatedVeiculo.ano,
          updatedVeiculo.cor,
          updatedVeiculo.tipoCombustivel,
          updatedVeiculo.tanqueCapacidade,
          updatedVeiculo.isAtivo ? 1 : 0,
          updatedVeiculo.updatedAt.toISOString(),
          updatedVeiculo.id
        ]
      );
      
      return updatedVeiculo;
    } else {
      // Cria novo veículo
      const newVeiculo: Veiculo = {
        ...veiculo,
        id,
        createdAt: now,
        updatedAt: now
      };
      
      await database.runAsync(
        `INSERT INTO veiculos (
          id, apelido, modelo, ano, cor, tipoCombustivel, tanqueCapacidade, isAtivo, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newVeiculo.id,
          newVeiculo.apelido,
          newVeiculo.modelo,
          newVeiculo.ano,
          newVeiculo.cor,
          newVeiculo.tipoCombustivel,
          newVeiculo.tanqueCapacidade,
          newVeiculo.isAtivo ? 1 : 0,
          newVeiculo.createdAt.toISOString(),
          newVeiculo.updatedAt.toISOString()
        ]
      );
      
      return newVeiculo;
    }
  } catch (error) {
    console.error('Erro ao salvar veículo:', error);
    throw error;
  }
};

// Define um veículo como ativo e desativa os demais
export const setVeiculoAtivo = async (id: string): Promise<void> => {
  try {
    // Primeiro, desativa todos os veículos
    await database.runAsync('UPDATE veiculos SET isAtivo = 0');
    
    // Depois, ativa o veículo específico
    await database.runAsync('UPDATE veiculos SET isAtivo = 1 WHERE id = ?', [id]);
  } catch (error) {
    console.error(`Erro ao definir veículo ${id} como ativo:`, error);
    throw error;
  }
};

// Remove um veículo pelo ID
export const deleteVeiculo = async (id: string): Promise<void> => {
  try {
    await database.runAsync('DELETE FROM veiculos WHERE id = ?', [id]);
  } catch (error) {
    console.error(`Erro ao excluir veículo ${id}:`, error);
    throw error;
  }
};

// Garante que exista pelo menos um veículo padrão no sistema
export const ensureDefaultVeiculo = async (): Promise<void> => {
  try {
    const veiculos = await getVeiculos();
    console.log(`Verificando veículos cadastrados: ${veiculos.length} encontrados`);
    
    if (veiculos.length === 0) {
      console.log('Nenhum veículo encontrado, criando veículo padrão...');
      // Cria um veículo padrão
      const veiculoPadrao = await saveVeiculo({
        apelido: 'Meu Carro',
        modelo: 'Modelo Padrão',
        ano: new Date().getFullYear(),
        cor: 'Prata',
        tipoCombustivel: 'gasolina',
        tanqueCapacidade: 50,
        isAtivo: true
      });
      
      console.log(`Veículo padrão criado com sucesso: ${veiculoPadrao.id}`);
      
      // Garante que o veículo foi definido como ativo
      await setVeiculoAtivo(veiculoPadrao.id);
      console.log(`Veículo ${veiculoPadrao.id} definido como ativo`);
    } else {
      // Verifica se existe algum veículo ativo
      const veiculoAtivo = await getVeiculoAtivo();
      
      if (!veiculoAtivo) {
        console.log('Nenhum veículo ativo, definindo o primeiro como ativo...');
        // Define o primeiro veículo como ativo se não houver nenhum
        await setVeiculoAtivo(veiculos[0].id);
        console.log(`Veículo ${veiculos[0].id} definido como ativo`);
      } else {
        console.log(`Veículo ativo já existe: ${veiculoAtivo.id} (${veiculoAtivo.apelido})`);
      }
    }
  } catch (error) {
    console.error('Erro ao garantir veículo padrão:', error);
    throw error;
  }
}; 
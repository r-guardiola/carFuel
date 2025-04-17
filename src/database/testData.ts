import { Abastecimento } from '../types/abastecimento';
import { database } from './database';
import { generateUUID } from '../utils/uuid';

export const insertTestData = async (): Promise<void> => {
  try {
    // Verificar se já temos dados
    const existingData = await database.getAllAsync<{ count: number }>('SELECT COUNT(*) as count FROM abastecimento');
    const count = existingData[0].count;
    
    if (count > 0) {
      console.log('Dados de teste já existem, pulando inserção');
      return;
    }
    
    // Criar dados de teste
    const now = new Date();
    const testData: Omit<Abastecimento, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        data: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
        valorLitro: 5.89,
        litros: 40.5,
        valorTotal: 238.55,
        tipoCombustivel: 'gasolina',
        kmAtual: 31500.0,
        kmPercorridos: 450.0,
        posto: 'Posto Shell',
        tanqueCheio: true,
        chequeiCalibragem: true,
        chequeiOleo: false,
        useiAditivo: false,
      },
      {
        data: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 14 dias atrás
        valorLitro: 5.79,
        litros: 38.2,
        valorTotal: 221.18,
        tipoCombustivel: 'gasolina',
        kmAtual: 31050.0,
        kmPercorridos: 430.0,
        posto: 'Posto Ipiranga',
        tanqueCheio: true,
        chequeiCalibragem: false,
        chequeiOleo: true,
        useiAditivo: true,
      },
      {
        data: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000), // 21 dias atrás
        valorLitro: 5.69,
        litros: 35.8,
        valorTotal: 203.70,
        tipoCombustivel: 'gasolina',
        kmAtual: 30620.0,
        kmPercorridos: 415.0,
        posto: 'Posto Petrobras',
        tanqueCheio: true,
        chequeiCalibragem: true,
        chequeiOleo: true,
        useiAditivo: false,
      },
    ];
    
    // Inserir dados de teste
    for (const item of testData) {
      const id = generateUUID();
      await database.runAsync(
        `INSERT INTO abastecimento (
          id, data, valorLitro, litros, valorTotal, tipoCombustivel, 
          kmAtual, kmPercorridos, posto, tanqueCheio, chequeiCalibragem, 
          chequeiOleo, useiAditivo, observacoes, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          item.data.toISOString(),
          item.valorLitro,
          item.litros,
          item.valorTotal,
          item.tipoCombustivel,
          item.kmAtual,
          item.kmPercorridos || null,
          item.posto || null,
          item.tanqueCheio ? 1 : 0,
          item.chequeiCalibragem ? 1 : 0,
          item.chequeiOleo ? 1 : 0,
          item.useiAditivo ? 1 : 0,
          item.observacoes || null,
          now.toISOString(),
          now.toISOString()
        ]
      );
    }
    
    console.log('Dados de teste inseridos com sucesso');
  } catch (error) {
    console.error('Erro ao inserir dados de teste:', error);
    throw error;
  }
}; 
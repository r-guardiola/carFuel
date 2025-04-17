import { TipoCombustivel } from './configuracao';

export interface Abastecimento {
  id: string;
  data: Date;
  valorLitro: number;
  litros: number;
  valorTotal: number;
  tipoCombustivel: TipoCombustivel;
  kmAtual: number;
  kmPercorridos?: number;
  posto?: string;
  tanqueCheio: boolean;
  chequeiCalibragem: boolean;
  chequeiOleo: boolean;
  useiAditivo: boolean;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
} 
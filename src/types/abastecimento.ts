import { TipoCombustivel } from './configuracao';

export interface Abastecimento {
  id: string;
  data: Date;
  valorLitro: number;
  litros: number;
  valorTotal: number;
  tipoCombustivel: TipoCombustivel;
  kmAtual: number;
  posto?: string;
  tanqueCheio: boolean;
  chequeiCalibragem: boolean;
  chequeiOleo: boolean;
  useiAditivo: boolean;
  observacoes?: string;
  veiculoId: string;
  createdAt: Date;
  updatedAt: Date;
} 
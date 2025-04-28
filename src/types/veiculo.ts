import { TipoCombustivel } from './configuracao';

export interface Veiculo {
  id: string;
  apelido: string;
  modelo: string;
  ano: number;
  cor: string;
  tipoCombustivel: TipoCombustivel;
  tanqueCapacidade: number;
  createdAt: Date;
  updatedAt: Date;
  isAtivo?: boolean;
} 
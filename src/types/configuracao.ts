export type TipoCombustivel = 'gasolina' | 'etanol' | 'diesel' | 'gnv';

export interface Configuracao {
  id: string;
  tipoCombustivel: TipoCombustivel;
  tanqueCapacidade: number;
  marca: string;
  modelo: string;
  placa: string;
  ano: number;
  createdAt: Date;
  updatedAt: Date;
} 
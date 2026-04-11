export type TipoVinho = {
  id: number;
  nome: string;
};

export type TipoVinhoFormValue = Omit<TipoVinho, 'id'>;

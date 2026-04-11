export type Marca = {
  id: number;
  nome: string;
  paisDeOrigem: string;
  anoFundacao: string;
  classificacao: string;
};

export type MarcaFormValue = Omit<Marca, 'id'>;

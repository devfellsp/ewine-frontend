export type Safra = {
  id: number;
  ano: number;
  descricao: string;
};

export type SafraFormValue = Omit<Safra, 'id'>;

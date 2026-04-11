export type Uva = {
  id: number;
  nome: string;
};

export type UvaFormValue = Omit<Uva, 'id'>;
